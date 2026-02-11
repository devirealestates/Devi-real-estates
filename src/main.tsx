import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { trackEnhancedVisitor } from '@/utils/enhancedVisitorTracker';
import { visitorDataMaintenance } from '@/utils/visitorDataMaintenance';

// Clean up any JSON objects stored in localStorage/sessionStorage
const cleanupLocationData = () => {
  const userLocation = localStorage.getItem('userLocation');
  if (userLocation && (userLocation.startsWith('{') || userLocation.startsWith('['))) {
    console.log('Cleaning up malformed location data');
    localStorage.removeItem('userLocation');
    sessionStorage.removeItem('userLocation');
  }
  
  const sessionLocation = sessionStorage.getItem('userLocation');
  if (sessionLocation && (sessionLocation.startsWith('{') || sessionLocation.startsWith('['))) {
    sessionStorage.removeItem('userLocation');
  }
};

cleanupLocationData();

// Unregister any existing service workers to prevent errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service worker unregistered');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);

// Start background maintenance service
visitorDataMaintenance.start();

// Enhanced visitor tracking - only track if not on admin route
if (!window.location.pathname.startsWith('/admin')) {
  // Delay tracking slightly to ensure all resources are loaded
  setTimeout(() => {
    trackEnhancedVisitor();
  }, 1000);
}
