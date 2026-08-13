import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Lock, Star, X} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ScreenHeader} from '../../components/ScreenHeader';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {getTaskSummary} from '../../services/insightsService';
import {getMyProfile} from '../../services/userService';
import type {AuthUser} from '../../types/auth';
import type {ProfileSummaryResponse} from '../../types/insights';

type Props = NativeStackScreenProps<AuthStackParamList, 'Badges'>;

export function BadgeScreen({navigation}: Props) {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [summary, setSummary] = useState<ProfileSummaryResponse | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function loadData() {
        setLoading(true);
        try {
          const [user, taskSummary] = await Promise.all([
            getMyProfile(),
            getTaskSummary(),
          ]);
          if (active) {
            setProfile(user);
            setSummary(taskSummary);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }
      loadData();
      return () => {
        active = false;
      };
    }, []),
  );

  const badges = useMemo(() => {
    const tasks = summary?.completedTasks ?? 0;
    const kilometers = summary?.totalWalkingKilometers ?? 0;
    const offlineMinutes = Math.floor((summary?.totalOfflineSeconds ?? 0) / 60);
    const level = profile?.level ?? 1;
    const xp = profile?.xp ?? 0;
    return [
      {id: 1, emoji: '🌱', name: 'Khởi đầu xanh', description: 'Hoàn thành nhiệm vụ đầu tiên', current: tasks, target: 1, unit: 'nhiệm vụ'},
      {id: 2, emoji: '🧭', name: 'Người khám phá', description: 'Hoàn thành 10 nhiệm vụ', current: tasks, target: 10, unit: 'nhiệm vụ'},
      {id: 3, emoji: '🏆', name: 'Bền bỉ', description: 'Hoàn thành 25 nhiệm vụ', current: tasks, target: 25, unit: 'nhiệm vụ'},
      {id: 4, emoji: '🥾', name: 'Bước chân đầu tiên', description: 'Đi bộ tổng cộng 1 km', current: kilometers, target: 1, unit: 'km'},
      {id: 5, emoji: '🌳', name: 'Bạn của thiên nhiên', description: 'Đi bộ tổng cộng 5 km', current: kilometers, target: 5, unit: 'km'},
      {id: 6, emoji: '📵', name: 'Rời màn hình', description: 'Tích lũy 30 phút không màn hình', current: offlineMinutes, target: 30, unit: 'phút'},
      {id: 7, emoji: '⭐', name: 'Tiến bộ', description: 'Đạt cấp độ 5', current: level, target: 5, unit: 'cấp'},
      {id: 8, emoji: '⚡', name: 'Tích lũy kinh nghiệm', description: 'Đạt 1.000 XP', current: xp, target: 1000, unit: 'XP'},
    ].map(item => ({...item, earned: item.current >= item.target}));
  }, [profile, summary]);

  const selected = badges.find(item => item.id === selectedId);
  const earnedCount = badges.filter(item => item.earned).length;
  const levelProgress = Math.min(((profile?.xp ?? 0) % 1000) / 10, 100);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="Bộ sưu tập huy hiệu" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.levelCard}>
          <View style={styles.starBox}>
            <Star size={26} color={colors.primary} fill={colors.primary} />
          </View>
          <View style={styles.levelContent}>
            <Text style={styles.levelTitle}>Level {profile?.level ?? 1}</Text>
            <View style={styles.levelTrack}>
              <View style={[styles.levelProgress, {width: `${levelProgress}%`}]} />
            </View>
            <Text style={styles.levelText}>{profile?.xp ?? 0} XP tích lũy</Text>
          </View>
          <Text style={styles.badgeCount}>{earnedCount}/{badges.length}</Text>
        </View>

        {loading ? <ActivityIndicator color={colors.primaryButton} /> : null}
        <Text style={styles.sectionTitle}>Huy hiệu từ dữ liệu hoạt động</Text>
        <View style={styles.grid}>
          {badges.map(badge => (
            <Pressable
              key={badge.id}
              style={[styles.badgeCard, !badge.earned && styles.badgeLocked]}
              onPress={() => setSelectedId(badge.id)}>
              <View style={[styles.badgeIcon, badge.earned && styles.badgeEarned]}>
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                {!badge.earned ? (
                  <View style={styles.lockBadge}>
                    <Lock size={11} color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
              <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
              <Text style={styles.badgeDescription} numberOfLines={2}>{badge.description}</Text>
              <Text style={[styles.badgeProgress, badge.earned && styles.badgeProgressDone]}>
                {Math.min(Number(badge.current.toFixed(2)), badge.target)}/{badge.target} {badge.unit}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal visible={Boolean(selected)} transparent animationType="fade" onRequestClose={() => setSelectedId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Pressable style={styles.modalClose} onPress={() => setSelectedId(null)}>
              <X size={20} color={colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalEmoji}>{selected?.emoji}</Text>
            <Text style={styles.modalTitle}>{selected?.name}</Text>
            <Text style={styles.modalDescription}>{selected?.description}</Text>
            <View style={styles.modalProgress}>
              <Text style={styles.modalProgressText}>
                {selected ? `${Math.min(Number(selected.current.toFixed(2)), selected.target)}/${selected.target} ${selected.unit}` : ''}
              </Text>
            </View>
            <Text style={styles.modalStatus}>
              {selected?.earned ? 'Đã mở khóa 🎉' : 'Tiếp tục hoạt động để mở khóa'}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {paddingHorizontal: 20, paddingBottom: 24},
  levelCard: {marginBottom: 18, padding: 16, flexDirection: 'row', alignItems: 'center', columnGap: 13, borderRadius: 20, backgroundColor: colors.primary},
  starBox: {width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: colors.lime},
  levelContent: {flex: 1},
  levelTitle: {color: '#FFFFFF', fontSize: 16, fontWeight: '800'},
  levelTrack: {height: 8, marginTop: 7, overflow: 'hidden', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)'},
  levelProgress: {height: '100%', borderRadius: 4, backgroundColor: colors.lime},
  levelText: {marginTop: 4, color: 'rgba(255,255,255,0.58)', fontSize: 10},
  badgeCount: {color: colors.lime, fontSize: 14, fontWeight: '800'},
  sectionTitle: {marginBottom: 12, color: colors.text, fontSize: 15, fontWeight: '700'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  badgeCard: {width: '48.5%', padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface},
  badgeLocked: {opacity: 0.62},
  badgeIcon: {width: 64, height: 64, marginBottom: 9, position: 'relative', alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: colors.surfaceSoft},
  badgeEarned: {borderWidth: 2, borderColor: colors.lime, backgroundColor: '#EFF9E6'},
  badgeEmoji: {fontSize: 31},
  lockBadge: {position: 'absolute', right: -2, bottom: -2, width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.textSecondary},
  badgeName: {color: colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center'},
  badgeDescription: {height: 32, marginTop: 4, color: colors.textSecondary, fontSize: 10, lineHeight: 15, textAlign: 'center'},
  badgeProgress: {marginTop: 7, color: colors.textSecondary, fontSize: 10, fontWeight: '600'},
  badgeProgressDone: {color: colors.primaryButton},
  modalBackdrop: {flex: 1, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21,66,18,0.45)'},
  modalCard: {width: '100%', padding: 24, alignItems: 'center', borderRadius: 26, backgroundColor: colors.surface},
  modalClose: {position: 'absolute', top: 14, right: 14, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: colors.surfaceSoft},
  modalEmoji: {fontSize: 58},
  modalTitle: {marginTop: 10, color: colors.text, fontSize: 21, fontWeight: '800'},
  modalDescription: {marginTop: 6, color: colors.textSecondary, fontSize: 13, textAlign: 'center'},
  modalProgress: {marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.surfaceSoft},
  modalProgressText: {color: colors.primaryButton, fontSize: 13, fontWeight: '700'},
  modalStatus: {marginTop: 12, color: colors.primary, fontSize: 13, fontWeight: '600'},
});
