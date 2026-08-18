import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ChevronLeft, ChevronRight, Lock, Search, ShieldAlert, Smartphone} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import {ToggleSwitch} from '../../components/ToggleSwitch';
import type {AuthStackParamList} from '../../navigation/types';
import type {AppInfo, AppUsageInfo} from '../../native/usageStats';
import {
  getSelectableApps,
  getTodayUsage,
  isUsageAccessGranted,
  openUsageAccessSettings,
} from '../../services/usageStatsService';
import {
  getAppLimitRules,
  type AppLimitRule,
} from '../../storage/appControlStorage';
import {accessibilityMonitor} from '../../native/accessibilityMonitor';
import {
  isAppControlEnabled,
  refreshAppControlRulesFromBackend,
  removeAndSyncAppControlRule,
  saveAndSyncAppControlRule,
  setAppControlEnabled,
  syncAppControlRules,
} from '../../services/appControlService';

type Props = NativeStackScreenProps<AuthStackParamList, 'AppManagement'>;
type FilterKey = 'selected' | 'all';

export function AppManagementScreen({navigation}: Props) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [rules, setRules] = useState<AppLimitRule[]>([]);
  const [usage, setUsage] = useState<AppUsageInfo[]>([]);
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  const [hasAccessibility, setHasAccessibility] = useState(false);
  const [controlEnabled, setControlEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('selected');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [granted, accessibility, enabled] = await Promise.all([
        isUsageAccessGranted(),
        accessibilityMonitor.isEnabled(),
        isAppControlEnabled(),
      ]);
      setHasUsageAccess(granted);
      setHasAccessibility(accessibility);
      setControlEnabled(enabled);
      const [installed, storedRules, todayUsage] = await Promise.all([
        getSelectableApps(),
        refreshAppControlRulesFromBackend().catch(() => getAppLimitRules()),
        granted ? getTodayUsage() : Promise.resolve([]),
      ]);
      setApps(installed);
      setRules(storedRules);
      setUsage(todayUsage);
      await syncAppControlRules();
    } catch (error) {
      Alert.alert('Không thể đọc ứng dụng', error instanceof Error ? error.message : 'Native module không khả dụng.');
    } finally {
      setLoading(false);
    }
  }, []);

  async function toggleAppControl() {
    if (controlEnabled) {
      await setAppControlEnabled(false);
      setControlEnabled(false);
      return;
    }
    if (!hasAccessibility) {
      Alert.alert('Cần Accessibility', 'Hãy bật dịch vụ “Theo dõi ứng dụng Touch Grass” để phát hiện app đang mở.', [
        {text: 'Hủy', style: 'cancel'},
        {text: 'Mở cài đặt', onPress: accessibilityMonitor.openSettings},
      ]);
      return;
    }
    if (rules.length === 0) {
      Alert.alert('Chưa chọn ứng dụng', 'Hãy chọn ít nhất một ứng dụng trước khi bật App Control.');
      return;
    }
    await syncAppControlRules();
    await setAppControlEnabled(true);
    setControlEnabled(true);
  }

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return;
      refreshTimer = setTimeout(load, 300);
    });
    return () => {
      subscription.remove();
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [load]);

  const ruleByPackage = useMemo(
    () => new Map(rules.map(rule => [rule.packageName, rule])),
    [rules],
  );
  const usageByPackage = useMemo(
    () => new Map(usage.map(item => [item.packageName, item])),
    [usage],
  );
  const filtered = useMemo(() => apps.filter(app => {
    const matchesSearch = app.appName.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (filter === 'all' || ruleByPackage.has(app.packageName));
  }), [apps, filter, ruleByPackage, search]);

  async function toggleApp(app: AppInfo) {
    if (app.isSensitive) {
      Alert.alert(
        'Ứng dụng nhạy cảm được bảo vệ',
        'Android phân loại đây là ứng dụng tài chính. Touch Grass mặc định không cho thêm ứng dụng này vào giới hạn.',
      );
      return;
    }
    const existing = ruleByPackage.get(app.packageName);
    if (existing) {
      try {
        await removeAndSyncAppControlRule(app.packageName);
        await load();
      } catch (error) {
        Alert.alert('Không thể bỏ giới hạn', error instanceof Error ? error.message : 'Vui lòng thử lại.');
      }
      return;
    }
    Alert.alert(
      'Xác nhận chọn ứng dụng',
      `Sau khi chọn, ${app.appName} sẽ bị khóa ngay khi App Control đang bật. Bạn có thể dùng Leaf Point để mua thời gian sử dụng tạm thời.`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Chọn ứng dụng',
          onPress: () => saveAndSyncAppControlRule({
            packageName: app.packageName,
            appName: app.appName,
            enabled: true,
          }).then(async () => {
            if (hasAccessibility) {
              await setAppControlEnabled(true);
            }
            await load();
          }).catch(error => Alert.alert(
            'Không thể thêm giới hạn',
            error instanceof Error ? error.message : 'Vui lòng thử lại.',
          )),
        },
      ],
    );
  }

  function formatUsage(packageName: string) {
    if (!hasUsageAccess) return 'Cần cấp Usage Access';
    const minutes = Math.floor((usageByPackage.get(packageName)?.totalTimeInForegroundMs ?? 0) / 60000);
    return `${minutes} phút hôm nay`;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={20} color={colors.text} /></Pressable>
        <Text style={styles.title}>Quản lý ứng dụng</Text>
      </View>

      <View style={styles.banner}>
        <ShieldAlert size={17} color={colors.primaryButton} />
        <Text style={styles.bannerText}>App Control chỉ khóa ứng dụng bạn chủ động chọn. Settings, launcher, Phone, SMS và ứng dụng hệ thống luôn được bảo vệ.</Text>
      </View>

      <View style={styles.controlCard}>
        <View style={styles.permissionInfo}>
          <Text style={styles.controlTitle}>Khóa ứng dụng đã chọn</Text>
          <Text style={styles.permissionText}>
            {controlEnabled ? 'Đang hoạt động' : 'Đang tắt'} · Theo dõi ứng dụng {hasAccessibility ? 'OK' : 'chưa bật'} · Thống kê {hasUsageAccess ? 'OK' : 'chưa cấp'}
          </Text>
        </View>
        <ToggleSwitch value={controlEnabled} onValueChange={toggleAppControl} />
      </View>

      {!hasUsageAccess ? (
        <Pressable style={styles.permissionCard} onPress={openUsageAccessSettings}>
          <Lock size={18} color={colors.error} />
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>Usage Access chưa được cấp</Text>
            <Text style={styles.permissionText}>Mở cài đặt Android để xem thời lượng sử dụng thật.</Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </Pressable>
      ) : null}

      {!hasAccessibility ? (
        <Pressable style={styles.permissionCard} onPress={accessibilityMonitor.openSettings}>
          <ShieldAlert size={18} color={colors.error} />
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>Accessibility chưa được bật</Text>
            <Text style={styles.permissionText}>Bật “Theo dõi ứng dụng Touch Grass” để phát hiện ứng dụng đang mở.</Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </Pressable>
      ) : null}

      <View style={styles.searchBox}>
        <Search size={17} color={colors.textSecondary} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Tìm ứng dụng trên thiết bị…" placeholderTextColor={colors.placeholder} style={styles.input} />
      </View>
      <View style={styles.filters}>
        {(['selected', 'all'] as const).map(item => (
          <Pressable key={item} style={[styles.filter, filter === item && styles.filterActive]} onPress={() => setFilter(item)}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item === 'selected' ? 'Đã chọn' : 'Tất cả ứng dụng'}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? <Text style={styles.empty}>Đang đọc danh sách từ Android…</Text> : null}
        {!loading && filtered.length === 0 ? <Text style={styles.empty}>{filter === 'selected' ? 'Bạn chưa chọn ứng dụng nào.' : 'Không tìm thấy ứng dụng phù hợp.'}</Text> : null}
        {filtered.map(app => {
          const rule = ruleByPackage.get(app.packageName);
          return (
            <View key={app.packageName} style={styles.appCard}>
              <View style={styles.appIcon}><Smartphone size={22} color={colors.primaryButton} /></View>
              <Pressable style={styles.appInfo} onPress={() => navigation.navigate('AppLimit', {packageName: app.packageName, appName: app.appName})}>
                <Text style={styles.appName}>{app.appName}</Text>
                <Text numberOfLines={1} style={styles.packageName}>{app.packageName}</Text>
                <Text style={[styles.usage, rule?.enabled && styles.exceeded]}>
                  {formatUsage(app.packageName)}{rule ? rule.enabled ? ' · Đang khóa' : ' · Đã tạm tắt' : ''}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{checked: Boolean(rule)}}
                style={[styles.selectButton, rule && styles.selectButtonActive]}
                onPress={() => toggleApp(app)}>
                <Text style={[styles.selectText, rule && styles.selectTextActive]}>{rule ? 'Đã chọn' : 'Chọn'}</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  header: {paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', alignItems: 'center', columnGap: 12},
  back: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.surfaceSoft},
  title: {color: colors.text, fontSize: 20, fontWeight: '800'},
  banner: {margin: 20, marginBottom: 12, padding: 13, flexDirection: 'row', alignItems: 'flex-start', columnGap: 9, borderRadius: 14, backgroundColor: colors.surfaceSoft},
  bannerText: {flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18},
  permissionCard: {marginHorizontal: 20, marginBottom: 12, padding: 14, flexDirection: 'row', alignItems: 'center', columnGap: 10, borderWidth: 1, borderColor: colors.error, borderRadius: 15, backgroundColor: colors.surface},
  permissionInfo: {flex: 1}, permissionTitle: {color: colors.error, fontSize: 13, fontWeight: '700'}, permissionText: {marginTop: 2, color: colors.textSecondary, fontSize: 11},
  controlCard: {marginHorizontal: 20, marginBottom: 12, padding: 14, flexDirection: 'row', alignItems: 'center', columnGap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: colors.surface},
  controlTitle: {color: colors.text, fontSize: 14, fontWeight: '700'},
  searchBox: {height: 46, marginHorizontal: 20, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', columnGap: 9, borderRadius: 14, backgroundColor: colors.inputBackground},
  input: {flex: 1, color: colors.text, fontSize: 14},
  filters: {marginHorizontal: 20, marginTop: 12, flexDirection: 'row', columnGap: 8},
  filter: {paddingHorizontal: 15, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.inputBackground},
  filterActive: {backgroundColor: colors.primaryButton}, filterText: {color: colors.textSecondary, fontSize: 12, fontWeight: '600'}, filterTextActive: {color: '#FFFFFF'},
  list: {paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28, rowGap: 10},
  empty: {paddingVertical: 36, color: colors.textSecondary, textAlign: 'center'},
  appCard: {padding: 13, flexDirection: 'row', alignItems: 'center', columnGap: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 17, backgroundColor: colors.surface},
  appIcon: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.surfaceSoft},
  appInfo: {flex: 1}, appName: {color: colors.text, fontSize: 14, fontWeight: '700'}, packageName: {marginTop: 2, color: colors.textSecondary, fontSize: 10},
  usage: {marginTop: 4, color: colors.primaryButton, fontSize: 11, fontWeight: '600'}, exceeded: {color: colors.error},
  selectButton: {paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.primaryButton, borderRadius: 16}, selectButtonActive: {backgroundColor: colors.primaryButton},
  selectText: {color: colors.primaryButton, fontSize: 11, fontWeight: '700'}, selectTextActive: {color: '#FFFFFF'},
});
