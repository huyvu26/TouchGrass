export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Permission: undefined;
  Home: undefined;
  AppManagement: undefined;
  AppLimit: {
    appName: string;
  };
  TaskHub: undefined;
  TaskDetail: {
    taskId: string;
  };
  GPSTracker: {
    userTaskId: string;
  };
  AICamera: {
    userTaskId: string;
  };
  AIAnalysis: {
    userTaskId: string;
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
