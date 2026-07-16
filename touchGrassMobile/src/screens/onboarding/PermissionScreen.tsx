import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export function PermissionScreen() {
  return (
    <View style={styles.container}>
      <Text>Permission Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});