import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Bell, Footprints, Leaf, ListChecks, Settings, Star, Timer} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {BottomTabBar} from '../../components/BottomTabBar';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {getTaskSummary} from '../../services/insightsService';
import {getMyProfile} from '../../services/userService';
import {getUserTasks} from '../../services/userTaskService';
import type {AuthUser} from '../../types/auth';
import type {ProfileSummaryResponse} from '../../types/insights';
import type {UserTaskDetail} from '../../types/userTask';

type Props = NativeStackScreenProps<AuthStackParamList, 'Home'>;

function formatOffline(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}p` : `${minutes} phút`;
}

export function HomeScreen({navigation}: Props) {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [summary, setSummary] = useState<ProfileSummaryResponse | null>(null);
  const [activeTask, setActiveTask] = useState<UserTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function loadDashboard() {
        setLoading(true);
        try {
          const [user, taskSummary, userTasks] = await Promise.all([
            getMyProfile(),
            getTaskSummary(),
            getUserTasks(1, 20),
          ]);
          if (active) {
            setProfile(user);
            setSummary(taskSummary);
            setActiveTask(
              userTasks.items.find(item => item.status === 'IN_PROGRESS') ?? null,
            );
          }
        } catch (error) {
          if (active) {
            Alert.alert(
              'Không thể tải trang chủ',
              error instanceof Error ? error.message : 'Vui lòng thử lại sau.',
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }
      loadDashboard();
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

  function continueActiveTask() {
    if (!activeTask) {
      navigation.navigate('TaskHub');
      return;
    }

    const params = {userTaskId: activeTask._id};
    switch (activeTask.task.verificationType) {
      case 'GPS_DISTANCE':
        navigation.navigate('GPSTracker', params);
        break;
      case 'PHOTO_AI':
        navigation.navigate('AICamera', params);
        break;
      case 'SCREEN_OFF_TIMER':
        navigation.navigate('ScreenTimer', params);
        break;
      case 'MANUAL_CHECKIN':
        navigation.navigate('ManualCheckin', params);
        break;
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Chào bạn 🌿</Text>
              <Text style={styles.userName}>{profile?.fullName ?? 'Đang tải...'}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerButton} onPress={() => navigation.navigate('Notifications')}>
              <Bell size={19} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.headerButton} onPress={() => navigation.navigate('Settings')}>
              <Settings size={19} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.primaryButton} />
        ) : null}

        <View style={styles.accountRow}>
          <View style={styles.accountCard}>
            <Star size={18} color={colors.primary} fill={colors.primary} />
            <View>
              <Text style={styles.smallLabel}>Cấp độ</Text>
              <Text style={styles.accountValue}>Lvl {profile?.level ?? 1}</Text>
            </View>
          </View>
          <View style={styles.accountCard}>
            <Leaf size={19} color={colors.primaryButton} />
            <View>
              <Text style={styles.smallLabel}>Leaf Points</Text>
              <Text style={styles.accountValue}>{profile?.leafPoints ?? 0} LP</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>
            {activeTask ? 'NHIỆM VỤ ĐANG THỰC HIỆN' : 'SẴN SÀNG CHẠM CỎ'}
          </Text>
          <Text style={styles.heroTitle}>
            {activeTask ? `${activeTask.task.emoji} ${activeTask.task.title}` : 'Bắt đầu một nhiệm vụ mới'}
          </Text>
          <Text style={styles.heroDescription}>
            {activeTask
              ? 'Tiến độ chính thức được backend xác minh theo loại nhiệm vụ.'
              : 'Chọn hoạt động phù hợp và nhận phần thưởng sau khi hoàn thành.'}
          </Text>
          <Pressable style={styles.primaryButton} onPress={continueActiveTask}>
            <ListChecks size={17} color={colors.primary} />
            <Text style={styles.primaryButtonText}>
              {activeTask ? 'Tiếp tục nhiệm vụ' : 'Xem danh sách nhiệm vụ'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Tổng quan hoạt động</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <ListChecks size={21} color={colors.primaryButton} />
            <Text style={styles.metricValue}>{summary?.completedTasks ?? 0}</Text>
            <Text style={styles.metricLabel}>Nhiệm vụ hoàn thành</Text>
          </View>
          <View style={styles.metricCard}>
            <Footprints size={21} color={colors.primaryButton} />
            <Text style={styles.metricValue}>{summary?.totalWalkingKilometers ?? 0} km</Text>
            <Text style={styles.metricLabel}>Tổng quãng đường</Text>
          </View>
          <View style={styles.metricCard}>
            <Timer size={21} color={colors.primaryButton} />
            <Text style={styles.metricValue}>
              {formatOffline(summary?.totalOfflineSeconds ?? 0)}
            </Text>
            <Text style={styles.metricLabel}>Không màn hình</Text>
          </View>
          <View style={styles.metricCard}>
            <Star size={21} color={colors.primaryButton} />
            <Text style={styles.metricValue}>{profile?.xp ?? 0} XP</Text>
            <Text style={styles.metricLabel}>Kinh nghiệm</Text>
          </View>
        </View>

        <View style={styles.prototypeCard}>
          <Text style={styles.prototypeTitle}>Kiểm soát ứng dụng · Prototype</Text>
          <Text style={styles.prototypeText}>
            Bản hiện tại chưa đọc UsageStats và chưa khóa ứng dụng thật. Màn hình
            quản lý chỉ dùng để minh họa thiết kế.
          </Text>
          <Pressable onPress={() => navigation.navigate('AppManagement')}>
            <Text style={styles.prototypeLink}>Xem giao diện prototype</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomTabBar active="home" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {paddingHorizontal: 20, paddingBottom: 20},
  header: {paddingTop: 8, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  userRow: {flexDirection: 'row', alignItems: 'center', columnGap: 12},
  avatar: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.primaryButton},
  avatarText: {color: '#FFFFFF', fontSize: 16, fontWeight: '800'},
  greeting: {color: colors.textSecondary, fontSize: 12},
  userName: {marginTop: 2, color: colors.text, fontSize: 16, fontWeight: '700'},
  headerActions: {flexDirection: 'row', columnGap: 8},
  headerButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.surfaceSoft},
  loader: {marginBottom: 10},
  accountRow: {marginBottom: 14, flexDirection: 'row', columnGap: 10},
  accountCard: {flex: 1, padding: 14, flexDirection: 'row', alignItems: 'center', columnGap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 17, backgroundColor: colors.surface},
  smallLabel: {color: colors.textSecondary, fontSize: 10},
  accountValue: {marginTop: 2, color: colors.primary, fontSize: 14, fontWeight: '800'},
  heroCard: {padding: 20, borderRadius: 24, backgroundColor: colors.primary},
  heroEyebrow: {color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: 0.7},
  heroTitle: {marginTop: 8, color: '#FFFFFF', fontSize: 21, fontWeight: '800'},
  heroDescription: {marginTop: 7, color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 18},
  primaryButton: {height: 48, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8, borderRadius: 24, backgroundColor: colors.lime},
  primaryButtonText: {color: colors.primary, fontSize: 13, fontWeight: '800'},
  sectionTitle: {marginTop: 18, marginBottom: 10, color: colors.text, fontSize: 15, fontWeight: '800'},
  metricsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  metricCard: {width: '48.5%', minHeight: 112, padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface},
  metricValue: {marginTop: 10, color: colors.primary, fontSize: 18, fontWeight: '800'},
  metricLabel: {marginTop: 3, color: colors.textSecondary, fontSize: 10},
  prototypeCard: {marginTop: 16, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surfaceSoft},
  prototypeTitle: {color: colors.text, fontSize: 13, fontWeight: '800'},
  prototypeText: {marginTop: 5, color: colors.textSecondary, fontSize: 11, lineHeight: 17},
  prototypeLink: {marginTop: 9, color: colors.primaryButton, fontSize: 12, fontWeight: '800'},
});
