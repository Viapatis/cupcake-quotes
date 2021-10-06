import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import QoutesGrid from './qoutesGrid';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <QoutesGrid urlsAndNames={new Map<string, string>(["first", "second", "third"].map(item => [item, `http://localhost:3000/api/v1/${item}`]))} />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
