module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((@)?react-native|@react-native-community|@react-native-async-storage|@react-native-google-signin|@react-navigation|lucide-react-native|react-native-.*)/)',
  ],
  moduleNameMapper: {
    '^lucide-react-native$': '<rootDir>/__mocks__/lucide-react-native.js',
  },
  setupFiles: [
    '<rootDir>/node_modules/@react-native-google-signin/google-signin/jest/build/jest/setup.js',
    '<rootDir>/jest.setup.js',
  ],
};
