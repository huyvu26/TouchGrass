import {API_BASE_URL} from '../config/api';
import {getAccessToken} from '../storage/authStorage';
import type {
  HistoryFilter,
  HistoryResponse,
  ProfileSummaryResponse,
  StatisticsPeriod,
  StatisticsResponse,
} from '../types/insights';

interface ApiErrorResponse {
  message?: string | string[];
}

async function authorizedGet<T>(path: string): Promise<T> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {Authorization: `Bearer ${accessToken}`},
  });
  const data = (await response.json()) as T | ApiErrorResponse;
  if (!response.ok) {
    const message = (data as ApiErrorResponse).message;
    throw new Error(
      Array.isArray(message)
        ? message.join('\n')
        : message ?? 'Không thể tải dữ liệu từ máy chủ.',
    );
  }

  return data as T;
}

export function getTaskHistory(
  filter: HistoryFilter = 'all',
  page = 1,
  limit = 20,
): Promise<HistoryResponse> {
  return authorizedGet<HistoryResponse>(
    `/user-tasks/history?filter=${filter}&page=${page}&limit=${limit}`,
  );
}

export function getTaskStatistics(
  period: StatisticsPeriod = 'week',
): Promise<StatisticsResponse> {
  return authorizedGet<StatisticsResponse>(
    `/user-tasks/statistics?period=${period}`,
  );
}

export function getTaskSummary(): Promise<ProfileSummaryResponse> {
  return authorizedGet<ProfileSummaryResponse>('/user-tasks/summary');
}
