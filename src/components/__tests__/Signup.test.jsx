import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../../pages/Signup';

describe('Signup Component', () => {
    test('renders signup form elements', () => {
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    test('requires checkbox to be checked', () => {
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
        expect(checkbox).toBeRequired();
    });

    test('handles input changes', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );
        const emailInput = screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);
        const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.type(confirmPasswordInput, 'password123');

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
        expect(confirmPasswordInput.value).toBe('password123');
    });
});
