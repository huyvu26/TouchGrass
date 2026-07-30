import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Lock, Star, X} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ScreenHeader} from '../../components/ScreenHeader';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Badges'>;

const BADGES = [
  {id: 1, emoji: '🥾', name: 'Người đi bộ', description: 'Đi bộ tổng cộng 50km', progress: '50/50 km', earned: true, locked: false},
  {id: 2, emoji: '🧭', name: 'Người khám phá', description: 'Hoàn thành 10 nhiệm vụ', progress: '10/10 nhiệm vụ', earned: true, locked: false},
  {id: 3, emoji: '🌱', name: 'Chạm vào cỏ', description: 'Ra ngoài 7 ngày liên tiếp', progress: '7/7 ngày', earned: true, locked: false},
  {id: 4, emoji: '🦅', name: 'Ranger', description: 'Đi bộ 100km tổng cộng', progress: '100/100 km', earned: true, locked: false},
  {id: 5, emoji: '📸', name: 'Nhiếp ảnh gia', description: 'Chụp 50 loại cây', progress: '42/50 loại cây', earned: false, locked: false},
  {id: 6, emoji: '🏔️', name: 'Leo núi', description: 'Đi bộ 200km tổng cộng', progress: '124.5/200 km', earned: false, locked: true},
  {id: 7, emoji: '🌟', name: 'Siêu sao', description: 'Đạt Level 10', progress: 'Lvl 5/10', earned: false, locked: true},
  {id: 8, emoji: '🌏', name: 'Nhà tự nhiên', description: 'Hoàn thành 100 nhiệm vụ', progress: '43/100 nhiệm vụ', earned: false, locked: true},
] as const;

export function BadgeScreen({navigation}: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = BADGES.find(item => item.id === selectedId);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Bộ sưu tập huy hiệu"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.levelCard}>
          <View style={styles.starBox}>
            <Star
              size={26}
              color={colors.primary}
              fill={colors.primary}
            />
          </View>
          <View style={styles.levelContent}>
            <Text style={styles.levelTitle}>Lvl 5 Explorer</Text>
            <View style={styles.levelTrack}>
              <View style={styles.levelProgress} />
            </View>
            <Text style={styles.levelText}>1,450 / 2,000 XP</Text>
          </View>
          <Text style={styles.badgeCount}>4/8</Text>
        </View>

        <Text style={styles.sectionTitle}>Huy hiệu của bạn</Text>
        <View style={styles.grid}>
          {BADGES.map(badge => (
            <Pressable
              key={badge.id}
              style={[
                styles.badgeCard,
                badge.locked && styles.badgeLocked,
              ]}
              onPress={() => setSelectedId(badge.id)}>
              <View
                style={[
                  styles.badgeIcon,
                  badge.earned && styles.badgeEarned,
                ]}>
                <Text style={styles.badgeEmoji}>
                  {badge.emoji}
                </Text>
                {badge.locked ? (
                  <View style={styles.lockBadge}>
                    <Lock size={11} color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
              <Text style={styles.badgeName} numberOfLines={1}>
                {badge.name}
              </Text>
              <Text style={styles.badgeDescription} numberOfLines={2}>
                {badge.description}
              </Text>
              <Text
                style={[
                  styles.badgeProgress,
                  badge.earned && styles.badgeProgressDone,
                ]}>
                {badge.progress}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(selected)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Pressable
              style={styles.modalClose}
              onPress={() => setSelectedId(null)}>
              <X size={20} color={colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalEmoji}>{selected?.emoji}</Text>
            <Text style={styles.modalTitle}>{selected?.name}</Text>
            <Text style={styles.modalDescription}>
              {selected?.description}
            </Text>
            <View style={styles.modalProgress}>
              <Text style={styles.modalProgressText}>
                {selected?.progress}
              </Text>
            </View>
            <Text style={styles.modalStatus}>
              {selected?.earned
                ? 'Đã mở khóa 🎉'
                : selected?.locked
                  ? 'Tiếp tục cố gắng để mở khóa'
                  : 'Sắp đạt được rồi!'}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {paddingHorizontal: 20, paddingBottom: 24},
  levelCard: {marginBottom: 18, padding: 16, flexDirection: 'row', alignItems: 'center', columnGap: 13, borderRadius: 20, backgroundColor: colors.primary},
  starBox: {width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: colors.lime},
  levelContent: {flex: 1},
  levelTitle: {color: '#FFFFFF', fontSize: 16, fontWeight: '800'},
  levelTrack: {height: 8, marginTop: 7, overflow: 'hidden', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)'},
  levelProgress: {width: '72.5%', height: '100%', borderRadius: 4, backgroundColor: colors.lime},
  levelText: {marginTop: 4, color: 'rgba(255,255,255,0.58)', fontSize: 10},
  badgeCount: {color: colors.lime, fontSize: 14, fontWeight: '800'},
  sectionTitle: {marginBottom: 12, color: colors.text, fontSize: 15, fontWeight: '700'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  badgeCard: {width: '48.5%', padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface},
  badgeLocked: {opacity: 0.62},
  badgeIcon: {width: 64, height: 64, marginBottom: 9, position: 'relative', alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: colors.surfaceSoft},
  badgeEarned: {borderWidth: 2, borderColor: colors.lime, backgroundColor: '#EFF9E6'},
  badgeEmoji: {fontSize: 31},
  lockBadge: {position: 'absolute', right: -2, bottom: -2, width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.textSecondary},
  badgeName: {color: colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center'},
  badgeDescription: {height: 32, marginTop: 4, color: colors.textSecondary, fontSize: 10, lineHeight: 15, textAlign: 'center'},
  badgeProgress: {marginTop: 7, color: colors.textSecondary, fontSize: 10, fontWeight: '600'},
  badgeProgressDone: {color: colors.primaryButton},
  modalBackdrop: {flex: 1, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21,66,18,0.45)'},
  modalCard: {width: '100%', padding: 24, alignItems: 'center', borderRadius: 26, backgroundColor: colors.surface},
  modalClose: {position: 'absolute', top: 14, right: 14, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: colors.surfaceSoft},
  modalEmoji: {fontSize: 58},
  modalTitle: {marginTop: 10, color: colors.text, fontSize: 21, fontWeight: '800'},
  modalDescription: {marginTop: 6, color: colors.textSecondary, fontSize: 13, textAlign: 'center'},
  modalProgress: {marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.surfaceSoft},
  modalProgressText: {color: colors.primaryButton, fontSize: 13, fontWeight: '700'},
  modalStatus: {marginTop: 12, color: colors.primary, fontSize: 13, fontWeight: '600'},
});
