import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
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
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {getTasks} from '../../services/taskService';
import {getUserTasks} from '../../services/userTaskService';
import {getMyProfile} from '../../services/userService';
import type {
  Task,
  TaskDifficulty,
  TaskFrequency,
} from '../../types/task';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'TaskHub'
>;

const TABS: Array<{key: TaskFrequency; label: string}> = [
  {key: 'DAILY', label: 'Hằng ngày'},
  {key: 'WEEKLY', label: 'Hằng tuần'},
  {key: 'ANYTIME', label: 'Bất kỳ lúc nào'},
];

const DIFFICULTY_COLORS: Record<
  TaskDifficulty,
  {text: string; background: string}
> = {
  EASY: {
    text: colors.primaryButton,
    background: 'rgba(36, 107, 5, 0.1)',
  },
  MEDIUM: {
    text: '#B08000',
    background: 'rgba(176, 128, 0, 0.1)',
  },
  HARD: {
    text: '#E0600A',
    background: 'rgba(224, 96, 10, 0.1)',
  },
};

const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

function getVietnamDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function getCurrentCycleKeys(): Set<string> {
  const today = getVietnamDateKey();
  const monday = new Date(`${today}T00:00:00.000Z`);
  const mondayOffset = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - mondayOffset);
  return new Set([
    `DAILY:${today}`,
    `WEEKLY:${monday.toISOString().slice(0, 10)}`,
  ]);
}

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
  const [activeTab, setActiveTab] =
    useState<TaskFrequency>('DAILY');
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(
    new Set(),
  );
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tasks = allTasks.filter(
    task =>
      task.frequency === activeTab &&
      !completedTaskIds.has(task._id),
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [taskData, userTasks] = await Promise.all([
        getTasks(),
        getUserTasks(1, 50),
      ]);
      setAllTasks(taskData);
      const currentCycles = getCurrentCycleKeys();
      setCompletedTaskIds(new Set(
        userTasks.items
          .filter(item =>
            item.status === 'COMPLETED' &&
            currentCycles.has(item.cycleKey),
          )
          .map(item => item.task._id),
      ));

      try {
        const profile = await getMyProfile();
        setXp(profile.xp);
      } catch {
        setXp(0);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Không thể tải danh sách nhiệm vụ.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadTasks();
  }, [loadTasks]));

  function handleTask(task: Task) {
    navigation.navigate('TaskDetail', {taskId: task._id});
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
            <Text style={styles.xpText}>{xp.toLocaleString()} XP</Text>
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
        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={colors.primaryButton} />
            <Text style={styles.stateText}>Đang tải nhiệm vụ...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.stateContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadTasks}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && tasks.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>
              Chưa có nhiệm vụ trong nhóm này.
            </Text>
          </View>
        ) : null}

        {!loading && !error ? tasks.map(task => {
          const difficulty = DIFFICULTY_COLORS[task.difficulty];

          return (
            <View key={task._id} style={styles.taskCard}>
              <View style={styles.taskTopRow}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{task.emoji}</Text>
                </View>

                <View style={styles.taskMain}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskSubtitle}>
                    {task.description}
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
                        {DIFFICULTY_LABELS[task.difficulty]}
                      </Text>
                    </View>

                    <View style={styles.infoChip}>
                      <Clock
                        size={11}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.timeText}>
                        {task.estimatedMinutes} phút
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.rewardRow}>
                <View style={styles.rewards}>
                  <View style={styles.xpReward}>
                    <Zap
                      size={12}
                      color={colors.primary}
                    />
                    <Text style={styles.xpRewardText}>
                      +{task.rewardXp} XP
                    </Text>
                  </View>

                  {task.rewardLp > 0 ? (
                    <View style={styles.lpReward}>
                      <Leaf
                        size={12}
                        color={colors.primaryButton}
                      />
                      <Text style={styles.lpRewardText}>
                        +{task.rewardLp} LP
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
                    Xem chi tiết
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }) : null}
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
  stateContainer: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 12,
  },
  stateText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  retryButton: {
    height: 38,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.primaryButton,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
