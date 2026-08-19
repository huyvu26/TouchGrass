import {usageStatsNative} from '../native/usageStats';
import {
  getProtectedPackages,
  submitAppUsageSummary,
} from './appControlApiService';

export async function getSelectableApps() {
  const [apps, protectedResponse] = await Promise.all([
    usageStatsNative.getInstalledLaunchableApps(),
    getProtectedPackages(),
  ]);
  const protectedPackages = new Set(protectedResponse.items);
  return apps.filter(app => !protectedPackages.has(app.packageName));
}

export async function getTodayUsage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return usageStatsNative.getAppUsageStats(start, Date.now());
}

export async function syncTodayUsageSummary() {
  const usage = await getTodayUsage();
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const totalTimeInForegroundMs = usage.reduce(
    (total, item) => total + item.totalTimeInForegroundMs,
    0,
  );

  return submitAppUsageSummary({
    date,
    totalScreenTimeSeconds: Math.min(
      86_400,
      Math.round(totalTimeInForegroundMs / 1000),
    ),
    apps: usage.map(item => ({
      packageName: item.packageName,
      totalTimeInForegroundMs: Math.round(item.totalTimeInForegroundMs),
      ...(item.lastTimeUsed > 0
        ? {lastTimeUsed: new Date(item.lastTimeUsed).toISOString()}
        : {}),
    })),
  });
}

export const isUsageAccessGranted = usageStatsNative.isUsageAccessGranted;
export const openUsageAccessSettings = usageStatsNative.openUsageAccessSettings;
