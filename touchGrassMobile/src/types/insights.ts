import type {TaskCategory, TaskVerificationType} from './task';

export type HistoryFilter = 'all' | 'done' | 'invalid' | 'cancelled';
export type StatisticsPeriod = 'day' | 'week' | 'month';

export interface HistoryItem {
  id: string;
  taskId: string;
  title: string;
  emoji: string;
  category: TaskCategory;
  verificationType: TaskVerificationType;
  activityAt: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number;
  rewardXp: number;
  rewardLp: number;
  rewardGranted: boolean;
  status: Exclude<HistoryFilter, 'all'>;
}

export interface HistoryResponse {
  items: HistoryItem[];
  counts: Record<HistoryFilter, number>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StatisticsResponse {
  period: StatisticsPeriod;
  range: {startAt: string; endAt: string};
  summary: {
    totalTasks: number;
    completed: number;
    invalid: number;
    cancelled: number;
    completionRate: number;
    distanceMeters: number;
    outdoorSeconds: number;
    offlineSeconds: number;
    xpEarned: number;
    leafPointsEarned: number;
    comparison: {
      completedPercent: number | null;
      outdoorPercent: number | null;
    };
  };
  series: Array<{
    key: string;
    label: string;
    completed: number;
    invalid: number;
    cancelled: number;
    outdoorSeconds: number;
  }>;
  deviceMetrics: {
    available: boolean;
    source: string;
    screenTimeSeconds: number | null;
    topApps: Array<{name: string; seconds: number}>;
  };
}

export interface ProfileSummaryResponse {
  completedTasks: number;
  historyItems: number;
  totalDistanceMeters: number;
  totalWalkingKilometers: number;
  totalOfflineSeconds: number;
  totalOfflineHours: number;
}
