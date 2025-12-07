import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import './styles/ui-framework.css'
// import './styles/viewport-scaling.css' // Temporarily disabled - causing black screen on mobile
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

createRoot(document.getElementById('root')).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
)
