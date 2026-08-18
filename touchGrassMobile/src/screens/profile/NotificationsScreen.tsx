import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Bell} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ScreenHeader} from '../../components/ScreenHeader';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Notifications'>;

export function NotificationsScreen({navigation}: Props) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="Thông báo" onBack={() => navigation.goBack()} />
      <View style={styles.empty}>
        <View style={styles.iconBox}>
          <Bell size={36} color={colors.primaryButton} />
        </View>
        <Text style={styles.title}>Chưa có thông báo</Text>
        <Text style={styles.description}>
          Tính năng thông báo trực tuyến đang được hoàn thiện. Kết quả nhiệm vụ và thành
          tích thật vẫn có thể xem trong Lịch sử và Thống kê.
        </Text>
        <Pressable style={styles.button} onPress={() => navigation.navigate('History')}>
          <Text style={styles.buttonText}>Xem lịch sử hoạt động</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  empty: {flex: 1, paddingHorizontal: 36, alignItems: 'center', justifyContent: 'center'},
  iconBox: {width: 84, height: 84, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: colors.surfaceSoft},
  title: {marginTop: 18, color: colors.text, fontSize: 19, fontWeight: '800'},
  description: {marginTop: 8, color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center'},
  button: {height: 48, marginTop: 20, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: colors.primaryButton},
  buttonText: {color: '#FFFFFF', fontSize: 13, fontWeight: '800'},
});
