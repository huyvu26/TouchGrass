import {NativeModules, Platform} from 'react-native';

export interface AppInfo {
  packageName: string;
  appName: string;
  isSystemApp: boolean;
  isSensitive: boolean;
}

export interface AppUsageInfo {
  packageName: string;
  appName: string;
  totalTimeInForegroundMs: number;
  lastTimeUsed: number;
}

interface UsageStatsNativeModule {
  isUsageAccessGranted(): Promise<boolean>;
  openUsageAccessSettings(): Promise<void>;
  getInstalledLaunchableApps(): Promise<AppInfo[]>;
  getAppUsageStats(startAt: number, endAt: number): Promise<AppUsageInfo[]>;
}

function getModule(): UsageStatsNativeModule {
  if (Platform.OS !== 'android' || !NativeModules.UsageStats) {
    throw new Error('Usage Stats chỉ khả dụng trên Android.');
  }
  return NativeModules.UsageStats as UsageStatsNativeModule;
}

export const usageStatsNative = {
  isUsageAccessGranted: () => getModule().isUsageAccessGranted(),
  openUsageAccessSettings: () => getModule().openUsageAccessSettings(),
  getInstalledLaunchableApps: () => getModule().getInstalledLaunchableApps(),
  getAppUsageStats: (startAt: number, endAt: number) =>
    getModule().getAppUsageStats(startAt, endAt),
};
