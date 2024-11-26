import * as axios from "axios";
import AuthService from '../components/configuration/Services/AuthService';

jest.mock('axios', () => {
    const mockAxiosInstance = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: {
            request: { use: jest.fn(), eject: jest.fn() },
            response: { use: jest.fn(), eject: jest.fn() },
        },
    };
    const mockAxios = {
        create: jest.fn(() => mockAxiosInstance),
        ...mockAxiosInstance,
    };
    return mockAxios;
});

describe('AuthService', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      sessionStorage.clear();
  
      // Mocking axios.post for specific cases
      axios.post.mockImplementation((url, data) => {
        
        if (url === '/auth/login') {
          return Promise.resolve({ data: { token: 'testToken' } });
        }
        if (url === '/auth/register') {
          return Promise.resolve({ data: { success: true } });
        }
        if (url === '/auth/refresh-token') {
          return Promise.resolve({ data: { token: 'newToken' } });
        }
        if (url === '/auth/logout') {
          return Promise.resolve({ data: { success: true } });
        }
      });
    });
  
    it('should login a user successfully', async () => {
      const loginData = { username: 'testUser', password: 'testPassword' };
      const result = await AuthService.login(loginData);
      expect(result).toEqual({ token: 'testToken' });
    });
    
    it('should register a user and return the response data', async () => {
      const userData = { username: 'newUser', password: 'newPassword' };
      const result = await AuthService.register(userData);
      expect(result).toEqual({ success: true });
    });
  
    it('should refresh the token and return the response data', async () => {
      const result = await AuthService.refreshToken();
      expect(result).toEqual({ token: 'newToken' });
    });
  
    it('should log out the user and return the response data', async () => {
      const result = await AuthService.logout();
      expect(result).toEqual({ success: true });
    });
  
    it('should check the session and return the response data', async () => {
      axios.get.mockResolvedValueOnce({ data: { sessionActive: true } });
      const result = await AuthService.checkSession();
      expect(result).toEqual({ sessionActive: true });
    });
  });