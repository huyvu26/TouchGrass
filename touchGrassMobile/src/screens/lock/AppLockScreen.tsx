import React, {useEffect, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Lock} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {getPendingLockedApp} from '../../services/appControlService';
import type {PendingLockedApp} from '../../native/appControl';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'AppLock'
>;

export function AppLockScreen({navigation}: Props) {
  const [pendingApp, setPendingApp] = useState<PendingLockedApp | null>(null);

  useEffect(() => {
    getPendingLockedApp().then(setPendingApp).catch(() => setPendingApp(null));
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.backgroundPattern}>
        {[0, 1, 2, 3].map(index => (
          <View
            key={index}
            style={[
              styles.fakePost,
              {top: 30 + index * 190},
            ]}
          />
        ))}
      </View>
      <View style={styles.shade} />

      <View style={styles.content}>
        <View style={styles.illustration}>
          <View style={styles.treeTopLarge} />
          <View style={styles.treeTopMedium} />
          <View style={styles.treeTopSmall} />
          <View style={styles.treeTrunk} />
          <View style={styles.lockBadge}>
            <Lock size={23} color={colors.lime} />
          </View>
        </View>

        <Text style={styles.title}>Ứng dụng đang bị khóa</Text>
        <Text style={styles.subtitle}>
          {pendingApp?.appName ?? 'Ứng dụng này'} nằm trong danh sách bạn đã chọn.{`\n`}
          Hãy dùng Leaf Point để mua thời gian sử dụng tạm thời.
        </Text>

        {pendingApp ? (
          <Pressable
            style={styles.unlockButton}
            onPress={() => navigation.navigate('AppLimit', pendingApp)}>
            <Text style={styles.unlockButtonText}>Dùng Leaf Point để mở khóa</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={styles.taskButton}
          onPress={() => navigation.navigate('TaskHub')}>
          <Text style={styles.taskButtonText}>
            Làm nhiệm vụ để nhận Leaf Point
          </Text>
        </Pressable>

        <Text style={styles.safetyText}>
          Bạn luôn có thể tắt khẩn cấp App Control trong Cài đặt Touch Grass để tránh bị kẹt.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.primary},
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#071007',
  },
  fakePost: {position: 'absolute', left: 18, right: 18, height: 160, borderRadius: 16, backgroundColor: '#1F2F1A'},
  shade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(11,28,8,0.88)',
  },
  content: {flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center'},
  illustration: {width: 150, height: 150, marginBottom: 20, position: 'relative', alignItems: 'center', justifyContent: 'flex-end', borderRadius: 75, backgroundColor: 'rgba(176,242,103,0.08)'},
  treeTopLarge: {position: 'absolute', bottom: 28, width: 72, height: 88, borderRadius: 40, backgroundColor: '#2D5A27'},
  treeTopMedium: {position: 'absolute', bottom: 52, width: 56, height: 70, borderRadius: 32, backgroundColor: '#3A7033'},
  treeTopSmall: {position: 'absolute', bottom: 78, width: 40, height: 50, borderRadius: 24, backgroundColor: '#4A8A40'},
  treeTrunk: {width: 12, height: 42, marginBottom: 10, borderRadius: 6, backgroundColor: '#5A8A48'},
  lockBadge: {position: 'absolute', right: 8, bottom: 8, width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.lime, borderRadius: 23, backgroundColor: colors.primary},
  title: {color: '#FFFFFF', fontSize: 26, fontWeight: '800', textAlign: 'center'},
  subtitle: {marginTop: 9, marginBottom: 26, color: 'rgba(255,255,255,0.68)', fontSize: 15, lineHeight: 23, textAlign: 'center'},
  taskButton: {width: '100%', height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: colors.lime, shadowColor: colors.lime, shadowOpacity: 0.32, shadowRadius: 14, elevation: 5},
  taskButtonText: {color: colors.primary, fontSize: 15, fontWeight: '800'},
  unlockButton: {width: '100%', height: 56, marginBottom: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.lime, borderRadius: 28},
  unlockButtonText: {color: colors.lime, fontSize: 15, fontWeight: '800'},
  safetyText: {marginTop: 18, color: 'rgba(255,255,255,0.58)', fontSize: 12, lineHeight: 18, textAlign: 'center'},
  savedRow: {marginTop: 20, flexDirection: 'row', alignItems: 'center', columnGap: 8},
  savedText: {color: 'rgba(255,255,255,0.5)', fontSize: 12},
});
