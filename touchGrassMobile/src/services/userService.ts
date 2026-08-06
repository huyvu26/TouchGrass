import {API_BASE_URL} from '../config/api';
import {
  getAccessToken,
} from '../storage/authStorage';
import type {AuthUser} from '../types/auth';

interface ApiErrorResponse {
  message?: string | string[];
}

export async function getMyProfile(): Promise<AuthUser> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('Bạn chưa đăng nhập.');
  }

  const response = await fetch(
    `${API_BASE_URL}/users/me`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const responseData = (await response.json()) as
    | AuthUser
    | ApiErrorResponse;

  if (!response.ok) {
    const errorResponse =
      responseData as ApiErrorResponse;

    const message = Array.isArray(
      errorResponse.message,
    )
      ? errorResponse.message.join('\n')
      : errorResponse.message ??
        'Không thể lấy thông tin tài khoản.';

    throw new Error(message);
  }

  return responseData as AuthUser;
}