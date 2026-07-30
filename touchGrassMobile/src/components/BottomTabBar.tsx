import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  BarChart2,
  Home,
  ListChecks,
  User,
} from 'lucide-react-native';
import type {NavigationProp} from '@react-navigation/native';

import {colors} from '../constants/colors';
import type {AuthStackParamList} from '../navigation/types';

export type MainTab = 'home' | 'tasks' | 'stats' | 'profile';

interface BottomTabBarProps {
  active: MainTab;
  navigation: NavigationProp<AuthStackParamList>;
}

const ITEMS = [
  {key: 'home', label: 'Trang chủ', icon: Home, route: 'Home'},
  {
    key: 'tasks',
    label: 'Nhiệm vụ',
    icon: ListChecks,
    route: 'TaskHub',
  },
  {
    key: 'stats',
    label: 'Thống kê',
    icon: BarChart2,
    route: 'Statistics',
  },
  {
    key: 'profile',
    label: 'Hồ sơ',
    icon: User,
    route: 'Profile',
  },
] as const;

export function BottomTabBar({
  active,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {ITEMS.map(item => {
        const Icon = item.icon;
        const selected = item.key === active;

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{selected}}
            style={styles.item}
            onPress={() => navigation.navigate(item.route)}>
            <View
              style={[
                styles.iconContainer,
                selected && styles.iconSelected,
              ]}>
              <Icon
                size={20}
                color={
                  selected
                    ? colors.primary
                    : colors.textSecondary
                }
                strokeWidth={selected ? 2.4 : 1.8}
              />
            </View>
            <Text
              style={[
                styles.label,
                selected && styles.labelSelected,
              ]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 8,
  },
  item: {
    flex: 1,
    paddingTop: 10,
    alignItems: 'center',
    rowGap: 3,
  },
  iconContainer: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconSelected: {
    backgroundColor: colors.lime,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
