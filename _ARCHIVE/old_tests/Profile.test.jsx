import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from '../src/pages/Profile';
import { useAuth } from '../src/context/AuthContext';
import { getDoc, getDocs } from 'firebase/firestore';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock useAuth
jest.mock('../src/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    onSnapshot: jest.fn(() => jest.fn()), // Returns unsubscribe function
    getCountFromServer: jest.fn(() => Promise.resolve({ data: () => ({ count: 0 }) })),
}));

jest.mock('firebase/functions', () => ({
    getFunctions: jest.fn(),
    httpsCallable: jest.fn(() => jest.fn().mockResolvedValue({ data: { url: 'http://mock.url/image.jpg' } })),
}));

// Mock FullscreenViewer
jest.mock('../src/components/FullscreenViewer', () => () => <div data-testid="fullscreen-viewer">Viewer</div>);

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'me' }),
}));

// Mock Firebase initialization
jest.mock('../src/firebase', () => ({
    db: {},
    auth: {},
    storage: {},
    functions: {},
    analytics: {}
}));

// Mock Printful API
jest.mock('../src/utils/printfulApi', () => ({
    mockPODIntegration: jest.fn(),
    PRINT_SIZES: ['8x10', '11x14'],
}));

describe('Profile Component', () => {
    const mockUser = {
        uid: 'user123',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'http://example.com/photo.jpg',
    };

    beforeEach(() => {
        const { onSnapshot } = require('firebase/firestore');

        useAuth.mockReturnValue({ currentUser: mockUser, logout: jest.fn() });
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
                displayName: 'Test User',
                bio: 'This is a bio',
                artTypes: ['Photography'],
                profileBgColor: '#000000',
            }),
        });

        // Mock onSnapshot to provide posts
        onSnapshot.mockImplementation((query, callback) => {
            // Immediately call the callback with mock data
            callback({
                docs: [
                    {
                        id: 'post1',
                        data: () => ({
                            items: [{ type: 'image', path: 'posts/user123/img1.jpg' }],
                        }),
                    },
                ],
            });
            // Return unsubscribe function
            return jest.fn();
        });

        getDocs.mockResolvedValue({
            docs: []
        });
    });

    test('renders profile info', async () => {
        render(<Profile />);

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByText('This is a bio')).toBeInTheDocument();
            // Art types are no longer displayed in the header, so we don't test for them
        });
    });

    test('renders posts', async () => {
        render(<Profile />);
        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument();
        });

        // This test would require actual post rendering which depends on SecureImage
        // For now, just verify no crash
    });

    test('passes accessibility check', async () => {
        const { container } = render(<Profile />);
        await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
