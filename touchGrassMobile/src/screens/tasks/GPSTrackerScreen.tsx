import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Geolocation, {
  type GeolocationResponse,
} from '@react-native-community/geolocation';
import {
  AlertCircle,
  MapPin,
  Pause,
  Play,
  Square,
} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Rect} from 'react-native-svg';

import {ScreenHeader} from '../../components/ScreenHeader';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {deviceSettings} from '../../native/deviceSettings';
import {
  completeUserTask,
  finishGpsTracking,
  startGpsTracking,
} from '../../services/userTaskService';
import type {
  GpsPoint,
  GpsVerificationResponse,
} from '../../types/userTask';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'GPSTracker'
>;

type TrackingPhase =
  | 'initializing'
  | 'tracking'
  | 'paused'
  | 'finishing'
  | 'passed'
  | 'failed';

const MAX_GPS_POINTS = 500;

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  locationProvider: 'auto',
});

type PermissionResult = 'granted' | 'denied' | 'blocked';

async function requestLocationPermission(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') {
    return 'granted';
  }

  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]);
  await deviceSettings.markFineLocationPermissionRequested();
  const fine = results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  if (fine === PermissionsAndroid.RESULTS.GRANTED) {
    return 'granted';
  }
  if (fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    return 'blocked';
  }

  if (fine === PermissionsAndroid.RESULTS.DENIED) {
    Alert.alert(
      'Cần quyền vị trí',
      'Touch Grass cần vị trí chính xác trong lúc bạn thực hiện nhiệm vụ đi bộ.',
    );
  }

  return 'denied';
}

