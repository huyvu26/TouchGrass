import React, {useCallback, useState} from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Bell,
  ChevronRight,
  Edit3,
  History,
  Medal,
  Settings,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../../components/BottomTabBar';
import { colors } from '../../constants/colors';
import {
  getMyProfile,
} from '../../services/userService';
import {getTaskSummary} from '../../services/insightsService';
import type {
  AuthUser,
} from '../../types/auth';
import type {ProfileSummaryResponse} from '../../types/insights';

import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] =
    useState<AuthUser | null>(null);
  const [summary, setSummary] =
    useState<ProfileSummaryResponse | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    async function loadProfile() {
      try {
        const [user, taskSummary] = await Promise.all([
          getMyProfile(),
          getTaskSummary(),
        ]);
        if (active) {
          setProfile(user);
          setSummary(taskSummary);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Không thể tải hồ sơ.';

        Alert.alert(
          'Lỗi tải hồ sơ',
          message,
        );
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []));
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Hồ sơ</Text>
        <Pressable
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}>
          <Settings size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.fullName
                .trim()
                .charAt(0)
                .toUpperCase() ?? '?'}
            </Text>

          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {profile?.fullName ?? 'Đang tải...'}
            </Text>
            <Text style={styles.username}>
              {profile?.email ?? ''}
            </Text>
            <View style={styles.levelChip}>
              <Text style={styles.levelChipText}>
                🌿 Level {profile?.level ?? 1}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}>
            <Edit3 size={17} color={colors.primaryButton} />
          </Pressable>
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Số dư tài khoản</Text>
            <Text style={styles.xpValue}>
              {profile?.xp ?? 0} XP
            </Text>
          </View>
          <Text style={styles.xpCaption}>
            {profile?.leafPoints ?? 0} Leaf Points ·{' '}
            {profile?.unlockMinutesBalance ?? 0} phút mở khóa
          </Text>
        </View>

        <View style={styles.statRow}>
          {[
            [String(summary?.completedTasks ?? 0), 'Nhiệm vụ'],
            [String(summary?.totalWalkingKilometers ?? 0), 'Km đã đi'],
            [`${summary?.totalOfflineHours ?? 0}h`, 'Không màn hình'],
          ].map(([value, label]) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Tiến độ nổi bật</Text>
        <View style={styles.badgePreview}>
          {[
            ['✅', `${summary?.completedTasks ?? 0} nhiệm vụ`],
            ['🥾', `${summary?.totalWalkingKilometers ?? 0} km`],
            ['📵', `${summary?.totalOfflineHours ?? 0} giờ`],
          ].map(([emoji, label]) => (
            <View key={label} style={styles.previewItem}>
              <View style={styles.previewIcon}>
                <Text style={styles.previewEmoji}>{emoji}</Text>
              </View>
              <Text style={styles.previewLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.links}>
          {[
            {
              icon: Medal,
              label: 'Bộ sưu tập huy hiệu',
              subtitle: 'Xem thành tích đã mở khóa',
              action: () => navigation.navigate('Badges'),
            },
            {
              icon: History,
              label: 'Lịch sử hoạt động',
              subtitle: `${summary?.historyItems ?? 0} hoạt động`,
              action: () => navigation.navigate('History'),
            },
            {
              icon: Bell,
              label: 'Thông báo',
              subtitle: 'Xem thông báo',
              action: () => navigation.navigate('Notifications'),
            },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Pressable
                key={item.label}
                style={styles.linkCard}
                onPress={item.action}>
                <View style={styles.linkIcon}>
                  <Icon size={20} color={colors.primaryButton} />
                </View>
                <View style={styles.linkContent}>
                  <Text style={styles.linkLabel}>{item.label}</Text>
                  <Text style={styles.linkSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>
                <ChevronRight
                  size={17}
                  color={colors.textSecondary}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <BottomTabBar active="profile" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { height: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  settingsButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.surfaceSoft },
  content: { paddingHorizontal: 20, paddingBottom: 18 },
  profileCard: { padding: 16, flexDirection: 'row', alignItems: 'center', columnGap: 13, borderRadius: 22, backgroundColor: colors.primary },
  avatar: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.lime, borderRadius: 36, backgroundColor: colors.primaryButton },
  avatarText: { color: '#FFFFFF', fontSize: 25, fontWeight: '800' },
  profileInfo: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  username: { marginTop: 2, color: 'rgba(255,255,255,0.58)', fontSize: 12 },
  levelChip: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 13, backgroundColor: colors.lime },
  levelChipText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  editButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#FFFFFF' },
  xpCard: { marginTop: 14, padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface },
  xpHeader: { marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  xpTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  xpValue: { color: colors.primaryButton, fontSize: 12, fontWeight: '700' },
  xpTrack: { height: 9, overflow: 'hidden', borderRadius: 5, backgroundColor: colors.surfaceSoft },
  xpProgress: { width: '72.5%', height: '100%', borderRadius: 5, backgroundColor: colors.primaryButton },
  xpCaption: { marginTop: 6, color: colors.textSecondary, fontSize: 10 },
  statRow: { marginTop: 12, flexDirection: 'row', columnGap: 8 },
  statCard: { flex: 1, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface },
  statValue: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  statLabel: { marginTop: 3, color: colors.textSecondary, fontSize: 10 },
  sectionTitle: { marginTop: 18, marginBottom: 10, color: colors.text, fontSize: 14, fontWeight: '700' },
  badgePreview: { padding: 13, flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface },
  previewItem: { flex: 1, alignItems: 'center' },
  previewIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.surfaceSoft },
  previewEmoji: { fontSize: 22 },
  previewLabel: { marginTop: 5, color: colors.textSecondary, fontSize: 9, textAlign: 'center' },
  links: { marginTop: 14, rowGap: 8 },
  linkCard: { padding: 13, flexDirection: 'row', alignItems: 'center', columnGap: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface },
  linkIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.surfaceSoft },
  linkContent: { flex: 1 },
  linkLabel: { color: colors.text, fontSize: 13, fontWeight: '700' },
  linkSubtitle: { marginTop: 2, color: colors.textSecondary, fontSize: 11 },
});
