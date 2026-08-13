import {NativeModules, Platform} from 'react-native';

interface AccessibilityMonitorNativeModule {
  isAccessibilityEnabled(): Promise<boolean>;
  openAccessibilitySettings(): Promise<void>;
  getCurrentForegroundPackage(): Promise<string | null>;
}

function getModule(): AccessibilityMonitorNativeModule {
  if (Platform.OS !== 'android' || !NativeModules.AccessibilityMonitor) {
    throw new Error('Accessibility chỉ khả dụng trên Android.');
  }
  return NativeModules.AccessibilityMonitor as AccessibilityMonitorNativeModule;
}

export const accessibilityMonitor = {
  isEnabled: () => getModule().isAccessibilityEnabled(),
  openSettings: () => getModule().openAccessibilitySettings(),
  getCurrentForegroundPackage: () => getModule().getCurrentForegroundPackage(),
};
