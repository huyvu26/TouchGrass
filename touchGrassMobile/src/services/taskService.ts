import type {Task} from '../types/task';
import {apiRequest} from './apiClient';

export function getTasks(): Promise<Task[]> {
  return apiRequest<Task[]>('/tasks');
}

export function getTaskById(taskId: string): Promise<Task> {
  return apiRequest<Task>(`/tasks/${encodeURIComponent(taskId)}`);
}
