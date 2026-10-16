import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import './index.css';
import App from './App';
import { StoreProvider, useStore } from './lib/store';
import { TooltipProvider } from './components/ui/tooltip';

const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;

function ThemedToaster() {
  const { theme } = useStore();
  return <Toaster theme={theme} position="bottom-right" richColors closeButton toastOptions={{ className: 'font-sans' }} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <Router>
        <TooltipProvider delayDuration={200}>
          <App />
          <ThemedToaster />
        </TooltipProvider>
      </Router>
    </StoreProvider>
  </React.StrictMode>,
);
