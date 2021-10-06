import React from 'react';
import './qoutesGrid.css';
import GridColumn from './gridColumn';
interface QoutesItem {
  rates: Record<string, number>,
  timestamp: number,
  base: string,
  date: string,
};
interface valueColumnProperties {
  value: string,
  bestChoice: boolean
}
interface columnProperties {
  values: Record<string, valueColumnProperties>
  , index: number
}
interface QoutesGridState {
  qoutesItems: Map<string, QoutesItem>,
  columnHandleProperties: Record<string, valueColumnProperties>,
  columnsProperties: Map<string, columnProperties>
};

interface QoutesGridProps { urlsAndNames: string[][], significantDigits: number };

class QoutesGrid extends React.Component<QoutesGridProps, QoutesGridState>{
  state: QoutesGridState = {
    qoutesItems: new Map<string, QoutesItem>(),
    columnHandleProperties: {},
    columnsProperties: new Map<string, columnProperties>()
  }
  componentDidMount() {
    const urlsAndNames = this.props.urlsAndNames;
    this.handleFetch(urlsAndNames[0][0]);
    urlsAndNames.forEach((urlAndName, index) => this.itemFetch(urlAndName, false, index));
  }

  render() {
    const { columnHandleProperties } = { ...this.state };
    const arrayColProps = Array
      .from(this.state.columnsProperties, ([key, data]) => data)
      .sort((a, b) => a.index - b.index);
    return (
      <div className="Grid">
        <div className="GridBody">
          {arrayColProps.map(value => (<GridColumn handleColProps={columnHandleProperties} colProps={value.values} />))}
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
      const colProp: Record<string, valueColumnProperties> = this.generateColumnPropertiesObj(name, qoutesItem, 'value');
      const colsProps = new Map<string, columnProperties>(this.state.columnsProperties)
        .set(name, { values: colProp, index: curIndex });
      this.checkBestChoice(colsProps);
      this.setState(prevState => {
        const qoutesItems = new Map<string, QoutesItem>(prevState.qoutesItems).set(name, qoutesItem);
        return { qoutesItems: qoutesItems, columnsProperties: colsProps }
      }
      );
      // this.itemFetch([url, name], true, curIndex);
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
      const colsProps: Record<string, valueColumnProperties> = this.generateColumnPropertiesObj('Pair name/market', qoutesItem, 'index');
      this.setState({
        columnHandleProperties: colsProps
      });
    }
  }

  checkBestChoice = (colsProps: Map<string, columnProperties>) => {
    const sorceNames = Array.from(colsProps.keys());
    const findObj: Record<string, Record<string, string>[]> = {}
    for (let i = 0; i < sorceNames.length; i++) {
      const curValues = colsProps.get(sorceNames[i])?.values;
      if (curValues !== undefined) {
        const typesСurrencies = Object.keys(curValues);
        for (let j = 0; j < typesСurrencies.length; j++) {
          if (typesСurrencies[j] !== 'name')
            if (typesСurrencies[j] in findObj)
              findObj[typesСurrencies[j]].push({ value: curValues[typesСurrencies[j]].value, sorceName: sorceNames[i] })
            else
              findObj[typesСurrencies[j]] = [{ value: curValues[typesСurrencies[j]].value, sorceName: sorceNames[i] }];
        }
      }
    }
    for (let typeСurrency in findObj) {
      findObj[typeСurrency].sort((a, b) => (+a.value) - (+b.value));
      let bestChoiceFlag = false;
      console.log(findObj[typeСurrency]);
      if (findObj[typeСurrency].length > 1 && +findObj[typeСurrency][0].value < +findObj[typeСurrency][1].value)
        bestChoiceFlag = true;
      findObj[typeСurrency].forEach((item, index) => {
        const colProp = { ...colsProps.get(item.sorceName) };
        console.log(index === 0 && bestChoiceFlag, bestChoiceFlag);
        colProp!.values![typeСurrency].bestChoice = index === 0 && bestChoiceFlag;
      })
    }
  }

  generateColumnPropertiesObj = (name: string, qoutesItem: QoutesItem, typePlh: 'value' | 'index') => {
    const columnItem: string[] = [name];
    const currencies: string[] = (Object.keys(qoutesItem.rates) as Array<string>);
    columnItem.push(...currencies.map(item => `${item}/${qoutesItem.base}`));
    const handle: Record<string, valueColumnProperties> = { name: { value: name, bestChoice: false } };
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
        handle[item] = { value: i + '', bestChoice: false };
      else if (typePlh === 'value') {
        const keys: string[] = item.split('/');
        let value = (keys[1] !== qoutesItem.base ? (qoutesItem.rates[keys[0]] / qoutesItem.rates[keys[1]])
          : (qoutesItem.rates[keys[0]])).toFixed(this.props.significantDigits);
        handle[item] = { value: value, bestChoice: false };
      }
    }
    return handle;
  }
}

export default QoutesGrid;
