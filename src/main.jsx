import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ErpProvider } from './context/ErpContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErpProvider>
      <App />
    </ErpProvider>
  </React.StrictMode>
);
