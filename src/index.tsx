import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import QoutesGrid from './qoutesGrid';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <QoutesGrid
      urlsAndNames={["first", "second", "third"].map(item => [`http://localhost:3000/api/v1/${item}`, item])}
      significantDigits={2}
    />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
