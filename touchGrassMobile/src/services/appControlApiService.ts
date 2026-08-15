import type {AppLimitRule} from '../storage/appControlStorage';
import type {
  AppControlRuleListResponse,
  AppControlRuleResponse,
  TemporaryUnlockResponse,
  TemporaryUnlockStatusResponse,
} from '../types/appControl';
import {apiRequest} from './apiClient';

export function getAppControlRules(): Promise<AppControlRuleListResponse> {
  return apiRequest<AppControlRuleListResponse>('/app-control/rules');
}

export function createAppControlRule(rule: AppLimitRule): Promise<AppControlRuleResponse> {
  return apiRequest<AppControlRuleResponse>('/app-control/rules', {
    method: 'POST',
    body: rule,
  });
}

export function updateAppControlRule(
  id: string,
  rule: AppLimitRule,
): Promise<AppControlRuleResponse> {
  return apiRequest<AppControlRuleResponse>(`/app-control/rules/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: {
      appName: rule.appName,
      enabled: rule.enabled,
      dailyLimitMinutes: rule.dailyLimitMinutes,
      activeDays: rule.activeDays,
      startTime: rule.startTime,
      endTime: rule.endTime,
    },
  });
}

export function deleteAppControlRule(id: string): Promise<{deleted: boolean; id: string}> {
  return apiRequest<{deleted: boolean; id: string}>(`/app-control/rules/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function upsertAppControlRule(rule: AppLimitRule): Promise<AppControlRuleResponse> {
  const response = await getAppControlRules();
  const existing = response.items.find(item => item.packageName === rule.packageName);
  return existing ? updateAppControlRule(existing.id, rule) : createAppControlRule(rule);
}

export async function deleteAppControlRuleByPackage(packageName: string): Promise<void> {
  const response = await getAppControlRules();
  const existing = response.items.find(item => item.packageName === packageName);
  if (existing) await deleteAppControlRule(existing.id);
}

export function createTemporaryUnlock(
  packageName: string,
  minutes: number,
  sourceUserTaskId: string,
  operationKey: string,
): Promise<TemporaryUnlockResponse> {
  return apiRequest<TemporaryUnlockResponse>('/app-control/unlock', {
    method: 'POST',
    headers: {'Idempotency-Key': operationKey},
    body: {packageName, minutes, sourceUserTaskId},
  });
}

export function getTemporaryUnlockStatus(packageName: string): Promise<TemporaryUnlockStatusResponse> {
  return apiRequest<TemporaryUnlockStatusResponse>(
    `/app-control/unlock/${encodeURIComponent(packageName)}/status`,
  );
}

export function deleteAppControlData(): Promise<{deleted: boolean}> {
  return apiRequest<{deleted: boolean}>('/app-control/data', {
    method: 'DELETE',
  });
}
