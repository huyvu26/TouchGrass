import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CheckCircle2, ChevronLeft, Clock3, ShieldCheck} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {
  completeUserTask,
  finishManualCheckin,
  startManualCheckin,
} from '../../services/userTaskService';
import type {ManualCheckinVerificationResponse} from '../../types/userTask';

type Props = NativeStackScreenProps<AuthStackParamList, 'ManualCheckin'>;
type Phase = 'starting' | 'running' | 'finishing' | 'failed' | 'error';

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

export function ManualCheckinScreen({navigation, route}: Props) {
  const {userTaskId} = route.params;
  const [phase, setPhase] = useState<Phase>('starting');
  const [result, setResult] =
    useState<ManualCheckinVerificationResponse | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const openReward = useCallback(async () => {
    await completeUserTask(userTaskId);
    navigation.replace('Reward', {userTaskId});
  }, [navigation, userTaskId]);

  const beginAttempt = useCallback(async () => {
    setPhase('starting');
    setError(null);
    try {
      const started = await startManualCheckin(userTaskId);
      if (!mountedRef.current) {
        return;
      }
      setResult(started);

      if (started.verificationStatus === 'PASSED' || started.passed) {
        await openReward();
        return;
      }

      setPhase(
        started.verificationStatus === 'FAILED' ? 'failed' : 'running',
      );
    } catch (startError) {
      if (mountedRef.current) {
        setError(
          startError instanceof Error
            ? startError.message
            : 'Không thể bắt đầu xác nhận nhiệm vụ.',
        );
        setPhase('error');
      }
    }
  }, [openReward, userTaskId]);

  useEffect(() => {
    mountedRef.current = true;
    beginAttempt();
    return () => {
      mountedRef.current = false;
    };
  }, [beginAttempt]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!result?.checkinStartedAt || phase !== 'running') {
        return;
      }
      const startedAt = new Date(result.checkinStartedAt).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, result?.checkinStartedAt]);

  async function finishAttempt() {
    if (phase !== 'running') {
      return;
    }
    setPhase('finishing');
    setError(null);

    try {
      const verification = await finishManualCheckin(userTaskId);
      setResult(verification);
      if (verification.verificationStatus === 'PASSED' || verification.passed) {
        await openReward();
        return;
      }

      setPhase('failed');
    } catch (finishError) {
      setError(
        finishError instanceof Error
          ? finishError.message
          : 'Không thể hoàn thành xác nhận nhiệm vụ.',
      );
      setPhase('error');
    }
  }

  const targetSeconds = result?.targetSeconds ?? 0;
  const shownSeconds = result?.durationSeconds
    ? result.durationSeconds
    : elapsedSeconds;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Xác nhận hoạt động</Text>
          <Text style={styles.headerSubtitle}>
            Mục tiêu: {targetSeconds ? formatDuration(targetSeconds) : 'Đang tải...'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.timerCircle}>
          {phase === 'starting' || phase === 'finishing' ? (
            <ActivityIndicator size="large" color={colors.primaryButton} />
          ) : phase === 'failed' || phase === 'error' ? (
            <Clock3 size={48} color={colors.error} />
          ) : (
            <CheckCircle2 size={48} color={colors.primaryButton} />
          )}
          <Text style={styles.timer}>{formatDuration(shownSeconds)}</Text>
          <Text style={styles.phaseText}>
            {phase === 'running'
              ? 'Đang thực hiện nhiệm vụ'
              : phase === 'finishing'
                ? 'Backend đang xác minh'
                : phase === 'failed'
                  ? 'Chưa đạt thời gian mục tiêu'
                  : phase === 'error'
                    ? 'Có lỗi xảy ra'
                    : 'Đang khôi phục phiên'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <ShieldCheck size={20} color={colors.primaryButton} />
          <Text style={styles.infoText}>
            Thời gian bắt đầu và kết quả được lấy từ backend. Ứng dụng không tự
            khai báo thời lượng hoàn thành.
          </Text>
        </View>

        {result?.alreadyProcessed ? (
          <Text style={styles.processedText}>
            Backend đã xử lý phiên này; ứng dụng đang dùng nguyên kết quả trả về.
          </Text>
        ) : null}

        {phase === 'failed' ? (
          <Text style={styles.errorText}>
            {result?.failureReason === 'TARGET_NOT_REACHED'
              ? `Bạn mới thực hiện ${formatDuration(result.durationSeconds)}, chưa đủ mục tiêu.`
              : 'Nhiệm vụ chưa được backend xác minh.'}
          </Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {phase === 'running' ? (
          <Pressable style={styles.primaryButton} onPress={finishAttempt}>
            <Text style={styles.primaryButtonText}>Hoàn thành và xác minh</Text>
          </Pressable>
        ) : phase === 'failed' || phase === 'error' ? (
          <Pressable style={styles.primaryButton} onPress={beginAttempt}>
            <Text style={styles.primaryButtonText}>Thử lại</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  header: {height: 70, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', columnGap: 12},
  backButton: {width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: colors.surfaceSoft},
  headerTitle: {color: colors.text, fontSize: 18, fontWeight: '800'},
  headerSubtitle: {marginTop: 2, color: colors.textSecondary, fontSize: 11},
  content: {flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center'},
  timerCircle: {width: 220, height: 220, padding: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 12, borderColor: colors.lime, borderRadius: 110, backgroundColor: colors.surface},
  timer: {marginTop: 10, color: colors.primary, fontSize: 34, fontWeight: '900'},
  phaseText: {marginTop: 5, color: colors.textSecondary, fontSize: 12, textAlign: 'center'},
  infoCard: {width: '100%', marginTop: 28, padding: 16, flexDirection: 'row', alignItems: 'flex-start', columnGap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface},
  infoText: {flex: 1, color: colors.text, fontSize: 12, lineHeight: 18},
  processedText: {marginTop: 12, color: colors.textSecondary, fontSize: 11, textAlign: 'center'},
  errorText: {marginTop: 16, color: colors.error, fontSize: 12, lineHeight: 18, textAlign: 'center'},
  primaryButton: {width: '100%', height: 54, marginTop: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: colors.primaryButton},
  primaryButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
});
