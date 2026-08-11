import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ChevronLeft,
  Clock,
  MapPin,
  Shield,
} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Ellipse,
  Path,
  Rect,
} from 'react-native-svg';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {getTaskById} from '../../services/taskService';
import {startUserTask} from '../../services/userTaskService';
import type {
  Task,
  TaskDifficulty,
  TaskFrequency,
  TaskTargetUnit,
  TaskVerificationType,
} from '../../types/task';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'TaskDetail'
>;

const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

const FREQUENCY_LABELS: Record<TaskFrequency, string> = {
  DAILY: 'Hằng ngày',
  WEEKLY: 'Hằng tuần',
  ANYTIME: 'Bất kỳ lúc nào',
};

const VERIFICATION_LABELS: Record<TaskVerificationType, string> = {
  GPS_DISTANCE: 'GPS và khoảng cách',
  PHOTO_AI: 'Ảnh và AI',
  SCREEN_OFF_TIMER: 'Bộ đếm tắt màn hình',
  MANUAL_CHECKIN: 'Xác nhận thủ công',
};

function formatTarget(value: number, unit: TaskTargetUnit): string {
  if (unit === 'METER') {
    return value >= 1000 ? `${value / 1000} km` : `${value} m`;
  }

  if (unit === 'MINUTE') {
    return `${value} phút`;
  }

  return `${value} ảnh`;
}

