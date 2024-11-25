module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!axios)/",
    "node_modules/(?!firebase|other-esm-library)/",
    "node_modules/(?!@firebase)/"
  ],
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest", 
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(axios|firebase)/)", // Allow Jest to transform axios and firebase
  ],
  moduleNameMapper: {
    '^firebase/(.*)$': '<rootDir>/src/__mocks__/firebase.js', // Mock Firebase
    '^axios$': '<rootDir>/__mocks__/axios.js', // Mock Axios
  },
};