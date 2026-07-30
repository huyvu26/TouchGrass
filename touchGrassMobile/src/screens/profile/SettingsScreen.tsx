import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ScreenHeader} from '../../components/ScreenHeader';
import {ToggleSwitch} from '../../components/ToggleSwitch';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Settings'>;

type ToggleKey =
  | 'strict'
  | 'autoRelock'
  | 'xpExtend'
  | 'taskReminder'
  | 'outdoorPriority'
  | 'darkMode'
  | 'notifications';

interface SettingsRowProps {
  label: string;
  subtitle?: string;
  toggleKey?: ToggleKey;
  value?: string;
  isLast?: boolean;
  toggles: Record<ToggleKey, boolean>;
  onToggle: (key: ToggleKey) => void;
}

function SettingsRow({
  label,
  subtitle,
  toggleKey,
  value,
  isLast,
  toggles,
  onToggle,
}: SettingsRowProps) {
  return (
    <View
      style={[
        styles.row,
        !isLast && styles.rowDivider,
      ]}>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {toggleKey ? (
        <ToggleSwitch
          value={toggles[toggleKey]}
          onValueChange={() => onToggle(toggleKey)}
        />
      ) : value ? (
        <View style={styles.valueRow}>
          <Text style={styles.valueText}>{value}</Text>
          <ChevronRight size={15} color={colors.textSecondary} />
        </View>
      ) : (
        <ChevronRight size={17} color={colors.textSecondary} />
      )}
    </View>
  );
}

export function SettingsScreen({navigation}: Props) {
  const [toggles, setToggles] = useState<
    Record<ToggleKey, boolean>
  >({
    strict: false,
    autoRelock: true,
    xpExtend: false,
    taskReminder: true,
    outdoorPriority: true,
    darkMode: false,
    notifications: true,
  });
  const [showLogout, setShowLogout] = useState(false);

  function toggle(key: ToggleKey) {
    setToggles(current => ({
      ...current,
      [key]: !current[key],
    }));
  }

  const common = {toggles, onToggle: toggle};

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Cài đặt"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>
          KIỂM SOÁT ỨNG DỤNG
        </Text>
        <View style={styles.section}>
          <SettingsRow
            label="Chế độ nghiêm ngặt"
            subtitle="Không thể tắt giới hạn trong 24h"
            toggleKey="strict"
            {...common}
          />
          <SettingsRow
            label="Tự động khóa lại khi hết thưởng"
            toggleKey="autoRelock"
            {...common}
          />
          <SettingsRow
            label="Cho phép dùng XP để gia hạn"
            toggleKey="xpExtend"
            isLast
            {...common}
          />
        </View>

        {toggles.strict ? (
          <View style={styles.strictWarning}>
            <Text style={styles.strictWarningTitle}>
              🔒 Chế độ nghiêm ngặt đang bật
            </Text>
            <Text style={styles.strictWarningText}>
              Bạn sẽ không thể sửa hoặc tắt giới hạn ứng dụng
              trong 24 giờ tiếp theo.
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>NHIỆM VỤ</Text>
        <View style={styles.section}>
          <SettingsRow
            label="Nhắc nhiệm vụ hằng ngày"
            toggleKey="taskReminder"
            {...common}
          />
          <SettingsRow
            label="Thời gian nhắc"
            value="07:00"
            {...common}
          />
          <SettingsRow
            label="Ưu tiên nhiệm vụ ngoài trời"
            toggleKey="outdoorPriority"
            isLast
            {...common}
          />
        </View>

        <Text style={styles.sectionLabel}>QUYỀN RIÊNG TƯ</Text>
        <View style={styles.section}>
          <SettingsRow
            label="Quản lý quyền truy cập"
            {...common}
          />
          <SettingsRow
            label="Dữ liệu sử dụng ứng dụng"
            subtitle="Chia sẻ ẩn danh để cải thiện ứng dụng"
            {...common}
          />
          <SettingsRow
            label="Xóa dữ liệu tài khoản"
            isLast
            {...common}
          />
        </View>

        <Text style={styles.sectionLabel}>ỨNG DỤNG</Text>
        <View style={styles.section}>
          <SettingsRow
            label="Ngôn ngữ"
            value="Tiếng Việt"
            {...common}
          />
          <SettingsRow
            label="Giao diện"
            subtitle="Sáng"
            toggleKey="darkMode"
            {...common}
          />
          <SettingsRow
            label="Thông báo"
            toggleKey="notifications"
            {...common}
          />
          <SettingsRow
            label="Giới thiệu Touch Grass"
            {...common}
          />
          <SettingsRow
            label="Phiên bản"
            value="1.0.0"
            isLast
            {...common}
          />
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() => setShowLogout(true)}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showLogout}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogout(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Đăng xuất?</Text>
            <Text style={styles.sheetText}>
              Bạn sẽ cần đăng nhập lại để tiếp tục hành trình. Dữ
              liệu của bạn vẫn được giữ nguyên.
            </Text>
            <View style={styles.sheetActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowLogout(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={styles.confirmButton}
                onPress={() => navigation.replace('Login')}>
                <Text style={styles.confirmButtonText}>
                  Đăng xuất
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {paddingHorizontal: 20, paddingBottom: 28},
  sectionLabel: {marginBottom: 8, marginLeft: 4, color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8},
  section: {marginBottom: 19, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface},
  row: {minHeight: 58, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', columnGap: 12},
  rowDivider: {borderBottomWidth: 1, borderBottomColor: colors.border},
  rowContent: {flex: 1},
  rowLabel: {color: colors.text, fontSize: 13, fontWeight: '600'},
  rowSubtitle: {marginTop: 3, color: colors.textSecondary, fontSize: 11},
  valueRow: {flexDirection: 'row', alignItems: 'center', columnGap: 3},
  valueText: {color: colors.textSecondary, fontSize: 12},
  strictWarning: {marginTop: -8, marginBottom: 18, padding: 13, borderWidth: 1, borderColor: 'rgba(186,26,26,0.18)', borderRadius: 15, backgroundColor: colors.errorBackground},
  strictWarningTitle: {color: colors.error, fontSize: 12, fontWeight: '700'},
  strictWarningText: {marginTop: 4, color: colors.error, fontSize: 11, lineHeight: 17},
  logoutButton: {height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.error, borderRadius: 26},
  logoutText: {color: colors.error, fontSize: 15, fontWeight: '700'},
  modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(21,66,18,0.42)'},
  sheet: {paddingHorizontal: 24, paddingTop: 14, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.surface},
  handle: {width: 40, height: 4, marginBottom: 20, alignSelf: 'center', borderRadius: 2, backgroundColor: colors.border},
  sheetTitle: {color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center'},
  sheetText: {marginTop: 8, color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center'},
  sheetActions: {marginTop: 22, flexDirection: 'row', columnGap: 12},
  cancelButton: {height: 50, flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.primaryButton, borderRadius: 25},
  cancelButtonText: {color: colors.primaryButton, fontSize: 14, fontWeight: '700'},
  confirmButton: {height: 50, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 25, backgroundColor: colors.error},
  confirmButtonText: {color: '#FFFFFF', fontSize: 14, fontWeight: '700'},
});
