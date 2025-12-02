import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../src/pages/Login';
import { useAuth } from '../src/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock useAuth
jest.mock('../src/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('Login Component', () => {
    const mockLogin = jest.fn();
    const mockGoogleSignIn = jest.fn();

    beforeEach(() => {
        useAuth.mockReturnValue({
            login: mockLogin,
            googleSignIn: mockGoogleSignIn,
        });
        mockLogin.mockClear();
        mockGoogleSignIn.mockClear();
        mockNavigate.mockClear();
    });

    test('renders login form', () => {
        render(<Login />);
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    test('handles email/password login', async () => {
        render(<Login />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('handles google login', async () => {
        render(<Login />);

        fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

        await waitFor(() => {
            expect(mockGoogleSignIn).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('displays error on login failure', async () => {
        mockLogin.mockRejectedValue(new Error('Invalid credentials'));
        render(<Login />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed to log in: invalid credentials/i)).toBeInTheDocument();
        });
    });

    test('passes accessibility check', async () => {
        const { container } = render(<Login />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
