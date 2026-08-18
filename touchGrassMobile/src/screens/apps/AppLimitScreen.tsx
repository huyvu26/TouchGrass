import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronLeft, Clock3, Leaf, Lock, Shield, Smartphone, Trash2} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '../../auth/AuthContext';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {createTemporaryUnlock, getTemporaryUnlockStatus, getUnlockOptions} from '../../services/appControlApiService';
import {removeAndSyncAppControlRule, saveAndSyncAppControlRule, setTemporaryUnlockUntil} from '../../services/appControlService';
import {getMyProfile} from '../../services/userService';
import {getAppLimitRules} from '../../storage/appControlStorage';
import type {UnlockOption} from '../../types/appControl';

type Props = NativeStackScreenProps<AuthStackParamList, 'AppLimit'>;

export function AppLimitScreen({navigation, route}: Props) {
  const {packageName, appName} = route.params;
  const {setUser} = useAuth();
  const [selected, setSelected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [leafPoints, setLeafPoints] = useState(0);
  const [options, setOptions] = useState<UnlockOption[]>([]);
  const [unlockedUntil, setUnlockedUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [pendingPurchase, setPendingPurchase] = useState<{optionId: string; operationKey: string} | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rules, optionResponse, status, profile] = await Promise.all([
        getAppLimitRules(), getUnlockOptions(), getTemporaryUnlockStatus(packageName), getMyProfile(),
      ]);
      const rule = rules.find(item => item.packageName === packageName);
      setSelected(Boolean(rule));
      setEnabled(Boolean(rule?.enabled));
      setOptions(optionResponse.items);
      setUnlockedUntil(status.unlocked ? status.expiresAt : null);
      setLeafPoints(profile.leafPoints);
      setUser(profile);
    } catch (error) {
      Alert.alert('Không thể tải thông tin', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [packageName, setUser]);

  useEffect(() => { load(); }, [load]);

  async function saveRule(nextEnabled: boolean) {
    if (saving) return;
    setSaving(true);
    try {
      await saveAndSyncAppControlRule({packageName, appName, enabled: nextEnabled});
      setSelected(true);
      setEnabled(nextEnabled);
      Alert.alert(
        nextEnabled ? 'Đã khóa ứng dụng' : 'Đã tạm tắt khóa',
        nextEnabled ? `${appName} sẽ bị khóa khi App Control đang hoạt động.` : `${appName} tạm thời không bị App Control chặn.`,
      );
    } catch (error) {
      Alert.alert('Không thể cập nhật', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  async function purchase(option: UnlockOption, operationKey?: string) {
    if (purchasing) return;
    const key = operationKey ?? `unlock-${packageName}-${option.id}-${Date.now()}`;
    setPurchasing(option.id);
    setPendingPurchase({optionId: option.id, operationKey: key});
    try {
      const result = await createTemporaryUnlock(packageName, option.id, key);
      await setTemporaryUnlockUntil(packageName, result.expiresAt);
      setLeafPoints(result.remainingLeafPoints);
      setUnlockedUntil(result.expiresAt);
      setPendingPurchase(null);
      setUser(await getMyProfile());
      Alert.alert('Đã mở khóa tạm thời', `${appName} được sử dụng thêm ${result.minutes} phút. Bạn còn ${result.remainingLeafPoints} Leaf Point.`);
    } catch (error) {
      Alert.alert('Không thể mua thời gian', `${error instanceof Error ? error.message : 'Vui lòng thử lại.'}\n\nBạn có thể thử lại mà không bị trừ điểm hai lần.`);
    } finally {
      setPurchasing(null);
    }
  }

  function confirmPurchase(option: UnlockOption) {
    if (!selected || !enabled) {
      Alert.alert('Ứng dụng chưa bị khóa', 'Hãy bật khóa ứng dụng trước khi mua thời gian sử dụng.');
      return;
    }
    Alert.alert('Mua thời gian sử dụng?', `Dùng ${option.leafPointCost} Leaf Point để mở ${appName} trong ${option.minutes} phút.`, [
      {text: 'Hủy', style: 'cancel'},
      {text: 'Xác nhận', onPress: () => purchase(option)},
    ]);
  }

  function remove() {
    Alert.alert('Bỏ khóa ứng dụng?', `${appName} sẽ được xóa khỏi danh sách ứng dụng bị khóa.`, [
      {text: 'Hủy', style: 'cancel'},
      {text: 'Xóa', style: 'destructive', onPress: async () => {
        setSaving(true);
        try {
          await removeAndSyncAppControlRule(packageName);
          navigation.goBack();
        } catch (error) {
          Alert.alert('Không thể xóa', error instanceof Error ? error.message : 'Vui lòng thử lại.');
        } finally {
          setSaving(false);
        }
      }},
    ]);
  }

  const formattedExpiry = unlockedUntil
    ? new Date(unlockedUntil).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})
    : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={20} color={colors.text} /></Pressable>
          <Text style={styles.title}>Kiểm soát ứng dụng</Text>
        </View>
        <View style={styles.infoBanner}>
          <Shield size={17} color={colors.primaryButton} />
          <Text style={styles.infoBannerText}>Ứng dụng được chọn sẽ bị khóa mặc định. Bạn dùng Leaf Point nhận từ nhiệm vụ để mua thời gian sử dụng tạm thời.</Text>
        </View>
        <View style={styles.identity}>
          <View style={styles.appIcon}><Smartphone size={24} color={colors.primaryButton} /></View>
          <View style={styles.identityText}><Text style={styles.appName}>{appName}</Text><Text numberOfLines={1} style={styles.packageName}>{packageName}</Text></View>
          {selected ? <Pressable accessibilityRole="switch" accessibilityState={{checked: enabled}} style={[styles.toggle, enabled && styles.toggleOn]} onPress={() => saveRule(!enabled)}><View style={[styles.thumb, enabled && styles.thumbOn]} /></Pressable> : null}
        </View>

        {loading ? <ActivityIndicator color={colors.primaryButton} /> : null}
        {!loading && !selected ? <Pressable disabled={saving} style={styles.lockButton} onPress={() => saveRule(true)}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <><Lock size={18} color="#FFFFFF" /><Text style={styles.lockButtonText}>Khóa ứng dụng này</Text></>}</Pressable> : null}

        {!loading && selected ? <>
          <View style={styles.statusCard}>
            <Lock size={20} color={unlockedUntil ? '#B08000' : colors.primaryButton} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>{unlockedUntil ? 'Đang được mở tạm thời' : enabled ? 'Đang khóa' : 'Đã tạm tắt khóa'}</Text>
              <Text style={styles.statusText}>{unlockedUntil ? `Có thể sử dụng đến ${formattedExpiry}` : enabled ? 'Chọn một gói bên dưới để sử dụng tạm thời.' : 'Bật lại khóa để sử dụng tính năng mua thời gian.'}</Text>
            </View>
          </View>
          <View style={styles.balanceCard}><Leaf size={24} color={colors.primaryButton} /><View style={styles.statusInfo}><Text style={styles.balanceLabel}>Số dư Leaf Point</Text><Text style={styles.balanceValue}>{leafPoints} LP</Text></View></View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mua thời gian sử dụng</Text>
            <Text style={styles.cardDescription}>Giá được hệ thống quy định và Leaf Point chỉ bị trừ sau khi bạn xác nhận.</Text>
            <View style={styles.options}>{options.map(option => <Pressable key={option.id} disabled={Boolean(purchasing) || leafPoints < option.leafPointCost} style={[styles.option, leafPoints < option.leafPointCost && styles.disabled]} onPress={() => confirmPurchase(option)}>{purchasing === option.id ? <ActivityIndicator color={colors.primaryButton} /> : <><Clock3 size={20} color={colors.primaryButton} /><Text style={styles.optionMinutes}>{option.minutes} phút</Text><Text style={styles.optionCost}>{option.leafPointCost} LP</Text></>}</Pressable>)}</View>
            {pendingPurchase ? <Pressable style={styles.retryButton} onPress={() => { const option = options.find(item => item.id === pendingPurchase.optionId); if (option) purchase(option, pendingPurchase.operationKey); }}><Text style={styles.retryText}>Thử lại giao dịch gần nhất</Text></Pressable> : null}
          </View>
          <Pressable disabled={saving} style={[styles.deleteButton, saving && styles.disabled]} onPress={remove}><Trash2 size={16} color={colors.error} /><Text style={styles.deleteText}>Bỏ khóa ứng dụng</Text></Pressable>
        </> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background}, content: {padding: 20, paddingBottom: 30, rowGap: 14},
  header: {flexDirection: 'row', alignItems: 'center', columnGap: 12}, back: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.surfaceSoft}, title: {color: colors.text, fontSize: 20, fontWeight: '800'},
  infoBanner: {padding: 13, flexDirection: 'row', alignItems: 'flex-start', columnGap: 9, borderRadius: 14, backgroundColor: colors.surfaceSoft}, infoBannerText: {flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18},
  identity: {padding: 15, flexDirection: 'row', alignItems: 'center', columnGap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface}, appIcon: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.surfaceSoft}, identityText: {flex: 1}, appName: {color: colors.text, fontSize: 16, fontWeight: '800'}, packageName: {marginTop: 3, color: colors.textSecondary, fontSize: 10},
  toggle: {width: 50, height: 29, padding: 3, justifyContent: 'center', borderRadius: 15, backgroundColor: '#C8D4C0'}, toggleOn: {backgroundColor: colors.primaryButton}, thumb: {width: 23, height: 23, borderRadius: 12, backgroundColor: '#FFFFFF'}, thumbOn: {alignSelf: 'flex-end'},
  lockButton: {height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8, borderRadius: 27, backgroundColor: colors.primaryButton}, lockButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
  statusCard: {padding: 16, flexDirection: 'row', alignItems: 'center', columnGap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface}, statusInfo: {flex: 1}, statusTitle: {color: colors.text, fontSize: 15, fontWeight: '800'}, statusText: {marginTop: 4, color: colors.textSecondary, fontSize: 12, lineHeight: 18},
  balanceCard: {padding: 16, flexDirection: 'row', alignItems: 'center', columnGap: 12, borderRadius: 18, backgroundColor: colors.surfaceSoft}, balanceLabel: {color: colors.textSecondary, fontSize: 12}, balanceValue: {marginTop: 2, color: colors.primaryButton, fontSize: 22, fontWeight: '900'},
  card: {padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface}, cardTitle: {color: colors.text, fontSize: 15, fontWeight: '800'}, cardDescription: {marginTop: 5, color: colors.textSecondary, fontSize: 11, lineHeight: 17}, options: {marginTop: 14, rowGap: 9}, option: {minHeight: 58, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', columnGap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: colors.background}, optionMinutes: {flex: 1, color: colors.text, fontSize: 14, fontWeight: '700'}, optionCost: {color: colors.primaryButton, fontSize: 14, fontWeight: '800'}, retryButton: {marginTop: 12, alignItems: 'center'}, retryText: {color: colors.primaryButton, fontSize: 12, fontWeight: '700'},
  deleteButton: {height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8, borderWidth: 1, borderColor: colors.error, borderRadius: 25}, deleteText: {color: colors.error, fontSize: 14, fontWeight: '700'}, disabled: {opacity: 0.45},
});
