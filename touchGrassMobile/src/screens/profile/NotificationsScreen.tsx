import React, {useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ScreenHeader} from '../../components/ScreenHeader';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Notifications'
>;
type Tab = 'all' | 'task' | 'achievement';

const NOTIFICATIONS = [
  {id: 1, group: 'today', tab: 'achievement', icon: '🏅', title: 'Huy hiệu mới!', description: 'Bạn vừa mở khóa “Người đi bộ” — 50km đã đi!', time: '5 phút trước', unread: true, action: 'Xem huy hiệu'},
  {id: 2, group: 'today', tab: 'task', icon: '⏰', title: 'Nhiệm vụ sắp hết hạn', description: '“Tìm màu xanh” còn 2 giờ để hoàn thành.', time: '32 phút trước', unread: true, action: 'Làm ngay'},
  {id: 3, group: 'today', tab: 'task', icon: '🔓', title: 'Mở khóa thành công!', description: 'Bạn nhận được +15 phút sử dụng Instagram.', time: '1 giờ trước', unread: true, action: null},
  {id: 4, group: 'before', tab: 'achievement', icon: '📊', title: 'Báo cáo tuần sẵn sàng', description: 'Tuần này bạn tiết kiệm 6h 20p thời gian màn hình.', time: 'Hôm qua, 8:00 SA', unread: false, action: 'Xem báo cáo'},
  {id: 5, group: 'before', tab: 'all', icon: '⚠️', title: 'Quyền Usage Stats bị tắt', description: 'Touch Grass cần quyền này để theo dõi ứng dụng.', time: 'Hôm qua, 3:15 CH', unread: false, action: 'Cấp quyền'},
] as const;

export function NotificationsScreen({navigation}: Props) {
  const [tab, setTab] = useState<Tab>('all');

  const filtered = useMemo(
    () =>
      tab === 'all'
        ? NOTIFICATIONS
        : NOTIFICATIONS.filter(item => item.tab === tab),
    [tab],
  );

  const today = filtered.filter(item => item.group === 'today');
  const before = filtered.filter(item => item.group === 'before');

  function actionFor(label: string | null) {
    if (label === 'Xem huy hiệu') {
      navigation.navigate('Badges');
    } else if (label === 'Làm ngay') {
      navigation.navigate('TaskHub');
    } else if (label === 'Xem báo cáo') {
      navigation.navigate('Statistics');
    } else if (label === 'Cấp quyền') {
      navigation.navigate('Permission');
    }
  }

  function renderGroup(
    title: string,
    items: typeof filtered,
  ) {
    if (items.length === 0) {
      return null;
    }

    return (
      <View style={styles.group}>
        <Text style={styles.groupTitle}>{title}</Text>
        <View style={styles.groupList}>
          {items.map(item => (
            <View
              key={item.id}
              style={[
                styles.card,
                item.unread && styles.cardUnread,
              ]}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{item.icon}</Text>
                {item.unread ? (
                  <View style={styles.unreadDot} />
                ) : null}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.description}>
                  {item.description}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.time}>{item.time}</Text>
                  {item.action ? (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => actionFor(item.action)}>
                      <Text style={styles.actionText}>
                        {item.action}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Thông báo"
        onBack={() => navigation.goBack()}
        right={
          <View style={styles.countChip}>
            <Text style={styles.countText}>3 mới</Text>
          </View>
        }
      />
      <View style={styles.tabs}>
        {(
          [
            ['all', 'Tất cả'],
            ['task', 'Nhiệm vụ'],
            ['achievement', 'Thành tựu'],
          ] as Array<[Tab, string]>
        ).map(([key, label]) => (
          <Pressable
            key={key}
            style={[
              styles.tab,
              tab === key && styles.tabActive,
            ]}
            onPress={() => setTab(key)}>
            <Text
              style={[
                styles.tabText,
                tab === key && styles.tabTextActive,
              ]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {renderGroup('Hôm nay', today)}
        {renderGroup('Trước đó', before)}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>
              Chưa có thông báo nào
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  countChip: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: colors.primaryButton},
  countText: {color: '#FFFFFF', fontSize: 11, fontWeight: '700'},
  tabs: {marginHorizontal: 20, marginBottom: 14, padding: 4, flexDirection: 'row', borderRadius: 14, backgroundColor: colors.inputBackground},
  tab: {height: 34, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10},
  tabActive: {backgroundColor: colors.surface, elevation: 2},
  tabText: {color: colors.textSecondary, fontSize: 12},
  tabTextActive: {color: colors.primary, fontWeight: '700'},
  content: {paddingHorizontal: 20, paddingBottom: 24, rowGap: 16},
  group: {},
  groupTitle: {marginBottom: 9, marginLeft: 4, color: colors.textSecondary, fontSize: 12, fontWeight: '700'},
  groupList: {rowGap: 10},
  card: {padding: 14, flexDirection: 'row', alignItems: 'flex-start', columnGap: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface},
  cardUnread: {borderColor: 'rgba(36,107,5,0.2)', backgroundColor: '#F0F8E8'},
  iconContainer: {width: 46, height: 46, position: 'relative', alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.surfaceSoft},
  icon: {fontSize: 22},
  unreadDot: {position: 'absolute', top: 1, right: 1, width: 10, height: 10, borderWidth: 2, borderColor: colors.background, borderRadius: 5, backgroundColor: colors.primaryButton},
  cardContent: {flex: 1},
  cardTitle: {color: colors.text, fontSize: 13, fontWeight: '700'},
  description: {marginTop: 3, color: colors.textSecondary, fontSize: 12, lineHeight: 18},
  cardFooter: {marginTop: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  time: {color: colors.textSecondary, fontSize: 10},
  actionButton: {paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14, backgroundColor: colors.primaryButton},
  actionText: {color: '#FFFFFF', fontSize: 10, fontWeight: '700'},
  empty: {paddingTop: 80, alignItems: 'center'},
  emptyIcon: {fontSize: 48},
  emptyTitle: {marginTop: 12, color: colors.text, fontSize: 17, fontWeight: '700'},
});
