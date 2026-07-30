import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {AlertCircle, Pause, Play, Square} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import {ScreenHeader} from '../../components/ScreenHeader';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'GPSTracker'
>;

export function GPSTrackerScreen({navigation}: Props) {
  const [paused, setPaused] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const progress = 0.7;
  const circumference = 2 * Math.PI * 52;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Đang đi bộ"
        subtitle="Đi dạo buổi sáng"
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            style={[
              styles.gpsChip,
              gpsError && styles.gpsChipError,
            ]}
            onPress={() => setGpsError(value => !value)}>
            <Text
              style={[
                styles.gpsChipText,
                gpsError && styles.gpsChipTextError,
              ]}>
              {gpsError ? 'GPS lỗi' : 'GPS OK'}
            </Text>
          </Pressable>
        }
      />

      <View style={styles.map}>
        <Svg width="100%" height="100%" viewBox="0 0 393 280">
          <Rect width="393" height="280" fill="#EEF5E8" />
          <Rect y="80" width="393" height="18" fill="#FFFFFF" opacity={0.7} />
          <Rect y="160" width="393" height="18" fill="#FFFFFF" opacity={0.7} />
          <Rect x="80" width="18" height="280" fill="#FFFFFF" opacity={0.7} />
          <Rect x="200" width="18" height="280" fill="#FFFFFF" opacity={0.7} />
          <Rect x="300" width="18" height="280" fill="#FFFFFF" opacity={0.7} />
          <Rect x="105" y="105" width="80" height="48" rx="12" fill="#C8E6A0" />
          <Path
            d="M60 200 L80 178 L120 170 L160 158 L196 140 L230 128 L260 120"
            stroke={colors.primaryButton}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="60" cy="200" r="8" fill={colors.textSecondary} />
          <Circle cx="60" cy="200" r="4" fill="#FFFFFF" />
          <Circle cx="260" cy="120" r="16" fill={colors.primaryButton} opacity={0.2} />
          <Circle cx="260" cy="120" r="10" fill={colors.primaryButton} />
          <Circle cx="260" cy="120" r="5" fill="#FFFFFF" />
          <Circle cx="340" cy="88" r="7" fill={colors.error} />
          <SvgText x="48" y="222" fontSize="10" fill={colors.textSecondary}>Bắt đầu</SvgText>
          <SvgText x="328" y="108" fontSize="10" fill={colors.error}>Đích</SvgText>
        </Svg>

        {gpsError ? (
          <View style={styles.overlay}>
            <View style={styles.errorCard}>
              <AlertCircle size={29} color={colors.error} />
              <Text style={styles.errorTitle}>
                Không tìm thấy GPS
              </Text>
              <Text style={styles.errorText}>
                Hãy ra ngoài trời và bật vị trí trên điện thoại.
              </Text>
              <Pressable
                style={styles.retryButton}
                onPress={() => setGpsError(false)}>
                <Text style={styles.retryText}>Thử lại</Text>
              </Pressable>
            </View>
          </View>
        ) : paused ? (
          <View style={styles.pausedOverlay}>
            <View style={styles.pausedChip}>
              <View style={styles.pausedDot} />
              <Text style={styles.pausedText}>Đã tạm dừng</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.statsCard}>
        <View style={styles.ring}>
          <Svg width={118} height={118} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="52" fill="none" stroke={colors.surfaceSoft} strokeWidth="8" />
            <Circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={colors.lime}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              transform="rotate(-90 60 60)"
            />
          </Svg>
          <Text style={styles.ringValue}>70%</Text>
        </View>

        <View style={styles.statsGrid}>
          {[
            ['Khoảng cách', '1.4 / 2.0 km'],
            ['Số bước', '1,842 bước'],
            ['Thời gian', '18 phút 22s'],
            ['Tốc độ', '4.6 km/h'],
          ].map(([label, value], index) => (
            <View key={label} style={styles.stat}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text
                style={[
                  styles.statValue,
                  index === 0 && styles.statHighlight,
                ]}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => setPaused(value => !value)}>
          {paused ? (
            <Play size={18} color="#FFFFFF" />
          ) : (
            <Pause size={18} color="#FFFFFF" />
          )}
          <Text style={styles.primaryButtonText}>
            {paused ? 'Tiếp tục' : 'Tạm dừng'}
          </Text>
        </Pressable>
        <Pressable
          style={styles.outlineButton}
          onPress={() => navigation.navigate('Reward')}>
          <Square size={15} color={colors.primaryButton} />
          <Text style={styles.outlineButtonText}>
            Kết thúc nhiệm vụ
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  gpsChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  gpsChipError: {borderColor: colors.error, backgroundColor: colors.errorBackground},
  gpsChipText: {color: colors.textSecondary, fontSize: 11, fontWeight: '600'},
  gpsChipTextError: {color: colors.error},
  map: {height: 280, position: 'relative', overflow: 'hidden', backgroundColor: '#EEF5E8'},
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(186,26,26,0.08)',
  },
  errorCard: {
    width: 245,
    padding: 18,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: colors.surface,
    elevation: 5,
  },
  errorTitle: {marginTop: 8, color: colors.text, fontSize: 15, fontWeight: '700'},
  errorText: {marginTop: 5, color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center'},
  retryButton: {marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.primaryButton},
  retryText: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21,66,18,0.34)',
  },
  pausedChip: {paddingHorizontal: 22, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', columnGap: 10, borderRadius: 20, backgroundColor: '#FFFFFF'},
  pausedDot: {width: 12, height: 12, borderRadius: 6, backgroundColor: '#E8A020'},
  pausedText: {color: colors.text, fontSize: 15, fontWeight: '700'},
  statsCard: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  ring: {width: 118, height: 118, alignItems: 'center', justifyContent: 'center'},
  ringValue: {position: 'absolute', color: colors.primary, fontSize: 16, fontWeight: '800'},
  statsGrid: {flex: 1, flexDirection: 'row', flexWrap: 'wrap', rowGap: 12},
  stat: {width: '50%', paddingLeft: 10},
  statLabel: {color: colors.textSecondary, fontSize: 10},
  statValue: {marginTop: 3, color: colors.text, fontSize: 12, fontWeight: '700'},
  statHighlight: {color: colors.primaryButton},
  actions: {marginTop: 'auto', padding: 16, rowGap: 10},
  primaryButton: {height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8, borderRadius: 26, backgroundColor: colors.primaryButton},
  primaryButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
  outlineButton: {height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8, borderWidth: 1.5, borderColor: colors.primaryButton, borderRadius: 24},
  outlineButtonText: {color: colors.primaryButton, fontSize: 14, fontWeight: '700'},
});
