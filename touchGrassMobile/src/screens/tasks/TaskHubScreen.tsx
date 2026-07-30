import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BarChart2,
  Clock,
  Home,
  Leaf,
  ListChecks,
  User,
  Zap,
} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'TaskHub'
>;

type TabKey = 'daily' | 'random' | 'special';

interface Task {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  xp: number;
  lp: number;
  difficulty:
    | 'Dễ'
    | 'Trung bình'
    | 'Khó'
    | 'Thử thách'
    | 'Sử thi';
  time: string;
  progress: number;
  goal: number;
  progressUnit?: string;
}

const TASKS: Record<TabKey, Task[]> = {
  daily: [
    {
      id: 1,
      emoji: '🌅',
      title: 'Đi dạo buổi sáng',
      subtitle: 'Đi bộ 2km trước 9 giờ sáng',
      xp: 50,
      lp: 10,
      difficulty: 'Dễ',
      time: 'còn 2g 15p',
      progress: 1.2,
      goal: 2,
      progressUnit: 'km',
    },
    {
      id: 2,
      emoji: '🌿',
      title: 'Tìm màu xanh',
      subtitle: 'Chụp ảnh cây xanh ngoài trời',
      xp: 35,
      lp: 0,
      difficulty: 'Dễ',
      time: 'còn 14g',
      progress: 0,
      goal: 1,
    },
    {
      id: 3,
      emoji: '☀️',
      title: 'Rời khỏi màn hình',
      subtitle: '30 phút không dùng điện thoại',
      xp: 75,
      lp: 15,
      difficulty: 'Trung bình',
      time: 'còn 10g',
      progress: 12,
      goal: 30,
      progressUnit: 'p',
    },
  ],
  random: [
    {
      id: 4,
      emoji: '🦋',
      title: 'Quan sát côn trùng',
      subtitle: 'Tìm và chụp ảnh 1 con bướm hoặc ong',
      xp: 45,
      lp: 8,
      difficulty: 'Trung bình',
      time: 'hết hôm nay',
      progress: 0,
      goal: 1,
    },
    {
      id: 5,
      emoji: '💧',
      title: 'Tìm nguồn nước',
      subtitle: 'Chụp ảnh suối, hồ hoặc mưa',
      xp: 60,
      lp: 12,
      difficulty: 'Khó',
      time: 'hết hôm nay',
      progress: 0,
      goal: 1,
    },
  ],
  special: [
    {
      id: 6,
      emoji: '🏆',
      title: 'Thám hiểm công viên',
      subtitle: 'Đi bộ 5km trong công viên tự nhiên',
      xp: 150,
      lp: 40,
      difficulty: 'Thử thách',
      time: 'còn 3 ngày',
      progress: 0,
      goal: 5,
      progressUnit: 'km',
    },
    {
      id: 7,
      emoji: '🌳',
      title: '42 loại cây',
      subtitle: 'Chụp ảnh 42 loại cây khác nhau',
      xp: 500,
      lp: 100,
      difficulty: 'Sử thi',
      time: 'còn 7 ngày',
      progress: 38,
      goal: 42,
    },
  ],
};

const TABS: Array<{key: TabKey; label: string}> = [
  {key: 'daily', label: 'Hằng ngày'},
  {key: 'random', label: 'Ngẫu nhiên'},
  {key: 'special', label: 'Đặc biệt'},
];

const DIFFICULTY_COLORS: Record<
  Task['difficulty'],
  {text: string; background: string}
> = {
  Dễ: {
    text: colors.primaryButton,
    background: 'rgba(36, 107, 5, 0.1)',
  },
  'Trung bình': {
    text: '#B08000',
    background: 'rgba(176, 128, 0, 0.1)',
  },
  Khó: {
    text: '#E0600A',
    background: 'rgba(224, 96, 10, 0.1)',
  },
  'Thử thách': {
    text: colors.error,
    background: 'rgba(186, 26, 26, 0.1)',
  },
  'Sử thi': {
    text: '#7B00D4',
    background: 'rgba(123, 0, 212, 0.1)',
  },
};

interface BottomNavProps {
  onHome: () => void;
  onStats: () => void;
  onProfile: () => void;
}