export function TaskDetailScreen({navigation, route}: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const loadTask = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setTask(await getTaskById(route.params.taskId));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Không thể tải chi tiết nhiệm vụ.',
      );
    } finally {
      setLoading(false);
    }
  }, [route.params.taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  async function startTask() {
    if (!task || isStarting) {
      return;
    }

    const supported =
      task.verificationType === 'GPS_DISTANCE' ||
      task.verificationType === 'PHOTO_AI';

    if (!supported) {
      Alert.alert(
        'Chưa hỗ trợ',
        'Loại nhiệm vụ này chưa có màn hình thực hiện phù hợp.',
      );
      return;
    }

    setIsStarting(true);

    try {
      const result = await startUserTask(task._id);

      if (task.verificationType === 'GPS_DISTANCE') {
        navigation.navigate('GPSTracker', {
          userTaskId: result.id,
        });
      } else {
        navigation.navigate('AICamera', {
          userTaskId: result.id,
        });
      }
    } catch (startError) {
      Alert.alert(
        'Không thể bắt đầu nhiệm vụ',
        startError instanceof Error
          ? startError.message
          : 'Vui lòng thử lại sau.',
      );
    } finally {
      setIsStarting(false);
    }
  }

  if (loading || error || !task) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.stateHeader}>
          <Pressable
            style={styles.stateBackButton}
            onPress={() => navigation.goBack()}>
            <ChevronLeft size={21} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.stateContainer}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color={colors.primaryButton} />
              <Text style={styles.stateText}>Đang tải chi tiết nhiệm vụ...</Text>
            </>
          ) : (
            <>
              <Text style={styles.errorText}>
                {error ?? 'Không tìm thấy nhiệm vụ.'}
              </Text>
              <Pressable style={styles.retryButton} onPress={loadTask}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const rewards = [
    {icon: '⚡', value: `+${task.rewardXp} XP`, color: colors.lime},
    {icon: '🍃', value: `+${task.rewardLp} LP`, color: colors.surfaceSoft},
    {icon: '🔓', value: `+${task.unlockMinutes} phút`, color: '#DCEFFD'},
  ];
  const meta = [
    {label: '🎯 Mục tiêu', value: formatTarget(task.targetValue, task.targetUnit)},
    {label: '⏱️ Thời gian ước tính', value: `${task.estimatedMinutes} phút`},
    {label: '📡 Xác minh', value: VERIFICATION_LABELS[task.verificationType]},
    {label: '📅 Tần suất', value: FREQUENCY_LABELS[task.frequency]},
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Svg width="100%" height={220} viewBox="0 0 393 220">
            <Rect width="393" height="220" fill="#B8E0F5" />
            <Circle
              cx="320"
              cy="55"
              r="30"
              fill="#FFD94F"
              opacity={0.88}
            />
            <Ellipse
              cx="90"
              cy="42"
              rx="54"
              ry="20"
              fill="#FFFFFF"
              opacity={0.78}
            />
            <Path
              d="M0 130 Q100 108 200 130 Q300 150 393 128 L393 220 L0 220Z"
              fill="#B4D88C"
            />
            <Path
              d="M150 220 Q180 180 196 160 Q212 180 240 220"
              fill="#D0B882"
            />
            <Rect x="54" y="82" width="10" height="108" rx="5" fill="#8B6340" />
            <Ellipse cx="59" cy="72" rx="34" ry="46" fill="#2D5A27" />
            <Ellipse cx="59" cy="50" rx="22" ry="30" fill="#4A8A40" />
            <Rect x="308" y="92" width="10" height="98" rx="5" fill="#8B6340" />
            <Ellipse cx="313" cy="82" rx="32" ry="44" fill="#246B05" />
            <Circle cx="196" cy="145" r="10" fill="#FDBCB4" />
            <Rect x="190" y="155" width="12" height="23" rx="5" fill={colors.primaryButton} />
            <Path d="M192 177 L188 198" stroke={colors.primary} strokeWidth="4" strokeLinecap="round" />
            <Path d="M198 177 L203 198" stroke={colors.primary} strokeWidth="4" strokeLinecap="round" />
          </Svg>

          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ChevronLeft size={21} color={colors.text} />
          </Pressable>

          <View style={styles.difficultyChip}>
            <Text style={styles.difficultyText}>
              {DIFFICULTY_LABELS[task.difficulty]}
            </Text>
          </View>
          <View style={styles.expiryChip}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={styles.expiryText}>
              {FREQUENCY_LABELS[task.frequency]}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.description}>
            {task.description}
          </Text>

          <View style={styles.rewardRow}>
            {rewards.map(reward => (
              <View
                key={reward.value}
                style={[
                  styles.rewardCard,
                  {backgroundColor: reward.color},
                ]}>
                <Text style={styles.rewardIcon}>{reward.icon}</Text>
                <Text style={styles.rewardValue}>{reward.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.metaCard}>
            {meta.map(item => (
              <View key={item.label} style={styles.metaItem}>
                <Text style={styles.metaLabel}>{item.label}</Text>
                <Text style={styles.metaValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Hướng dẫn</Text>
          {task.instructions.map((instruction, index) => (
            <View key={instruction} style={styles.instruction}>
              <View style={styles.step}>
                <Text style={styles.stepText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>
                {instruction}
              </Text>
            </View>
          ))}

          <View style={styles.privacyCard}>
            <MapPin size={17} color={colors.primaryButton} />
            <Text style={styles.privacyText}>
              Vị trí chỉ được ghi trong khi làm nhiệm vụ và được
              xóa sau khi xác minh.
            </Text>
          </View>
          <View style={styles.warningCard}>
            <Shield size={17} color={colors.error} />
            <Text style={styles.warningText}>
              Hệ thống tự phát hiện gian lận. Đi bộ trong nhà hoặc
              dùng xe sẽ không được tính.
            </Text>
          </View>

          <Pressable
            disabled={isStarting}
            style={({pressed}) => [
              styles.primaryButton,
              isStarting && styles.primaryButtonDisabled,
              pressed && styles.pressed,
            ]}
            onPress={startTask}>
            {isStarting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                🌿 Bắt đầu nhiệm vụ
              </Text>
            )}
          </Pressable>
          <Pressable
            style={styles.ghostButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.ghostButtonText}>Để sau</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  stateHeader: {height: 60, paddingHorizontal: 16, justifyContent: 'center'},
  stateBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  stateContainer: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 12,
  },
  stateText: {color: colors.textSecondary, fontSize: 13, textAlign: 'center'},
  errorText: {color: colors.error, fontSize: 13, lineHeight: 19, textAlign: 'center'},
  retryButton: {
    height: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.primaryButton,
  },
  retryButtonText: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
  content: {paddingBottom: 20},
  hero: {height: 220, position: 'relative', overflow: 'hidden'},
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  difficultyChip: {
    position: 'absolute',
    left: 20,
    bottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primaryButton,
  },
  difficultyText: {color: '#FFFFFF', fontSize: 12, fontWeight: '700'},
  expiryChip: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  expiryText: {color: colors.text, fontSize: 12, fontWeight: '600'},
  body: {paddingHorizontal: 20, paddingTop: 14},
  title: {color: colors.primary, fontSize: 24, fontWeight: '800'},
  description: {
    marginTop: 8,
    marginBottom: 18,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  rewardRow: {marginBottom: 18, flexDirection: 'row', columnGap: 8},
  rewardCard: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    rowGap: 3,
    borderRadius: 14,
  },
  rewardIcon: {fontSize: 18},
  rewardValue: {color: colors.primary, fontSize: 12, fontWeight: '800'},
  metaCard: {
    marginBottom: 20,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  metaItem: {width: '50%'},
  metaLabel: {color: colors.textSecondary, fontSize: 11},
  metaValue: {marginTop: 3, color: colors.text, fontSize: 13, fontWeight: '700'},
  sectionTitle: {marginBottom: 12, color: colors.text, fontSize: 15, fontWeight: '700'},
  instruction: {marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', columnGap: 12},
  step: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primaryButton,
  },
  stepText: {color: '#FFFFFF', fontSize: 12, fontWeight: '800'},
  instructionText: {flex: 1, paddingTop: 3, color: colors.textSecondary, fontSize: 13, lineHeight: 20},
  privacyCard: {
    marginTop: 4,
    marginBottom: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 10,
    borderRadius: 16,
    backgroundColor: colors.surfaceSoft,
  },
  privacyText: {flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18},
  warningCard: {
    marginBottom: 20,
    padding: 14,
    flexDirection: 'row',
    columnGap: 10,
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.18)',
    borderRadius: 16,
    backgroundColor: colors.errorBackground,
  },
  warningText: {flex: 1, color: colors.error, fontSize: 12, lineHeight: 18},
  primaryButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: colors.primaryButton,
  },
  primaryButtonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '800'},
  primaryButtonDisabled: {opacity: 0.65},
  ghostButton: {height: 48, alignItems: 'center', justifyContent: 'center'},
  ghostButtonText: {color: colors.primaryButton, fontSize: 14, fontWeight: '700'},
  pressed: {opacity: 0.78},
});
