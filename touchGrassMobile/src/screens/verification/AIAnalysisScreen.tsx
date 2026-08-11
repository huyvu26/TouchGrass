import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Loader,
  Shield,
} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Ellipse, Path, Rect} from 'react-native-svg';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'AIAnalysis'
>;

type AnalysisState = 'loading' | 'success' | 'fail';

const STEPS = [
  'Kiểm tra chất lượng ảnh',
  'Nhận diện vật thể tự nhiên',
  'Xác minh ảnh chụp ngoài trời',
] as const;

export function AIAnalysisScreen({navigation, route}: Props) {
  const [phase, setPhase] =
    useState<AnalysisState>('loading');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={21} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>AI đang phân tích</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.preview}>
          <Svg width="100%" height="100%" viewBox="0 0 353 230">
            <Rect width="353" height="230" fill="#8EAD65" />
            <Rect y="145" width="353" height="85" fill="#5E7F3E" />
            <Circle cx="298" cy="40" r="28" fill="#F6D75C" />
            <Ellipse cx="85" cy="150" rx="72" ry="112" fill="#2D5A27" />
            <Ellipse cx="270" cy="145" rx="85" ry="120" fill="#3A7033" />
            <Ellipse cx="185" cy="160" rx="72" ry="90" fill="#4A8A40" />
            <Path d="M164 230 Q178 170 195 230" fill="#96784E" />
          </Svg>
          <View style={styles.scanLine} />
          {phase === 'success' ? (
            <View style={styles.resultBadge}>
              <Check size={15} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.resultBadgeText}>
                Cây xanh ngoài trời
              </Text>
            </View>
          ) : phase === 'fail' ? (
            <View style={[styles.resultBadge, styles.failBadge]}>
              <AlertCircle size={15} color="#FFFFFF" />
              <Text style={styles.resultBadgeText}>
                Không thể xác minh
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.statusHeader}>
          {phase === 'loading' ? (
            <Loader size={25} color={colors.primaryButton} />
          ) : phase === 'success' ? (
            <Check size={26} color={colors.primaryButton} />
          ) : (
            <AlertCircle size={26} color={colors.error} />
          )}
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>
              {phase === 'loading'
                ? 'Đang xác minh ảnh'
                : phase === 'success'
                  ? 'Xác minh thành công!'
                  : 'Ảnh chưa đạt yêu cầu'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {phase === 'loading'
                ? 'AI đang kiểm tra nội dung và vị trí chụp.'
                : phase === 'success'
                  ? 'Đã tìm thấy cây xanh trong môi trường ngoài trời.'
                  : 'Hãy chụp rõ cây xanh hơn và tránh ảnh trên màn hình.'}
            </Text>
          </View>
        </View>

        <View style={styles.stepsCard}>
          {STEPS.map((label, index) => {
            const done =
              phase !== 'loading' || index < 2;
            const current = phase === 'loading' && index === 2;

            return (
              <View key={label} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepIcon,
                    done && styles.stepIconDone,
                  ]}>
                  {done ? (
                    <Check
                      size={13}
                      color="#FFFFFF"
                      strokeWidth={3}
                    />
                  ) : (
                    <View style={styles.currentDot} />
                  )}
                </View>
                <Text style={styles.stepLabel}>{label}</Text>
                {current ? (
                  <Text style={styles.processing}>
                    Đang xử lý...
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={styles.demoTabs}>
          {(
            [
              ['loading', 'Phân tích'],
              ['success', 'Thành công'],
              ['fail', 'Thất bại'],
            ] as Array<[AnalysisState, string]>
          ).map(([key, label]) => (
            <Pressable
              key={key}
              style={[
                styles.demoTab,
                phase === key && styles.demoTabActive,
              ]}
              onPress={() => setPhase(key)}>
              <Text
                style={[
                  styles.demoTabText,
                  phase === key && styles.demoTabTextActive,
                ]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {phase === 'success' ? (
          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate('Reward', {
                userTaskId: route.params.userTaskId,
              })
            }>
            <Text style={styles.primaryButtonText}>
              Tiếp tục → Nhận thưởng
            </Text>
          </Pressable>
        ) : phase === 'fail' ? (
          <>
            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                navigation.navigate('AICamera', {
                  userTaskId: route.params.userTaskId,
                })
              }>
              <Text style={styles.primaryButtonText}>
                📸 Chụp lại
              </Text>
            </Pressable>
            <Pressable
              style={styles.ghostButton}
              onPress={() => navigation.navigate('TaskHub')}>
              <Text style={styles.ghostText}>Về nhiệm vụ</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.waitText}>
            Vui lòng đợi trong giây lát...
          </Text>
        )}

        <View style={styles.privacyCard}>
          <Shield size={16} color={colors.primaryButton} />
          <Text style={styles.privacyText}>
            Ảnh của bạn bị xóa ngay sau khi phân tích và không
            được lưu trữ trên máy chủ.
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
  scanLine: {position: 'absolute', left: 16, right: 16, top: '52%', height: 2, backgroundColor: colors.lime, shadowColor: colors.lime, shadowOpacity: 0.9, shadowRadius: 8},
  resultBadge: {position: 'absolute', right: 14, bottom: 14, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', columnGap: 6, borderRadius: 16, backgroundColor: colors.primaryButton},
  failBadge: {backgroundColor: colors.error},
  resultBadgeText: {color: '#FFFFFF', fontSize: 12, fontWeight: '700'},
  statusHeader: {marginVertical: 18, flexDirection: 'row', alignItems: 'flex-start', columnGap: 12},
  statusText: {flex: 1},
  statusTitle: {color: colors.text, fontSize: 18, fontWeight: '800'},
  statusSubtitle: {marginTop: 4, color: colors.textSecondary, fontSize: 13, lineHeight: 19},
  stepsCard: {marginBottom: 16, padding: 16, rowGap: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface},
  stepRow: {flexDirection: 'row', alignItems: 'center', columnGap: 10},
  stepIcon: {width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.inputBackground},
  stepIconDone: {backgroundColor: colors.primaryButton},
  currentDot: {width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primaryButton},
  stepLabel: {flex: 1, color: colors.text, fontSize: 13},
  processing: {color: colors.textSecondary, fontSize: 11},
  demoTabs: {marginBottom: 16, flexDirection: 'row', columnGap: 8},
  demoTab: {height: 34, flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 17},
  demoTabActive: {borderColor: colors.primaryButton, backgroundColor: colors.surfaceSoft},
  demoTabText: {color: colors.textSecondary, fontSize: 11, fontWeight: '600'},
  demoTabTextActive: {color: colors.primaryButton},
  primaryButton: {height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: colors.primaryButton},
  primaryButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
  ghostButton: {height: 46, alignItems: 'center', justifyContent: 'center'},
  ghostText: {color: colors.primaryButton, fontSize: 14, fontWeight: '700'},
  waitText: {paddingVertical: 14, color: colors.textSecondary, fontSize: 13, textAlign: 'center'},
  privacyCard: {marginTop: 16, padding: 13, flexDirection: 'row', alignItems: 'flex-start', columnGap: 9, borderRadius: 14, backgroundColor: colors.surfaceSoft},
  privacyText: {flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18},
});
