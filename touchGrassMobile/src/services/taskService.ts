import {API_BASE_URL} from '../config/api';
import {getAccessToken} from '../storage/authStorage';
import type {Task} from '../types/task';

interface ApiErrorResponse {
  message?: string | string[];
}

function getErrorMessage(error: ApiErrorResponse): string {
  if (Array.isArray(error.message)) {
    return error.message.join('\n');
  }

  return error.message ?? 'Không thể tải dữ liệu nhiệm vụ.';
}

async function authorizedGet<T>(path: string): Promise<T> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const responseData = (await response.json()) as T | ApiErrorResponse;

  if (!response.ok) {
    throw new Error(getErrorMessage(responseData as ApiErrorResponse));
  }

  return responseData as T;
}

export function getTasks(): Promise<Task[]> {
  return authorizedGet<Task[]>('/tasks');
}

export function getTaskById(taskId: string): Promise<Task> {
  return authorizedGet<Task>(`/tasks/${encodeURIComponent(taskId)}`);
}
