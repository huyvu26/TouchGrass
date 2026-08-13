import {apiRequest} from './apiClient';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
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

export async function login(
  loginData: LoginRequest,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: loginData,
    authenticated: false,
  });
}
