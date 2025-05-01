
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Mobile app capabilities will be loaded after the app is rendered
// to avoid blocking the initial render
const loadPwaElements = async () => {
  try {
    const { defineCustomElements } = await import('@ionic/pwa-elements/loader');
    defineCustomElements(window);
    console.log('PWA elements loaded successfully');
  } catch (error) {
    console.error('Failed to load PWA elements:', error);
  }
};

// Check for browserslist update notification
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
}

// Render the app first, then load PWA elements
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Load PWA elements after render
loadPwaElements();
