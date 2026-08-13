import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Camera, Check} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ScreenHeader} from '../../components/ScreenHeader';
import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {getMyProfile, updateMyProfile} from '../../services/userService';
import type {AuthUser, UpdateProfileRequest} from '../../types/auth';
import {useAuth} from '../../auth/AuthContext';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'EditProfile'
>;

const GOALS = [
  'Giảm mạng xã hội',
  'Vận động nhiều hơn',
  'Ngủ đúng giờ',
  'Tập trung học tập',
] as const;

export function EditProfileScreen({navigation}: Props) {
  const {setUser} = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialProfile = useRef<AuthUser | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getMyProfile();
        initialProfile.current = user;
        setUser(user);
        setName(user.fullName);
        setEmail(user.email);
        setDob(user.dateOfBirth ?? '');
        setGoals(user.goals);
      } catch (error) {
        Alert.alert(
          'Lỗi tải hồ sơ',
          error instanceof Error
            ? error.message
            : 'Không thể tải thông tin tài khoản.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [setUser]);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || '?';

  function toggleGoal(goal: string) {
    setGoals(current =>
      current.includes(goal)
        ? current.filter(item => item !== goal)
        : [...current, goal],
    );
  }

  async function save() {
    const initial = initialProfile.current;
    if (!initial || saving) {
      return;
    }

    const normalizedName = name.trim();
    if (normalizedName.length < 3) {
      Alert.alert('Dữ liệu chưa hợp lệ', 'Họ và tên phải có ít nhất 3 ký tự.');
      return;
    }

    const changes: UpdateProfileRequest = {};
    if (normalizedName !== initial.fullName) {
      changes.fullName = normalizedName;
    }
    const normalizedDob = dob.trim() || null;
    if (normalizedDob !== initial.dateOfBirth) {
      changes.dateOfBirth = normalizedDob;
    }
    if (JSON.stringify(goals) !== JSON.stringify(initial.goals)) {
      changes.goals = goals;
    }

    if (Object.keys(changes).length === 0) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMyProfile(changes);
      initialProfile.current = updated;
      setUser(updated);
      setName(updated.fullName);
      setDob(updated.dateOfBirth ?? '');
      setGoals(updated.goals);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (error) {
      Alert.alert(
        'Không thể cập nhật hồ sơ',
        error instanceof Error ? error.message : 'Vui lòng thử lại sau.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Chỉnh sửa hồ sơ"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
            <Pressable
              style={styles.cameraButton}
              onPress={() => Alert.alert(
                'Ảnh đại diện',
                'Backend hiện chưa có API tải ảnh đại diện từ thiết bị.',
              )}>
              <Camera size={14} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.changePhoto}>
            Thay đổi ảnh đại diện
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primaryButton} />
        ) : null}

        {[
          ['Họ và tên', name, setName],
          ['Địa chỉ email', email, setEmail],
          ['Ngày sinh', dob, setDob],
        ].map(([label, value, setter]) => (
          <View key={label as string} style={styles.field}>
            <Text style={styles.label}>{label as string}</Text>
            <TextInput
              value={value as string}
              style={styles.input}
              placeholderTextColor={colors.placeholder}
              editable={(label as string) !== 'Địa chỉ email' && !loading && !saving}
              onChangeText={setter as (text: string) => void}
            />
          </View>
        ))}

        <Text style={styles.goalTitle}>Mục tiêu của tôi</Text>
        <View style={styles.goals}>
          {GOALS.map(goal => {
            const selected = goals.includes(goal);
            return (
              <Pressable
                key={goal}
                style={[
                  styles.goal,
                  selected && styles.goalSelected,
                ]}
                onPress={() => toggleGoal(goal)}>
                {selected ? (
                  <Check
                    size={13}
                    color={colors.primaryButton}
                    strokeWidth={3}
                  />
                ) : null}
                <Text
                  style={[
                    styles.goalText,
                    selected && styles.goalTextSelected,
                  ]}>
                  {goal}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          disabled={loading || saving}
          style={[styles.saveButton, (loading || saving) && styles.disabled]}
          onPress={save}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Lưu thay đổi</Text>
          )}
        </Pressable>
      </ScrollView>

      {saved ? (
        <View style={styles.snackbar}>
          <Check size={18} color={colors.lime} strokeWidth={3} />
          <Text style={styles.snackbarText}>
            Đã cập nhật hồ sơ thành công!
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {paddingHorizontal: 20, paddingBottom: 28},
  avatarSection: {marginBottom: 22, alignItems: 'center'},
  avatar: {width: 88, height: 88, position: 'relative', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.lime, borderRadius: 44, backgroundColor: colors.primaryButton},
  avatarText: {color: '#FFFFFF', fontSize: 31, fontWeight: '800'},
  cameraButton: {position: 'absolute', right: 0, bottom: 0, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background, borderRadius: 15, backgroundColor: colors.primaryButton},
  changePhoto: {marginTop: 8, color: colors.primaryButton, fontSize: 12, fontWeight: '600'},
  field: {marginBottom: 14},
  label: {marginBottom: 7, color: colors.text, fontSize: 13, fontWeight: '700'},
  input: {height: 50, paddingHorizontal: 16, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: colors.inputBackground},
  goalTitle: {marginTop: 4, marginBottom: 10, color: colors.text, fontSize: 14, fontWeight: '700'},
  goals: {marginBottom: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  goal: {height: 38, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', columnGap: 5, borderWidth: 1.5, borderColor: colors.border, borderRadius: 19},
  goalSelected: {borderColor: colors.primaryButton, backgroundColor: colors.surfaceSoft},
  goalText: {color: colors.textSecondary, fontSize: 12, fontWeight: '600'},
  goalTextSelected: {color: colors.primaryButton},
  saveButton: {height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: colors.primaryButton},
  saveText: {color: '#FFFFFF', fontSize: 16, fontWeight: '800'},
  disabled: {opacity: 0.6},
  snackbar: {position: 'absolute', left: 20, right: 20, bottom: 24, padding: 15, flexDirection: 'row', alignItems: 'center', columnGap: 10, borderRadius: 16, backgroundColor: colors.primary, elevation: 6},
  snackbarText: {color: '#FFFFFF', fontSize: 13, fontWeight: '600'},
});
