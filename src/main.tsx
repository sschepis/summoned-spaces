import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupRealtimeForEnvironment } from './services/vercel-realtime-manager';

// Set up appropriate realtime system based on environment
setupRealtimeForEnvironment();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
