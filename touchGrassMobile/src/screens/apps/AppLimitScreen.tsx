import React, {useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  MessageCircle,
  Music2,
  Trash2,
} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'AppLimit'
>;

const PRESETS = [10, 20, 30, 60] as const;
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const UNLOCK_TASKS = [
  {
    key: 'walk',
    icon: '🚶',
    label: 'Đi bộ 500m',
    description: 'Ra ngoài và đi bộ ít nhất 500 mét',
  },
  {
    key: 'photo',
    icon: '📸',
    label: 'Chụp ảnh cây xanh',
    description: 'Chụp 1 ảnh cây hoặc thực vật ngoài trời',
  },
  {
    key: 'random',
    icon: '🎲',
    label: 'Nhiệm vụ ngẫu nhiên',
    description: 'Hệ thống sẽ chọn ngẫu nhiên một nhiệm vụ',
  },
] as const;

type UnlockTaskKey = (typeof UNLOCK_TASKS)[number]['key'];

interface ToggleProps {
  enabled: boolean;
  label: string;
  onToggle: () => void;
}

function ToggleSwitch({
  enabled,
  label,
  onToggle,
}: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{checked: enabled}}
      style={[
        styles.toggle,
        enabled && styles.toggleEnabled,
      ]}
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

function AppIdentityIcon({name}: {name: string}) {
  if (name === 'Facebook') {
    return (
      <View style={[styles.appIcon, styles.facebookIcon]}>
        <Text style={styles.facebookLetter}>f</Text>
      </View>
    );
  }

  if (name === 'Instagram') {
    return (
      <View style={[styles.appIcon, styles.instagramIcon]}>
        <Camera size={29} color="#FFFFFF" />
      </View>
    );
  }

  if (name === 'YouTube') {
    return (
      <View style={[styles.appIcon, styles.youtubeIcon]}>
        <Svg width={32} height={32} viewBox="0 0 24 24">
          <Path
            d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z"
            fill="#FFFFFF"
          />
        </Svg>
      </View>
    );
  }

  if (name === 'Messenger') {
    return (
      <View style={[styles.appIcon, styles.messengerIcon]}>
        <MessageCircle
          size={29}
          color="#FFFFFF"
          fill="#FFFFFF"
        />
      </View>
    );
  }

  return (
    <View style={styles.appIcon}>
      <Music2 size={30} color="#FFFFFF" />
    </View>
  );
}

