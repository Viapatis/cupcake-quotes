import React from 'react';
import './qoutesGrid.css';
interface QoutesItem {
  rates: Record<string, number>,
  timestamp: number,
  base: string,
  date: string,
};

interface QoutesGridState {
  qoutesItems: Map<string, QoutesItem>,
  columnHandleProperties: Record<string, string>,
  columnsProperties: Map<string, Record<string, string>>
};

interface QoutesGridProps { urlsAndNames: Map<string, string> };

class QoutesGrid extends React.Component<QoutesGridProps, QoutesGridState>{
  state: QoutesGridState = {
    qoutesItems: new Map<string, QoutesItem>(),
    columnHandleProperties: {},
    columnsProperties: new Map<string, Record<string, string>>()
  }
  componentDidMount() {
    const urlsAndNames: Map<string, string> = this.props.urlsAndNames;
    this.handleFetch(urlsAndNames.values().next().value);
    urlsAndNames.forEach((url, name) => this.itemFetch(url, false, name));
  }
  render() {
    return (
      <div className="qoutesGrid">
        <div className="qoutesGridBody"></div>
      </div>
    )
  }
  itemFetch = async (url: string, poll: boolean, name: string) => {
    const curUrl = poll ? `${url}/poll` : url;
    const response = await fetch(curUrl);
    if (response.status === 502)
      await this.itemFetch(curUrl, poll, name)
    else if (response.status !== 200) {
      console.log(response.statusText);
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      await this.itemFetch(curUrl, poll, name)
    } else {
      const qoutesItem: QoutesItem = await response.json();
      const columnProperties: Record<string, string> = this.generateColumnPropertiesObj(name, qoutesItem, 'value');
      this.setState(prevState => {
        qoutesItems: new Map<string, QoutesItem>(prevState.qoutesItems).set(name, qoutesItem);
        columnsProperties: new Map<string, Record<string, string>>(prevState.columnsProperties).set(name, columnProperties);
      }
      );
      this.itemFetch(url, true, name);
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
      const columnProperties: Record<string, string> = this.generateColumnPropertiesObj('Pair name/market', qoutesItem, 'index');
      this.setState({
        columnHandleProperties: columnProperties
      });
    }
  }

  generateColumnPropertiesObj = (name: string, qoutesItem: QoutesItem, typePlh: 'value' | 'index') => {
    const columnItem: string[] = [name];
    const currencies: string[] = (Object.keys(qoutesItem.rates) as Array<string>);
    columnItem.push(...currencies.map(item => `${item}/${qoutesItem.base}`));
    const handle: Record<string, string> = { name: name };
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
        handle[item] = i + '';
      else if (typePlh === 'value') {
        const keys: string[] = item.split('/');
        if (keys[1] !== qoutesItem.base) {
          handle[item] = (qoutesItem.rates[keys[0]] / qoutesItem.rates[keys[1]]).toFixed(2);
        } else {
          handle[item] = qoutesItem.rates[keys[0]].toFixed(2);
        }
      }
    }
    return handle;
  }
}

export default QoutesGrid;
