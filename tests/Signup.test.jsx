import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '../src/pages/Signup';
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

describe('Signup Component', () => {
    const mockSignup = jest.fn();

    beforeEach(() => {
        useAuth.mockReturnValue({
            signup: mockSignup,
        });
        mockSignup.mockClear();
        mockNavigate.mockClear();
    });

    test('renders signup form', () => {
        render(<Signup />);
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    test('handles successful signup', async () => {
        mockSignup.mockResolvedValue({});
        render(<Signup />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });

        // Check the terms checkbox
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('shows error when passwords do not match', async () => {
        render(<Signup />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password456' } });

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
            expect(mockSignup).not.toHaveBeenCalled();
        });
    });

    test('displays error on signup failure', async () => {
        mockSignup.mockRejectedValue(new Error('Email already in use'));
        render(<Signup />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed to create an account.*email already in use/i)).toBeInTheDocument();
        });
    });

    test('passes accessibility check', async () => {
        const { container } = render(<Signup />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    }, 10000);
});
