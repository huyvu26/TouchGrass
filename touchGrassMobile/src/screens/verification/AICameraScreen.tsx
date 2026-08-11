import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Camera,
  ChevronLeft,
  Flashlight,
  RotateCcw,
  Shield,
  X,
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

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'AICamera'
>;

type CameraState = 'preview' | 'taken' | 'denied';

export function AICameraScreen({navigation, route}: Props) {
  const [state, setState] = useState<CameraState>('preview');
  const [flash, setFlash] = useState(false);

  if (state === 'denied') {
    return (
      <SafeAreaView style={styles.deniedScreen}>
        <View style={styles.deniedIcon}>
          <Camera size={34} color={colors.error} />
        </View>
        <Text style={styles.deniedTitle}>
          Cần quyền truy cập camera
        </Text>
        <Text style={styles.deniedText}>
          Touch Grass cần camera để chụp ảnh xác minh nhiệm vụ.
          Bạn có thể cấp quyền trong cài đặt điện thoại.
        </Text>
        <Pressable
          style={styles.permissionButton}
          onPress={() => setState('preview')}>
          <Text style={styles.permissionButtonText}>
            Mở cài đặt quyền
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
        <Svg width="100%" height="100%" viewBox="0 0 393 650">
          <Rect width="393" height="650" fill="#86A55E" />
          <Rect y="405" width="393" height="245" fill="#5F7F42" />
          <Circle cx="330" cy="85" r="42" fill="#F8DC65" opacity={0.78} />
          <Ellipse cx="95" cy="405" rx="78" ry="160" fill="#2D5A27" />
          <Ellipse cx="305" cy="380" rx="96" ry="185" fill="#3A7033" />
          <Ellipse cx="208" cy="440" rx="90" ry="140" fill="#4A8A40" />
          <Path d="M170 650 Q196 495 225 650" fill="#9B7C52" />
          <Circle cx="203" cy="378" r="70" fill="#75A847" opacity={0.9} />
          <Circle cx="245" cy="360" r="55" fill="#5F9638" />
        </Svg>

        <View style={styles.topControls}>
          <Pressable
            style={styles.roundControl}
            onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.taskChip}>
            <Text style={styles.taskChipText}>🌿 Tìm màu xanh</Text>
          </View>
          <Pressable
            style={styles.roundControl}
            onPress={() => setFlash(value => !value)}>
            <Flashlight
              size={19}
              color={flash ? colors.lime : '#FFFFFF'}
            />
          </Pressable>
        </View>

        <View style={styles.guide}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <Text style={styles.guideText}>
            Đặt cây xanh vào trong khung
          </Text>
        </View>

        {state === 'taken' ? (
          <View style={styles.takenBadge}>
            <Text style={styles.takenText}>Ảnh đã chụp</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.permissionDemo}
          onPress={() => setState('denied')}>
          <Text style={styles.permissionDemoText}>
            Mô phỏng lỗi quyền
          </Text>
        </Pressable>
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.privacyRow}>
          <Shield size={14} color={colors.lime} />
          <Text style={styles.privacyText}>
            Ảnh chỉ dùng để AI xác minh và sẽ bị xóa sau đó
          </Text>
        </View>

        {state === 'preview' ? (
          <View style={styles.captureRow}>
            <View style={styles.sideControlPlaceholder} />
            <Pressable
              accessibilityLabel="Chụp ảnh"
              style={styles.shutterOuter}
              onPress={() => setState('taken')}>
              <View style={styles.shutterInner} />
            </Pressable>
            <Pressable style={styles.sideControl}>
              <RotateCcw size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.reviewActions}>
            <Pressable
              style={styles.retakeButton}
              onPress={() => setState('preview')}>
              <X size={17} color="#FFFFFF" />
              <Text style={styles.retakeText}>Chụp lại</Text>
            </Pressable>
            <Pressable
              style={styles.analyzeButton}
              onPress={() =>
                navigation.navigate('AIAnalysis', {
                  userTaskId: route.params.userTaskId,
                })
              }>
              <Camera size={17} color={colors.primary} />
              <Text style={styles.analyzeText}>Dùng ảnh này</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#111811'},
  cameraView: {flex: 1, position: 'relative', overflow: 'hidden'},
  topControls: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundControl: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.36)',
  },
  taskChip: {paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.42)'},
  taskChipText: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
  guide: {position: 'absolute', top: '24%', left: 38, right: 38, height: 315, alignItems: 'center', justifyContent: 'flex-end'},
  corner: {position: 'absolute', width: 44, height: 44, borderColor: '#FFFFFF'},
  topLeft: {top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 18},
  topRight: {top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 18},
  bottomLeft: {bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 18},
  bottomRight: {bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 18},
  guideText: {marginBottom: 18, paddingHorizontal: 14, paddingVertical: 7, color: '#FFFFFF', fontSize: 12, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.42)', overflow: 'hidden'},
  takenBadge: {position: 'absolute', top: 82, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.primaryButton},
  takenText: {color: '#FFFFFF', fontSize: 12, fontWeight: '700'},
  permissionDemo: {position: 'absolute', left: 14, bottom: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)'},
  permissionDemoText: {color: 'rgba(255,255,255,0.7)', fontSize: 10},
  bottomPanel: {paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, backgroundColor: '#111811'},
  privacyRow: {marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 6},
  privacyText: {color: 'rgba(255,255,255,0.58)', fontSize: 11},
  captureRow: {height: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'},
  sideControl: {width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.12)'},
  sideControlPlaceholder: {width: 46, height: 46},
  shutterOuter: {width: 76, height: 76, padding: 5, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 38},
  shutterInner: {flex: 1, borderRadius: 32, backgroundColor: '#FFFFFF'},
  reviewActions: {height: 82, flexDirection: 'row', alignItems: 'center', columnGap: 12},
  retakeButton: {height: 52, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 26},
  retakeText: {color: '#FFFFFF', fontSize: 14, fontWeight: '700'},
  analyzeButton: {height: 52, flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 7, borderRadius: 26, backgroundColor: colors.lime},
  analyzeText: {color: colors.primary, fontSize: 14, fontWeight: '800'},
  deniedScreen: {flex: 1, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A1A'},
  deniedIcon: {width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: 'rgba(186,26,26,0.2)'},
  deniedTitle: {marginTop: 18, color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center'},
  deniedText: {marginTop: 10, color: 'rgba(255,255,255,0.62)', fontSize: 14, lineHeight: 21, textAlign: 'center'},
  permissionButton: {width: '100%', height: 52, marginTop: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: colors.lime},
  permissionButtonText: {color: colors.primary, fontSize: 15, fontWeight: '800'},
  cancelText: {marginTop: 18, color: 'rgba(255,255,255,0.72)', fontSize: 14, fontWeight: '600'},
});
