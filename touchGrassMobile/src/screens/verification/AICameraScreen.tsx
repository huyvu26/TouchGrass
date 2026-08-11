import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import ImageLabeling from '@react-native-ml-kit/image-labeling';
import {
  Camera as VisionCamera,
  CommonResolutions,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';
import {
  Camera as CameraIcon,
  ChevronLeft,
  Flashlight,
  RotateCcw,
  Shield,
} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import type {MlKitLabel} from '../../types/userTask';

type Props = NativeStackScreenProps<AuthStackParamList, 'AICamera'>;
type CameraPosition = 'back' | 'front';

export function AICameraScreen({navigation, route}: Props) {
  const isFocused = useIsFocused();
  const {hasPermission, canRequestPermission, requestPermission} =
    useCameraPermission();
  const [position, setPosition] = useState<CameraPosition>('back');
  const [flash, setFlash] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const device = useCameraDevice(position);
  const photoOutput = usePhotoOutput({
    targetResolution: CommonResolutions.HD_4_3,
    containerFormat: 'jpeg',
    quality: 0.82,
    qualityPrioritization: 'balanced',
  });

  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      requestPermission();
    }
  }, [canRequestPermission, hasPermission, requestPermission]);

  async function capturePhoto() {
    if (processing || !device || !cameraReady) {
      return;
    }

    setProcessing(true);
    try {
      const capturedAt = new Date().toISOString();
      const photo = await photoOutput.capturePhotoToFile(
        {
          flashMode: flash && device.hasFlash ? 'on' : 'off',
          enableShutterSound: true,
        },
        {},
      );
      const imageUri = photo.filePath.startsWith('file://')
        ? photo.filePath
        : `file://${photo.filePath}`;
      const detected = await ImageLabeling.label(imageUri);
      const labels: MlKitLabel[] = detected.map(label => ({
        text: label.text,
        confidence: label.confidence,
      }));

      if (labels.length === 0) {
        Alert.alert(
          'Chưa nhận diện được ảnh',
          'Hãy chụp vật thể rõ hơn, gần hơn và trong điều kiện đủ sáng.',
        );
        return;
      }

      navigation.navigate('AIAnalysis', {
        userTaskId: route.params.userTaskId,
        imageUri,
        capturedAt,
        labels,
      });
    } catch (error) {
      Alert.alert(
        'Không thể chụp hoặc phân tích ảnh',
        error instanceof Error ? error.message : 'Vui lòng thử lại.',
      );
    } finally {
      setProcessing(false);
    }
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <View style={styles.permissionIcon}>
          <CameraIcon size={34} color={colors.error} />
        </View>
        <Text style={styles.permissionTitle}>Cần quyền truy cập camera</Text>
        <Text style={styles.permissionText}>
          Touch Grass dùng camera để chụp trực tiếp ảnh xác minh nhiệm vụ.
          Ứng dụng không truy cập thư viện ảnh của bạn.
        </Text>
        <Pressable
          style={styles.permissionButton}
          onPress={() =>
            canRequestPermission ? requestPermission() : Linking.openSettings()
          }>
          <Text style={styles.permissionButtonText}>
            {canRequestPermission ? 'Cấp quyền camera' : 'Mở cài đặt quyền'}
          </Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Quay lại nhiệm vụ</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.cameraView}>
        {device ? (
          <VisionCamera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isFocused}
            outputs={[photoOutput]}
            resizeMode="cover"
            enableNativeTapToFocusGesture
            onStarted={() => setCameraReady(true)}
            onStopped={() => setCameraReady(false)}
          />
        ) : (
          <View style={styles.noCamera}>
            <Text style={styles.noCameraText}>Không tìm thấy camera phù hợp.</Text>
          </View>
        )}

        <View style={styles.topControls}>
          <Pressable style={styles.roundControl} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.taskChip}>
            <Text style={styles.taskChipText}>AI xác minh nhiệm vụ</Text>
          </View>
          <Pressable
            disabled={!device?.hasFlash || processing}
            style={[styles.roundControl, !device?.hasFlash && styles.disabled]}
            onPress={() => setFlash(value => !value)}>
            <Flashlight size={19} color={flash ? colors.lime : '#FFFFFF'} />
          </Pressable>
        </View>

        <View pointerEvents="none" style={styles.guide}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <Text style={styles.guideText}>Đặt vật thể cần xác minh vào trong khung</Text>
        </View>

        {processing ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={colors.lime} />
            <Text style={styles.processingText}>Đang nhận diện ảnh bằng ML Kit...</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.privacyRow}>
          <Shield size={14} color={colors.lime} />
          <Text style={styles.privacyText}>
            Ảnh chỉ dùng để xác minh nhiệm vụ, không lấy từ thư viện
          </Text>
        </View>
        <View style={styles.captureRow}>
          <View style={styles.sideControlPlaceholder} />
          <Pressable
            accessibilityLabel="Chụp ảnh"
            disabled={processing || !device || !cameraReady}
            style={[
              styles.shutterOuter,
              (processing || !cameraReady) && styles.disabled,
            ]}
            onPress={capturePhoto}>
            <View style={styles.shutterInner} />
          </Pressable>
          <Pressable
            accessibilityLabel="Đổi camera trước sau"
            disabled={processing}
            style={styles.sideControl}
            onPress={() => {
              setFlash(false);
              setCameraReady(false);
              setPosition(current => (current === 'back' ? 'front' : 'back'));
            }}>
            <RotateCcw size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#111811'},
  cameraView: {flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#000000'},
  topControls: {position: 'absolute', top: 12, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  roundControl: {width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.46)'},
  taskChip: {paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.46)'},
  taskChipText: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
  guide: {position: 'absolute', top: '24%', left: 38, right: 38, height: 315, alignItems: 'center', justifyContent: 'flex-end'},
  corner: {position: 'absolute', width: 44, height: 44, borderColor: '#FFFFFF'},
  topLeft: {top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 18},
  topRight: {top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 18},
  bottomLeft: {bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 18},
  bottomRight: {bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 18},
  guideText: {marginBottom: 18, paddingHorizontal: 14, paddingVertical: 7, color: '#FFFFFF', fontSize: 12, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.46)', overflow: 'hidden'},
  processingOverlay: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', rowGap: 12, backgroundColor: 'rgba(0,0,0,0.58)'},
  processingText: {color: '#FFFFFF', fontSize: 14, fontWeight: '700'},
  noCamera: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  noCameraText: {color: '#FFFFFF', fontSize: 14},
  bottomPanel: {paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, backgroundColor: '#111811'},
  privacyRow: {marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 6},
  privacyText: {color: 'rgba(255,255,255,0.58)', fontSize: 11},
  captureRow: {height: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'},
  sideControl: {width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.12)'},
  sideControlPlaceholder: {width: 46, height: 46},
  shutterOuter: {width: 76, height: 76, padding: 5, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 38},
  shutterInner: {flex: 1, borderRadius: 32, backgroundColor: '#FFFFFF'},
  disabled: {opacity: 0.38},
  permissionScreen: {flex: 1, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A1A'},
  permissionIcon: {width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: 'rgba(186,26,26,0.2)'},
  permissionTitle: {marginTop: 18, color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center'},
  permissionText: {marginTop: 10, color: 'rgba(255,255,255,0.62)', fontSize: 14, lineHeight: 21, textAlign: 'center'},
  permissionButton: {width: '100%', height: 52, marginTop: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: colors.lime},
  permissionButtonText: {color: colors.primary, fontSize: 15, fontWeight: '800'},
  cancelText: {marginTop: 18, color: 'rgba(255,255,255,0.72)', fontSize: 14, fontWeight: '600'},
});
