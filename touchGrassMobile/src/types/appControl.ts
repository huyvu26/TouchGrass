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
  sessionId: string;
  packageName: string;
  startedAt: string;
  expiresAt: string;
  minutesSpent: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  remainingBalance: number;
  alreadyProcessed: boolean;
}

export interface TemporaryUnlockStatusResponse {
  active: boolean;
  expiresAt: string | null;
  remainingSeconds: number;
}
