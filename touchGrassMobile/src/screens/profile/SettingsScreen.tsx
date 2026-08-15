import React, {useCallback, useState} from 'react';
import {Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronRight, ShieldAlert} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ScreenHeader} from '../../components/ScreenHeader';
import {ToggleSwitch} from '../../components/ToggleSwitch';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {useAuth} from '../../auth/AuthContext';
import {
  deleteAndClearAppControlData,
  emergencyDisableAppControl,
  isAppControlEnabled,
  setAppControlEnabled,
} from '../../services/appControlService';

type Props = NativeStackScreenProps<AuthStackParamList, 'Settings'>;

function Row({label, subtitle, onPress, value, danger}: {label: string; subtitle?: string; onPress?: () => void; value?: string; danger?: boolean}) {
  return (
    <Pressable disabled={!onPress} style={styles.row} onPress={onPress}>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && styles.danger]}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {onPress ? <ChevronRight size={17} color={colors.textSecondary} /> : null}
    </Pressable>
  );
}

export function SettingsScreen({navigation}: Props) {
  const {logout} = useAuth();
  const [appControl, setAppControl] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [deletingAppControl, setDeletingAppControl] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    isAppControlEnabled()
      .then(enabled => {
        if (active) setAppControl(enabled);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []));

  async function toggleControl() {
    if (!appControl) {
      navigation.navigate('AppManagement');
      return;
    }
    await setAppControlEnabled(false);
    setAppControl(false);
  }

  async function emergencyStop() {
    await emergencyDisableAppControl();
    setAppControl(false);
    Alert.alert('Đã tắt App Control', 'Touch Grass sẽ không mở màn hình khóa cho đến khi bạn bật lại.');
  }

  function confirmDeleteAppControlData() {
    Alert.alert(
      'Xóa dữ liệu App Control?',
      'Toàn bộ ứng dụng đã chọn, giới hạn và phiên mở khóa sẽ bị xóa trên backend và thiết bị này. Tài khoản và lịch sử nhiệm vụ không bị xóa.',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa dữ liệu',
          style: 'destructive',
          onPress: async () => {
            if (deletingAppControl) return;
            setDeletingAppControl(true);
            try {
              await deleteAndClearAppControlData();
              setAppControl(false);
              Alert.alert('Đã xóa', 'Dữ liệu App Control đã được xóa khỏi backend và thiết bị.');
            } catch (error) {
              Alert.alert(
                'Không thể xóa dữ liệu',
                error instanceof Error ? error.message : 'Vui lòng thử lại.',
              );
            } finally {
              setDeletingAppControl(false);
            }
          },
        },
      ],
    );
  }

  async function confirmLogout() {
    await logout();
    setShowLogout(false);
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="Cài đặt" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notice}>
          <ShieldAlert size={17} color={colors.primaryButton} />
          <Text style={styles.noticeText}>Các mục hoạt động thật được ghi rõ bên dưới. Tính năng chưa triển khai không còn hiển thị như một toggle đang hoạt động.</Text>
        </View>

        <Text style={styles.sectionLabel}>APP CONTROL</Text>
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Khóa ứng dụng đã chọn</Text>
              <Text style={styles.rowSubtitle}>{appControl ? 'Đang hoạt động trên Android' : 'Mở Quản lý ứng dụng để thiết lập và bật'}</Text>
            </View>
            <ToggleSwitch value={appControl} onValueChange={toggleControl} />
          </View>
          <Row label="Quản lý ứng dụng và giới hạn" onPress={() => navigation.navigate('AppManagement')} />
          <Row label="Tắt khẩn cấp App Control" subtitle="Luôn khả dụng để tránh bị kẹt ngoài ứng dụng" danger onPress={emergencyStop} />
        </View>

        <Text style={styles.sectionLabel}>QUYỀN VÀ RIÊNG TƯ</Text>
        <View style={styles.section}>
          <Row label="Quản lý quyền truy cập" subtitle="Camera, GPS, Usage Access và Accessibility" onPress={() => navigation.navigate('Permission')} />
          <Row label="Dữ liệu App Control" subtitle="Quy tắc được đồng bộ với backend và lưu bản sao trên thiết bị" />
          <Row
            label={deletingAppControl ? 'Đang xóa dữ liệu…' : 'Xóa dữ liệu App Control'}
            subtitle="Không xóa tài khoản hoặc lịch sử nhiệm vụ"
            danger
            onPress={deletingAppControl ? undefined : confirmDeleteAppControlData}
          />
        </View>

        <Text style={styles.sectionLabel}>ỨNG DỤNG</Text>
        <View style={styles.section}>
          <Row label="Ngôn ngữ" value="Tiếng Việt" />
          <Row label="Giới thiệu Touch Grass" subtitle="Ứng dụng hỗ trợ giảm thời gian màn hình bằng nhiệm vụ ngoài trời." />
          <Row label="Phiên bản" value="1.0.0" />
        </View>

        <Pressable style={styles.logoutButton} onPress={() => setShowLogout(true)}><Text style={styles.logoutText}>Đăng xuất</Text></Pressable>
      </ScrollView>

      <Modal visible={showLogout} transparent animationType="slide" onRequestClose={() => setShowLogout(false)}>
        <View style={styles.modalBackdrop}><View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Đăng xuất?</Text>
          <Text style={styles.sheetText}>Token đăng nhập sẽ được xóa khỏi thiết bị.</Text>
          <View style={styles.actions}>
            <Pressable style={styles.cancel} onPress={() => setShowLogout(false)}><Text style={styles.cancelText}>Hủy</Text></Pressable>
            <Pressable style={styles.confirm} onPress={confirmLogout}><Text style={styles.confirmText}>Đăng xuất</Text></Pressable>
          </View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background}, content: {paddingHorizontal: 20, paddingBottom: 28},
  notice: {marginBottom: 16, padding: 13, flexDirection: 'row', alignItems: 'flex-start', columnGap: 9, borderRadius: 14, backgroundColor: colors.surfaceSoft}, noticeText: {flex: 1, color: colors.textSecondary, fontSize: 11, lineHeight: 17},
  sectionLabel: {marginBottom: 8, marginLeft: 4, color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8},
  section: {marginBottom: 19, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface},
  row: {minHeight: 62, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', columnGap: 8, borderBottomWidth: 1, borderBottomColor: colors.border},
  toggleRow: {minHeight: 66, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', columnGap: 12, borderBottomWidth: 1, borderBottomColor: colors.border},
  rowContent: {flex: 1}, rowLabel: {color: colors.text, fontSize: 13, fontWeight: '600'}, rowSubtitle: {marginTop: 3, color: colors.textSecondary, fontSize: 11, lineHeight: 16}, value: {color: colors.textSecondary, fontSize: 11}, danger: {color: colors.error},
  logoutButton: {height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.error, borderRadius: 26}, logoutText: {color: colors.error, fontSize: 15, fontWeight: '700'},
  modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(21,66,18,0.42)'}, sheet: {padding: 24, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.surface}, handle: {width: 40, height: 4, marginBottom: 20, alignSelf: 'center', borderRadius: 2, backgroundColor: colors.border}, sheetTitle: {color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center'}, sheetText: {marginTop: 8, color: colors.textSecondary, fontSize: 13, textAlign: 'center'}, actions: {marginTop: 22, flexDirection: 'row', columnGap: 12}, cancel: {height: 50, flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primaryButton, borderRadius: 25}, cancelText: {color: colors.primaryButton, fontWeight: '700'}, confirm: {height: 50, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 25, backgroundColor: colors.error}, confirmText: {color: '#FFFFFF', fontWeight: '700'},
});
