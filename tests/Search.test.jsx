import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Search from '../src/pages/Search';
import { getDocs } from 'firebase/firestore';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn(),
    getDocs: jest.fn(),
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock Firebase initialization
jest.mock('../src/firebase', () => ({
    db: {},
    auth: {},
    storage: {},
    functions: {},
    analytics: {}
}));

describe('Search Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        getDocs.mockClear();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('renders search input', () => {
        render(<Search />);
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    test('searches for posts', async () => {
        getDocs.mockResolvedValue({
            docs: [
                {
                    id: 'post1',
                    data: () => ({
                        title: 'Test Post',
                        authorName: 'Test User',
                        location: 'Test Location',
                        items: [{ type: 'image', url: 'http://example.com/image.jpg' }]
                    }),
                },
            ],
        });

        render(<Search />);

        const input = screen.getByPlaceholderText('Search...');

        // Wrap everything in a single act block
        await act(async () => {
            fireEvent.change(input, { target: { value: 'test' } });
            jest.advanceTimersByTime(500);
            // Flush promises
            await Promise.resolve();
        });

        // Wait for results to appear
        await waitFor(() => {
            expect(getDocs).toHaveBeenCalled();
            expect(screen.getByText('Test Post')).toBeInTheDocument();
        });
    });

    test('searches for users', async () => {
        getDocs.mockResolvedValue({
            docs: [
                {
                    id: 'user1',
                    data: () => ({
                        displayName: 'Test User',
                        artTypes: ['Photography'],
                        photoURL: 'http://example.com/photo.jpg',
                    }),
                },
            ],
        });

        const { findByText } = render(<Search />);

        await act(async () => {
            // Switch to Artists tab
            fireEvent.click(screen.getByText('Artists'));
            jest.advanceTimersByTime(500);

            const input = screen.getByPlaceholderText('Search...');
            fireEvent.change(input, { target: { value: 'test' } });
            jest.advanceTimersByTime(500);
            await Promise.resolve();
        });

        const user = await findByText('Test User');
        expect(user).toBeInTheDocument();
    });

    test('passes accessibility check', async () => {
        getDocs.mockResolvedValue({ docs: [] });

        const { container } = render(<Search />);

        await act(async () => {
            jest.runAllTimers();
            await Promise.resolve();
        });

        jest.useRealTimers();

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    }, 20000);
});
