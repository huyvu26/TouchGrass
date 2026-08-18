import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  AppState,
  Linking,
  PermissionsAndroid,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {BarChart2, Camera, ChevronRight, MapPin, Shield} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {VisionCamera} from 'react-native-vision-camera';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {markPermissionSetupComplete} from '../../storage/authStorage';
import {accessibilityMonitor} from '../../native/accessibilityMonitor';
import {deviceSettings} from '../../native/deviceSettings';
import {
  isUsageAccessGranted,
  openUsageAccessSettings,
} from '../../services/usageStatsService';

type Props = NativeStackScreenProps<AuthStackParamList, 'Permission'>;
type PermissionKey = 'camera' | 'location' | 'usage' | 'accessibility';
type Status = 'unknown' | 'notGranted' | 'granted' | 'denied' | 'settings' | 'unavailable';

const INFO: Record<PermissionKey, {label: string; description: string; Icon: typeof Shield}> = {
  camera: {
    label: 'Máy ảnh',
    description: 'Chỉ dùng ảnh chụp trực tiếp khi bạn thực hiện nhiệm vụ ảnh.',
    Icon: Camera,
  },
  location: {
    label: 'Vị trí chính xác',
    description: 'Chỉ thu thập GPS trong lúc nhiệm vụ đi bộ đang chạy.',
    Icon: MapPin,
  },
  usage: {
    label: 'Quyền truy cập sử dụng',
    description: 'Chỉ đọc thời lượng sử dụng ứng dụng trên thiết bị cho App Control.',
    Icon: BarChart2,
  },
  accessibility: {
    label: 'Phát hiện ứng dụng đang mở',
    description: 'Quyền tùy chọn cho App Control: chỉ đọc tên package đang ở phía trước để áp dụng giới hạn; không đọc mật khẩu hay nội dung.',
    Icon: Shield,
  },
};

const STATUS_LABEL: Record<Status, string> = {
  unknown: 'Đang kiểm tra…',
  notGranted: 'Chưa cấp',
  granted: 'Đã cấp',
  denied: 'Bị từ chối',
  settings: 'Cần mở Cài đặt',
  unavailable: 'Không khả dụng',
};

