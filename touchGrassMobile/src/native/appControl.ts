import {NativeModules, Platform} from 'react-native';

export interface PendingLockedApp {
  packageName: string;
  appName: string;
}

interface AppControlNativeModule {
  syncAppLimitRules(rulesJson: string, protectedPackagesJson: string): Promise<void>;
  isAppControlEnabled(): Promise<boolean>;
  setAppControlEnabled(enabled: boolean): Promise<void>;
  getPendingLockedApp(): Promise<PendingLockedApp | null>;
  setTemporaryUnlockUntil(packageName: string, expiresAt: string): Promise<void>;
  emergencyDisable(): Promise<void>;
  clearData(): Promise<void>;
}

function getModule(): AppControlNativeModule {
  if (Platform.OS !== 'android' || !NativeModules.AppControl) {
    throw new Error('App Control chỉ khả dụng trên Android.');
  }
  return NativeModules.AppControl as AppControlNativeModule;
}

export const appControlNative = {
  syncRules: (rules: unknown, protectedPackages: string[]) =>
    getModule().syncAppLimitRules(
      JSON.stringify(rules),
      JSON.stringify(protectedPackages),
    ),
  isEnabled: () => getModule().isAppControlEnabled(),
  setEnabled: (enabled: boolean) => getModule().setAppControlEnabled(enabled),
  getPendingLockedApp: () => getModule().getPendingLockedApp(),
  setTemporaryUnlockUntil: (packageName: string, expiresAt: string) =>
    getModule().setTemporaryUnlockUntil(packageName, expiresAt),
  emergencyDisable: () => getModule().emergencyDisable(),
  clearData: () => getModule().clearData(),
};
