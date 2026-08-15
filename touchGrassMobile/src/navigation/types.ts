import type {MlKitLabel} from '../types/userTask';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {
    email?: string;
    token?: string;
  };
  Permission: undefined;
  Home: undefined;
  AppManagement: undefined;
  AppLimit: {
    packageName: string;
    appName: string;
  };
  TaskHub: undefined;
  TaskDetail: {
    taskId: string;
  };
  GPSTracker: {
    userTaskId: string;
  };
  ScreenTimer: {
    userTaskId: string;
  };
  ManualCheckin: {
    userTaskId: string;
  };
  AICamera: {
    userTaskId: string;
  };
  AIAnalysis: {
    userTaskId: string;
    imageUri: string;
    capturedAt: string;
    labels: MlKitLabel[];
  };
  AppLock: undefined;
  Reward: {
    userTaskId: string;
  };
  Statistics: undefined;
  History: undefined;
  Badges: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
};
