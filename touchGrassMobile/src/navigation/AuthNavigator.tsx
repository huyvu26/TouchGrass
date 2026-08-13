import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AppLimitScreen} from '../screens/apps/AppLimitScreen';
import {AppManagementScreen} from '../screens/apps/AppManagementScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {HomeScreen} from '../screens/home/HomeScreen';
import {AppLockScreen} from '../screens/lock/AppLockScreen';
import {OnboardingScreen} from '../screens/onboarding/OnboardingScreen';
import {PermissionScreen} from '../screens/onboarding/PermissionScreen';
import {SplashScreen} from '../screens/onboarding/SplashScreen';
import {BadgeScreen} from '../screens/progress/BadgeScreen';
import {HistoryScreen} from '../screens/progress/HistoryScreen';
import {StatisticsScreen} from '../screens/progress/StatisticsScreen';
import {EditProfileScreen} from '../screens/profile/EditProfileScreen';
import {NotificationsScreen} from '../screens/profile/NotificationsScreen';
import {ProfileScreen} from '../screens/profile/ProfileScreen';
import {SettingsScreen} from '../screens/profile/SettingsScreen';
import {RewardScreen} from '../screens/rewards/RewardScreen';
import {GPSTrackerScreen} from '../screens/tasks/GPSTrackerScreen';
import {ScreenTimerScreen} from '../screens/tasks/ScreenTimerScreen';
import {ManualCheckinScreen} from '../screens/tasks/ManualCheckinScreen';
import {TaskDetailScreen} from '../screens/tasks/TaskDetailScreen';
import {TaskHubScreen} from '../screens/tasks/TaskHubScreen';
import {AICameraScreen} from '../screens/verification/AICameraScreen';
import {AIAnalysisScreen} from '../screens/verification/AIAnalysisScreen';
import type {AuthStackParamList} from './types';

const Stack =
  createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
      />

      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />

      <Stack.Screen
        name="Permission"
        component={PermissionScreen}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />

      <Stack.Screen
        name="AppManagement"
        component={AppManagementScreen}
      />

      <Stack.Screen
        name="AppLimit"
        component={AppLimitScreen}
      />

      <Stack.Screen
        name="TaskHub"
        component={TaskHubScreen}
      />

      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
      />

      <Stack.Screen
        name="GPSTracker"
        component={GPSTrackerScreen}
      />

      <Stack.Screen
        name="ScreenTimer"
        component={ScreenTimerScreen}
      />

      <Stack.Screen
        name="ManualCheckin"
        component={ManualCheckinScreen}
      />

      <Stack.Screen
        name="AICamera"
        component={AICameraScreen}
      />

      <Stack.Screen
        name="AIAnalysis"
        component={AIAnalysisScreen}
      />

      <Stack.Screen
        name="AppLock"
        component={AppLockScreen}
      />

      <Stack.Screen
        name="Reward"
        component={RewardScreen}
      />

      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
      />

      <Stack.Screen
        name="History"
        component={HistoryScreen}
      />

      <Stack.Screen
        name="Badges"
        component={BadgeScreen}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
      />
    </Stack.Navigator>
  );
}
