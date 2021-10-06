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
  columnHandleProperties: Record<string, number>,
  columnProperties: Map<string, Record<string, number>>
};

interface QoutesGridProps { urlsAndNames: Map<string, string> };

class QoutesGrid extends React.Component<QoutesGridProps, QoutesGridState>{
  state: QoutesGridState = {
    qoutesItems: new Map<string, QoutesItem>(),
    columnHandleProperties: {},
    columnProperties: new Map<string, Record<string, number>>()
  }
  componentDidMount() {
    
  }
  render() {
    return (
      <div className="qoutesGrid">
        <div className="qoutesGridBody"></div>
      </div>
    )
  }
  
}

export default QoutesGrid;
