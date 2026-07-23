import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AppLimitScreen} from '../screens/apps/AppLimitScreen';
import {AppManagementScreen} from '../screens/apps/AppManagementScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {HomeScreen} from '../screens/home/HomeScreen';
import {OnboardingScreen} from '../screens/onboarding/OnboardingScreen';
import {PermissionScreen} from '../screens/onboarding/PermissionScreen';
import {SplashScreen} from '../screens/onboarding/SplashScreen';
import {TaskHubScreen} from '../screens/tasks/TaskHubScreen';
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
    </Stack.Navigator>
  );
}
