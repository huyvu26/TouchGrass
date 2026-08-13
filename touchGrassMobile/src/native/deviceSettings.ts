import {NativeModules, Platform} from 'react-native';

interface DeviceSettingsNativeModule {
  getFineLocationPermissionStatus(): Promise<'granted' | 'notDetermined' | 'denied' | 'blocked'>;
  markFineLocationPermissionRequested(): Promise<void>;
  isLocationServicesEnabled(): Promise<boolean>;
  openLocationSettings(): Promise<void>;
}

function getModule(): DeviceSettingsNativeModule {
  if (Platform.OS !== 'android' || !NativeModules.DeviceSettings) {
    throw new Error('Cài đặt vị trí chỉ khả dụng trên Android.');
  }
  return NativeModules.DeviceSettings as DeviceSettingsNativeModule;
}

export const deviceSettings = {
  getFineLocationPermissionStatus: () => getModule().getFineLocationPermissionStatus(),
  markFineLocationPermissionRequested: () => getModule().markFineLocationPermissionRequested(),
  isLocationServicesEnabled: () => getModule().isLocationServicesEnabled(),
  openLocationSettings: () => getModule().openLocationSettings(),
};
