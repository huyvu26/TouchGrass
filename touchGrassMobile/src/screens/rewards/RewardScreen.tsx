import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Check, Star} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {claimUserTaskReward} from '../../services/userTaskService';
import type {ClaimRewardResponse} from '../../types/userTask';

type Props = NativeStackScreenProps<AuthStackParamList, 'Reward'>;

export function RewardScreen({navigation, route}: Props) {
  const [claiming, setClaiming] = useState(false);
  const [claim, setClaim] = useState<ClaimRewardResponse | null>(null);

  async function claimReward() {
    if (claiming || claim) {
      return;
    }

    setClaiming(true);
    try {
      const result = await claimUserTaskReward(route.params.userTaskId);
      setClaim(result);
    } catch (error) {
      Alert.alert(
        'Không thể nhận phần thưởng',
        error instanceof Error ? error.message : 'Vui lòng thử lại sau.',
      );
    } finally {
      setClaiming(false);
    }
  }

  const rewards = claim
    ? [
        {icon: '⚡', value: `+${claim.reward.xp} XP`, label: 'Kinh nghiệm', color: colors.lime},
        {icon: '🍃', value: `+${claim.reward.leafPoints} LP`, label: 'Leaf Points', color: '#FFFFFF'},
      ]
    : [];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.confetti} pointerEvents="none">
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

        {claim ? (
          <View style={styles.levelBadge}>
            {claim.alreadyClaimed ? (
              <Check size={16} color={colors.primary} strokeWidth={3} />
            ) : (
              <Star size={16} color={colors.primary} fill={colors.primary} />
            )}
            <Text style={styles.levelBadgeText}>
              {claim.alreadyClaimed ? 'Đã nhận trước đó' : 'Đã nhận thưởng'} · Cấp {claim.profile.level}
            </Text>
          </View>
        ) : null}

        <Text style={styles.title}>Nhiệm vụ hoàn thành!</Text>
        <Text style={styles.subtitle}>
          {claim
            ? 'Phần thưởng đã được cập nhật vào tài khoản của bạn.'
            : 'Bấm nhận thưởng để cập nhật phần thưởng vào tài khoản.'}
        </Text>

        {claim ? (
          <>
            <View style={styles.rewardRow}>
              {rewards.map(item => (
                <View key={item.label} style={styles.rewardCard}>
                  <Text style={styles.rewardIcon}>{item.icon}</Text>
                  <Text style={[styles.rewardValue, {color: item.color}]}>
                    {item.value}
                  </Text>
                  <Text style={styles.rewardLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.profileCard}>
              <Text style={styles.profileTitle}>Số dư tài khoản hiện tại</Text>
              <View style={styles.profileGrid}>
                <View style={styles.profileItem}>
                  <Text style={styles.profileLabel}>Tổng XP</Text>
                  <Text style={styles.profileValue}>{claim.profile.xp}</Text>
                </View>
                <View style={styles.profileItem}>
                  <Text style={styles.profileLabel}>Cấp độ</Text>
                  <Text style={styles.profileValue}>{claim.profile.level}</Text>
                </View>
                <View style={styles.profileItem}>
                  <Text style={styles.profileLabel}>Leaf Points</Text>
                  <Text style={styles.profileValue}>{claim.profile.leafPoints}</Text>
                </View>
              </View>
            </View>

          </>
        ) : (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingIcon}>🎁</Text>
            <Text style={styles.pendingTitle}>Phần thưởng đang chờ nhận</Text>
            <Text style={styles.pendingText}>
              Phần thưởng chính xác sẽ hiển thị sau khi bạn xác nhận.
            </Text>
          </View>
        )}

        {claim ? (
          <Pressable style={styles.claimButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.claimText}>Về trang chủ</Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={claiming}
            style={[styles.claimButton, claiming && styles.disabled]}
            onPress={claimReward}>
            {claiming ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.claimText}>Nhận phần thưởng 🎉</Text>
            )}
          </Pressable>
        )}

        {!claim ? (
          <Pressable style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeText}>Về trang chủ</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.primary},
  confetti: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0},
  confettiDot: {position: 'absolute', width: 9, height: 9, borderRadius: 5, opacity: 0.72},
  content: {flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center'},
  chestGlow: {width: 180, height: 145, marginBottom: 12, alignItems: 'center', justifyContent: 'flex-end', borderRadius: 90, backgroundColor: 'rgba(176,242,103,0.08)'},
  chestLid: {width: 126, height: 50, marginBottom: -8, alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 60, borderTopRightRadius: 60, backgroundColor: '#C4955A', transform: [{rotate: '-6deg'}]},
  gems: {color: colors.lime, fontSize: 20, fontWeight: '900'},
  chest: {width: 128, height: 58, alignItems: 'center', borderRadius: 10, backgroundColor: '#8B6340'},
  chestBand: {position: 'absolute', top: 22, width: '100%', height: 6, backgroundColor: '#C4A870'},
  chestLock: {width: 16, height: 20, borderRadius: 4, backgroundColor: '#C4A870'},
  levelBadge: {marginTop: 4, paddingHorizontal: 18, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', columnGap: 7, borderRadius: 18, backgroundColor: colors.lime},
  levelBadgeText: {color: colors.primary, fontSize: 13, fontWeight: '800'},
  title: {marginTop: 12, color: '#FFFFFF', fontSize: 27, fontWeight: '800', textAlign: 'center'},
  subtitle: {marginTop: 7, marginBottom: 18, color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 21, textAlign: 'center'},
  rewardRow: {width: '100%', marginBottom: 14, flexDirection: 'row', columnGap: 9},
  rewardCard: {flex: 1, paddingVertical: 13, alignItems: 'center', rowGap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)'},
  rewardIcon: {fontSize: 22},
  rewardValue: {fontSize: 14, fontWeight: '800'},
  rewardLabel: {color: 'rgba(255,255,255,0.48)', fontSize: 10},
  profileCard: {width: '100%', marginBottom: 18, padding: 15, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)'},
  profileTitle: {marginBottom: 12, color: '#FFFFFF', fontSize: 13, fontWeight: '800'},
  profileGrid: {flexDirection: 'row', flexWrap: 'wrap', rowGap: 12},
  profileItem: {width: '50%'},
  profileLabel: {color: 'rgba(255,255,255,0.5)', fontSize: 11},
  profileValue: {marginTop: 3, color: colors.lime, fontSize: 16, fontWeight: '800'},
  pendingCard: {width: '100%', marginBottom: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)'},
  pendingIcon: {fontSize: 30},
  pendingTitle: {marginTop: 8, color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
  pendingText: {marginTop: 5, color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 18, textAlign: 'center'},
  claimButton: {width: '100%', height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: colors.lime},
  claimText: {color: colors.primary, fontSize: 16, fontWeight: '800'},
  homeButton: {width: '100%', height: 48, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)'},
  homeText: {color: 'rgba(255,255,255,0.82)', fontSize: 14, fontWeight: '700'},
  disabled: {opacity: 0.65},
});
