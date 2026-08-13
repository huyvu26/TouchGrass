import type {AuthUser, UpdateProfileRequest} from '../types/auth';
import {apiRequest} from './apiClient';

export async function getMyProfile(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/users/me');
}

export async function updateMyProfile(
  changes: UpdateProfileRequest,
): Promise<AuthUser> {
  return apiRequest<AuthUser>('/users/me', {
    method: 'PATCH',
    body: changes,
  });
}
