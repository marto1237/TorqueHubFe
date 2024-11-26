import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/auth/Login';
import AuthService from '../src/components/configuration/Services/AnswerService';
import { useAppNotifications } from '../src/common/NotificationProvider'; // Correct path to NotificationProvider

jest.mock('firebase/storage');
jest.mock('firebase/app');
// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));



describe('Login Component', () => {
  const mockNavigate = jest.fn();
  const mockNotifications = { show: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));
    useAppNotifications.mockReturnValue(mockNotifications);
  });

  test('renders the login form correctly', () => {
    render(
      <MemoryRouter>
        <Login setLoggedIn={jest.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument();
  });

  test('shows validation errors for invalid inputs', async () => {
    render(
      <MemoryRouter>
        <Login setLoggedIn={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
  });

  test('calls login API and navigates on successful login', async () => {
    AuthService.login.mockResolvedValueOnce({
      jwtToken: 'mock-jwt-token',
    });

    render(
      <MemoryRouter>
        <Login setLoggedIn={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('shows error notification on failed login', async () => {
    AuthService.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <MemoryRouter>
        <Login setLoggedIn={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
        rememberMe: false,
      });
      expect(mockNotifications.show).toHaveBeenCalledWith('Invalid credentials', {
        autoHideDuration: 3000,
        severity: 'error',
      });
    });
  });
});
