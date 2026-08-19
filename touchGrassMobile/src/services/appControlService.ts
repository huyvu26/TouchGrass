import {
  clearAppLimitRules,
  getAppLimitRules,
  removeAppLimitRule,
  replaceAppLimitRules,
  saveAppLimitRule,
  type AppLimitRule,
} from '../storage/appControlStorage';
import {appControlNative} from '../native/appControl';
import {
  deleteAppControlData,
  deleteAppControlRuleByPackage,
  getAppControlRules,
  getProtectedPackages,
  upsertAppControlRule,
} from './appControlApiService';

export interface AppLimitEvaluation {
  shouldWarn: boolean;
  reason: 'PROTECTED' | 'NO_RULE' | 'DISABLED' | 'LOCKED';
}

export async function evaluateAppLimit(packageName: string): Promise<AppLimitEvaluation> {
  const protectedResponse = await getProtectedPackages();
  if (protectedResponse.items.includes(packageName)) {
    return {shouldWarn: false, reason: 'PROTECTED'};
  }
  const rule = (await getAppLimitRules()).find(item => item.packageName === packageName);
  if (!rule) return {shouldWarn: false, reason: 'NO_RULE'};
  if (!rule.enabled) return {shouldWarn: false, reason: 'DISABLED'};
  return {shouldWarn: true, reason: 'LOCKED'};
}

export async function syncAppControlRules(): Promise<void> {
  const [rules, protectedResponse] = await Promise.all([
    getAppLimitRules(),
    getProtectedPackages(),
  ]);
  await appControlNative.syncRules(rules, protectedResponse.items);
}

export async function refreshAppControlRulesFromBackend(): Promise<AppLimitRule[]> {
  const [response, protectedResponse] = await Promise.all([
    getAppControlRules(),
    getProtectedPackages(),
  ]);
  const protectedPackages = new Set(protectedResponse.items);
  const rules = response.items.map(({id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rule}) => rule);
  const safeRules = rules.filter(rule => !protectedPackages.has(rule.packageName));
  await replaceAppLimitRules(safeRules);
  await appControlNative.syncRules(safeRules, protectedResponse.items);
  return safeRules;
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
export const getPendingLockedApp = appControlNative.getPendingLockedApp;
export const setTemporaryUnlockUntil = appControlNative.setTemporaryUnlockUntil;
export const emergencyDisableAppControl = appControlNative.emergencyDisable;

export async function deleteAndClearAppControlData(): Promise<void> {
  await deleteAppControlData();
  await clearAppLimitRules();
  await appControlNative.clearData();
}
