import React, {useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Bell,
  Camera,
  ChevronLeft,
  ChevronRight,
  Lock,
  MessageCircle,
  Music2,
  Plus,
  Search,
} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'AppManagement'
>;

const MANAGED_APPS = [
  {
    name: 'TikTok',
    category: 'Giải trí',
    limit: '20 phút/ngày',
    enabled: true,
  },
  {
    name: 'Facebook',
    category: 'Mạng xã hội',
    limit: '30 phút/ngày',
    enabled: true,
  },
  {
    name: 'Instagram',
    category: 'Mạng xã hội',
    limit: '25 phút/ngày',
    enabled: true,
  },
  {
    name: 'YouTube',
    category: 'Video',
    limit: '45 phút/ngày',
    enabled: false,
  },
  {
    name: 'Messenger',
    category: 'Nhắn tin',
    limit: '15 phút/ngày',
    enabled: true,
  },
] as const;

type FilterKey = 'limited' | 'all';

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
      hitSlop={5}
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

function AppIcon({name}: {name: string}) {
  if (name === 'TikTok') {
    return (
      <View style={[styles.appIcon, styles.tiktokIcon]}>
        <Music2 size={25} color="#FFFFFF" />
      </View>
    );
  }

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
        <Camera size={24} color="#FFFFFF" />
      </View>
    );
  }

  if (name === 'YouTube') {
    return (
      <View style={[styles.appIcon, styles.youtubeIcon]}>
        <Svg width={27} height={27} viewBox="0 0 24 24">
          <Path
            d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z"
            fill="#FFFFFF"
          />
        </Svg>
      </View>
    );
  }

  return (
    <View style={[styles.appIcon, styles.messengerIcon]}>
      <MessageCircle
        size={25}
        color="#FFFFFF"
        fill="#FFFFFF"
      />
    </View>
  );
}

export function AppManagementScreen({navigation}: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('limited');
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(
      MANAGED_APPS.map(app => [app.name, app.enabled]),
    ),
  );

  const filteredApps = useMemo(
    () =>
      MANAGED_APPS.filter(app => {
        const matchesSearch = app.name
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        const matchesFilter =
          filter === 'all' || toggles[app.name];

        return matchesSearch && matchesFilter;
      }),
    [filter, search, toggles],
  );

  const limitedCount = MANAGED_APPS.filter(
    app => toggles[app.name],
  ).length;

  function toggleApp(name: string) {
    setToggles(current => ({
      ...current,
      [name]: !current[name],
    }));
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={styles.circleButton}
            onPress={() => navigation.goBack()}>
            <ChevronLeft size={20} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>Quản lý ứng dụng</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Thông báo"
            hitSlop={8}
            onPress={() =>
              Alert.alert(
                'Thông báo',
                'Màn hình thông báo sẽ được triển khai sau.',
              )
            }>
            <Bell size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Search
            size={17}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            value={search}
            placeholder="Tìm ứng dụng..."
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          <Pressable
            style={[
              styles.filterChip,
              filter === 'limited' && styles.filterChipActive,
            ]}
            onPress={() => setFilter('limited')}>
            <Text
              style={[
                styles.filterText,
                filter === 'limited' &&
                  styles.filterTextActive,
              ]}>
              Đang giới hạn
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterChip,
              filter === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setFilter('all')}>
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.filterTextActive,
              ]}>
              Tất cả ứng dụng
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.summary}>
        <Lock size={15} color={colors.primaryButton} />
        <Text style={styles.summaryText}>
          {limitedCount} ứng dụng đang được giới hạn
        </Text>
      </View>

      <View style={styles.prototypeBanner}>
        <Text style={styles.prototypeText}>
          PROTOTYPE · Danh sách và giới hạn bên dưới chỉ dùng để minh họa UI,
          chưa đọc ứng dụng đã cài hoặc khóa ứng dụng thật.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        {filteredApps.map(app => (
          <View key={app.name} style={styles.appCard}>
            <Pressable
              accessibilityRole="button"
              style={styles.appMain}
              onPress={() =>
                navigation.navigate('AppLimit', {
                  appName: app.name,
                })
              }>
              <AppIcon name={app.name} />

              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.name}</Text>
                <Text style={styles.appMeta}>
                  {app.category} · {app.limit}
                </Text>
              </View>
            </Pressable>

            <ToggleSwitch
              enabled={Boolean(toggles[app.name])}
              label={`Giới hạn ${app.name}`}
              onToggle={() => toggleApp(app.name)}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Mở chi tiết ${app.name}`}
              hitSlop={6}
              onPress={() =>
                navigation.navigate('AppLimit', {
                  appName: app.name,
                })
              }>
              <ChevronRight
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        ))}

        {filteredApps.length === 0 ? (
          <Text style={styles.emptyText}>
            Không tìm thấy ứng dụng nào.
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          style={({pressed}) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            Alert.alert(
              'Thêm ứng dụng',
              'Danh sách ứng dụng cài đặt sẽ được kết nối sau.',
            )
          }>
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>
            Thêm ứng dụng
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  circleButton: {
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
  searchContainer: {
    height: 46,
    marginBottom: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.inputBackground,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    columnGap: 8,
  },
  filterChip: {
    height: 34,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 17,
  },
  filterChipActive: {
    borderColor: colors.primaryButton,
    backgroundColor: colors.surfaceSoft,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.primaryButton,
  },
  summary: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    borderRadius: 14,
    backgroundColor: colors.surfaceSoft,
  },
  summaryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    rowGap: 10,
  },
  appCard: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  appMain: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  appIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  tiktokIcon: {
    backgroundColor: '#010101',
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
  },
  facebookLetter: {
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 37,
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
  appInfo: {
    minWidth: 0,
    flex: 1,
  },
  appName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  appMeta: {
    marginTop: 2,
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
  emptyText: {
    paddingVertical: 40,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  prototypeBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 11,
    borderRadius: 12,
    backgroundColor: colors.surfaceSoft,
  },
  prototypeText: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primaryButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    borderRadius: 26,
    backgroundColor: colors.primaryButton,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
});
