import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';

import { colors } from './src/constants/colors';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import {AuthProvider} from './src/auth/AuthContext';
import {navigationRef} from './src/navigation/rootNavigation';

export default function App() {
  
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />

      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <AuthNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
