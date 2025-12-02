import { AuthProvider } from '../src/context/AuthContext';

// Mock Firebase initialization
jest.mock('../src/firebase', () => ({
    db: {},
    auth: {},
    storage: {},
    functions: {},
    analytics: {}
}));

test('imports AuthProvider', () => {
    expect(AuthProvider).toBeTruthy();
});
