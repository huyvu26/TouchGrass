import { StatusBar } from 'react-native';
import {
  NavigationContainer,
  type LinkingOptions,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';

import { colors } from './src/constants/colors';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import {AuthProvider} from './src/auth/AuthContext';
import {navigationRef} from './src/navigation/rootNavigation';
import type {AuthStackParamList} from './src/navigation/types';

const linking: LinkingOptions<AuthStackParamList> = {
  prefixes: ['touchgrass://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      AppLock: 'app-lock',
    },
  },
};

export default function App() {
  
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />

      <AuthProvider>
        <NavigationContainer ref={navigationRef} linking={linking}>
          <AuthNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
