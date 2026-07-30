import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {BarChart2} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle} from 'react-native-svg';

import {BottomTabBar} from '../../components/BottomTabBar';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Statistics'
>;

type Period = 'day' | 'week' | 'month';

const BAR_DATA = [
  ['T2', 78, 34],
  ['T3', 96, 26],
  ['T4', 42, 62],
  ['T5', 65, 48],
  ['T6', 100, 18],
  ['T7', 28, 88],
  ['CN', 20, 100],
] as const;

export function StatisticsScreen({navigation}: Props) {
  const [period, setPeriod] = useState<Period>('week');
  const [empty, setEmpty] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Thống kê</Text>
          <Pressable
            style={styles.demoButton}
            onPress={() => setEmpty(value => !value)}>
            <Text style={styles.demoButtonText}>
              {empty ? 'Có dữ liệu' : 'Trống'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.tabs}>
          {(
            [
              ['day', 'Ngày'],
              ['week', 'Tuần'],
              ['month', 'Tháng'],
            ] as Array<[Period, string]>
          ).map(([key, label]) => (
            <Pressable
              key={key}
              style={[
                styles.tab,
                period === key && styles.tabActive,
              ]}
              onPress={() => setPeriod(key)}>
              <Text
                style={[
                  styles.tabText,
                  period === key && styles.tabTextActive,
                ]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {empty ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <BarChart2 size={36} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>
            Chưa có đủ dữ liệu
          </Text>
          <Text style={styles.emptyText}>
            Sử dụng ứng dụng ít nhất 3 ngày để xem thống kê chi
            tiết.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                📱 Màn hình tuần này
              </Text>
              <Text style={styles.summaryValue}>16h 20p</Text>
              <Text style={styles.goodChange}>
                ↓ 12% so với tuần trước
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                🌿 Ngoài trời
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  styles.greenValue,
                ]}>
                8h 05p
              </Text>
              <Text style={styles.goodChange}>
                ↑ 34% so với tuần trước
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Biểu đồ tuần này
              </Text>
              <View style={styles.legend}>
                <View style={[styles.legendDot, styles.screenDot]} />
                <Text style={styles.legendText}>Màn hình</Text>
                <View style={[styles.legendDot, styles.outdoorDot]} />
                <Text style={styles.legendText}>Thiên nhiên</Text>
              </View>
            </View>
            <View style={styles.barChart}>
              {BAR_DATA.map(([day, screen, outdoor]) => (
                <View key={day} style={styles.barColumn}>
                  <View style={styles.barArea}>
                    <View
                      style={[
                        styles.bar,
                        styles.screenBar,
                        {height: screen},
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        styles.outdoorBar,
                        {height: outdoor},
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Hoàn thành nhiệm vụ
            </Text>
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
                    strokeDasharray={`${0.72 * 214} ${214}`}
                    transform="rotate(-90 46 46)"
                  />
                </Svg>
                <Text style={styles.donutValue}>18</Text>
              </View>
              <View style={styles.taskLegend}>
                {[
                  [colors.primaryButton, 'Hoàn thành', '13'],
                  ['#E8A020', 'Không hợp lệ', '3'],
                  [colors.error, 'Đã hủy', '2'],
                ].map(([color, label, value]) => (
                  <View key={label} style={styles.taskLegendRow}>
                    <View
                      style={[
                        styles.taskLegendDot,
                        {backgroundColor: color},
                      ]}
                    />
                    <Text style={styles.taskLegendLabel}>
                      {label}
                    </Text>
                    <Text style={styles.taskLegendValue}>
                      {value} nhiệm vụ
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Ứng dụng tiêu tốn nhiều nhất
            </Text>
            {[
              ['TikTok', 48, '#111111'],
              ['Instagram', 42, '#C13584'],
              ['Facebook', 35, '#1877F2'],
              ['YouTube', 28, '#FF0000'],
            ].map(([name, minutes, color]) => (
              <View key={name as string} style={styles.appUsage}>
                <View style={styles.appHeader}>
                  <View
                    style={[
                      styles.appIcon,
                      {backgroundColor: color as string},
                    ]}>
                    <Text style={styles.appIconText}>
                      {(name as string).slice(0, 1)}
                    </Text>
                  </View>
                  <Text style={styles.appName}>{name}</Text>
                  <Text style={styles.minutes}>
                    {minutes} phút
                  </Text>
                </View>
                <View style={styles.usageTrack}>
                  <View
                    style={[
                      styles.usageBar,
                      {
                        width: `${(Number(minutes) / 48) * 100}%`,
                        backgroundColor: color as string,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
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
  titleRow: {marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {color: colors.text, fontSize: 22, fontWeight: '800'},
  demoButton: {paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: colors.border, borderRadius: 16},
  demoButtonText: {color: colors.textSecondary, fontSize: 11},
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
  screenDot: {backgroundColor: 'rgba(186,26,26,0.5)'},
  outdoorDot: {backgroundColor: colors.primaryButton},
  legendText: {color: colors.textSecondary, fontSize: 9},
  barChart: {height: 138, marginTop: 14, flexDirection: 'row', alignItems: 'flex-end', columnGap: 6},
  barColumn: {height: '100%', flex: 1, alignItems: 'center'},
  barArea: {flex: 1, width: '100%', flexDirection: 'row', alignItems: 'flex-end', columnGap: 2},
  bar: {flex: 1, minHeight: 4, borderTopLeftRadius: 4, borderTopRightRadius: 4},
  screenBar: {backgroundColor: 'rgba(186,26,26,0.45)'},
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
  appUsage: {marginTop: 13},
  appHeader: {marginBottom: 5, flexDirection: 'row', alignItems: 'center', columnGap: 8},
  appIcon: {width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 7},
  appIconText: {color: '#FFFFFF', fontSize: 11, fontWeight: '800'},
  appName: {flex: 1, color: colors.text, fontSize: 13, fontWeight: '600'},
  minutes: {color: colors.textSecondary, fontSize: 12, fontWeight: '700'},
  usageTrack: {height: 7, overflow: 'hidden', borderRadius: 4, backgroundColor: colors.surfaceSoft},
  usageBar: {height: '100%', borderRadius: 4, opacity: 0.8},
  emptyState: {flex: 1, paddingHorizontal: 40, alignItems: 'center', justifyContent: 'center'},
  emptyIcon: {width: 80, height: 80, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: colors.surfaceSoft},
  emptyTitle: {marginTop: 14, color: colors.text, fontSize: 18, fontWeight: '700'},
  emptyText: {marginTop: 6, color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center'},
});
