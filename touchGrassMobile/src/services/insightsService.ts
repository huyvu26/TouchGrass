import {apiRequest} from './apiClient';
import type {
  HistoryFilter,
  HistoryResponse,
  ProfileSummaryResponse,
  StatisticsPeriod,
  StatisticsResponse,
} from '../types/insights';

export function getTaskHistory(
  filter: HistoryFilter = 'all',
  page = 1,
  limit = 20,
): Promise<HistoryResponse> {
  return apiRequest<HistoryResponse>(
    `/user-tasks/history?filter=${filter}&page=${page}&limit=${limit}`,
  );
}

export function getTaskStatistics(
  period: StatisticsPeriod = 'week',
): Promise<StatisticsResponse> {
  return apiRequest<StatisticsResponse>(
    `/user-tasks/statistics?period=${period}`,
  );
}

export function getTaskSummary(): Promise<ProfileSummaryResponse> {
  return apiRequest<ProfileSummaryResponse>('/user-tasks/summary');
}
