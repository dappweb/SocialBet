// Polyfills for Web3Auth
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
// Additional Node-style globals for browser compatibility
import process from 'process';
(window as any).process = process;
(window as any).global = window;

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
