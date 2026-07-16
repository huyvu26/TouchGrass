import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {LoginScreen} from '../screens/auth/LoginScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {PermissionScreen} from '../screens/onboarding/PermissionScreen';
import type {AuthStackParamList} from './types';

const Stack =
  createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Register"
      screenOptions={{
        headerShown: false,
      }}>
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
    </Stack.Navigator>
  );
}