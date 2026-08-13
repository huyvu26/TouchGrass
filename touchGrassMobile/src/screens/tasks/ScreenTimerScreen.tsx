import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ChevronLeft, Clock3, Lock, Power, ShieldCheck} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {screenState} from '../../native/screenState';
import {
  completeUserTask,
  finishScreenTimer,
  startScreenTimer,
} from '../../services/userTaskService';
import type {ScreenTimerVerificationResponse} from '../../types/userTask';

type Props = NativeStackScreenProps<AuthStackParamList, 'ScreenTimer'>;
type Phase = 'starting' | 'ready' | 'screenOff' | 'verifying' | 'failed' | 'error';

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes} phút ${remaining} giây`;
}

export function ScreenTimerScreen({navigation, route}: Props) {
  const {userTaskId} = route.params;
  const [phase, setPhase] = useState<Phase>('starting');
  const [result, setResult] = useState<ScreenTimerVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const screenOffRef = useRef<string | null>(null);
  const finishingRef = useRef(false);
  const mountedRef = useRef(true);

  const finishAttempt = useCallback(
    async (screenOffAt: string, screenOnAt: string) => {
      if (finishingRef.current) {
        return;
      }
      finishingRef.current = true;
      setPhase('verifying');

      try {
        const verification = await finishScreenTimer(
          userTaskId,
          screenOffAt,
          screenOnAt,
        );
        if (!mountedRef.current) {
          return;
        }
        setResult(verification);

        if (verification.passed) {
          await completeUserTask(userTaskId);
          await screenState.stopListening();
          navigation.replace('Reward', {userTaskId});
          return;
        }

        await screenState.stopListening();
        setPhase('failed');
      } catch (finishError) {
        if (mountedRef.current) {
          setError(
            finishError instanceof Error
              ? finishError.message
              : 'Không thể xác minh thời gian tắt màn hình.',
          );
          setPhase('error');
        }
      } finally {
        finishingRef.current = false;
      }
    },
    [navigation, userTaskId],
  );

  const readNativeEvents = useCallback(async () => {
    try {
      const events = await screenState.getScreenEvents();
      if (events.screenOffAt) {
        screenOffRef.current = events.screenOffAt;
      }
      if (events.screenOffAt && events.screenOnAt) {
        await finishAttempt(events.screenOffAt, events.screenOnAt);
      }
    } catch (nativeError) {
      if (mountedRef.current) {
        setError(
          nativeError instanceof Error
            ? nativeError.message
            : 'Không thể đọc trạng thái màn hình Android.',
        );
        setPhase('error');
      }
    }
  }, [finishAttempt]);

  const beginAttempt = useCallback(async () => {
    setPhase('starting');
    setError(null);
    setResult(null);
    screenOffRef.current = null;

    try {
      const started = await startScreenTimer(userTaskId);
      if (!mountedRef.current) {
        return;
      }
      setResult(started);

      if (started.passed) {
        await completeUserTask(userTaskId);
        navigation.replace('Reward', {userTaskId});
        return;
      }

      await screenState.startListening();
      if (mountedRef.current) {
        setPhase('ready');
      }
    } catch (startError) {
      if (mountedRef.current) {
        setError(
          startError instanceof Error
            ? startError.message
            : 'Không thể bắt đầu bộ đếm tắt màn hình.',
        );
        setPhase('error');
      }
    }
  }, [navigation, userTaskId]);

  useEffect(() => {
    mountedRef.current = true;
    const subscription = screenState.subscribe(event => {
      if (event.type === 'SCREEN_OFF') {
        screenOffRef.current = event.timestamp;
        setPhase('screenOff');
      } else if (screenOffRef.current) {
        finishAttempt(screenOffRef.current, event.timestamp);
      }
    });
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        readNativeEvents();
      }
    });

    beginAttempt();
    return () => {
      mountedRef.current = false;
      subscription.remove();
      appStateSubscription.remove();
      screenState.stopListening().catch(() => undefined);
    };
  }, [beginAttempt, finishAttempt, readNativeEvents]);

  const targetSeconds = result?.targetSeconds ?? 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Thời gian không màn hình</Text>
          <Text style={styles.headerSubtitle}>
            Mục tiêu: {targetSeconds ? formatDuration(targetSeconds) : 'Đang tải...'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.timerCircle}>
          {phase === 'starting' || phase === 'verifying' ? (
            <ActivityIndicator size="large" color={colors.primaryButton} />
          ) : phase === 'failed' || phase === 'error' ? (
            <Clock3 size={48} color={colors.error} />
          ) : (
            <Power size={52} color={colors.primaryButton} />
          )}
          <Text style={styles.phaseTitle}>
            {phase === 'starting'
              ? 'Đang bắt đầu bộ đếm'
              : phase === 'ready'
                ? 'Hãy khóa màn hình'
                : phase === 'screenOff'
                  ? 'Màn hình đang tắt'
                  : phase === 'verifying'
                    ? 'Đang xác minh'
                    : phase === 'failed'
                      ? 'Chưa đạt mục tiêu'
                      : 'Có lỗi xảy ra'}
          </Text>
        </View>

        <Text style={styles.instruction}>
          {phase === 'ready'
            ? 'Nhấn nút nguồn của thiết bị để tắt màn hình. Sau khi đủ thời gian, bật màn hình lại; ứng dụng sẽ tự gửi hai thời điểm cho backend.'
            : phase === 'screenOff'
              ? 'Giữ màn hình tắt cho đến khi đạt thời gian yêu cầu.'
              : phase === 'verifying'
                ? 'Backend đang tính thời lượng từ sự kiện Android và kiểm tra kết quả.'
                : phase === 'failed'
                  ? `Bạn đã tắt màn hình ${formatDuration(result?.durationSeconds ?? 0)}, chưa đủ ${formatDuration(targetSeconds)}.`
                  : phase === 'error'
                    ? error
                    : 'Đang chuẩn bị phiên xác minh...'}
        </Text>

        <View style={styles.stepsCard}>
          <View style={styles.stepRow}>
            <Lock size={20} color={colors.primaryButton} />
            <Text style={styles.stepText}>Android ghi nhận ACTION_SCREEN_OFF.</Text>
          </View>
          <View style={styles.stepRow}>
            <Power size={20} color={colors.primaryButton} />
            <Text style={styles.stepText}>Android ghi nhận ACTION_SCREEN_ON.</Text>
          </View>
          <View style={styles.stepRow}>
            <ShieldCheck size={20} color={colors.primaryButton} />
            <Text style={styles.stepText}>Backend tự tính và xác minh thời lượng.</Text>
          </View>
        </View>

        {result?.alreadyProcessed ? (
          <Text style={styles.processedText}>
            Phiên đã được xử lý trước đó; ứng dụng dùng nguyên kết quả backend.
          </Text>
        ) : null}

        {result ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>
              Trạng thái backend: {result.verificationStatus}
            </Text>
            <Text style={styles.statusText}>
              Tiến độ: {result.progress}/{result.targetValue} phút
            </Text>
            {result.failureReason ? (
              <Text style={styles.failureText}>
                Lý do: {result.failureReason}
              </Text>
            ) : null}
          </View>
        ) : null}

        {phase === 'failed' || phase === 'error' ? (
          <Pressable style={styles.retryButton} onPress={beginAttempt}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
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
  timerCircle: {width: 210, height: 210, padding: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 12, borderColor: colors.lime, borderRadius: 105, backgroundColor: colors.surface},
  phaseTitle: {marginTop: 14, color: colors.primary, fontSize: 18, fontWeight: '800', textAlign: 'center'},
  instruction: {marginTop: 24, color: colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center'},
  stepsCard: {width: '100%', marginTop: 24, padding: 16, rowGap: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface},
  stepRow: {flexDirection: 'row', alignItems: 'center', columnGap: 11},
  stepText: {flex: 1, color: colors.text, fontSize: 12, lineHeight: 18},
  processedText: {marginTop: 12, color: colors.textSecondary, fontSize: 11, textAlign: 'center'},
  statusCard: {width: '100%', marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surfaceSoft},
  statusText: {color: colors.textSecondary, fontSize: 11, lineHeight: 17},
  failureText: {color: colors.error, fontSize: 11, lineHeight: 17},
  retryButton: {width: '100%', height: 52, marginTop: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: colors.primaryButton},
  retryButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
});
