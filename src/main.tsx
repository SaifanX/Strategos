import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from './App.tsx';
import './index.css';

// @ts-ignore
const convexUrl = import.meta.env.VITE_CONVEX_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {convexUrl ? (
        <ConvexProvider client={new ConvexReactClient(convexUrl)}>
          <App />
        </ConvexProvider>
      ) : (
        <App />
      )}
    </BrowserRouter>
  </StrictMode>,
);
