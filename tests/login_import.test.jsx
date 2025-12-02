import Login from '../src/pages/Login';

// Mock Firebase initialization
jest.mock('../src/firebase', () => ({
    db: {},
    auth: {},
    storage: {},
    functions: {},
    analytics: {}
}));

test('imports Login', () => {
    expect(Login).toBeTruthy();
});
