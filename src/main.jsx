import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import ErrorBoundary from './components/ErrorBoundary';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Expose for debugging/seeding
window.db = db;
window.auth = auth;
window.collection = collection;
window.addDoc = addDoc;
window.serverTimestamp = serverTimestamp;

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
