import React, {useEffect, useRef} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Leaf, TreePine} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Splash'
>;

export function SplashScreen({navigation}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation, opacity, scale]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <Leaf
        size={28}
        color={colors.primaryButton}
        style={styles.leftLeaf}
      />
      <Leaf
        size={21}
        color={colors.forest}
        style={styles.rightLeaf}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity,
            transform: [{scale}],
          },
        ]}>
        <View style={styles.logo}>
          <TreePine
            size={58}
            color="#FFFFFF"
            strokeWidth={2.3}
          />
          <View style={styles.logoDot} />
        </View>

        <Text style={styles.title}>Touch Grass</Text>
        <Text style={styles.subtitle}>
          Kết nối lại với thiên nhiên
        </Text>
      </Animated.View>

      <View style={styles.pagination}>
        <View style={styles.activeDot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  topGlow: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(176, 242, 103, 0.18)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 40,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(36, 107, 5, 0.08)',
  },
  leftLeaf: {
    position: 'absolute',
    top: 155,
    left: 32,
    opacity: 0.24,
    transform: [{rotate: '-28deg'}],
  },
  rightLeaf: {
    position: 'absolute',
    top: 210,
    right: 44,
    opacity: 0.2,
    transform: [{rotate: '38deg'}],
  },
  content: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  logo: {
    width: 104,
    height: 104,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: colors.primaryButton,
    shadowColor: colors.primaryButton,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 10,
  },
  logoDot: {
    position: 'absolute',
    top: 22,
    right: 21,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.lime,
  },
  title: {
    marginBottom: 10,
    color: colors.primary,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 72,
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
});
