/* global jest */

jest.mock('@react-native-community/geolocation', () => ({
  setRNConfiguration: jest.fn(),
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn(),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const {View} = require('react-native');
  const MapComponent = React.forwardRef((props, ref) =>
    React.createElement(View, {...props, ref}),
  );
  return {
    __esModule: true,
    default: MapComponent,
    Marker: props => React.createElement(View, props),
    Polyline: props => React.createElement(View, props),
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('@react-native-ml-kit/image-labeling', () => ({
  __esModule: true,
  default: {label: jest.fn(async () => [])},
}));

jest.mock('react-native-vision-camera', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    Camera: props => React.createElement(View, props),
    CommonResolutions: {},
    useCameraDevice: jest.fn(() => null),
    useCameraPermission: jest.fn(() => ({
      hasPermission: false,
      canRequestPermission: true,
      requestPermission: jest.fn(async () => false),
    })),
    usePhotoOutput: jest.fn(() => ({capturePhotoToFile: jest.fn()})),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  createAsyncStorage: () => ({
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  }),
}));
