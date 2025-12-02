import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../../pages/Login';
import { BrowserRouter } from 'react-router-dom';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        login: jest.fn(),
        googleSignIn: jest.fn(),
        currentUser: null
    })
}));

describe('Login Component', () => {
    test('renders login form', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    test('handles input changes', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        const emailInput = screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });
});