async function ensureLocationServicesEnabled(): Promise<void> {
  if (!(await deviceSettings.isLocationServicesEnabled())) {
    throw new Error('LOCATION_SERVICES_DISABLED');
  }
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      () => resolve(),
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getFailureMessage(reason: string | null): string {
  if (reason === 'UNREALISTIC_SPEED') {
    return 'Tốc độ di chuyển không phù hợp với nhiệm vụ đi bộ.';
  }

  if (reason === 'TARGET_NOT_REACHED') {
    return 'Bạn chưa đi đủ quãng đường mục tiêu.';
  }

  return reason ?? 'Không thể xác minh phiên GPS.';
}

export function GPSTrackerScreen({navigation, route}: Props) {
  const [phase, setPhase] =
    useState<TrackingPhase>('initializing');
  const [pointsCount, setPointsCount] = useState(0);
  const [latestPoint, setLatestPoint] =
    useState<GpsPoint | null>(null);
  const [targetValue, setTargetValue] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [failureMessage, setFailureMessage] = useState<string | null>(
    null,
  );
  const [verification, setVerification] =
    useState<GpsVerificationResponse | null>(null);
  const [settingsTarget, setSettingsTarget] = useState<
    'permission' | 'location' | null
  >(null);

  const pointsRef = useRef<GpsPoint[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const trackingStartedAtRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const stopLocationWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const recordPosition = useCallback((position: GeolocationResponse) => {
    const accuracy = position.coords.accuracy;

    if (
      !Number.isFinite(accuracy) ||
      accuracy < 0 ||
      accuracy > 100
    ) {
      return;
    }

    const point: GpsPoint = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy,
      timestamp: new Date(position.timestamp).toISOString(),
    };
    const previousPoint = pointsRef.current.at(-1);

    setLatestPoint(point);

    // Backend chỉ sử dụng điểm có độ chính xác từ 50 m trở xuống.
    if (accuracy > 50 || pointsRef.current.length >= MAX_GPS_POINTS) {
      return;
    }

    if (
      previousPoint &&
      new Date(point.timestamp).getTime() <=
        new Date(previousPoint.timestamp).getTime()
    ) {
      return;
    }

    pointsRef.current.push(point);
    setPointsCount(pointsRef.current.length);
  }, []);

  const startLocationWatch = useCallback(() => {
    stopLocationWatch();
    watchIdRef.current = Geolocation.watchPosition(
      recordPosition,
      error => {
        if (!mountedRef.current) {
          return;
        }

        setFailureMessage(error.message || 'Không thể lấy vị trí GPS.');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 3,
        interval: 5000,
        fastestInterval: 3000,
        maximumAge: 0,
        timeout: 20000,
      },
    );
  }, [recordPosition, stopLocationWatch]);

  const beginTracking = useCallback(async () => {
    setPhase('initializing');
    setFailureMessage(null);
    setVerification(null);
    setSettingsTarget(null);
    pointsRef.current = [];
    setPointsCount(0);
    setLatestPoint(null);

    try {
      const permissionResult = await requestLocationPermission();

      if (permissionResult !== 'granted') {
        if (permissionResult === 'blocked') {
          setSettingsTarget('permission');
        }
        throw new Error(
          permissionResult === 'blocked'
            ? 'Quyền vị trí đã bị từ chối vĩnh viễn. Hãy mở Cài đặt và cho phép Vị trí chính xác.'
            : 'Bạn cần cấp quyền vị trí chính xác để làm nhiệm vụ GPS.',
        );
      }

      try {
        await ensureLocationServicesEnabled();
      } catch {
        setSettingsTarget('location');
        throw new Error(
          'Không lấy được vị trí. Hãy bật Dịch vụ vị trí/GPS rồi thử lại.',
        );
      }

      const result = await startGpsTracking(route.params.userTaskId);

      if (!mountedRef.current) {
        return;
      }

      setVerification(result);
      setTargetValue(result.targetValue);
      trackingStartedAtRef.current = result.trackingStartedAt
        ? new Date(result.trackingStartedAt).getTime()
        : Date.now();

      if (result.verificationStatus === 'PASSED') {
        setPhase('passed');
        return;
      }

      setPhase('tracking');
      startLocationWatch();
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setFailureMessage(
        error instanceof Error
          ? error.message
          : 'Không thể bắt đầu xác minh GPS.',
      );
      setPhase('failed');
    }
  }, [route.params.userTaskId, startLocationWatch]);

  async function openLocationSettings() {
    if (settingsTarget === 'permission') {
      await Linking.openSettings();
      return;
    }

    if (Platform.OS === 'android') {
      try {
        await deviceSettings.openLocationSettings();
        return;
      } catch {
        await Linking.openSettings();
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    beginTracking();

    return () => {
      mountedRef.current = false;
      stopLocationWatch();
    };
  }, [beginTracking, stopLocationWatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (trackingStartedAtRef.current !== null) {
        setElapsedSeconds(
          Math.max(
            0,
            Math.floor(
              (Date.now() - trackingStartedAtRef.current) / 1000,
            ),
          ),
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function togglePause() {
    if (phase === 'tracking') {
      stopLocationWatch();
      setPhase('paused');
      return;
    }

    if (phase === 'paused') {
      setFailureMessage(null);
      setPhase('tracking');
      startLocationWatch();
    }
  }

  async function completeAndOpenReward() {
    setPhase('finishing');

    try {
      await completeUserTask(route.params.userTaskId);
      navigation.replace('Reward', {
        userTaskId: route.params.userTaskId,
      });
    } catch (error) {
      setFailureMessage(
        error instanceof Error
          ? error.message
          : 'Không thể hoàn thành nhiệm vụ.',
      );
      setPhase('passed');
    }
  }

  async function finishTracking() {
    if (phase === 'passed') {
      await completeAndOpenReward();
      return;
    }

    if (pointsRef.current.length < 2) {
      Alert.alert(
        'Chưa đủ dữ liệu GPS',
        'Hãy tiếp tục di chuyển đến khi ứng dụng thu được ít nhất 2 điểm GPS chính xác.',
      );
      return;
    }

    stopLocationWatch();
    setPhase('finishing');
    setFailureMessage(null);

    try {
      const result = await finishGpsTracking(
        route.params.userTaskId,
        pointsRef.current,
      );
      setVerification(result);

      if (result.verificationStatus === 'PASSED') {
        setPhase('passed');
        await completeAndOpenReward();
        return;
      }

      if (result.verificationStatus === 'FAILED') {
        setFailureMessage(getFailureMessage(result.failureReason));
        setPhase('failed');
        return;
      }

      setPhase('tracking');
      startLocationWatch();
    } catch (error) {
      setFailureMessage(
        error instanceof Error
          ? error.message
          : 'Không thể gửi dữ liệu GPS để xác minh.',
      );
      setPhase('tracking');
      startLocationWatch();
    }
  }

  const gpsAvailable =
    latestPoint !== null && latestPoint.accuracy <= 50 && !failureMessage;
  const isBusy = phase === 'initializing' || phase === 'finishing';
  const targetLabel = targetValue
    ? targetValue >= 1000
      ? `${targetValue / 1000} km`
      : `${targetValue} m`
    : 'Đang tải';
  const backendSummary = verification?.summary;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Đang đi bộ"
        subtitle={`Mục tiêu: ${targetLabel}`}
        onBack={() => navigation.goBack()}
        right={
          <View
            style={[
              styles.gpsChip,
              !gpsAvailable && styles.gpsChipError,
            ]}>
            <Text
              style={[
                styles.gpsChipText,
                !gpsAvailable && styles.gpsChipTextError,
              ]}>
              {gpsAvailable ? 'GPS OK' : 'Đang tìm GPS'}
            </Text>
          </View>
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
          {latestPoint ? (
            <>
              <Circle cx="196" cy="140" r="22" fill={colors.primaryButton} opacity={0.18} />
              <Circle cx="196" cy="140" r="11" fill={colors.primaryButton} />
              <Circle cx="196" cy="140" r="5" fill="#FFFFFF" />
            </>
          ) : null}
        </Svg>

        <View style={styles.coordinateCard}>
          <MapPin size={18} color={colors.primaryButton} />
          <View style={styles.coordinateContent}>
            <Text style={styles.coordinateTitle}>
              {latestPoint ? 'Vị trí mới nhất' : 'Đang chờ tín hiệu GPS'}
            </Text>
            <Text style={styles.coordinateText}>
              {latestPoint
                ? `${latestPoint.latitude.toFixed(6)}, ${latestPoint.longitude.toFixed(6)} · ±${Math.round(latestPoint.accuracy)}m`
                : 'Hãy bật vị trí và di chuyển ra khu vực thoáng.'}
            </Text>
          </View>
        </View>

        {isBusy ? (
          <View style={styles.busyOverlay}>
            <ActivityIndicator size="large" color={colors.primaryButton} />
            <Text style={styles.busyText}>
              {phase === 'initializing'
                ? 'Đang bắt đầu phiên GPS...'
                : 'Backend đang xác minh quãng đường...'}
            </Text>
          </View>
        ) : phase === 'paused' ? (
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
          <View style={styles.ringCircle}>
            <MapPin size={25} color={colors.primaryButton} />
            <Text style={styles.ringValue}>{pointsCount}</Text>
            <Text style={styles.ringLabel}>điểm GPS</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {[
            [
              'Quãng đường',
              backendSummary
                ? `${Math.round(backendSummary.distanceMeters)} / ${Math.round(targetValue)} m`
                : 'Chờ xác minh',
            ],
            ['Thời gian', formatDuration(elapsedSeconds)],
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

      {failureMessage ? (
        <View style={styles.failureCard}>
          <AlertCircle size={18} color={colors.error} />
          <View style={styles.failureContent}>
            <Text style={styles.failureText}>{failureMessage}</Text>
            {settingsTarget ? (
              <Pressable onPress={openLocationSettings}>
                <Text style={styles.settingsLink}>Mở Cài đặt</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        {phase === 'failed' ? (
          <Pressable style={styles.primaryButton} onPress={beginTracking}>
            <Play size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Thử lại GPS</Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={isBusy || phase === 'passed'}
            style={[
              styles.primaryButton,
              (isBusy || phase === 'passed') && styles.buttonDisabled,
            ]}
            onPress={togglePause}>
            {phase === 'paused' ? (
              <Play size={18} color="#FFFFFF" />
            ) : (
              <Pause size={18} color="#FFFFFF" />
            )}
            <Text style={styles.primaryButtonText}>
              {phase === 'paused' ? 'Tiếp tục' : 'Tạm dừng'}
            </Text>
          </Pressable>
        )}

        <Pressable
          disabled={isBusy || phase === 'failed'}
          style={[
            styles.outlineButton,
            (isBusy || phase === 'failed') && styles.buttonDisabled,
          ]}
          onPress={finishTracking}>
          <Square size={15} color={colors.primaryButton} />
          <Text style={styles.outlineButtonText}>
            {phase === 'passed'
              ? 'Tiếp tục nhận thưởng'
              : 'Kết thúc và xác minh'}
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
    borderColor: colors.primaryButton,
    borderRadius: 16,
    backgroundColor: colors.surfaceSoft,
  },
  gpsChipError: {borderColor: colors.border, backgroundColor: colors.surface},
  gpsChipText: {color: colors.primaryButton, fontSize: 11, fontWeight: '700'},
  gpsChipTextError: {color: colors.textSecondary},
  map: {height: 280, position: 'relative', overflow: 'hidden', backgroundColor: '#EEF5E8'},
  coordinateCard: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
    elevation: 3,
  },
  coordinateContent: {minWidth: 0, flex: 1},
  coordinateTitle: {color: colors.text, fontSize: 12, fontWeight: '700'},
  coordinateText: {marginTop: 3, color: colors.textSecondary, fontSize: 10},
  busyOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  busyText: {color: colors.text, fontSize: 13, fontWeight: '600'},
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
  ringCircle: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 7,
    borderColor: colors.lime,
    borderRadius: 52,
  },
  ringValue: {marginTop: 2, color: colors.primary, fontSize: 17, fontWeight: '800'},
  ringLabel: {color: colors.textSecondary, fontSize: 9},
  statsGrid: {flex: 1, flexDirection: 'row', flexWrap: 'wrap', rowGap: 12},
  stat: {width: '50%', paddingLeft: 10},
  statLabel: {color: colors.textSecondary, fontSize: 10},
  statValue: {marginTop: 3, color: colors.text, fontSize: 12, fontWeight: '700'},
  statHighlight: {color: colors.primaryButton},
  failureCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 9,
    borderRadius: 14,
    backgroundColor: colors.errorBackground,
  },
  failureText: {flex: 1, color: colors.error, fontSize: 12, lineHeight: 18},
  failureContent: {flex: 1, rowGap: 6},
  settingsLink: {color: colors.primaryButton, fontSize: 12, fontWeight: '800'},
  actions: {marginTop: 'auto', padding: 16, rowGap: 10},
  primaryButton: {height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8, borderRadius: 26, backgroundColor: colors.primaryButton},
  primaryButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
  outlineButton: {height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8, borderWidth: 1.5, borderColor: colors.primaryButton, borderRadius: 24},
  outlineButtonText: {color: colors.primaryButton, fontSize: 14, fontWeight: '700'},
  buttonDisabled: {opacity: 0.45},
});
