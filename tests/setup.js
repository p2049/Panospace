import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock Firebase SDK
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})),
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    signInWithPopup: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    serverTimestamp: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(() => ({})),
    ref: jest.fn(),
    uploadBytesResumable: jest.fn(),
    getDownloadURL: jest.fn(),
    deleteObject: jest.fn(),
}));

jest.mock('firebase/analytics', () => ({
    getAnalytics: jest.fn(),
}));

// Mock local firebase instance
jest.mock('../src/firebase', () => ({
    auth: {},
    db: {},
    storage: {},
    analytics: {}
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    BrowserRouter: ({ children }) => <div>{children}</div>
}));
