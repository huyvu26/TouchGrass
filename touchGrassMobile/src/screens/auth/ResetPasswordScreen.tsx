import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ChevronLeft, KeyRound} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {resetPassword} from '../../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({navigation, route}: Props) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!token.trim()) {
      Alert.alert('Thiếu mã xác nhận', 'Hãy nhập mã hoặc token nhận được trong email.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Mật khẩu chưa hợp lệ', 'Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Hãy nhập lại mật khẩu xác nhận.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await resetPassword(token.trim(), password);
      Alert.alert('Đổi mật khẩu thành công', response.message || 'Bạn có thể đăng nhập bằng mật khẩu mới.', [
        {text: 'Đăng nhập', onPress: () => navigation.reset({index: 0, routes: [{name: 'Login'}]})},
      ]);
    } catch (error) {
      Alert.alert('Không thể đổi mật khẩu', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Pressable style={styles.back} onPress={() => navigation.goBack()}><ChevronLeft size={22} color={colors.text} /></Pressable>
          <View style={styles.icon}><KeyRound size={30} color={colors.primaryButton} /></View>
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>Email: {route.params.email}</Text>
          <Text style={styles.label}>Mã xác nhận hoặc token</Text>
          <TextInput value={token} onChangeText={setToken} autoCapitalize="none" autoCorrect={false} style={styles.input} placeholder="Nhập mã nhận được" placeholderTextColor={colors.placeholder} />
          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" style={styles.input} placeholder="Ít nhất 8 ký tự" placeholderTextColor={colors.placeholder} />
          <Text style={styles.label}>Xác nhận mật khẩu</Text>
          <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" style={styles.input} placeholder="Nhập lại mật khẩu mới" placeholderTextColor={colors.placeholder} onSubmitEditing={submit} />
          <Pressable disabled={submitting} style={[styles.button, submitting && styles.disabled]} onPress={submit}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Cập nhật mật khẩu</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background}, flex: {flex: 1}, content: {flex: 1, paddingHorizontal: 24, paddingTop: 12},
  back: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.surfaceSoft},
  icon: {width: 62, height: 62, marginTop: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 31, backgroundColor: colors.surfaceSoft},
  title: {marginTop: 18, color: colors.text, fontSize: 28, fontWeight: '800'}, subtitle: {marginTop: 8, marginBottom: 14, color: colors.textSecondary, fontSize: 13},
  label: {marginTop: 16, marginBottom: 7, color: colors.text, fontSize: 13, fontWeight: '700'},
  input: {height: 52, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface, color: colors.text, fontSize: 15},
  button: {height: 54, marginTop: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: colors.primaryButton},
  buttonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'}, disabled: {opacity: 0.65},
});
