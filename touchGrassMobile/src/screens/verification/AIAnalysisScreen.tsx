import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {AlertCircle, Check, ChevronLeft, Shield} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {
  completeUserTask,
  verifyUserTaskPhoto,
} from '../../services/userTaskService';
import type {PhotoVerificationResponse} from '../../types/userTask';

type Props = NativeStackScreenProps<AuthStackParamList, 'AIAnalysis'>;
type AnalysisState = 'loading' | 'partial' | 'failed' | 'error';

const FAILURE_MESSAGES: Record<string, string> = {
  LABEL_NOT_ACCEPTED:
    'Không nhận diện được vật thể phù hợp với nhiệm vụ.',
  LOW_CONFIDENCE:
    'Ảnh chưa đủ rõ, vui lòng chụp gần hơn hoặc đủ sáng hơn.',
};

export function AIAnalysisScreen({navigation, route}: Props) {
  const {userTaskId, imageUri, capturedAt, labels} = route.params;
  const [phase, setPhase] = useState<AnalysisState>('loading');
  const [result, setResult] = useState<PhotoVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const submitPhoto = useCallback(async () => {
    if (submittedRef.current) {
      return;
    }

    submittedRef.current = true;
    setPhase('loading');
    setError(null);

    try {
      const verification = await verifyUserTaskPhoto(
        userTaskId,
        imageUri,
        labels,
        capturedAt,
      );
      setResult(verification);

      if (verification.passed) {
        await completeUserTask(userTaskId);
        navigation.replace('Reward', {userTaskId});
        return;
      }

      setPhase(verification.photoAccepted ? 'partial' : 'failed');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Không thể gửi ảnh xác minh. Vui lòng thử lại.',
      );
      setPhase('error');
    }
  }, [capturedAt, imageUri, labels, navigation, userTaskId]);

  useEffect(() => {
    submitPhoto();
  }, [submitPhoto]);

  function captureAnotherPhoto() {
    navigation.replace('AICamera', {userTaskId});
  }

  function retryUpload() {
    submittedRef.current = false;
    submitPhoto();
  }

  const failureMessage = result?.failureReason
    ? FAILURE_MESSAGES[result.failureReason] ?? result.failureReason
    : 'Ảnh chưa đạt yêu cầu xác minh của nhiệm vụ.';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={21} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>AI xác minh ảnh</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.preview}>
          <Image source={{uri: imageUri}} style={styles.previewImage} resizeMode="cover" />
          {phase === 'loading' ? <View style={styles.scanLine} /> : null}
          {phase !== 'loading' ? (
            <View
              style={[
                styles.resultBadge,
                phase === 'failed' || phase === 'error'
                  ? styles.failBadge
                  : undefined,
              ]}>
              {phase === 'partial' ? (
                <Check size={15} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <AlertCircle size={15} color="#FFFFFF" />
              )}
              <Text style={styles.resultBadgeText}>
                {phase === 'partial' ? 'Ảnh hợp lệ' : 'Cần thử lại'}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.statusHeader}>
          {phase === 'loading' ? (
            <ActivityIndicator size="small" color={colors.primaryButton} />
          ) : phase === 'partial' ? (
            <Check size={26} color={colors.primaryButton} />
          ) : (
            <AlertCircle size={26} color={colors.error} />
          )}
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>
              {phase === 'loading'
                ? 'Đang gửi ảnh để xác minh'
                : phase === 'partial'
                  ? 'Ảnh đã được chấp nhận'
                  : phase === 'failed'
                    ? 'Ảnh chưa đạt yêu cầu'
                    : 'Không thể xác minh ảnh'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {phase === 'loading'
                ? 'Hệ thống đang đối chiếu ảnh với yêu cầu nhiệm vụ.'
                : phase === 'partial'
                  ? `Đã xác minh ${result?.acceptedPhotoCount ?? 0}/${result?.requiredPhotoCount ?? 0} ảnh.`
                  : phase === 'failed'
                    ? failureMessage
                    : error}
            </Text>
          </View>
        </View>

        <View style={styles.labelsCard}>
          <Text style={styles.cardTitle}>Nhãn ML Kit nhận diện</Text>
          {labels.slice(0, 5).map((label, index) => (
            <View key={`${label.text}-${index}`} style={styles.labelRow}>
              <Text style={styles.labelText}>{label.text}</Text>
              <Text style={styles.confidenceText}>
                {Math.round(label.confidence * 100)}%
              </Text>
            </View>
          ))}
          {result?.alreadyProcessed ? (
            <Text style={styles.processedText}>
              Ảnh này đã được xử lý trước đó; ứng dụng đang hiển thị kết quả đã lưu.
            </Text>
          ) : null}
        </View>

        {phase === 'partial' ? (
          <Pressable style={styles.primaryButton} onPress={captureAnotherPhoto}>
            <Text style={styles.primaryButtonText}>Chụp ảnh tiếp theo</Text>
          </Pressable>
        ) : phase === 'failed' ? (
          <Pressable style={styles.primaryButton} onPress={captureAnotherPhoto}>
            <Text style={styles.primaryButtonText}>Chụp lại</Text>
          </Pressable>
        ) : phase === 'error' ? (
          <Pressable style={styles.primaryButton} onPress={retryUpload}>
            <Text style={styles.primaryButtonText}>Gửi lại ảnh này</Text>
          </Pressable>
        ) : (
          <Text style={styles.waitText}>Vui lòng đợi trong giây lát...</Text>
        )}

        {phase !== 'loading' ? (
          <Pressable style={styles.ghostButton} onPress={() => navigation.navigate('TaskHub')}>
            <Text style={styles.ghostText}>Về danh sách nhiệm vụ</Text>
          </Pressable>
        ) : null}

        <View style={styles.privacyCard}>
          <Shield size={16} color={colors.primaryButton} />
          <Text style={styles.privacyText}>
            Ảnh chỉ được dùng để xác minh nhiệm vụ. Tiến độ chỉ cập nhật sau khi ảnh đạt yêu cầu.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  header: {height: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', columnGap: 12},
  backButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.surfaceSoft},
  headerTitle: {color: colors.text, fontSize: 20, fontWeight: '800'},
  content: {paddingHorizontal: 20, paddingBottom: 24},
  preview: {height: 230, position: 'relative', overflow: 'hidden', borderRadius: 22, backgroundColor: colors.surfaceSoft},
  previewImage: {width: '100%', height: '100%'},
  scanLine: {position: 'absolute', left: 16, right: 16, top: '52%', height: 2, backgroundColor: colors.lime},
  resultBadge: {position: 'absolute', right: 14, bottom: 14, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', columnGap: 6, borderRadius: 16, backgroundColor: colors.primaryButton},
  failBadge: {backgroundColor: colors.error},
  resultBadgeText: {color: '#FFFFFF', fontSize: 12, fontWeight: '700'},
  statusHeader: {marginVertical: 18, flexDirection: 'row', alignItems: 'flex-start', columnGap: 12},
  statusText: {flex: 1},
  statusTitle: {color: colors.text, fontSize: 18, fontWeight: '800'},
  statusSubtitle: {marginTop: 4, color: colors.textSecondary, fontSize: 13, lineHeight: 19},
  labelsCard: {marginBottom: 16, padding: 16, rowGap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface},
  cardTitle: {marginBottom: 2, color: colors.text, fontSize: 14, fontWeight: '800'},
  labelRow: {flexDirection: 'row', justifyContent: 'space-between'},
  labelText: {color: colors.text, fontSize: 13},
  confidenceText: {color: colors.primaryButton, fontSize: 13, fontWeight: '700'},
  processedText: {marginTop: 4, color: colors.textSecondary, fontSize: 11, lineHeight: 16},
  primaryButton: {height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: colors.primaryButton},
  primaryButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
  ghostButton: {height: 46, alignItems: 'center', justifyContent: 'center'},
  ghostText: {color: colors.primaryButton, fontSize: 13, fontWeight: '700'},
  waitText: {paddingVertical: 15, color: colors.textSecondary, fontSize: 13, textAlign: 'center'},
  privacyCard: {marginTop: 12, padding: 14, flexDirection: 'row', alignItems: 'flex-start', columnGap: 9, borderRadius: 16, backgroundColor: colors.surfaceSoft},
  privacyText: {flex: 1, color: colors.textSecondary, fontSize: 11, lineHeight: 17},
});
