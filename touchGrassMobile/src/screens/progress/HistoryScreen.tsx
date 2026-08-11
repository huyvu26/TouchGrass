import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ScreenHeader} from '../../components/ScreenHeader';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {getTaskHistory} from '../../services/insightsService';
import type {HistoryFilter, HistoryResponse} from '../../types/insights';

type Props = NativeStackScreenProps<AuthStackParamList, 'History'>;

const STATUS = {
  done: {label: 'Đã hoàn thành', color: colors.primaryButton, background: colors.surfaceSoft},
  invalid: {label: 'Không hợp lệ', color: '#B08000', background: '#FFF8E0'},
  cancelled: {label: 'Đã hủy', color: colors.error, background: colors.errorBackground},
} as const;

const TYPE_LABELS = {
  GPS_DISTANCE: 'Đi bộ GPS',
  PHOTO_AI: 'Ảnh và AI',
  SCREEN_OFF_TIMER: 'Không màn hình',
  MANUAL_CHECKIN: 'Xác nhận thủ công',
} as const;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return 'Không ghi nhận';
  }
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes > 0 ? `${minutes} phút ${remaining} giây` : `${remaining} giây`;
}

export function HistoryScreen({navigation}: Props) {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getTaskHistory(filter, 1, 20));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Không thể tải lịch sử nhiệm vụ.',
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const counts = data?.counts ?? {all: 0, done: 0, invalid: 0, cancelled: 0};

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="Lịch sử hoạt động" onBack={() => navigation.goBack()} />
      <View style={styles.filters}>
        {(
          [
            ['all', `Tất cả · ${counts.all}`],
            ['done', `✓ ${counts.done}`],
            ['invalid', `⚠ ${counts.invalid}`],
            ['cancelled', `✕ ${counts.cancelled}`],
          ] as Array<[HistoryFilter, string]>
        ).map(([key, label]) => (
          <Pressable
            key={key}
            style={[styles.filter, filter === key && styles.filterActive]}
            onPress={() => setFilter(key)}>
            <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.primaryButton} />
          <Text style={styles.stateText}>Đang tải lịch sử...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadHistory}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : data?.items.length === 0 ? (
        <View style={styles.stateContainer}>
          <Text style={styles.emptyTitle}>Chưa có hoạt động phù hợp</Text>
          <Text style={styles.stateText}>Các nhiệm vụ kết thúc sẽ xuất hiện tại đây.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {data?.items.map(item => {
            const status = STATUS[item.status];
            return (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate('TaskDetail', {taskId: item.taskId})}>
                <View style={styles.emojiBox}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={[styles.status, {backgroundColor: status.background}]}>
                      <Text style={[styles.statusText, {color: status.color}]}>{status.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.meta}>
                    {TYPE_LABELS[item.verificationType]} · {formatDate(item.activityAt)}
                  </Text>
                  <View style={styles.rewardRow}>
                    <Text style={styles.duration}>⏱ {formatDuration(item.durationSeconds)}</Text>
                    {item.status === 'done' && item.rewardGranted ? (
                      <>
                        <Text style={styles.xp}>+{item.rewardXp} XP</Text>
                        <Text style={styles.lp}>+{item.rewardLp} LP</Text>
                      </>
                    ) : null}
                  </View>
                </View>
                <ChevronRight size={16} color={colors.textSecondary} />
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  filters: {paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', columnGap: 7},
  filter: {height: 32, paddingHorizontal: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: 16},
  filterActive: {borderColor: colors.primaryButton, backgroundColor: colors.surfaceSoft},
  filterText: {color: colors.textSecondary, fontSize: 11, fontWeight: '600'},
  filterTextActive: {color: colors.primaryButton},
  list: {paddingHorizontal: 20, paddingBottom: 20, rowGap: 10},
  card: {padding: 14, flexDirection: 'row', alignItems: 'center', columnGap: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface},
  emojiBox: {width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.surfaceSoft},
  emoji: {fontSize: 22},
  cardContent: {minWidth: 0, flex: 1},
  cardTitleRow: {marginBottom: 3, flexDirection: 'row', alignItems: 'center', columnGap: 6},
  cardTitle: {minWidth: 0, flex: 1, color: colors.text, fontSize: 13, fontWeight: '700'},
  status: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 11},
  statusText: {fontSize: 9, fontWeight: '600'},
  meta: {color: colors.textSecondary, fontSize: 11},
  rewardRow: {marginTop: 5, flexDirection: 'row', columnGap: 8},
  duration: {color: colors.textSecondary, fontSize: 10},
  xp: {color: colors.primaryButton, fontSize: 10, fontWeight: '700'},
  lp: {color: colors.primary, fontSize: 10, fontWeight: '700'},
  stateContainer: {flex: 1, paddingHorizontal: 36, alignItems: 'center', justifyContent: 'center', rowGap: 12},
  stateText: {color: colors.textSecondary, fontSize: 13, textAlign: 'center'},
  emptyTitle: {color: colors.text, fontSize: 17, fontWeight: '800'},
  errorText: {color: colors.error, fontSize: 13, lineHeight: 19, textAlign: 'center'},
  retryButton: {paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.primaryButton},
  retryText: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
});
