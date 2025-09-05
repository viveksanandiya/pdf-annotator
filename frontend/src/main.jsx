import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Configure React-PDF
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// // Set worker source with fallback 
// pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// // Disable console warnings in development
// if (process.env.NODE_ENV === 'development') {
//   const originalWarn = console.warn;
//   console.warn = function(...args) {
//     if (args[0]?.includes?.('react-pdf')) return;
//     originalWarn.apply(console, args);
//   };
// }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)