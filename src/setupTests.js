// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = global.ReadableStream || class {};


// Mock react-simple-typewriter
jest.mock('react-simple-typewriter', () => ({
    useTypewriter: jest.fn(() => ({
      text: 'Welcome to Torque Hub',
      typing: true, // or false if not typing
    })),
    Cursor: () => '|',
  }));
  
jest.mock('@toolpad/core/useNotifications', () => ({
    NotificationsProvider: ({ children }) => <>{children}</>,
    useNotifications: jest.fn(() => ({
      show: jest.fn(),
    })),
  }));

  
jest.mock('firebase/storage', () => ({
    getDownloadURL: jest.fn(() => Promise.resolve('mocked-url')),
    ref: jest.fn(),
  }));

  jest.mock('axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
  }));
  
   