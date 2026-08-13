import React, {useEffect, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ChevronLeft, Clock3, Shield, Smartphone, Trash2} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {
  getAppLimitRules,
  removeAppLimitRule,
  saveAppLimitRule,
  type AppLimitRule,
} from '../../storage/appControlStorage';

type Props = NativeStackScreenProps<AuthStackParamList, 'AppLimit'>;
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export function AppLimitScreen({navigation, route}: Props) {
  const {packageName, appName} = route.params;
  const [enabled, setEnabled] = useState(true);
  const [limit, setLimit] = useState('30');
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  useEffect(() => {
    getAppLimitRules().then(rules => {
      const rule = rules.find(item => item.packageName === packageName);
      if (!rule) return;
      setEnabled(rule.enabled);
      setLimit(String(rule.dailyLimitMinutes));
      setActiveDays(rule.activeDays);
      setStartTime(rule.startTime);
      setEndTime(rule.endTime);
    });
  }, [packageName]);

  function toggleDay(day: number) {
    setActiveDays(current => current.includes(day) ? current.filter(item => item !== day) : [...current, day]);
  }

  async function save() {
    const minutes = Number(limit);
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
      Alert.alert('Giới hạn không hợp lệ', 'Vui lòng nhập từ 1 đến 1440 phút.');
      return;
    }
    if (!timePattern.test(startTime) || !timePattern.test(endTime) || startTime > endTime) {
      Alert.alert('Khung giờ không hợp lệ', 'Dùng định dạng HH:mm và giờ bắt đầu không được sau giờ kết thúc.');
      return;
    }
    if (activeDays.length === 0) {
      Alert.alert('Chưa chọn ngày', 'Hãy chọn ít nhất một ngày áp dụng.');
      return;
    }
    const rule: AppLimitRule = {
      packageName,
      appName,
      enabled,
      dailyLimitMinutes: minutes,
      activeDays,
      startTime,
      endTime,
    };
    await saveAppLimitRule(rule);
    Alert.alert('Đã lưu', 'Quy tắc được lưu trên thiết bị. Touch Grass hiện chỉ cảnh báo, chưa tự động khóa ứng dụng.');
  }

  function remove() {
    Alert.alert('Bỏ giới hạn?', `${appName} sẽ bị xóa khỏi danh sách đã chọn.`, [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => removeAppLimitRule(packageName).then(() => navigation.goBack()),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={20} color={colors.text} /></Pressable>
          <Text style={styles.title}>Giới hạn ứng dụng</Text>
        </View>

        <View style={styles.prototype}>
          <Shield size={17} color={colors.primaryButton} />
          <Text style={styles.prototypeText}>Quy tắc thật được lưu local và đối chiếu với UsageStats. Trong giai đoạn này hệ thống chỉ cảnh báo, không tự động khóa app.</Text>
        </View>

        <View style={styles.identity}>
          <View style={styles.appIcon}><Smartphone size={24} color={colors.primaryButton} /></View>
          <View style={styles.identityText}>
            <Text style={styles.appName}>{appName}</Text>
            <Text numberOfLines={1} style={styles.packageName}>{packageName}</Text>
          </View>
          <Pressable accessibilityRole="switch" accessibilityState={{checked: enabled}} style={[styles.toggle, enabled && styles.toggleOn]} onPress={() => setEnabled(value => !value)}>
            <View style={[styles.thumb, enabled && styles.thumbOn]} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giới hạn hằng ngày</Text>
          <View style={styles.inputRow}>
            <TextInput value={limit} onChangeText={setLimit} keyboardType="number-pad" maxLength={4} style={styles.numberInput} />
            <Text style={styles.unit}>phút/ngày</Text>
          </View>
          <View style={styles.presets}>
            {[15, 30, 60, 120].map(value => (
              <Pressable key={value} style={[styles.preset, limit === String(value) && styles.presetActive]} onPress={() => setLimit(String(value))}>
                <Text style={[styles.presetText, limit === String(value) && styles.presetTextActive]}>{value}m</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ngày áp dụng</Text>
          <View style={styles.days}>
            {DAYS.map((label, index) => (
              <Pressable key={label} style={[styles.day, activeDays.includes(index) && styles.dayActive]} onPress={() => toggleDay(index)}>
                <Text style={[styles.dayText, activeDays.includes(index) && styles.dayTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Khung giờ áp dụng</Text>
          <View style={styles.timeRow}>
            <Clock3 size={18} color={colors.primaryButton} />
            <TextInput value={startTime} onChangeText={setStartTime} maxLength={5} placeholder="00:00" style={styles.timeInput} />
            <Text style={styles.to}>đến</Text>
            <TextInput value={endTime} onChangeText={setEndTime} maxLength={5} placeholder="23:59" style={styles.timeInput} />
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={save}><Text style={styles.saveText}>Lưu quy tắc</Text></Pressable>
        <Pressable style={styles.deleteButton} onPress={remove}><Trash2 size={16} color={colors.error} /><Text style={styles.deleteText}>Xóa khỏi danh sách giới hạn</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20, paddingBottom: 30, rowGap: 14},
  header: {flexDirection: 'row', alignItems: 'center', columnGap: 12},
  back: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.surfaceSoft},
  title: {color: colors.text, fontSize: 20, fontWeight: '800'},
  prototype: {padding: 13, flexDirection: 'row', alignItems: 'flex-start', columnGap: 9, borderRadius: 14, backgroundColor: colors.surfaceSoft},
  prototypeText: {flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18},
  identity: {padding: 15, flexDirection: 'row', alignItems: 'center', columnGap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface},
  appIcon: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.surfaceSoft},
  identityText: {flex: 1}, appName: {color: colors.text, fontSize: 16, fontWeight: '800'}, packageName: {marginTop: 3, color: colors.textSecondary, fontSize: 10},
  toggle: {width: 50, height: 29, padding: 3, justifyContent: 'center', borderRadius: 15, backgroundColor: '#C8D4C0'}, toggleOn: {backgroundColor: colors.primaryButton},
  thumb: {width: 23, height: 23, borderRadius: 12, backgroundColor: '#FFFFFF'}, thumbOn: {alignSelf: 'flex-end'},
  card: {padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface},
  cardTitle: {marginBottom: 13, color: colors.text, fontSize: 15, fontWeight: '700'},
  inputRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 10},
  numberInput: {minWidth: 85, paddingVertical: 5, color: colors.primary, fontSize: 30, fontWeight: '800', textAlign: 'center'}, unit: {color: colors.textSecondary, fontSize: 13},
  presets: {marginTop: 12, flexDirection: 'row', columnGap: 7}, preset: {flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 14}, presetActive: {borderColor: colors.primaryButton, backgroundColor: colors.surfaceSoft}, presetText: {color: colors.textSecondary, fontSize: 12, fontWeight: '600'}, presetTextActive: {color: colors.primaryButton},
  days: {flexDirection: 'row', columnGap: 5}, day: {height: 35, flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 9}, dayActive: {borderColor: colors.primaryButton, backgroundColor: colors.primaryButton}, dayText: {color: colors.textSecondary, fontSize: 10, fontWeight: '700'}, dayTextActive: {color: '#FFFFFF'},
  timeRow: {flexDirection: 'row', alignItems: 'center', columnGap: 9}, timeInput: {flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 11, color: colors.text, textAlign: 'center'}, to: {color: colors.textSecondary, fontSize: 12},
  saveButton: {height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: colors.primaryButton}, saveText: {color: '#FFFFFF', fontSize: 15, fontWeight: '700'},
  deleteButton: {height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8, borderWidth: 1, borderColor: colors.error, borderRadius: 25}, deleteText: {color: colors.error, fontSize: 14, fontWeight: '700'},
});
