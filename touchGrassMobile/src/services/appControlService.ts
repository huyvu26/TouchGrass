import {
  getAppLimitRules,
  type AppLimitRule,
} from '../storage/appControlStorage';
import {getTodayUsage} from './usageStatsService';
import {isProtectedPackage} from './protectedPackages';
import {appControlNative} from '../native/appControl';
import {
  deleteAppControlRuleByPackage,
  getAppControlRules,
  upsertAppControlRule,
} from './appControlApiService';
import {
  removeAppLimitRule,
  replaceAppLimitRules,
  saveAppLimitRule,
} from '../storage/appControlStorage';

export interface AppLimitEvaluation {
  shouldWarn: boolean;
  usedMinutes: number;
  reason: 'PROTECTED' | 'NO_RULE' | 'DISABLED' | 'OUTSIDE_SCHEDULE' | 'UNDER_LIMIT' | 'LIMIT_REACHED';
}

function isWithinSchedule(rule: AppLimitRule, date: Date): boolean {
  const mondayFirstDay = (date.getDay() + 6) % 7;
  if (!rule.activeDays.includes(mondayFirstDay)) return false;
  const current = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return current >= rule.startTime && current <= rule.endTime;
}

export async function evaluateAppLimit(packageName: string): Promise<AppLimitEvaluation> {
  if (isProtectedPackage(packageName)) return {shouldWarn: false, usedMinutes: 0, reason: 'PROTECTED'};
  const rule = (await getAppLimitRules()).find(item => item.packageName === packageName);
  if (!rule) return {shouldWarn: false, usedMinutes: 0, reason: 'NO_RULE'};
  if (!rule.enabled) return {shouldWarn: false, usedMinutes: 0, reason: 'DISABLED'};
  if (!isWithinSchedule(rule, new Date())) return {shouldWarn: false, usedMinutes: 0, reason: 'OUTSIDE_SCHEDULE'};
  const usage = (await getTodayUsage()).find(item => item.packageName === packageName);
  const usedMinutes = Math.floor((usage?.totalTimeInForegroundMs ?? 0) / 60000);
  return {
    shouldWarn: usedMinutes >= rule.dailyLimitMinutes,
    usedMinutes,
    reason: usedMinutes >= rule.dailyLimitMinutes ? 'LIMIT_REACHED' : 'UNDER_LIMIT',
  };
}

export async function syncAppControlRules(): Promise<void> {
  await appControlNative.syncRules(await getAppLimitRules());
}

export async function refreshAppControlRulesFromBackend(): Promise<AppLimitRule[]> {
  const response = await getAppControlRules();
  const rules = response.items.map(({id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rule}) => rule);
  await replaceAppLimitRules(rules);
  await appControlNative.syncRules(rules);
  return rules;
}

export async function saveAndSyncAppControlRule(rule: AppLimitRule): Promise<void> {
  const remote = await upsertAppControlRule(rule);
  const stored: AppLimitRule = {
    packageName: remote.packageName,
    appName: remote.appName,
    enabled: remote.enabled,
    dailyLimitMinutes: remote.dailyLimitMinutes,
    activeDays: remote.activeDays,
    startTime: remote.startTime,
    endTime: remote.endTime,
  };
  await saveAppLimitRule(stored);
  await syncAppControlRules();
}

export async function removeAndSyncAppControlRule(packageName: string): Promise<void> {
  await deleteAppControlRuleByPackage(packageName);
  await removeAppLimitRule(packageName);
  await syncAppControlRules();
}

export const isAppControlEnabled = appControlNative.isEnabled;
export const setAppControlEnabled = appControlNative.setEnabled;
export const grantPendingAppTemporaryUnlock = appControlNative.grantTemporaryUnlock;
export const getPendingLockedApp = appControlNative.getPendingLockedApp;
export const setTemporaryUnlockUntil = appControlNative.setTemporaryUnlockUntil;
export const emergencyDisableAppControl = appControlNative.emergencyDisable;
