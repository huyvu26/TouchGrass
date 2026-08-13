import {
  getAppLimitRules,
  type AppLimitRule,
} from '../storage/appControlStorage';
import {getTodayUsage} from './usageStatsService';
import {isProtectedPackage} from './protectedPackages';

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
