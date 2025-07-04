import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import './i18n';
import { queryClient } from './lib/queryClient';
import { registerSW, defaultSWConfig, markPerformance } from './utils/serviceWorker';

// Performance mark for app initialization
markPerformance('app-init-start');

// Register Service Worker for PWA functionality
registerSW({
  ...defaultSWConfig,
  onUpdate: (registration) => {
    console.log('🆕 App update available');
    // Show update notification to users
    if (confirm('A new version is available. Would you like to update?')) {
      window.location.reload();
    }
  },
  onSuccess: (registration) => {
    console.log('✅ App is now offline-ready');
    markPerformance('service-worker-ready');
  }
});

// PWA Install Handler
window.addEventListener('pwa-install-available', () => {
  console.log('💾 PWA can be installed');
  // Could show install banner here
});

// Performance monitoring
markPerformance('dom-content-loaded');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);

// Mark app render complete
markPerformance('app-render-complete');

// Log performance when page loads
window.addEventListener('load', () => {
  markPerformance('window-load-complete');
  
  // Log initial performance metrics
  setTimeout(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('📊 Performance Metrics:', {
          'DOM Content Loaded': Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
          'Page Load Complete': Math.round(navigation.loadEventEnd - navigation.fetchStart),
          'First Byte': Math.round(navigation.responseStart - navigation.fetchStart),
        });
      }
    }
  }, 100);
});