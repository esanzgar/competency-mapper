import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import User from './components/User';

ReactDOM.render(
  // <BrowserRouter basename={process.env.PUBLIC_URL}>
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
