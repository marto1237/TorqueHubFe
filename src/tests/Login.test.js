import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/auth/Login';
import AuthService from '../components/configuration/Services/AuthService';
import { useAppNotifications } from '../components/common/NotificationProvider';

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Notifications
jest.mock('../components/common/NotificationProvider', () => ({
  useAppNotifications: jest.fn(),
}));

// Mock AuthService
jest.mock('../components/configuration/Services/AuthService', () => ({
  login: jest.fn(),
}));

describe('Login Component', () => {
  const mockNotifications = { show: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    useAppNotifications.mockReturnValue(mockNotifications);
  });

  test('calls login API and navigates on successful login', async () => {
    // Mock API response for login
    AuthService.login.mockResolvedValueOnce({
      jwtToken: 'mock-jwt-token',
    });

    render(
      <MemoryRouter>
        <Login setLoggedIn={jest.fn()} />
      </MemoryRouter>
    );

    // Simulate user input
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    // Wait for login API to be called and navigation to be triggered
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });

    });
  });
});
