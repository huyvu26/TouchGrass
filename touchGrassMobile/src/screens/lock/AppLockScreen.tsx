import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {AlertCircle, Leaf, Lock} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'AppLock'
>;

export function AppLockScreen({navigation}: Props) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.backgroundPattern}>
        {[0, 1, 2, 3].map(index => (
          <View
            key={index}
            style={[
              styles.fakePost,
              {top: 30 + index * 190},
            ]}
          />
        ))}
      </View>
      <View style={styles.shade} />

      <View style={styles.content}>
        <View style={styles.illustration}>
          <View style={styles.treeTopLarge} />
          <View style={styles.treeTopMedium} />
          <View style={styles.treeTopSmall} />
          <View style={styles.treeTrunk} />
          <View style={styles.lockBadge}>
            <Lock size={23} color={colors.lime} />
          </View>
        </View>

        <Text style={styles.title}>Bạn đã hết thời gian!</Text>
        <Text style={styles.subtitle}>
          Hãy ra ngoài chạm vào cỏ.{'\n'}
          Thiên nhiên đang chờ bạn 🌿
        </Text>

        <Pressable
          style={styles.taskButton}
          onPress={() => setShowDetail(value => !value)}>
          <Text style={styles.taskButtonText}>
            🚶 Làm nhiệm vụ: Đi bộ 500m
          </Text>
        </Pressable>

        {showDetail ? (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>
              Chi tiết nhiệm vụ
            </Text>
            {[
              ['📍 Khoảng cách', '500 m'],
              ['⚡ Phần thưởng', '+25 XP · +8 LP'],
              ['🔓 Mở khóa', '+15 phút TikTok'],
            ].map(([label, value]) => (
              <View key={label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
              </View>
            ))}
            <Pressable
              style={styles.startButton}
              onPress={() => navigation.navigate('TaskDetail')}>
              <Text style={styles.startButtonText}>
                Bắt đầu ngay
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.penaltyCard}>
          <View style={styles.penaltyHeader}>
            <AlertCircle size={19} color="#FF8A8A" />
            <View style={styles.penaltyTextContainer}>
              <Text style={styles.penaltyTitle}>
                Dùng thêm có phí
              </Text>
              <Text style={styles.penaltyDescription}>
                Trừ 50 XP để dùng thêm 5 phút. Mỗi lần vượt giới
                hạn sẽ trừ thêm điểm.
              </Text>
            </View>
          </View>
          <Pressable style={styles.penaltyButton}>
            <Text style={styles.penaltyButtonText}>
              Dùng thêm (−50 XP)
            </Text>
          </Pressable>
        </View>

        <View style={styles.savedRow}>
          <Leaf size={16} color={colors.lime} />
          <Text style={styles.savedText}>
            Bạn đã tiết kiệm 38 giờ màn hình tháng này! 🎉
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.primary},
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#071007',
  },
  fakePost: {position: 'absolute', left: 18, right: 18, height: 160, borderRadius: 16, backgroundColor: '#1F2F1A'},
  shade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(11,28,8,0.88)',
  },
  content: {flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center'},
  illustration: {width: 150, height: 150, marginBottom: 20, position: 'relative', alignItems: 'center', justifyContent: 'flex-end', borderRadius: 75, backgroundColor: 'rgba(176,242,103,0.08)'},
  treeTopLarge: {position: 'absolute', bottom: 28, width: 72, height: 88, borderRadius: 40, backgroundColor: '#2D5A27'},
  treeTopMedium: {position: 'absolute', bottom: 52, width: 56, height: 70, borderRadius: 32, backgroundColor: '#3A7033'},
  treeTopSmall: {position: 'absolute', bottom: 78, width: 40, height: 50, borderRadius: 24, backgroundColor: '#4A8A40'},
  treeTrunk: {width: 12, height: 42, marginBottom: 10, borderRadius: 6, backgroundColor: '#5A8A48'},
  lockBadge: {position: 'absolute', right: 8, bottom: 8, width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.lime, borderRadius: 23, backgroundColor: colors.primary},
  title: {color: '#FFFFFF', fontSize: 26, fontWeight: '800', textAlign: 'center'},
  subtitle: {marginTop: 9, marginBottom: 26, color: 'rgba(255,255,255,0.68)', fontSize: 15, lineHeight: 23, textAlign: 'center'},
  taskButton: {width: '100%', height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: colors.lime, shadowColor: colors.lime, shadowOpacity: 0.32, shadowRadius: 14, elevation: 5},
  taskButtonText: {color: colors.primary, fontSize: 15, fontWeight: '800'},
  detailCard: {width: '100%', marginTop: 12, padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)'},
  detailTitle: {marginBottom: 9, color: '#FFFFFF', fontSize: 14, fontWeight: '700'},
  detailRow: {marginBottom: 7, flexDirection: 'row', justifyContent: 'space-between'},
  detailLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 12},
  detailValue: {color: colors.lime, fontSize: 12, fontWeight: '600'},
  startButton: {height: 38, marginTop: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: colors.primaryButton},
  startButtonText: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
  penaltyCard: {width: '100%', marginTop: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,100,100,0.3)', borderRadius: 18, backgroundColor: 'rgba(186,26,26,0.17)'},
  penaltyHeader: {flexDirection: 'row', alignItems: 'flex-start', columnGap: 10},
  penaltyTextContainer: {flex: 1},
  penaltyTitle: {color: '#FF8A8A', fontSize: 13, fontWeight: '700'},
  penaltyDescription: {marginTop: 3, color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 18},
  penaltyButton: {height: 38, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,100,100,0.45)', borderRadius: 19, backgroundColor: 'rgba(186,26,26,0.25)'},
  penaltyButtonText: {color: '#FF8A8A', fontSize: 13, fontWeight: '700'},
  savedRow: {marginTop: 20, flexDirection: 'row', alignItems: 'center', columnGap: 8},
  savedText: {color: 'rgba(255,255,255,0.5)', fontSize: 12},
});
