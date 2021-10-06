import React from 'react';
import './qoutesGrid.css';
import { GridColumn, HandleGridColumn } from './gridColumn';
import { ValueColumnProperties, ColumnProperties } from './defColTypes';
interface QoutesItem {
  rates: Record<string, number>,
  timestamp: number,
  base: string,
  date: string,
};

interface QoutesGridState {
  qoutesItems: Map<string, QoutesItem>,
  columnHandleProperties: ColumnProperties,
  columnsProperties: Map<string, ColumnProperties>,
  columnCount: number
};

interface QoutesGridProps { urlsAndNames: string[][], significantDigits: number, rows: number };

class QoutesGrid extends React.Component<QoutesGridProps, QoutesGridState>{
  state: QoutesGridState = {
    qoutesItems: new Map<string, QoutesItem>(),
    columnHandleProperties: new ColumnProperties(this.props.rows, 'hanle'),
    columnsProperties: new Map<string, ColumnProperties>(this.props.urlsAndNames.map((urlAndName, index) => [urlAndName[1], new ColumnProperties(this.props.rows, index, urlAndName[1])])),
    columnCount: this.props.urlsAndNames.length + 1
  }
  componentDidMount() {
    const urlsAndNames = this.props.urlsAndNames;
    this.handleFetch(urlsAndNames[0][0]);
    urlsAndNames.forEach((urlAndName, index) => this.itemFetch(urlAndName, false, index));
  }

  render() {
    const { columnHandleProperties, columnCount } = { ...this.state };
    const arrayColProps = Array
      .from(this.state.columnsProperties, ([key, data]) => data)
      .sort((a, b) => a.index - b.index);
    return (
      <div className="Grid">
        <div className="GridBody" style={{ 'gridTemplateColumns': new Array(columnCount).fill('auto').join(' ') }}>
          <HandleGridColumn handleColProps={columnHandleProperties} />
          {arrayColProps.map(colProps => (<GridColumn handleColProps={columnHandleProperties} key={colProps.getName()} colProps={colProps} />))}
        </div>
      </div>
    )
  }

  itemFetch = async (urlAndName: string[], poll: boolean, index: number) => {
    const [url, name] = [...urlAndName];
    const curUrl = poll ? `${url}/poll` : url;
    const colIndex = this.state.columnsProperties.get(name)?.index;
    const curIndex = colIndex ? colIndex : index;
    const response = await fetch(curUrl);
    if (response.status === 502)
      await this.itemFetch([curUrl, name], poll, curIndex)
    else if (response.status !== 200) {
      console.log(response.statusText);
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      await this.itemFetch([curUrl, name], poll, curIndex)
    } else {
      const qoutesItem: QoutesItem = await response.json();
      const colProp: Record<string, ValueColumnProperties> = this.generateColumnPropertiesObj(name, qoutesItem, 'value');
      const colsProps = new Map<string, ColumnProperties>(this.state.columnsProperties)
        .set(name, new ColumnProperties(colProp, curIndex));
      this.checkBestChoiceInRow(colsProps, 'min');
      this.setState(prevState => {
        const qoutesItems = new Map<string, QoutesItem>(prevState.qoutesItems).set(name, qoutesItem);
        return { qoutesItems: qoutesItems, columnsProperties: colsProps }
      }
      );
      this.itemFetch([url, name], true, curIndex);
    }
  }

  handleFetch = async (url: string) => {
    const response = await fetch(url);
    if (response.status === 502)
      await this.handleFetch(url)
    else if (response.status !== 200) {
      console.log(response.statusText);
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      await this.handleFetch(url)
    } else {
      const qoutesItem: QoutesItem = await response.json();
      const colsProps: Record<string, ValueColumnProperties> = this.generateColumnPropertiesObj('Pair name/market', qoutesItem, 'index');
      this.setState({
        columnHandleProperties: new ColumnProperties(colsProps, 0)
      });
    }
  }

  checkBestChoiceInRow = (colsProps: Map<string, ColumnProperties>, sortMode: 'min' | 'max') => {
    const colNames = Array.from(colsProps.keys());
    const findObj: Record<string, Record<string, string>[]> = {}
    for (let i = 0; i < colNames.length; i++) {
      const colProp = colsProps.get(colNames[i])!;
      const colValues = colProp.values;
      const rowsTypes = colProp.getRowHandles();
      for (let j = 0; j < rowsTypes.length; j++) {
        if (rowsTypes[j] in findObj)
          findObj[rowsTypes[j]].push({ value: colValues![rowsTypes[j]].value, sorceName: colNames[i] })
        else
          findObj[rowsTypes[j]] = [{ value: colValues![rowsTypes[j]].value, sorceName: colNames[i] }];
      }
    }
    for (let rowType in findObj) {
      findObj[rowType].sort((a, b) => ((+a.value) - (+b.value)) * (-1) ** (sortMode === 'max' ? 1 : 0));
      let bestChoiceFlag = false;
      if (findObj[rowType].length > 1 && +findObj[rowType][0].value < +findObj[rowType][1].value)
        bestChoiceFlag = true;
      findObj[rowType].forEach((item, index) => {
        const colProp = { ...colsProps.get(item.sorceName) };
        colProp!.values![rowType].bestChoice = index === 0 && bestChoiceFlag;
      })
    }
  }

  generateColumnPropertiesObj = (name: string, qoutesItem: QoutesItem, typePlh: 'value' | 'index') => {
    const columnItem = [name];
    const currencies = Object.keys(qoutesItem.rates);
    columnItem.push(...currencies.map(item => `${item}/${qoutesItem.base}`));
    const colProperty: Record<string, ValueColumnProperties> = { name: new ValueColumnProperties(name) };
    columnItem.push(...currencies
      .slice(0, -1)
      .map((item, index) => currencies
        .slice(index + 1)
        .map(subItem => `${item}/${subItem}`))
      .reduce((arrRes, arrItems) => arrRes.concat(arrItems))
    )
    for (let i = 1; i < columnItem.length; i++) {
      const item = columnItem[i];
      if (typePlh === 'index')
        colProperty[item] = { value: i + '', bestChoice: false };
      else if (typePlh === 'value') {
        const keys: string[] = item.split('/');
        let value = (keys[1] !== qoutesItem.base ? (qoutesItem.rates[keys[0]] / qoutesItem.rates[keys[1]])
          : (qoutesItem.rates[keys[0]])).toFixed(this.props.significantDigits);
        colProperty[item] = { value: value, bestChoice: false };
      }
    }
    return colProperty;
  }
}

export default QoutesGrid;