export function PermissionScreen({navigation}: Props) {
  const [statuses, setStatuses] = useState<Record<PermissionKey, Status>>({
    camera: 'unknown',
    location: 'unknown',
    usage: 'unknown',
    accessibility: 'unknown',
  });
  const [locationServices, setLocationServices] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    const next: Record<PermissionKey, Status> = {
      camera: 'unavailable',
      location: 'unavailable',
      usage: 'unavailable',
      accessibility: 'unavailable',
    };
    try {
      const camera = VisionCamera.cameraPermissionStatus;
      next.camera = camera === 'authorized' ? 'granted' : camera === 'denied' || camera === 'restricted' ? 'settings' : 'notGranted';
    } catch {}
    try {
      const location = await deviceSettings.getFineLocationPermissionStatus();
      next.location = location === 'granted'
        ? 'granted'
        : location === 'blocked'
          ? 'settings'
          : location === 'denied'
            ? 'denied'
            : 'notGranted';
      setLocationServices(await deviceSettings.isLocationServicesEnabled());
    } catch {
      setLocationServices(null);
    }
    try {
      next.usage = (await isUsageAccessGranted()) ? 'granted' : 'notGranted';
    } catch {}
    try {
      next.accessibility = (await accessibilityMonitor.isEnabled()) ? 'granted' : 'notGranted';
    } catch {}
    setStatuses(next);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    let refreshTimers: ReturnType<typeof setTimeout>[] = [];
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return;
      refreshTimers.forEach(clearTimeout);
      refreshTimers = [250, 1000, 2000].map(delay =>
        setTimeout(refresh, delay),
      );
    });
    return () => {
      subscription.remove();
      refreshTimers.forEach(clearTimeout);
    };
  }, [refresh]);

  async function requestCamera() {
    if (statuses.camera === 'settings') return Linking.openSettings();
    try {
      const granted = await VisionCamera.requestCameraPermission();
      setStatuses(current => ({...current, camera: granted ? 'granted' : 'settings'}));
    } catch {
      setStatuses(current => ({...current, camera: 'unavailable'}));
    }
  }

  async function requestLocation() {
    if (statuses.location === 'settings') return Linking.openSettings();
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    await deviceSettings.markFineLocationPermissionRequested();
    const fine = result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
    setStatuses(current => ({
      ...current,
      location:
        fine === PermissionsAndroid.RESULTS.GRANTED
          ? 'granted'
          : fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
            ? 'settings'
            : 'denied',
    }));
    setLocationServices(await deviceSettings.isLocationServicesEnabled());
  }

  async function handlePermission(key: PermissionKey) {
    if (key === 'camera') return requestCamera();
    if (key === 'location') return requestLocation();
    if (key === 'usage') return openUsageAccessSettings();
    return accessibilityMonitor.openSettings();
  }

  async function continueToHome() {
    const missing = Object.values(statuses).filter(value => value !== 'granted').length;
    if (missing > 0) {
      Alert.alert(
        'Một số chức năng chưa sẵn sàng',
        'Bạn vẫn có thể tiếp tục. Camera/GPS sẽ được hỏi lại khi làm nhiệm vụ; Usage Access và Accessibility chỉ cần cho App Control.',
        [{text: 'Ở lại'}, {text: 'Vẫn tiếp tục', onPress: finish}],
      );
      return;
    }
    await finish();
  }

  async function finish() {
    await markPermissionSetupComplete();
    navigation.reset({index: 0, routes: [{name: 'Home'}]});
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerIcon}><Shield size={34} color={colors.primaryButton} /></View>
        <Text style={styles.title}>Thiết lập quyền</Text>
        <Text style={styles.subtitle}>Các trạng thái dưới đây được đọc trực tiếp từ Android và tự cập nhật khi bạn quay lại màn hình.</Text>

        {(Object.keys(INFO) as PermissionKey[]).map(key => {
          const {Icon, label, description} = INFO[key];
          const status = statuses[key];
          const granted = status === 'granted';
          return (
            <View key={key} style={[styles.card, granted && styles.cardGranted]}>
              <View style={styles.row}>
                <View style={styles.icon}><Icon size={21} color={granted ? colors.primaryButton : colors.textSecondary} /></View>
                <View style={styles.info}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.description}>{description}</Text>
                  {key === 'location' && statuses.location === 'granted' && locationServices === false ? (
                    <Text style={styles.warning}>Dịch vụ vị trí/GPS đang tắt.</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.actionRow}>
                <Text style={[styles.status, granted && styles.statusGranted]}>{STATUS_LABEL[status]}</Text>
                {!granted ? (
                  <Pressable style={styles.outlineButton} onPress={() => handlePermission(key)}>
                    <Text style={styles.outlineText}>{status === 'settings' ? 'Mở App Settings' : key === 'usage' || key === 'accessibility' ? 'Mở cài đặt' : 'Cấp quyền'}</Text>
                  </Pressable>
                ) : key === 'location' && locationServices === false ? (
                  <Pressable style={styles.outlineButton} onPress={deviceSettings.openLocationSettings}>
                    <Text style={styles.outlineText}>Bật GPS</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}

        <View style={styles.privacy}>
          <Shield size={17} color={colors.primaryButton} />
          <Text style={styles.privacyText}>Dữ liệu App Control được lưu local. Touch Grass không đọc nội dung cửa sổ, thông báo, mật khẩu hay dữ liệu nhập. Màn hình giới hạn chỉ xuất hiện với ứng dụng bạn chủ động chọn sau khi bật App Control.</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={continueToHome}>
          <Text style={styles.primaryText}>Hoàn tất thiết lập</Text>
          <ChevronRight size={19} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28},
  headerIcon: {width: 68, height: 68, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.surfaceSoft},
  title: {marginTop: 14, color: colors.primary, fontSize: 24, fontWeight: '800', textAlign: 'center'},
  subtitle: {marginTop: 8, marginBottom: 22, color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center'},
  card: {marginBottom: 12, padding: 15, borderWidth: 1.5, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface},
  cardGranted: {borderColor: 'rgba(36,107,5,0.35)'},
  row: {flexDirection: 'row', columnGap: 12},
  icon: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.surfaceSoft},
  info: {flex: 1},
  label: {color: colors.text, fontSize: 15, fontWeight: '700'},
  description: {marginTop: 3, color: colors.textSecondary, fontSize: 12, lineHeight: 17},
  warning: {marginTop: 5, color: colors.error, fontSize: 12, fontWeight: '600'},
  actionRow: {marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  status: {color: colors.textSecondary, fontSize: 12, fontWeight: '700'},
  statusGranted: {color: colors.primaryButton},
  outlineButton: {paddingHorizontal: 13, paddingVertical: 8, borderWidth: 1, borderColor: colors.primaryButton, borderRadius: 16},
  outlineText: {color: colors.primaryButton, fontSize: 12, fontWeight: '700'},
  privacy: {marginTop: 6, marginBottom: 20, padding: 14, flexDirection: 'row', alignItems: 'flex-start', columnGap: 10, borderRadius: 14, backgroundColor: colors.surfaceSoft},
  privacyText: {flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18},
  primaryButton: {height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8, borderRadius: 26, backgroundColor: colors.primaryButton},
  primaryText: {color: '#FFFFFF', fontSize: 15, fontWeight: '700'},
});