function BottomNavigation({
  onHome,
  onStats,
  onProfile,
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
        const active = item.key === 'tasks';

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            style={styles.navItem}
            onPress={() => {
              if (item.key === 'home') {
                onHome();
              } else if (item.key === 'stats') {
                onStats();
              } else if (item.key === 'profile') {
                onProfile();
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

export function TaskHubScreen({navigation}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const tasks = TASKS[activeTab];

  function handleTask(task: Task) {
    if (task.id === 2 || task.id === 4 || task.id === 5 || task.id === 7) {
      navigation.navigate('AICamera');
      return;
    }

    navigation.navigate('TaskDetail');
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Khám phá thiên nhiên</Text>
          <View style={styles.xpChip}>
            <Zap
              size={13}
              color={colors.primary}
              fill={colors.primary}
            />
            <Text style={styles.xpText}>1,450 XP</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Hoàn thành nhiệm vụ để mở khóa thời gian màn hình
        </Text>

        <View style={styles.tabs}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.tabButton,
                  active && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab(tab.key)}>
                <Text
                  style={[
                    styles.tabText,
                    active && styles.tabTextActive,
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.taskList}>
        {tasks.map(task => {
          const hasProgress = task.progress > 0;
          const progressPercentage: `${number}%` =
            `${Math.min(task.progress / task.goal, 1) * 100}%`;
          const difficulty = DIFFICULTY_COLORS[task.difficulty];

          return (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskTopRow}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{task.emoji}</Text>
                </View>

                <View style={styles.taskMain}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskSubtitle}>
                    {task.subtitle}
                  </Text>

                  <View style={styles.chipRow}>
                    <View
                      style={[
                        styles.infoChip,
                        {backgroundColor: difficulty.background},
                      ]}>
                      <Text
                        style={[
                          styles.difficultyText,
                          {color: difficulty.text},
                        ]}>
                        {task.difficulty}
                      </Text>
                    </View>

                    <View style={styles.infoChip}>
                      <Clock
                        size={11}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.timeText}>
                        {task.time}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {hasProgress ? (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>
                      Tiến độ
                    </Text>
                    <Text style={styles.progressValue}>
                      {task.progress}/{task.goal}
                      {task.progressUnit ?? ''}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBar,
                        {width: progressPercentage},
                      ]}
                    />
                  </View>
                </View>
              ) : null}

              <View style={styles.rewardRow}>
                <View style={styles.rewards}>
                  <View style={styles.xpReward}>
                    <Zap
                      size={12}
                      color={colors.primary}
                    />
                    <Text style={styles.xpRewardText}>
                      +{task.xp} XP
                    </Text>
                  </View>

                  {task.lp > 0 ? (
                    <View style={styles.lpReward}>
                      <Leaf
                        size={12}
                        color={colors.primaryButton}
                      />
                      <Text style={styles.lpRewardText}>
                        +{task.lp} LP
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Pressable
                  accessibilityRole="button"
                  style={({pressed}) => [
                    styles.taskButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleTask(task)}>
                  <Text style={styles.taskButtonText}>
                    {hasProgress ? 'Tiếp tục' : 'Bắt đầu'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <BottomNavigation
        onHome={() => navigation.navigate('Home')}
        onStats={() => navigation.navigate('Statistics')}
        onProfile={() => navigation.navigate('Profile')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleRow: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 10,
  },
  title: {
    minWidth: 0,
    flex: 1,
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  xpChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
    borderRadius: 16,
    backgroundColor: colors.lime,
  },
  xpText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: 14,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  tabs: {
    padding: 4,
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: colors.inputBackground,
  },
  tabButton: {
    height: 36,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    rowGap: 14,
  },
  taskCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  taskTopRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 14,
  },
  emojiContainer: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.surfaceSoft,
  },
  emoji: {
    fontSize: 26,
  },
  taskMain: {
    minWidth: 0,
    flex: 1,
  },
  taskTitle: {
    marginBottom: 4,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  taskSubtitle: {
    marginBottom: 8,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  infoChip: {
    height: 24,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceSoft,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  progressValue: {
    color: colors.primaryButton,
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrack: {
    height: 7,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: colors.surfaceSoft,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primaryButton,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  rewards: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  xpReward: {
    height: 30,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(176, 242, 103, 0.2)',
  },
  xpRewardText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  lpReward: {
    height: 30,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
    borderRadius: 15,
    backgroundColor: colors.surfaceSoft,
  },
  lpRewardText: {
    color: colors.primaryButton,
    fontSize: 12,
    fontWeight: '700',
  },
  taskButton: {
    height: 38,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.primaryButton,
  },
  taskButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  bottomNav: {
    height: 72,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
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
