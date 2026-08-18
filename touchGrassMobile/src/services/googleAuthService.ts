import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import {GOOGLE_WEB_CLIENT_ID} from '../config/oauth';
import type {AuthResponse} from '../types/auth';
import {loginWithGoogle} from './authService';

let configured = false;
let signInRequest: Promise<AuthResponse | null> | null = null;

export function isGoogleAuthConfigured(): boolean {
  return GOOGLE_WEB_CLIENT_ID.trim().length > 0;
}

async function performGoogleSignIn(): Promise<AuthResponse | null> {
  if (!isGoogleAuthConfigured()) {
    throw new Error('Chưa cấu hình GOOGLE_WEB_CLIENT_ID cho ứng dụng Android.');
  }
  if (!configured) {
    GoogleSignin.configure({webClientId: GOOGLE_WEB_CLIENT_ID});
    configured = true;
  }
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;
  const idToken = response.data.idToken;
  if (!idToken) throw new Error('Google không trả về ID token. Hãy kiểm tra Web Client ID.');
  return loginWithGoogle(idToken);
}

export function signInWithGoogle(): Promise<AuthResponse | null> {
  if (signInRequest) {
    return signInRequest;
  }

  signInRequest = performGoogleSignIn().finally(() => {
    signInRequest = null;
  });
  return signInRequest;
}