export function AppLimitScreen({navigation, route}: Props) {
  const {appName} = route.params;
  const [enabled, setEnabled] = useState(true);
  const [limit, setLimit] = useState(20);
  const [activeDays, setActiveDays] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [unlockTask, setUnlockTask] =
    useState<UnlockTaskKey>('walk');
  const [strictMode, setStrictMode] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  function toggleDay(index: number) {
    setActiveDays(current =>
      current.includes(index)
        ? current.filter(day => day !== index)
        : [...current, index],
    );
  }

  function saveChanges() {
    Alert.alert(
      'Đã lưu thay đổi',
      `Giới hạn của ${appName} đã được cập nhật.`,
    );
  }

  function confirmDelete() {
    setShowDelete(false);
    Alert.alert(
      'Đã xóa',
      `${appName} không còn nằm trong danh sách giới hạn.`,
      [
        {
          text: 'Đóng',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ChevronLeft size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Giới hạn ứng dụng</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.prototypeBanner}>
            <Text style={styles.prototypeText}>
              PROTOTYPE · Thiết lập này chỉ minh họa giao diện và chưa khóa ứng
              dụng thật trên Android.
            </Text>
          </View>
          <View style={styles.identityCard}>
            <AppIdentityIcon name={appName} />
            <View style={styles.identityContent}>
              <Text style={styles.appName}>{appName}</Text>
              <Text style={styles.appPackage}>
                Ứng dụng minh họa · chưa đọc package từ thiết bị
              </Text>
            </View>
            <ToggleSwitch
              enabled={enabled}
              label={`Bật giới hạn ${appName}`}
              onToggle={() => setEnabled(current => !current)}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Giới hạn hằng ngày
            </Text>

            <View style={styles.limitSelector}>
              <Pressable
                accessibilityRole="button"
                style={styles.adjustButton}
                onPress={() =>
                  setLimit(current => Math.max(5, current - 5))
                }>
                <Text style={styles.adjustText}>−</Text>
              </Pressable>

              <View style={styles.limitValue}>
                <Text style={styles.limitNumber}>{limit}</Text>
                <Text style={styles.limitUnit}>phút/ngày</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                style={styles.adjustButton}
                onPress={() =>
                  setLimit(current =>
                    Math.min(180, current + 5),
                  )
                }>
                <Text style={styles.adjustText}>+</Text>
              </Pressable>
            </View>

            <View style={styles.presetRow}>
              {PRESETS.map(preset => {
                const selected = limit === preset;

                return (
                  <Pressable
                    key={preset}
                    style={[
                      styles.presetButton,
                      selected && styles.presetSelected,
                    ]}
                    onPress={() => setLimit(preset)}>
                    <Text
                      style={[
                        styles.presetText,
                        selected && styles.presetTextSelected,
                      ]}>
                      {preset}m
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ngày áp dụng</Text>
            <View style={styles.daysRow}>
              {DAYS.map((day, index) => {
                const selected = activeDays.includes(index);

                return (
                  <Pressable
                    key={day}
                    style={[
                      styles.dayButton,
                      selected && styles.daySelected,
                    ]}
                    onPress={() => toggleDay(index)}>
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
                      ]}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Khung thời gian</Text>
            <View style={styles.timeRow}>
              <Pressable
                style={styles.timeButton}
                onPress={() =>
                  Alert.alert(
                    'Giờ bắt đầu',
                    'Bộ chọn thời gian sẽ được kết nối sau.',
                  )
                }>
                <Text style={styles.timeText}>06:00</Text>
                <ChevronDown
                  size={16}
                  color={colors.textSecondary}
                />
              </Pressable>

              <Text style={styles.toText}>đến</Text>

              <Pressable
                style={styles.timeButton}
                onPress={() =>
                  Alert.alert(
                    'Giờ kết thúc',
                    'Bộ chọn thời gian sẽ được kết nối sau.',
                  )
                }>
                <Text style={styles.timeText}>23:00</Text>
                <ChevronDown
                  size={16}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Khi hết thời gian
            </Text>

            {UNLOCK_TASKS.map(task => {
              const selected = unlockTask === task.key;

              return (
                <Pressable
                  key={task.key}
                  style={[
                    styles.taskOption,
                    selected && styles.taskOptionSelected,
                  ]}
                  onPress={() => setUnlockTask(task.key)}>
                  <Text style={styles.taskEmoji}>{task.icon}</Text>
                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        selected && styles.taskTitleSelected,
                      ]}>
                      {task.label}
                    </Text>
                    <Text style={styles.taskDescription}>
                      {task.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      selected && styles.radioSelected,
                    ]}>
                    {selected ? (
                      <View style={styles.radioDot} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.strictCard}>
            <View style={styles.strictContent}>
              <Text style={styles.strictTitle}>
                Chế độ nghiêm ngặt
              </Text>
              <Text style={styles.strictDescription}>
                Không thể tắt giới hạn trong 24h sau khi bật
              </Text>
            </View>
            <ToggleSwitch
              enabled={strictMode}
              label="Chế độ nghiêm ngặt"
              onToggle={() =>
                setStrictMode(current => !current)
              }
            />
          </View>

          <Pressable
            accessibilityRole="button"
            style={({pressed}) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={saveChanges}>
            <Text style={styles.primaryButtonText}>
              Lưu thay đổi
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({pressed}) => [
              styles.deleteButton,
              pressed && styles.pressed,
            ]}
            onPress={() => setShowDelete(true)}>
            <Trash2 size={16} color={colors.error} />
            <Text style={styles.deleteButtonText}>
              Xóa khỏi danh sách giới hạn
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showDelete}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowDelete(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowDelete(false)}
          />
          <View style={styles.deleteSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.deleteIcon}>
              <Trash2 size={26} color={colors.error} />
            </View>
            <Text style={styles.deleteTitle}>Xóa {appName}?</Text>
            <Text style={styles.deleteDescription}>
              {appName} sẽ không còn bị giới hạn. Bạn có thể thêm
              lại bất cứ lúc nào.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowDelete(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}>
                <Text style={styles.confirmDeleteText}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  prototypeBanner: {marginBottom: 14, padding: 11, borderRadius: 12, backgroundColor: colors.surfaceSoft},
  prototypeText: {color: colors.textSecondary, fontSize: 10, lineHeight: 15, textAlign: 'center'},
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceSoft,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 20,
    rowGap: 14,
  },
  identityCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  appIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#010101',
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
  },
  facebookLetter: {
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 45,
    fontWeight: '800',
  },
  instagramIcon: {
    backgroundColor: '#C13584',
  },
  youtubeIcon: {
    backgroundColor: '#FF0000',
  },
  messengerIcon: {
    backgroundColor: '#0099FF',
  },
  identityContent: {
    minWidth: 0,
    flex: 1,
  },
  appName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  appPackage: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
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
    elevation: 2,
  },
  toggleThumbEnabled: {
    alignSelf: 'flex-end',
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    marginBottom: 14,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  limitSelector: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 16,
  },
  adjustButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceSoft,
  },
  adjustText: {
    color: colors.primary,
    fontSize: 22,
    lineHeight: 25,
    fontWeight: '800',
  },
  limitValue: {
    minWidth: 80,
    alignItems: 'center',
  },
  limitNumber: {
    color: colors.primary,
    fontSize: 32,
    lineHeight: 37,
    fontWeight: '800',
  },
  limitUnit: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  presetRow: {
    flexDirection: 'row',
    columnGap: 8,
  },
  presetButton: {
    height: 36,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 18,
  },
  presetSelected: {
    borderColor: colors.primaryButton,
    backgroundColor: colors.surfaceSoft,
  },
  presetText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  presetTextSelected: {
    color: colors.primaryButton,
  },
  daysRow: {
    flexDirection: 'row',
    columnGap: 6,
  },
  dayButton: {
    height: 36,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
  },
  daySelected: {
    borderColor: colors.primaryButton,
    backgroundColor: colors.primaryButton,
  },
  dayText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  timeButton: {
    height: 48,
    flex: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.inputBackground,
  },
  timeText: {
    color: colors.text,
    fontSize: 14,
  },
  toText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  taskOption: {
    marginBottom: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
  },
  taskOptionSelected: {
    borderColor: colors.primaryButton,
    backgroundColor: colors.surfaceSoft,
  },
  taskEmoji: {
    fontSize: 24,
  },
  taskContent: {
    minWidth: 0,
    flex: 1,
  },
  taskTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  taskTitleSelected: {
    color: colors.primary,
  },
  taskDescription: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  radio: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 10,
  },
  radioSelected: {
    borderColor: colors.primaryButton,
    backgroundColor: colors.primaryButton,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  strictCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  strictContent: {
    minWidth: 0,
    flex: 1,
  },
  strictTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  strictDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: colors.primaryButton,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: 26,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(21, 66, 18, 0.45)',
  },
  deleteSheet: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  deleteIcon: {
    width: 56,
    height: 56,
    marginBottom: 16,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.errorBackground,
  },
  deleteTitle: {
    marginBottom: 8,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  deleteDescription: {
    marginBottom: 24,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    columnGap: 12,
  },
  cancelButton: {
    height: 52,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryButton,
    borderRadius: 26,
  },
  cancelButtonText: {
    color: colors.primaryButton,
    fontSize: 16,
    fontWeight: '700',
  },
  confirmDeleteButton: {
    height: 52,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: colors.error,
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
