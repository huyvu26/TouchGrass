import React, {useState} from 'react';
import {
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
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'History'>;
type Status = 'done' | 'invalid' | 'cancelled';
type Filter = 'all' | Status;

const HISTORY = [
  {id: 1, emoji: '🌅', title: 'Đi dạo buổi sáng', type: 'Đi bộ', date: 'Hôm nay, 7:20 SA', duration: '28 phút', xp: '+50 XP', lp: '+10 LP', status: 'done'},
  {id: 2, emoji: '📸', title: 'Chụp ảnh cây xanh', type: 'Chụp ảnh', date: 'Hôm nay, 6:55 SA', duration: '5 phút', xp: '+35 XP', lp: '+8 LP', status: 'done'},
  {id: 3, emoji: '☀️', title: 'Rời khỏi màn hình', type: 'Nghỉ ngơi', date: 'Hôm qua, 3:10 CH', duration: '30 phút', xp: '0 XP', lp: '0 LP', status: 'invalid'},
  {id: 4, emoji: '🦋', title: 'Quan sát côn trùng', type: 'Chụp ảnh', date: 'Hôm qua, 10:00 SA', duration: '—', xp: '0 XP', lp: '0 LP', status: 'cancelled'},
  {id: 5, emoji: '🏆', title: 'Thám hiểm công viên', type: 'Đi bộ', date: 'T6, 26/07', duration: '62 phút', xp: '+150 XP', lp: '+40 LP', status: 'done'},
  {id: 6, emoji: '🌿', title: 'Tìm màu xanh', type: 'Chụp ảnh', date: 'T5, 25/07', duration: '12 phút', xp: '+35 XP', lp: '+7 LP', status: 'done'},
] as const;

const STATUS = {
  done: {label: 'Đã hoàn thành', color: colors.primaryButton, background: colors.surfaceSoft},
  invalid: {label: 'Không hợp lệ', color: '#B08000', background: '#FFF8E0'},
  cancelled: {label: 'Đã hủy', color: colors.error, background: colors.errorBackground},
} as const;

export function HistoryScreen({navigation}: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const items =
    filter === 'all'
      ? HISTORY
      : HISTORY.filter(item => item.status === filter);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Lịch sử hoạt động"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.filters}>
        {(
          [
            ['all', `Tất cả · ${HISTORY.length}`],
            ['done', '✅ 4'],
            ['invalid', '⚠️ 1'],
            ['cancelled', '✕ 1'],
          ] as Array<[Filter, string]>
        ).map(([key, label]) => (
          <Pressable
            key={key}
            style={[
              styles.filter,
              filter === key && styles.filterActive,
            ]}
            onPress={() => setFilter(key)}>
            <Text
              style={[
                styles.filterText,
                filter === key && styles.filterTextActive,
              ]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {items.map(item => {
          const status = STATUS[item.status];

          return (
            <Pressable key={item.id} style={styles.card}>
              <View style={styles.emojiBox}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View
                    style={[
                      styles.status,
                      {backgroundColor: status.background},
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {color: status.color},
                      ]}>
                      {status.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.meta}>
                  {item.type} · {item.date}
                </Text>
                <View style={styles.rewardRow}>
                  {item.duration !== '—' ? (
                    <Text style={styles.duration}>
                      ⏱ {item.duration}
                    </Text>
                  ) : null}
                  {item.status === 'done' ? (
                    <>
                      <Text style={styles.xp}>{item.xp}</Text>
                      <Text style={styles.lp}>{item.lp}</Text>
                    </>
                  ) : null}
                </View>
              </View>
              <ChevronRight size={16} color={colors.textSecondary} />
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  filters: {paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', columnGap: 7},
  filter: {height: 32, paddingHorizontal: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: 16},
  filterActive: {borderColor: colors.primaryButton, backgroundColor: colors.surfaceSoft},
  filterText: {color: colors.textSecondary, fontSize: 11, fontWeight: '600'},
  filterTextActive: {color: colors.primaryButton},
  list: {paddingHorizontal: 20, paddingBottom: 20, rowGap: 10},
  card: {padding: 14, flexDirection: 'row', alignItems: 'center', columnGap: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface},
  emojiBox: {width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.surfaceSoft},
  emoji: {fontSize: 22},
  cardContent: {minWidth: 0, flex: 1},
  cardTitleRow: {marginBottom: 3, flexDirection: 'row', alignItems: 'center', columnGap: 6},
  cardTitle: {minWidth: 0, flex: 1, color: colors.text, fontSize: 13, fontWeight: '700'},
  status: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 11},
  statusText: {fontSize: 9, fontWeight: '600'},
  meta: {color: colors.textSecondary, fontSize: 11},
  rewardRow: {marginTop: 5, flexDirection: 'row', columnGap: 8},
  duration: {color: colors.textSecondary, fontSize: 10},
  xp: {color: colors.primaryButton, fontSize: 10, fontWeight: '700'},
  lp: {color: colors.primary, fontSize: 10, fontWeight: '700'},
});
