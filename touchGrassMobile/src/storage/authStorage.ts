import {
  createAsyncStorage,
} from '@react-native-async-storage/async-storage';

const authStorage =
  createAsyncStorage('touchgrass-auth');

const ACCESS_TOKEN_KEY = 'accessToken';
const ONBOARDING_COMPLETE_KEY = 'onboardingComplete';

export async function saveAccessToken(
  token: string,
): Promise<void> {
  await authStorage.setItem(
    ACCESS_TOKEN_KEY,
    token,
  );
}

export async function getAccessToken(): Promise<
  string | null
> {
  return authStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function removeAccessToken(): Promise<void> {
  await authStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function markOnboardingComplete(): Promise<void> {
  await authStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
}

export async function isOnboardingComplete(): Promise<boolean> {
  return (await authStorage.getItem(ONBOARDING_COMPLETE_KEY)) === 'true';
}
