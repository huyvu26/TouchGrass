import type {AppLimitRule} from '../storage/appControlStorage';

export interface AppControlRuleResponse extends AppLimitRule {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppControlRuleListResponse {
  items: AppControlRuleResponse[];
}

export interface TemporaryUnlockResponse {
  id: string;
  packageName: string;
  minutes: number;
  leafPointsSpent: number;
  remainingLeafPoints: number;
  startedAt: string;
  expiresAt: string;
  alreadyProcessed: boolean;
}

export interface TemporaryUnlockStatusResponse {
  packageName: string;
  unlocked: boolean;
  expiresAt: string | null;
  remainingSeconds: number;
}

export interface UnlockOption {
  id: string;
  minutes: number;
  leafPointCost: number;
}

export interface UnlockOptionsResponse {
  items: UnlockOption[];
}

export interface ProtectedPackagesResponse {
  items: string[];
}

export interface AppUsageSummaryItem {
  packageName: string;
  totalTimeInForegroundMs: number;
  lastTimeUsed?: string;
}

export interface AppUsageSummaryRequest {
  date: string;
  totalScreenTimeSeconds?: number;
  apps: AppUsageSummaryItem[];
}

export interface AppUsageSummaryResponse extends AppUsageSummaryRequest {
  updatedAt: string;
}

export interface AppControlSummaryResponse {
  available: boolean;
  date: string;
  totalScreenTimeSeconds: number;
  limitedAppCount: number;
  timeSavedAvailable: boolean;
  timeSavedSeconds: number;
}
