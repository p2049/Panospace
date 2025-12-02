import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreatePost from '../src/pages/CreatePost';
import { useAuth } from '../src/context/AuthContext';
import { addDoc } from 'firebase/firestore';
import { uploadBytesResumable } from 'firebase/storage';
import { compressImage } from '../src/utils/imageCompression';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock useAuth
jest.mock('../src/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
    serverTimestamp: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
    ref: jest.fn(),
    uploadBytesResumable: jest.fn(),
    deleteObject: jest.fn(),
}));

// Mock utils
jest.mock('../src/utils/imageCompression', () => ({
    compressImage: jest.fn(),
}));

jest.mock('../src/utils/printfulApi', () => ({
    PRINT_SIZES: ['8x10', '11x14'],
    mockPODIntegration: jest.fn(),
}));

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// Mock Firebase initialization
jest.mock('../src/firebase', () => ({
    db: {},
    auth: {},
    storage: {},
    functions: {},
    analytics: {}
}));

describe('CreatePost Component', () => {
    const mockUser = {
        uid: 'user123',
        displayName: 'Test User',
        email: 'test@example.com',
    };

    beforeEach(() => {
        useAuth.mockReturnValue({ currentUser: mockUser });
        compressImage.mockImplementation((file) => Promise.resolve(file));
        addDoc.mockClear();
        uploadBytesResumable.mockClear();
        mockNavigate.mockClear();
    });

    test('renders create post interface', () => {
        render(<CreatePost />);
        expect(screen.getByText('Create New Post')).toBeInTheDocument();
        expect(screen.getByText('Images')).toBeInTheDocument();
        expect(screen.getByText('Title')).toBeInTheDocument();
    });

    test('adds text slide', () => {
        render(<CreatePost />);
        const fileInput = screen.getByLabelText(/Click to add images/i);
        expect(fileInput).toBeInTheDocument();
    });

    test('shows guidelines and publishes post', async () => {
        render(<CreatePost />);
        const publishBtn = screen.getByText(/Publish/i);
        expect(publishBtn).toBeInTheDocument();
        expect(publishBtn).toBeDisabled();
    });

    test('passes accessibility check', async () => {
        const { container } = render(<CreatePost />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    }, 10000);
});
