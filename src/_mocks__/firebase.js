export const getStorage = jest.fn(() => ({
    ref: jest.fn(() => ({
        getDownloadURL: jest.fn(() => Promise.resolve('mock-url')),
    })),
}));

export const initializeApp = jest.fn();