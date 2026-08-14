import {apiRequest} from './apiClient';
import type {
  AuthResponse,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordResponse,
} from '../types/auth';

export async function register(
  registerData: RegisterRequest,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: registerData,
    authenticated: false,
  });
}

export function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    body: {email},
    authenticated: false,
  });
}

export function resetPassword(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>('/auth/reset-password', {
    method: 'POST',
    body: {token, newPassword},
    authenticated: false,
  });
}

export function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: {idToken},
    authenticated: false,
  });
}

export async function login(
  loginData: LoginRequest,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: loginData,
    authenticated: false,
  });
}
