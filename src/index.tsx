import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import QoutesGrid from './qoutesGrid';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <QoutesGrid
      urlsAndNames={["first", "second", "third"].map(item => [`http://localhost:3000/api/v1/${item}`, item[0].toUpperCase() + item.slice(1)])}
      significantDigits={2}
      rows={6}
    />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
