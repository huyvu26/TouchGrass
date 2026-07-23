import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BarChart2,
  Camera,
  Check,
  ChevronRight,
  MapPin,
  Shield,
} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Permission'
>;

const PERMISSIONS = [
  {
    key: 'accessibility',
    icon: Shield,
    label: 'Hỗ trợ Accessibility',
    description:
      'Cho phép ứng dụng theo dõi và chặn app khi hết thời gian',
    required: true,
  },
  {
    key: 'usage',
    icon: BarChart2,
    label: 'Thống kê sử dụng',
    description:
      'Xem thời gian sử dụng từng ứng dụng trên thiết bị',
    required: true,
  },
  {
    key: 'location',
    icon: MapPin,
    label: 'Vị trí GPS',
    description:
      'Xác nhận bạn đang ở ngoài trời khi hoàn thành nhiệm vụ',
    required: false,
  },
  {
    key: 'camera',
    icon: Camera,
    label: 'Máy ảnh',
    description:
      'Chụp ảnh cây xanh và thiên nhiên để hoàn thành nhiệm vụ',
    required: false,
  },
] as const;

type PermissionKey = (typeof PERMISSIONS)[number]['key'];
type PermissionState = Record<PermissionKey, boolean>;

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
  accessibilityLabel: string;
}

function PermissionToggle({
  enabled,
  onToggle,
  accessibilityLabel,
}: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{checked: enabled}}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.toggle,
        enabled && styles.toggleEnabled,
      ]}
      hitSlop={6}
      onPress={onToggle}>
      <View
        style={[
          styles.toggleThumb,
          enabled && styles.toggleThumbEnabled,
        ]}
      />
    </Pressable>
  );
}

export function PermissionScreen({navigation}: Props) {
  const [granted, setGranted] = useState<PermissionState>({
    accessibility: false,
    usage: true,
    location: true,
    camera: false,
  });

  const allRequiredGranted = PERMISSIONS.filter(
    permission => permission.required,
  ).every(permission => granted[permission.key]);

  function togglePermission(key: PermissionKey) {
    setGranted(current => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Shield
              size={36}
              color={colors.primaryButton}
            />
          </View>

          <Text style={styles.title}>Cấp quyền</Text>
          <Text style={styles.subtitle}>
            Touch Grass cần một số quyền để hoạt động đúng cách.
            Quyền bắt buộc{' '}
            <Text style={styles.requiredMark}>(*)</Text> phải được
            cấp.
          </Text>
        </View>

        <View style={styles.permissionList}>
          {PERMISSIONS.map(permission => {
            const Icon = permission.icon;
            const enabled = granted[permission.key];

            return (
              <View
                key={permission.key}
                style={[
                  styles.permissionCard,
                  enabled && styles.permissionCardEnabled,
                ]}>
                <View style={styles.permissionMainRow}>
                  <View
                    style={[
                      styles.permissionIcon,
                      enabled && styles.permissionIconEnabled,
                    ]}>
                    <Icon
                      size={22}
                      color={
                        enabled
                          ? colors.primaryButton
                          : colors.textSecondary
                      }
                    />
                  </View>

                  <View style={styles.permissionContent}>
                    <Text style={styles.permissionLabel}>
                      {permission.label}
                      {permission.required ? (
                        <Text style={styles.requiredMark}> *</Text>
                      ) : null}
                    </Text>
                    <Text style={styles.permissionDescription}>
                      {permission.description}
                    </Text>
                  </View>

                  <PermissionToggle
                    enabled={enabled}
                    accessibilityLabel={`Cấp quyền ${permission.label}`}
                    onToggle={() =>
                      togglePermission(permission.key)
                    }
                  />
                </View>

                {enabled ? (
                  <View style={styles.grantedRow}>
                    <Check
                      size={14}
                      color={colors.primaryButton}
                      strokeWidth={2.5}
                    />
                    <Text style={styles.grantedText}>
                      Đã cấp quyền
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={styles.privacyCard}>
          <Shield
            size={17}
            color={colors.primaryButton}
          />
          <Text style={styles.privacyText}>
            Chúng tôi cam kết{' '}
            <Text style={styles.privacyStrong}>
              bảo mật dữ liệu
            </Text>{' '}
            của bạn. Dữ liệu không bao giờ được bán cho bên thứ
            ba.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!allRequiredGranted}
          style={({pressed}) => [
            styles.primaryButton,
            !allRequiredGranted && styles.disabledButton,
            pressed && allRequiredGranted && styles.pressed,
          ]}
          onPress={() => navigation.replace('Home')}>
          <Text style={styles.primaryButtonText}>
            {allRequiredGranted
              ? 'Tiếp tục'
              : 'Cần cấp quyền bắt buộc'}
          </Text>
          {allRequiredGranted ? (
            <ChevronRight
              size={19}
              color="#FFFFFF"
            />
          ) : null}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 28,
    alignItems: 'center',
  },
  headerIcon: {
    width: 72,
    height: 72,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.surfaceSoft,
  },
  title: {
    marginBottom: 8,
    color: colors.primary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  requiredMark: {
    color: colors.error,
  },
  permissionList: {
    marginBottom: 24,
    rowGap: 12,
  },
  permissionCard: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  permissionCardEnabled: {
    borderColor: 'rgba(36, 107, 5, 0.27)',
    shadowColor: colors.primaryButton,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 14,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
  },
  permissionIconEnabled: {
    backgroundColor: colors.surfaceSoft,
  },
  permissionContent: {
    flex: 1,
  },
  permissionLabel: {
    marginBottom: 3,
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  permissionDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  toggle: {
    width: 52,
    height: 30,
    padding: 3,
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#C8D4C0',
  },
  toggleEnabled: {
    backgroundColor: colors.primaryButton,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleThumbEnabled: {
    alignSelf: 'flex-end',
  },
  grantedRow: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    borderRadius: 10,
    backgroundColor: colors.surfaceSoft,
  },
  grantedText: {
    color: colors.primaryButton,
    fontSize: 12,
    fontWeight: '500',
  },
  privacyCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 10,
    borderRadius: 14,
    backgroundColor: colors.surfaceSoft,
  },
  privacyText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  privacyStrong: {
    color: colors.primary,
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 52,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    borderRadius: 26,
    backgroundColor: colors.primaryButton,
    shadowColor: colors.primaryButton,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
});
