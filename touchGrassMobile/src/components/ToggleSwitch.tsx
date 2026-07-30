import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {colors} from '../constants/colors';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
}

export function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{checked: value, disabled}}
      disabled={disabled}
      style={[
        styles.track,
        value && styles.trackActive,
        disabled && styles.disabled,
      ]}
      onPress={onValueChange}>
      <View
        style={[
          styles.thumb,
          value && styles.thumbActive,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 26,
    padding: 3,
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#CDD2C9',
  },
  trackActive: {
    backgroundColor: colors.primaryButton,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  disabled: {
    opacity: 0.5,
  },
});
