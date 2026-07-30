import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Star} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Reward'
>;

const REWARDS = [
  {icon: '⚡', value: '+50 XP', label: 'Kinh nghiệm', color: colors.lime},
  {icon: '🍃', value: '+10 LP', label: 'Leaf Points', color: '#FFFFFF'},
  {icon: '🔓', value: '+15 phút', label: 'Mở khóa', color: '#BDE8FF'},
] as const;

export function RewardScreen({navigation}: Props) {
  const [levelUp, setLevelUp] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.confetti}>
        {[
          [32, 70, colors.lime],
          [90, 120, '#FFD580'],
          [315, 85, '#BDE8FF'],
          [350, 175, colors.lime],
          [55, 260, '#BDE8FF'],
          [280, 300, '#FFD580'],
        ].map(([left, top, color], index) => (
          <View
            key={index}
            style={[
              styles.confettiDot,
              {
                left: left as number,
                top: top as number,
                backgroundColor: color as string,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        <View style={styles.chestGlow}>
          <View style={styles.chestLid}>
            <Text style={styles.gems}>● ◆ ●</Text>
          </View>
          <View style={styles.chest}>
            <View style={styles.chestBand} />
            <View style={styles.chestLock} />
          </View>
        </View>

        <Pressable
          style={styles.levelToggle}
          onPress={() => setLevelUp(value => !value)}>
          <Text style={styles.levelToggleText}>
            {levelUp ? 'Ẩn Level Up' : 'Xem Level Up'}
          </Text>
        </Pressable>

        {levelUp ? (
          <View style={styles.levelBadge}>
            <Star
              size={16}
              color={colors.primary}
              fill={colors.primary}
            />
            <Text style={styles.levelBadgeText}>
              Lvl 6 Adventurer
            </Text>
          </View>
        ) : null}

        <Text style={styles.title}>Nhiệm vụ hoàn thành!</Text>
        <Text style={styles.subtitle}>
          Tuyệt vời! Bạn đã hoàn thành{'\n'}
          “Đi dạo buổi sáng” 🌿
        </Text>

        <View style={styles.rewardRow}>
          {REWARDS.map(item => (
            <View key={item.value} style={styles.rewardCard}>
              <Text style={styles.rewardIcon}>{item.icon}</Text>
              <Text style={[styles.rewardValue, {color: item.color}]}>
                {item.value}
              </Text>
              <Text style={styles.rewardLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>Tiến độ XP</Text>
            <Text style={styles.xpValue}>1,450 / 2,000 XP</Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={styles.xpProgress} />
          </View>
          <View style={styles.xpFooter}>
            <Text style={styles.beforeText}>Trước: 1,400 XP</Text>
            <Text style={styles.addedText}>+50 XP</Text>
          </View>
        </View>

        <Pressable
          style={styles.claimButton}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.claimText}>
            Nhận phần thưởng 🎉
          </Text>
        </Pressable>
        <Pressable
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeText}>Về trang chủ</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.primary},
  confetti: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  confettiDot: {position: 'absolute', width: 9, height: 9, borderRadius: 5, opacity: 0.72},
  content: {flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center'},
  chestGlow: {width: 180, height: 150, marginBottom: 18, alignItems: 'center', justifyContent: 'flex-end', borderRadius: 90, backgroundColor: 'rgba(176,242,103,0.08)'},
  chestLid: {width: 126, height: 50, marginBottom: -8, alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 60, borderTopRightRadius: 60, backgroundColor: '#C4955A', transform: [{rotate: '-6deg'}]},
  gems: {color: colors.lime, fontSize: 20, fontWeight: '900'},
  chest: {width: 128, height: 58, alignItems: 'center', borderRadius: 10, backgroundColor: '#8B6340'},
  chestBand: {position: 'absolute', top: 22, width: '100%', height: 6, backgroundColor: '#C4A870'},
  chestLock: {width: 16, height: 20, borderRadius: 4, backgroundColor: '#C4A870'},
  levelToggle: {paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)'},
  levelToggleText: {color: 'rgba(255,255,255,0.62)', fontSize: 11},
  levelBadge: {marginTop: 8, paddingHorizontal: 18, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', columnGap: 7, borderRadius: 18, backgroundColor: colors.lime},
  levelBadgeText: {color: colors.primary, fontSize: 13, fontWeight: '800'},
  title: {marginTop: 12, color: '#FFFFFF', fontSize: 29, fontWeight: '800', textAlign: 'center'},
  subtitle: {marginTop: 7, marginBottom: 20, color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 21, textAlign: 'center'},
  rewardRow: {width: '100%', marginBottom: 18, flexDirection: 'row', columnGap: 9},
  rewardCard: {flex: 1, paddingVertical: 13, alignItems: 'center', rowGap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)'},
  rewardIcon: {fontSize: 22},
  rewardValue: {fontSize: 15, fontWeight: '800'},
  rewardLabel: {color: 'rgba(255,255,255,0.48)', fontSize: 10},
  xpCard: {width: '100%', marginBottom: 20, padding: 15, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)'},
  xpHeader: {marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between'},
  xpLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 12},
  xpValue: {color: colors.lime, fontSize: 12, fontWeight: '700'},
  xpTrack: {height: 10, overflow: 'hidden', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.12)'},
  xpProgress: {width: '72.5%', height: '100%', borderRadius: 5, backgroundColor: colors.lime},
  xpFooter: {marginTop: 6, flexDirection: 'row', justifyContent: 'space-between'},
  beforeText: {color: 'rgba(255,255,255,0.42)', fontSize: 11},
  addedText: {color: colors.lime, fontSize: 11, fontWeight: '700'},
  claimButton: {width: '100%', height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: colors.lime},
  claimText: {color: colors.primary, fontSize: 16, fontWeight: '800'},
  homeButton: {width: '100%', height: 48, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)'},
  homeText: {color: 'rgba(255,255,255,0.82)', fontSize: 14, fontWeight: '700'},
});
