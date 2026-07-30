import React, {useState} from 'react';
import {
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
  const [name, setName] = useState('Hải Đăng');
  const [displayName, setDisplayName] = useState('HaiDang');
  const [email, setEmail] = useState('haidang@email.com');
  const [dob, setDob] = useState('15/08/1998');
  const [goals, setGoals] = useState<string[]>([
    'Giảm mạng xã hội',
    'Vận động nhiều hơn',
  ]);
  const [saved, setSaved] = useState(false);

  function toggleGoal(goal: string) {
    setGoals(current =>
      current.includes(goal)
        ? current.filter(item => item !== goal)
        : [...current, goal],
    );
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
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
            <Text style={styles.avatarText}>HĐ</Text>
            <Pressable style={styles.cameraButton}>
              <Camera size={14} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.changePhoto}>
            Thay đổi ảnh đại diện
          </Text>
        </View>

        {[
          ['Họ và tên', name, setName],
          ['Tên hiển thị', displayName, setDisplayName],
          ['Địa chỉ email', email, setEmail],
          ['Ngày sinh', dob, setDob],
        ].map(([label, value, setter]) => (
          <View key={label as string} style={styles.field}>
            <Text style={styles.label}>{label as string}</Text>
            <TextInput
              value={value as string}
              style={styles.input}
              placeholderTextColor={colors.placeholder}
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

        <Pressable style={styles.saveButton} onPress={save}>
          <Text style={styles.saveText}>Lưu thay đổi</Text>
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
  snackbar: {position: 'absolute', left: 20, right: 20, bottom: 24, padding: 15, flexDirection: 'row', alignItems: 'center', columnGap: 10, borderRadius: 16, backgroundColor: colors.primary, elevation: 6},
  snackbarText: {color: '#FFFFFF', fontSize: 13, fontWeight: '600'},
});
