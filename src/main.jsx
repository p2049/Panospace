import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import './styles/ui-framework.css'
// import './styles/viewport-scaling.css' // Temporarily disabled - causing black screen on mobile
import './i18n';
import App from './App.jsx'

import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Expose for debugging/seeding
window.db = db;
window.auth = auth;
window.collection = collection;
window.addDoc = addDoc;
window.serverTimestamp = serverTimestamp;

// 🛡️ Initialize Security Guard (DEV ONLY)
import { initializeUploadGuard } from '@/core/security/uploadGuard';
if (import.meta.env.DEV) {
  initializeUploadGuard();
}

// Unregister service workers in development to prevent fetch interception issues
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => {
      reg.unregister();
      console.log('[DEV] Service worker unregistered:', reg.scope);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
)
