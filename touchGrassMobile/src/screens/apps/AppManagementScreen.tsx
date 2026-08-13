import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
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
  removeAppLimitRule,
  saveAppLimitRule,
  type AppLimitRule,
} from '../../storage/appControlStorage';

type Props = NativeStackScreenProps<AuthStackParamList, 'AppManagement'>;
type FilterKey = 'selected' | 'all';

export function AppManagementScreen({navigation}: Props) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [rules, setRules] = useState<AppLimitRule[]>([]);
  const [usage, setUsage] = useState<AppUsageInfo[]>([]);
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('selected');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const granted = await isUsageAccessGranted();
      setHasUsageAccess(granted);
      const [installed, storedRules, todayUsage] = await Promise.all([
        getSelectableApps(),
        getAppLimitRules(),
        granted ? getTodayUsage() : Promise.resolve([]),
      ]);
      setApps(installed);
      setRules(storedRules);
      setUsage(todayUsage);
    } catch (error) {
      Alert.alert('Không thể đọc ứng dụng', error instanceof Error ? error.message : 'Native module không khả dụng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

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
      await removeAppLimitRule(app.packageName);
      await load();
      return;
    }
    Alert.alert(
      'Xác nhận chọn ứng dụng',
      `Chỉ thêm ${app.appName} nếu bạn thực sự muốn theo dõi giới hạn của ứng dụng này. Touch Grass hiện chưa tự động khóa ứng dụng.`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Chọn ứng dụng',
          onPress: () => saveAppLimitRule({
            packageName: app.packageName,
            appName: app.appName,
            enabled: true,
            dailyLimitMinutes: 30,
            activeDays: [0, 1, 2, 3, 4, 5, 6],
            startTime: '00:00',
            endTime: '23:59',
          }).then(load),
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
        <Text style={styles.bannerText}>Giai đoạn an toàn: chỉ đọc thời lượng và cảnh báo bên trong Touch Grass. Ứng dụng chưa tự động khóa app khác.</Text>
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
          const usedMinutes = Math.floor((usageByPackage.get(app.packageName)?.totalTimeInForegroundMs ?? 0) / 60000);
          const exceeded = Boolean(rule?.enabled && usedMinutes >= rule.dailyLimitMinutes);
          return (
            <View key={app.packageName} style={styles.appCard}>
              <View style={styles.appIcon}><Smartphone size={22} color={colors.primaryButton} /></View>
              <Pressable style={styles.appInfo} onPress={() => navigation.navigate('AppLimit', {packageName: app.packageName, appName: app.appName})}>
                <Text style={styles.appName}>{app.appName}</Text>
                <Text numberOfLines={1} style={styles.packageName}>{app.packageName}</Text>
                <Text style={[styles.usage, exceeded && styles.exceeded]}>{formatUsage(app.packageName)}{rule ? ` · Giới hạn ${rule.dailyLimitMinutes} phút` : ''}</Text>
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
