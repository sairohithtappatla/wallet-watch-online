
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './integrations/supabase/client';

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

// Check Supabase connectivity
const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('Supabase connectivity issue:', error);
    } else {
      console.log('Successfully connected to Supabase');
    }
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
  }
};

// Check for browserslist update notification
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
  console.log('Environment variables loaded:', {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
  });
  
  // Check Supabase connection in development mode
  checkSupabaseConnection();
}

// Render the app first, then load PWA elements
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Load PWA elements after render
loadPwaElements();
