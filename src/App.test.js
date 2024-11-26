import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// Mock all required dependencies
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    })),
    defaults: {
      headers: {
        common: {}
      }
    },
  };
  return {
    __esModule: true,
    default: mockAxios,
  };
});
jest.mock('firebase/storage');
jest.mock('firebase/app');
jest.mock('../src/components/configuration/Services/AnswerService');
jest.mock('./components/common/Navbar', () => ({ loggedIn, userDetails }) => (
  <div data-testid="navbar">
    {loggedIn ? 'Logged In' : 'Logged Out'}
    {userDetails?.username && `Welcome ${userDetails.username}`}
  </div>
));

// Mock lazy-loaded components
jest.mock('./pages/HomePage', () => () => <div data-testid="home-page">Home Page</div>);


jest.mock('./components/configuration/utils/EventBus', () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
}));

// Mock AuthService
jest.mock('./components/configuration/Services/AnswerService', () => ({
  logout: jest.fn().mockResolvedValue({}),
}));

describe('App Component', () => {
  let queryClient;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset sessionStorage
    sessionStorage.clear();
    
    delete window.location;
    window.location = {
      href: '',
      origin: 'http://localhost',
      assign: jest.fn(),
    };
    
    // Initialize QueryClient
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderApp = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  };

  test('renders without crashing', async () => {
    await act(async () => {
      renderApp();
    });
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  test('initializes with dark theme by default', async () => {
    await act(async () => {
      renderApp();
    });
    const themeToggleButton = screen.getByLabelText('toggle theme');
    expect(themeToggleButton).toBeInTheDocument();
    expect(screen.getByTestId('LightModeIcon')).toBeInTheDocument();
  });

  test('toggles theme when theme button is clicked', async () => {
    await act(async () => {
      renderApp();
    });
    const themeToggleButton = screen.getByLabelText('toggle theme');
    
    // Click to switch to light theme
    fireEvent.click(themeToggleButton);
    expect(screen.getByTestId('DarkModeIcon')).toBeInTheDocument();
    
    // Click to switch back to dark theme
    fireEvent.click(themeToggleButton);
    expect(screen.getByTestId('LightModeIcon')).toBeInTheDocument();
  });

  test('loads user details from sessionStorage on mount', async () => {
    const mockUserDetails = {
      username: 'testuser',
      profileImage: 'test-avatar.jpg',
    };
    sessionStorage.setItem('userDetails', JSON.stringify(mockUserDetails));
  
    await act(async () => {
      renderApp();
    });
  
    // Adjust the assertions to match the actual rendered output
    expect(screen.getByTestId('navbar')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('navbar')).toHaveTextContent(`Welcome ${mockUserDetails.username}`);
  });

  test('scroll to top button functionality', async () => {
    window.scrollTo = jest.fn();

    await act(async () => {
      renderApp();
    });

    const scrollButton = screen.getByLabelText('scroll to top');
    fireEvent.click(scrollButton);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });
  
});