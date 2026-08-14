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
import {ChevronLeft, Mail} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {forgotPassword} from '../../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert('Email không hợp lệ', 'Hãy nhập đúng email đã đăng ký.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await forgotPassword(normalizedEmail);
      Alert.alert(
        'Đã gửi yêu cầu',
        response.message || 'Hãy kiểm tra email để lấy mã đặt lại mật khẩu.',
        [{text: 'Nhập mã', onPress: () => navigation.navigate('ResetPassword', {email: normalizedEmail})}],
      );
    } catch (error) {
      Alert.alert('Không thể gửi yêu cầu', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Pressable style={styles.back} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={colors.text} />
          </Pressable>
          <View style={styles.icon}><Mail size={30} color={colors.primaryButton} /></View>
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <Text style={styles.subtitle}>Nhập email tài khoản. Backend sẽ gửi mã hoặc liên kết đặt lại mật khẩu nếu tài khoản tồn tại.</Text>
          <Text style={styles.label}>Địa chỉ email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            style={styles.input}
            onSubmitEditing={submit}
          />
          <Pressable disabled={submitting} style={[styles.button, submitting && styles.disabled]} onPress={submit}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Gửi yêu cầu đặt lại</Text>}
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.login}>Quay lại đăng nhập</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  flex: {flex: 1},
  content: {flex: 1, paddingHorizontal: 24, paddingTop: 12},
  back: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.surfaceSoft},
  icon: {width: 62, height: 62, marginTop: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 31, backgroundColor: colors.surfaceSoft},
  title: {marginTop: 20, color: colors.text, fontSize: 28, fontWeight: '800'},
  subtitle: {marginTop: 10, color: colors.textSecondary, fontSize: 14, lineHeight: 22},
  label: {marginTop: 32, marginBottom: 8, color: colors.text, fontSize: 13, fontWeight: '700'},
  input: {height: 54, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface, color: colors.text, fontSize: 15},
  button: {height: 54, marginTop: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: colors.primaryButton},
  buttonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
  login: {marginTop: 22, color: colors.primaryButton, fontSize: 14, fontWeight: '700', textAlign: 'center'},
  disabled: {opacity: 0.65},
});
