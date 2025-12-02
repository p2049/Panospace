import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Feed from '../src/pages/Feed';
import { getDocs } from 'firebase/firestore';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock Firebase functions
jest.mock('firebase/firestore', () => {
    const originalModule = jest.requireActual('firebase/firestore');
    return {
        ...originalModule,
        getFirestore: jest.fn(),
        collection: jest.fn(),
        query: jest.fn(),
        orderBy: jest.fn(),
        limit: jest.fn(),
        where: jest.fn(),
        getDocs: jest.fn(),
        doc: jest.fn(),
        getDoc: jest.fn(),
    };
});

// Mock Post component to avoid complex rendering
jest.mock('../src/components/Post', () => ({ post }) => <div data-testid="post-item">{post.title}</div>);
// Mock SkeletonPost - although UI might use spinner now, keeping it if used, otherwise tests should look for spinner
jest.mock('../src/components/SkeletonPost', () => () => <div data-testid="skeleton-post">Loading...</div>);

// Mock React Router
jest.mock('react-router-dom', () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock Auth Context
jest.mock('../src/context/AuthContext', () => ({
    useAuth: () => ({
        currentUser: { uid: 'test-user-id', displayName: 'Test User' },
    }),
}));

// Mock Firebase initialization to prevent emulator connection errors
jest.mock('../src/firebase', () => ({
    db: {},
    auth: {},
    storage: {},
    functions: {},
    analytics: {}
}));

describe('Feed Component', () => {
    beforeEach(() => {
        getDocs.mockClear();
        // Setup default mock for getDoc to avoid "not a function" errors if called
        const { getDoc } = require('firebase/firestore');
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
                main: [],
                niches: {}
            })
        });
    });

    test('renders loading state initially', async () => {
        getDocs.mockReturnValue(new Promise(() => { })); // Never resolves
        render(<Feed />);
        expect(screen.queryByTestId('post-item')).not.toBeInTheDocument();
    });

    test('renders posts after loading', async () => {
        const mockPosts = [
            { id: '1', title: 'Post 1', data: () => ({ title: 'Post 1' }) },
            { id: '2', title: 'Post 2', data: () => ({ title: 'Post 2' }) },
        ];
        getDocs.mockResolvedValue({
            docs: mockPosts,
        });

        render(<Feed />);

        await waitFor(() => {
            expect(screen.getAllByTestId('post-item')).toHaveLength(2);
            expect(screen.getByText('Post 1')).toBeInTheDocument();
            expect(screen.getByText('Post 2')).toBeInTheDocument();
        });
    });

    test('renders empty state when no posts', async () => {
        getDocs.mockResolvedValue({
            docs: [],
        });

        render(<Feed />);

        await waitFor(() => {
            expect(screen.getByText(/No posts found/i)).toBeInTheDocument();
            expect(screen.getByText(/Follow more artists or select disciplines/i)).toBeInTheDocument();
        });
    });

    test('passes accessibility check', async () => {
        getDocs.mockResolvedValue({
            docs: [],
        });
        const { container } = render(<Feed />);
        await waitFor(() => expect(screen.getByText(/No posts found/i)).toBeInTheDocument());

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    }, 10000);
});
