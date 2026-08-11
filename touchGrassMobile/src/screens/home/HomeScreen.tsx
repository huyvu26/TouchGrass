import React, {useCallback, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BarChart2,
  Bell,
  Home,
  Leaf,
  ListChecks,
  Lock,
  Music2,
  Settings,
  Star,
  Unlock,
  User,
} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {getMyProfile} from '../../services/userService';
import type {AuthUser} from '../../types/auth';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Home'
>;

const CONTROLLED_APPS = [
  {
    name: 'TikTok',
    limitMinutes: 20,
    usedMinutes: 18,
    locked: false,
    icon: 'tiktok',
  },
  {
    name: 'Facebook',
    limitMinutes: 30,
    usedMinutes: 30,
    locked: true,
    icon: 'facebook',
  },
  {
    name: 'Instagram',
    limitMinutes: 25,
    usedMinutes: 25,
    locked: true,
    icon: 'instagram',
  },
  {
    name: 'YouTube',
    limitMinutes: 45,
    usedMinutes: 20,
    locked: false,
    icon: 'youtube',
  },
] as const;

interface AppIconProps {
  icon: (typeof CONTROLLED_APPS)[number]['icon'];
}

function ControlledAppIcon({icon}: AppIconProps) {
  if (icon === 'tiktok') {
    return (
      <View style={[styles.appIcon, styles.tiktokIcon]}>
        <Music2
          size={24}
          color="#FFFFFF"
        />
      </View>
    );
  }

  if (icon === 'facebook') {
    return (
      <View style={[styles.appIcon, styles.facebookIcon]}>
        <Text style={styles.facebookLetter}>f</Text>
      </View>
    );
  }

  if (icon === 'instagram') {
    return (
      <View style={[styles.appIcon, styles.instagramIcon]}>
        <Svg width={25} height={25} viewBox="0 0 24 24">
          <Rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="6"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          <Circle
            cx="12"
            cy="12"
            r="4"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          <Circle cx="17.5" cy="6.5" r="1.5" fill="#FFFFFF" />
        </Svg>
      </View>
    );
  }

  return (
    <View style={[styles.appIcon, styles.youtubeIcon]}>
      <Svg width={26} height={26} viewBox="0 0 24 24">
        <Path
          d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
}

interface BottomNavProps {
  onOpenTasks: () => void;
  onOpenStats: () => void;
  onOpenProfile: () => void;
}

function BottomNavigation({
  onOpenTasks,
  onOpenStats,
  onOpenProfile,
}: BottomNavProps) {
  const items = [
    {key: 'home', label: 'Trang chủ', icon: Home},
    {key: 'tasks', label: 'Nhiệm vụ', icon: ListChecks},
    {key: 'stats', label: 'Thống kê', icon: BarChart2},
    {key: 'profile', label: 'Hồ sơ', icon: User},
  ] as const;

  return (
    <View style={styles.bottomNav}>
      {items.map(item => {
        const Icon = item.icon;
        const active = item.key === 'home';

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            style={styles.navItem}
            onPress={() => {
              if (item.key === 'tasks') {
                onOpenTasks();
              } else if (item.key === 'stats') {
                onOpenStats();
              } else if (item.key === 'profile') {
                onOpenProfile();
              }
            }}>
            <View
              style={[
                styles.navIconContainer,
                active && styles.navIconActive,
              ]}>
              <Icon
                size={20}
                color={
                  active ? colors.primary : colors.textSecondary
                }
                strokeWidth={active ? 2.3 : 1.8}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                active && styles.navLabelActive,
              ]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function HomeScreen({navigation}: Props) {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const xp = profile?.xp ?? 0;
  const maxXp = Math.max(1000, Math.ceil((xp + 1) / 1000) * 1000);
  const xpPercentage: `${number}%` =
    `${Math.min((xp / maxXp) * 100, 100)}%`;
  const xpRemaining = Math.max(maxXp - xp, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProfile() {
        try {
          const user = await getMyProfile();

          if (active) {
            setProfile(user);
          }
        } catch {
          // Giữ trạng thái mặc định; Profile sẽ hiển thị lỗi chi tiết.
        }
      }

      loadProfile();

      return () => {
        active = false;
      };
    }, []),
  );

  const initials = profile?.fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') ?? '?';

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Chào buổi sáng 🌿</Text>
              <Text style={styles.userName}>
                {profile?.fullName ?? 'Đang tải...'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Thông báo"
              style={styles.headerButton}
              onPress={() =>
                navigation.navigate('Notifications')
              }>
              <Bell
                size={19}
                color={colors.textSecondary}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quản lý ứng dụng"
              style={styles.headerButton}
              onPress={() =>
                navigation.navigate('AppManagement')
              }>
              <Settings
                size={19}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.levelIcon}>
              <Star
                size={18}
                color={colors.primary}
                fill={colors.primary}
              />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Cấp độ</Text>
              <Text
                style={styles.summaryValue}
                numberOfLines={1}>
                Lvl {profile?.level ?? 1}
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.leafIcon}>
              <Leaf
                size={19}
                color={colors.primaryButton}
              />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Leaf Points</Text>
              <Text style={styles.summaryValue}>
                {profile?.leafPoints ?? 0} LP
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.cardTitle}>Tiến độ XP</Text>
            <Text style={styles.xpValue}>
              {xp.toLocaleString()} / {maxXp.toLocaleString()} XP
            </Text>
          </View>
          <View style={styles.xpTrack}>
            <View
              style={[
                styles.xpProgress,
                {width: xpPercentage},
              ]}
            />
          </View>
          <Text style={styles.xpCaption}>
            Còn {xpRemaining.toLocaleString()} XP tới mốc tiếp theo
          </Text>
        </View>

        <View style={styles.countdownCard}>
          <View style={styles.countdownRing}>
            <Svg
              width={140}
              height={140}
              viewBox="0 0 160 160">
              <Circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth={10}
              />
              <Circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={colors.lime}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * 0.35}
                transform="rotate(-90 80 80)"
              />
            </Svg>
            <View style={styles.countdownCenter}>
              <Text style={styles.countdownTime}>12m 45s</Text>
              <Text style={styles.countdownRemaining}>
                còn lại
              </Text>
            </View>
          </View>

          <View style={styles.countdownContent}>
            <Text style={styles.countdownLabel}>
              Thời gian màn hình hôm nay
            </Text>
            <Text style={styles.countdownWarning}>Sắp hết!</Text>
            <Pressable
              accessibilityRole="button"
              style={({pressed}) => [
                styles.taskButton,
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.navigate('TaskHub')}>
              <ListChecks
                size={15}
                color={colors.primary}
              />
              <Text style={styles.taskButtonText}>
                Làm nhiệm vụ ngay
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.appsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Ứng dụng đang kiểm soát
            </Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() =>
                navigation.navigate('AppManagement')
              }>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </Pressable>
          </View>

          <View style={styles.appList}>
            {CONTROLLED_APPS.map(app => {
              const usagePercentage: `${number}%` =
                `${Math.min(
                  app.usedMinutes / app.limitMinutes,
                  1,
                ) * 100}%`;
              const almostFull =
                app.usedMinutes / app.limitMinutes > 0.8;

              return (
                <Pressable
                  key={app.name}
                  style={[
                    styles.appCard,
                    app.locked && styles.lockedAppCard,
                  ]}
                  onPress={() =>
                    app.locked
                      ? navigation.navigate('AppLock')
                      : navigation.navigate('AppLimit', {
                          appName: app.name,
                        })
                  }>
                  <ControlledAppIcon icon={app.icon} />

                  <View style={styles.appContent}>
                    <View style={styles.appHeader}>
                      <Text style={styles.appName}>
                        {app.name}
                      </Text>
                      <View style={styles.appStatus}>
                        {app.locked ? (
                          <Lock
                            size={12}
                            color={colors.error}
                          />
                        ) : (
                          <Unlock
                            size={12}
                            color={colors.textSecondary}
                          />
                        )}
                        <Text
                          style={[
                            styles.appStatusText,
                            app.locked &&
                              styles.lockedStatusText,
                          ]}>
                          {app.locked
                            ? 'Đã khóa'
                            : `${app.usedMinutes}/${app.limitMinutes} phút`}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.usageTrack}>
                      <View
                        style={[
                          styles.usageProgress,
                          {
                            width: usagePercentage,
                            backgroundColor: app.locked
                              ? colors.error
                              : almostFull
                                ? '#E8A020'
                                : colors.primaryButton,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <BottomNavigation
        onOpenTasks={() => navigation.navigate('TaskHub')}
        onOpenStats={() => navigation.navigate('Statistics')}
        onOpenProfile={() => navigation.navigate('Profile')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.primaryButton,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  userName: {
    marginTop: 2,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    columnGap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceSoft,
  },
  summaryRow: {
    marginBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    columnGap: 10,
  },
  summaryCard: {
    minWidth: 0,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  levelIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.lime,
  },
  leafIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#E8F5E0',
  },
  summaryText: {
    minWidth: 0,
    flex: 1,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  summaryValue: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  xpCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  xpHeader: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  xpValue: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  xpTrack: {
    height: 10,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: colors.surfaceSoft,
  },
  xpProgress: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primaryButton,
  },
  xpCaption: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 11,
  },
  countdownCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 18,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 14,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  countdownRing: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownCenter: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownTime: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },
  countdownRemaining: {
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
  countdownContent: {
    minWidth: 0,
    flex: 1,
  },
  countdownLabel: {
    marginBottom: 6,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    lineHeight: 17,
  },
  countdownWarning: {
    marginBottom: 12,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  taskButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 6,
    borderRadius: 20,
    backgroundColor: colors.lime,
  },
  taskButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  appsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    color: colors.primaryButton,
    fontSize: 13,
    fontWeight: '600',
  },
  appList: {
    rowGap: 10,
  },
  appCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  lockedAppCard: {
    borderColor: 'rgba(186, 26, 26, 0.2)',
  },
  appIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tiktokIcon: {
    backgroundColor: '#010101',
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
  },
  facebookLetter: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  instagramIcon: {
    backgroundColor: '#C13584',
  },
  youtubeIcon: {
    backgroundColor: '#FF0000',
  },
  appContent: {
    minWidth: 0,
    flex: 1,
  },
  appHeader: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  appStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  appStatusText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  lockedStatusText: {
    color: colors.error,
  },
  usageTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: colors.surfaceSoft,
  },
  usageProgress: {
    height: '100%',
    borderRadius: 3,
  },
  bottomNav: {
    height: 72,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    paddingTop: 10,
    alignItems: 'center',
    rowGap: 3,
  },
  navIconContainer: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  navIconActive: {
    backgroundColor: colors.lime,
  },
  navLabel: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
