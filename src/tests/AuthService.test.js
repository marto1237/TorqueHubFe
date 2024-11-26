import AuthService from '../components/configuration/Services/AuthService'; 
import api from '../components/configuration/api';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

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

  describe('AuthService', () => {
    let mock;

    beforeEach(() => {
        // Initialize a new mock adapter for each test
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        // Reset the mock adapter after each test
        mock.reset();
    });

    it('should login a user successfully', async () => {
        const loginData = { username: 'testUser', password: 'testPassword' };
        const mockResponse = { token: 'testToken' };

        // Mock the API response
        mock.onPost('/auth/login').reply(200, mockResponse);

        const result = await AuthService.login(loginData);

        expect(result).toEqual(mockResponse);
    });

    it('should throw an error for incorrect login credentials', async () => {
        const loginData = { username: 'testUser', password: 'wrongPassword' };

        // Mock a failed response
        mock.onPost('/auth/login').reply(401, { message: 'Unauthorized' });

        await expect(AuthService.login(loginData)).rejects.toThrow();
    });

    it('should register a user and return the response data', async () => {
        const userData = { username: 'newUser', password: 'newPassword' };
        const mockResponse = { success: true };

        // Mock the API response
        mock.onPost('/auth/register').reply(200, mockResponse);

        const result = await AuthService.register(userData);

        expect(result).toEqual(mockResponse);
    });

    it('should refresh the token and return the response data', async () => {
        const mockResponse = { token: 'newToken' };

        // Mock the API response
        mock.onPost('/auth/refresh-token').reply(200, mockResponse);

        const result = await AuthService.refreshToken();

        expect(result).toEqual(mockResponse);
    });

    it('should log out the user and return the response data', async () => {
        const mockResponse = { success: true };

        // Mock the API response
        mock.onPost('/auth/logout').reply(200, mockResponse);

        const result = await AuthService.logout();

        expect(result).toEqual(mockResponse);
    });

    it('should check the session and return the response data', async () => {
        const mockResponse = { sessionActive: true };

        // Mock the API response
        mock.onGet('/auth/check-session').reply(200, mockResponse);

        const result = await AuthService.checkSession();

        expect(result).toEqual(mockResponse);
    });

    it('should handle token expiration and trigger a retry', async () => {
        const mockResponse = { token: 'newToken' };
        const mockOriginalResponse = { data: 'protectedData' };

        // Mock the refresh token response
        mock.onPost('/auth/refresh-token').reply(200, mockResponse);

        // Mock the original request
        mock.onGet('/protected-endpoint')
            .replyOnce(401, { message: 'JWT expired' })
            .onGet('/protected-endpoint')
            .reply(200, mockOriginalResponse);

        const result = await api.get('/protected-endpoint', { requiresAuth: true });

        expect(result.data).toEqual(mockOriginalResponse.data);
    });
});