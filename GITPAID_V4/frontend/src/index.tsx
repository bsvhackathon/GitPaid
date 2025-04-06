import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Direct polyfill imports
import 'buffer';
import 'process';

// Make Buffer global
window.Buffer = window.Buffer || require('buffer').Buffer;

// Initialize the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);