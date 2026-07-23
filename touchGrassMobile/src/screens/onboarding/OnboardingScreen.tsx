import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ChevronRight, Leaf} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Ellipse,
  Path,
  Rect,
} from 'react-native-svg';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Onboarding'
>;

function NatureIllustration() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 320 300">
      <Ellipse
        cx="160"
        cy="270"
        rx="150"
        ry="22"
        fill="#C8E6B0"
        opacity={0.6}
      />

      <Rect
        x="54"
        y="160"
        width="12"
        height="110"
        rx="6"
        fill="#8B6340"
      />
      <Ellipse cx="60" cy="150" rx="38" ry="50" fill="#2D5A27" />
      <Ellipse cx="60" cy="135" rx="28" ry="38" fill="#3A7033" />
      <Ellipse cx="60" cy="122" rx="18" ry="26" fill="#4A8A40" />

      <Rect
        x="242"
        y="170"
        width="10"
        height="100"
        rx="5"
        fill="#8B6340"
      />
      <Ellipse cx="247" cy="162" rx="32" ry="44" fill="#246B05" />
      <Ellipse cx="247" cy="148" rx="22" ry="32" fill="#2D7A0A" />
      <Ellipse cx="247" cy="137" rx="14" ry="22" fill="#3A8C12" />

      <Rect
        x="198"
        y="210"
        width="8"
        height="60"
        rx="4"
        fill="#A0784A"
      />
      <Ellipse cx="202" cy="202" rx="22" ry="30" fill="#3A7A20" />
      <Ellipse cx="202" cy="192" rx="15" ry="20" fill="#4A8A2A" />

      <Circle cx="155" cy="188" r="12" fill="#FDBCB4" />
      <Rect
        x="148"
        y="200"
        width="14"
        height="26"
        rx="6"
        fill="#246B05"
      />
      <Path
        d="M148 208 L138 218"
        stroke="#FDBCB4"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M162 208 L172 215"
        stroke="#FDBCB4"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M152 226 L146 248"
        stroke="#154212"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M158 226 L164 248"
        stroke="#154212"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <Circle
        cx="280"
        cy="50"
        r="28"
        fill="#FFE066"
        opacity={0.55}
      />
      <Circle
        cx="280"
        cy="50"
        r="18"
        fill="#FFD600"
        opacity={0.7}
      />

      <Circle cx="80" cy="262" r="4" fill="#FFD580" />
      <Circle cx="120" cy="262" r="4" fill="#FF9060" />
      <Circle cx="185" cy="262" r="4" fill="#FFD580" />
      <Circle cx="228" cy="262" r="4" fill="#FF9060" />
    </Svg>
  );
}

export function OnboardingScreen({navigation}: Props) {
  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'bottom']}>
      <View style={styles.illustrationSection}>
        <View style={styles.skyDot} />
        <NatureIllustration />

        <View style={styles.rewardChip}>
          <Leaf
            size={16}
            color={colors.primary}
          />
          <Text style={styles.rewardText}>+50 XP</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Chạm vào{'\n'}thiên nhiên 🌱
        </Text>

        <Text style={styles.description}>
          Hoàn thành các hoạt động ngoài trời như đi bộ, chụp
          ảnh thiên nhiên để lấy lại sự tập trung và mở khóa
          thời gian sử dụng màn hình.
        </Text>

        <View style={styles.pagination}>
          <View style={styles.activeDot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Pressable
          accessibilityRole="button"
          style={({pressed}) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.replace('Login')}>
          <Text style={styles.primaryButtonText}>Bắt đầu</Text>
          <ChevronRight
            size={19}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  illustrationSection: {
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#E7F2E0',
  },
  skyDot: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(189, 232, 255, 0.5)',
  },
  rewardChip: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    borderRadius: 18,
    backgroundColor: colors.lime,
    shadowColor: colors.lime,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  rewardText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 12,
    color: colors.primary,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  description: {
    marginBottom: 24,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 25,
  },
  pagination: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryButton,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  primaryButton: {
    height: 52,
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    borderRadius: 26,
    backgroundColor: colors.primaryButton,
    shadowColor: colors.primaryButton,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
});
