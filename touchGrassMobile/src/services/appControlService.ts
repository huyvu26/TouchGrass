import {
  clearAppLimitRules,
  getAppLimitRules,
  removeAppLimitRule,
  replaceAppLimitRules,
  saveAppLimitRule,
  type AppLimitRule,
} from '../storage/appControlStorage';
import {isProtectedPackage} from './protectedPackages';
import {appControlNative} from '../native/appControl';
import {
  deleteAppControlData,
  deleteAppControlRuleByPackage,
  getAppControlRules,
  upsertAppControlRule,
} from './appControlApiService';

export interface AppLimitEvaluation {
  shouldWarn: boolean;
  reason: 'PROTECTED' | 'NO_RULE' | 'DISABLED' | 'LOCKED';
}

export async function evaluateAppLimit(packageName: string): Promise<AppLimitEvaluation> {
  if (isProtectedPackage(packageName)) return {shouldWarn: false, reason: 'PROTECTED'};
  const rule = (await getAppLimitRules()).find(item => item.packageName === packageName);
  if (!rule) return {shouldWarn: false, reason: 'NO_RULE'};
  if (!rule.enabled) return {shouldWarn: false, reason: 'DISABLED'};
  return {shouldWarn: true, reason: 'LOCKED'};
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

export async function deleteAndClearAppControlData(): Promise<void> {
  await deleteAppControlData();
  await clearAppLimitRules();
  await appControlNative.clearData();
}
