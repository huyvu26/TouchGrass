export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  goals: string[];
  xp: number;
  level: number;
  leafPoints: number;
  unlockMinutesBalance: number;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  goals?: string[];
}
