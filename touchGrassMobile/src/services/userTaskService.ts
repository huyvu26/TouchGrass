import {apiRequest} from './apiClient';
import type {
  ClaimRewardResponse,
  CompleteTaskResponse,
  GpsPoint,
  GpsVerificationResponse,
  MlKitLabel,
  ManualCheckinVerificationResponse,
  PhotoVerificationResponse,
  ScreenTimerVerificationResponse,
  StartUserTaskResponse,
  UpdateUserTaskProgressResponse,
  UserTaskDetail,
  UserTaskListResponse,
} from '../types/userTask';

export function startUserTask(
  taskId: string,
): Promise<StartUserTaskResponse> {
  return apiRequest<StartUserTaskResponse>('/user-tasks', {
    method: 'POST',
    body: {taskId},
  });
}

export function getUserTasks(
  page = 1,
  limit = 10,
): Promise<UserTaskListResponse> {
  return apiRequest<UserTaskListResponse>(
    `/user-tasks?page=${page}&limit=${limit}`,
  );
}

export function getUserTaskById(
  userTaskId: string,
): Promise<UserTaskDetail> {
  return apiRequest<UserTaskDetail>(
    `/user-tasks/${encodeURIComponent(userTaskId)}`,
  );
}

export function updateUserTaskProgress(
  userTaskId: string,
  progress: number,
): Promise<UpdateUserTaskProgressResponse> {
  return apiRequest<UpdateUserTaskProgressResponse>(
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
  return apiRequest<CompleteTaskResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/complete`,
    {method: 'POST'},
  );
}

export function claimUserTaskReward(
  userTaskId: string,
): Promise<ClaimRewardResponse> {
  return apiRequest<ClaimRewardResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/claim-reward`,
    {method: 'POST'},
  );
}

export function startGpsTracking(
  userTaskId: string,
): Promise<GpsVerificationResponse> {
  return apiRequest<GpsVerificationResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/gps/start`,
    {method: 'POST'},
  );
}

export function finishGpsTracking(
  userTaskId: string,
  points: GpsPoint[],
): Promise<GpsVerificationResponse> {
  return apiRequest<GpsVerificationResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/gps/finish`,
    {
      method: 'POST',
      body: {points},
    },
  );
}

export function startScreenTimer(
  userTaskId: string,
): Promise<ScreenTimerVerificationResponse> {
  return apiRequest<ScreenTimerVerificationResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/screen-timer/start`,
    {method: 'POST'},
  );
}

export function finishScreenTimer(
  userTaskId: string,
  screenOffAt: string,
  screenOnAt: string,
): Promise<ScreenTimerVerificationResponse> {
  return apiRequest<ScreenTimerVerificationResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/screen-timer/finish`,
    {
      method: 'POST',
      body: {screenOffAt, screenOnAt},
    },
  );
}

export async function verifyUserTaskPhoto(
  userTaskId: string,
  imageUri: string,
  labels: MlKitLabel[],
  capturedAt: string,
): Promise<PhotoVerificationResponse> {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'camera.jpg',
  } as unknown as Blob);
  formData.append('labels', JSON.stringify(labels));
  formData.append('capturedAt', capturedAt);

  return apiRequest<PhotoVerificationResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/photo/verify`,
    {method: 'POST', body: formData},
  );
}

export function startManualCheckin(
  userTaskId: string,
): Promise<ManualCheckinVerificationResponse> {
  return apiRequest<ManualCheckinVerificationResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/manual-checkin/start`,
    {method: 'POST'},
  );
}

export function finishManualCheckin(
  userTaskId: string,
): Promise<ManualCheckinVerificationResponse> {
  return apiRequest<ManualCheckinVerificationResponse>(
    `/user-tasks/${encodeURIComponent(userTaskId)}/manual-checkin/finish`,
    {method: 'POST'},
  );
}
