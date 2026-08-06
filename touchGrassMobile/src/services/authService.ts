import {API_BASE_URL} from '../config/api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/auth';

interface ApiErrorResponse {
  message?: string | string[];
}

function getErrorMessage(
  errorResponse: ApiErrorResponse,
): string {
  if (Array.isArray(errorResponse.message)) {
    return errorResponse.message.join('\n');
  }

  return (
    errorResponse.message ??
    'Không thể kết nối với máy chủ.'
  );
}

async function handleAuthResponse(
  response: Response,
): Promise<AuthResponse> {
  const responseData = (await response.json()) as
    | AuthResponse
    | ApiErrorResponse;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        responseData as ApiErrorResponse,
      ),
    );
  }

  return responseData as AuthResponse;
}

export async function register(
  registerData: RegisterRequest,
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    },
  );

  return handleAuthResponse(response);
}

export async function login(
  loginData: LoginRequest,
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    },
  );

  return handleAuthResponse(response);
}