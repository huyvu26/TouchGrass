import {isProtectedPackage} from './protectedPackages';
import {usageStatsNative} from '../native/usageStats';

export async function getSelectableApps() {
  const apps = await usageStatsNative.getInstalledLaunchableApps();
  return apps.filter(app => !isProtectedPackage(app.packageName));
}

export async function getTodayUsage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return usageStatsNative.getAppUsageStats(start, Date.now());
}

export const isUsageAccessGranted = usageStatsNative.isUsageAccessGranted;
export const openUsageAccessSettings = usageStatsNative.openUsageAccessSettings;
