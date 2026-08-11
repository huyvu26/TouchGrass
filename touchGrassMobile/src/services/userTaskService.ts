import {API_BASE_URL} from '../config/api';
import {getAccessToken} from '../storage/authStorage';
import type {
  ClaimRewardResponse,
  CompleteTaskResponse,
  StartUserTaskResponse,
  UpdateUserTaskProgressResponse,
  UserTaskDetail,
  UserTaskListResponse,
} from '../types/userTask';

interface ApiErrorResponse {
  message?: string | string[];
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
}

function getErrorMessage(error: ApiErrorResponse): string {
  if (Array.isArray(error.message)) {
    return error.message.join('\n');
  }

  return error.message ?? 'Không thể kết nối với máy chủ.';
}

async function authorizedRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body === undefined
        ? {}
        : {'Content-Type': 'application/json'}),
    },
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  const responseData = (await response.json()) as T | ApiErrorResponse;

  if (!response.ok) {
    throw new Error(getErrorMessage(responseData as ApiErrorResponse));
  }

  return responseData as T;
}

export function startUserTask(
  taskId: string,
): Promise<StartUserTaskResponse> {
  return authorizedRequest<StartUserTaskResponse>('/user-tasks', {
    method: 'POST',
    body: {taskId},
  });
}

export function getUserTasks(
  page = 1,
  limit = 10,
): Promise<UserTaskListResponse> {
  return authorizedRequest<UserTaskListResponse>(
    `/user-tasks?page=${page}&limit=${limit}`,
  );
}

export function getUserTaskById(
  userTaskId: string,
): Promise<UserTaskDetail> {
  return authorizedRequest<UserTaskDetail>(
    `/user-tasks/${encodeURIComponent(userTaskId)}`,
  );
}

export function updateUserTaskProgress(
  userTaskId: string,
  progress: number,
): Promise<UpdateUserTaskProgressResponse> {
  return authorizedRequest<UpdateUserTaskProgressResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/progress`,
    {
      method: 'PATCH',
      body: {progress},
    },
  );
}

export function completeUserTask(
  userTaskId: string,
): Promise<CompleteTaskResponse> {
  return authorizedRequest<CompleteTaskResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/complete`,
    {method: 'POST'},
  );
}

export function claimUserTaskReward(
  userTaskId: string,
): Promise<ClaimRewardResponse> {
  return authorizedRequest<ClaimRewardResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/claim-reward`,
    {method: 'POST'},
  );
}
