import {NativeModules, Platform} from 'react-native';

export interface PendingLockedApp {
  packageName: string;
  appName: string;
}

interface AppControlNativeModule {
  syncAppLimitRules(rulesJson: string): Promise<void>;
  isAppControlEnabled(): Promise<boolean>;
  setAppControlEnabled(enabled: boolean): Promise<void>;
  getPendingLockedApp(): Promise<PendingLockedApp | null>;
  grantTemporaryUnlock(userTaskId: string, minutes: number): Promise<boolean>;
  setTemporaryUnlockUntil(packageName: string, expiresAt: string): Promise<void>;
  emergencyDisable(): Promise<void>;
}

function getModule(): AppControlNativeModule {
  if (Platform.OS !== 'android' || !NativeModules.AppControl) {
    throw new Error('App Control chỉ khả dụng trên Android.');
  }
  return NativeModules.AppControl as AppControlNativeModule;
}

export const appControlNative = {
  syncRules: (rules: unknown) => getModule().syncAppLimitRules(JSON.stringify(rules)),
  isEnabled: () => getModule().isAppControlEnabled(),
  setEnabled: (enabled: boolean) => getModule().setAppControlEnabled(enabled),
  getPendingLockedApp: () => getModule().getPendingLockedApp(),
  grantTemporaryUnlock: (userTaskId: string, minutes: number) =>
    getModule().grantTemporaryUnlock(userTaskId, minutes),
  setTemporaryUnlockUntil: (packageName: string, expiresAt: string) =>
    getModule().setTemporaryUnlockUntil(packageName, expiresAt),
  emergencyDisable: () => getModule().emergencyDisable(),
};
