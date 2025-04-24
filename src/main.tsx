
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Call the element loader before the app renders
defineCustomElements(window);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
