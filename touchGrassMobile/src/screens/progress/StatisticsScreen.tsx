import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {BarChart2, Smartphone} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle} from 'react-native-svg';

import {BottomTabBar} from '../../components/BottomTabBar';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {getTaskStatistics} from '../../services/insightsService';
import type {StatisticsPeriod, StatisticsResponse} from '../../types/insights';

type Props = NativeStackScreenProps<AuthStackParamList, 'Statistics'>;

function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}p` : `${minutes} phút`;
}

function comparisonText(value: number | null): string {
  if (value === null) {
    return 'Chưa có dữ liệu kỳ trước';
  }
  if (value === 0) {
    return 'Không đổi so với kỳ trước';
  }
  return `${value > 0 ? '↑' : '↓'} ${Math.abs(value)}% so với kỳ trước`;
}

export function StatisticsScreen({navigation}: Props) {
  const [period, setPeriod] = useState<StatisticsPeriod>('week');
  const [data, setData] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getTaskStatistics(period));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Không thể tải thống kê.',
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const maxCompleted = Math.max(1, ...(data?.series.map(item => item.completed) ?? [1]));
  const maxOutdoor = Math.max(1, ...(data?.series.map(item => item.outdoorSeconds) ?? [1]));
  const summary = data?.summary;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê</Text>
        <View style={styles.tabs}>
          {(
            [
              ['day', 'Ngày'],
              ['week', 'Tuần'],
              ['month', 'Tháng'],
            ] as Array<[StatisticsPeriod, string]>
          ).map(([key, label]) => (
            <Pressable
              key={key}
              style={[styles.tab, period === key && styles.tabActive]}
              onPress={() => setPeriod(key)}>
              <Text style={[styles.tabText, period === key && styles.tabTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.primaryButton} />
          <Text style={styles.stateText}>Đang tải thống kê...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadStatistics}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : !data || data.summary.totalTasks === 0 ? (
        <View style={styles.stateContainer}>
          <View style={styles.emptyIcon}>
            <BarChart2 size={36} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có dữ liệu trong kỳ này</Text>
          <Text style={styles.stateText}>Hoàn thành nhiệm vụ để bắt đầu tạo thống kê.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>🌿 Ngoài trời</Text>
              <Text style={styles.summaryValue}>{formatSeconds(summary?.outdoorSeconds ?? 0)}</Text>
              <Text style={styles.goodChange}>
                {comparisonText(summary?.comparison.outdoorPercent ?? null)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>🔒 Không màn hình</Text>
              <Text style={[styles.summaryValue, styles.greenValue]}>
                {formatSeconds(summary?.offlineSeconds ?? 0)}
              </Text>
              <Text style={styles.goodChange}>{summary?.distanceMeters ?? 0} m đã đi</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Hoạt động theo thời gian</Text>
              <View style={styles.legend}>
                <View style={[styles.legendDot, styles.taskDot]} />
                <Text style={styles.legendText}>Nhiệm vụ</Text>
                <View style={[styles.legendDot, styles.outdoorDot]} />
                <Text style={styles.legendText}>Ngoài trời</Text>
              </View>
            </View>
            <View style={styles.barChart}>
              {data.series.map(item => (
                <View key={item.key} style={styles.barColumn}>
                  <View style={styles.barArea}>
                    <View
                      style={[
                        styles.bar,
                        styles.taskBar,
                        {height: Math.max(4, (item.completed / maxCompleted) * 100)},
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        styles.outdoorBar,
                        {height: Math.max(4, (item.outdoorSeconds / maxOutdoor) * 100)},
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hoàn thành nhiệm vụ</Text>
            <View style={styles.taskStats}>
              <View style={styles.donut}>
                <Svg width={92} height={92} viewBox="0 0 92 92">
                  <Circle cx="46" cy="46" r="34" fill="none" stroke={colors.surfaceSoft} strokeWidth="11" />
                  <Circle
                    cx="46"
                    cy="46"
                    r="34"
                    fill="none"
                    stroke={colors.primaryButton}
                    strokeWidth="11"
                    strokeDasharray={`${((summary?.completionRate ?? 0) / 100) * 214} ${214}`}
                    transform="rotate(-90 46 46)"
                  />
                </Svg>
                <Text style={styles.donutValue}>{summary?.completionRate ?? 0}%</Text>
              </View>
              <View style={styles.taskLegend}>
                {[
                  [colors.primaryButton, 'Hoàn thành', summary?.completed ?? 0],
                  ['#E8A020', 'Không hợp lệ', summary?.invalid ?? 0],
                  [colors.error, 'Đã hủy', summary?.cancelled ?? 0],
                ].map(([color, label, value]) => (
                  <View key={label as string} style={styles.taskLegendRow}>
                    <View style={[styles.taskLegendDot, {backgroundColor: color as string}]} />
                    <Text style={styles.taskLegendLabel}>{label}</Text>
                    <Text style={styles.taskLegendValue}>{value} nhiệm vụ</Text>
                  </View>
                ))}
                <Text style={styles.comparison}>
                  {comparisonText(summary?.comparison.completedPercent ?? null)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.rewardCard}>
            <View>
              <Text style={styles.rewardLabel}>Phần thưởng đã nhận trong kỳ</Text>
              <Text style={styles.rewardValue}>
                {summary?.xpEarned ?? 0} XP · {summary?.leafPointsEarned ?? 0} LP
              </Text>
            </View>
          </View>

          <View style={styles.deviceCard}>
            <Smartphone size={24} color={colors.textSecondary} />
            <View style={styles.deviceText}>
              <Text style={styles.cardTitle}>Thời gian dùng ứng dụng</Text>
              <Text style={styles.deviceDescription}>
                {data.deviceMetrics.available
                  ? formatSeconds(data.deviceMetrics.screenTimeSeconds ?? 0)
                  : 'Chưa khả dụng. Android cần quyền Usage Stats để cung cấp chỉ số này.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      <BottomTabBar active="stats" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  header: {paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12},
  title: {marginBottom: 14, color: colors.text, fontSize: 22, fontWeight: '800'},
  tabs: {padding: 4, flexDirection: 'row', borderRadius: 14, backgroundColor: colors.inputBackground},
  tab: {height: 34, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10},
  tabActive: {backgroundColor: colors.surface, elevation: 2},
  tabText: {color: colors.textSecondary, fontSize: 13},
  tabTextActive: {color: colors.primary, fontWeight: '700'},
  content: {paddingHorizontal: 20, paddingBottom: 18, rowGap: 14},
  summaryRow: {flexDirection: 'row', columnGap: 10},
  summaryCard: {flex: 1, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface},
  summaryLabel: {color: colors.textSecondary, fontSize: 11},
  summaryValue: {marginTop: 5, color: colors.text, fontSize: 21, fontWeight: '800'},
  greenValue: {color: colors.primaryButton},
  goodChange: {marginTop: 4, color: colors.primaryButton, fontSize: 10, fontWeight: '600'},
  card: {padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cardTitle: {color: colors.text, fontSize: 14, fontWeight: '700'},
  legend: {flexDirection: 'row', alignItems: 'center', columnGap: 4},
  legendDot: {width: 8, height: 8, marginLeft: 6, borderRadius: 2},
  taskDot: {backgroundColor: 'rgba(47,107,5,0.4)'},
  outdoorDot: {backgroundColor: colors.primaryButton},
  legendText: {color: colors.textSecondary, fontSize: 9},
  barChart: {height: 138, marginTop: 14, flexDirection: 'row', alignItems: 'flex-end', columnGap: 6},
  barColumn: {height: '100%', flex: 1, alignItems: 'center'},
  barArea: {flex: 1, width: '100%', flexDirection: 'row', alignItems: 'flex-end', columnGap: 2},
  bar: {flex: 1, minHeight: 4, borderTopLeftRadius: 4, borderTopRightRadius: 4},
  taskBar: {backgroundColor: 'rgba(47,107,5,0.4)'},
  outdoorBar: {backgroundColor: colors.primaryButton},
  dayLabel: {marginTop: 5, color: colors.textSecondary, fontSize: 10},
  taskStats: {marginTop: 14, flexDirection: 'row', alignItems: 'center', columnGap: 15},
  donut: {width: 92, height: 92, alignItems: 'center', justifyContent: 'center'},
  donutValue: {position: 'absolute', color: colors.primary, fontSize: 16, fontWeight: '800'},
  taskLegend: {flex: 1},
  taskLegendRow: {marginBottom: 8, flexDirection: 'row', alignItems: 'center', columnGap: 7},
  taskLegendDot: {width: 10, height: 10, borderRadius: 5},
  taskLegendLabel: {flex: 1, color: colors.textSecondary, fontSize: 11},
  taskLegendValue: {color: colors.text, fontSize: 11, fontWeight: '700'},
  comparison: {marginTop: 3, color: colors.primaryButton, fontSize: 10},
  rewardCard: {padding: 16, borderRadius: 18, backgroundColor: colors.primary},
  rewardLabel: {color: 'rgba(255,255,255,0.62)', fontSize: 11},
  rewardValue: {marginTop: 5, color: colors.lime, fontSize: 18, fontWeight: '800'},
  deviceCard: {padding: 16, flexDirection: 'row', alignItems: 'center', columnGap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface},
  deviceText: {flex: 1},
  deviceDescription: {marginTop: 4, color: colors.textSecondary, fontSize: 11, lineHeight: 17},
  stateContainer: {flex: 1, paddingHorizontal: 36, alignItems: 'center', justifyContent: 'center', rowGap: 12},
  stateText: {color: colors.textSecondary, fontSize: 13, textAlign: 'center'},
  emptyIcon: {width: 80, height: 80, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: colors.surfaceSoft},
  emptyTitle: {color: colors.text, fontSize: 17, fontWeight: '800'},
  errorText: {color: colors.error, fontSize: 13, lineHeight: 19, textAlign: 'center'},
  retryButton: {paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.primaryButton},
  retryText: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
});
