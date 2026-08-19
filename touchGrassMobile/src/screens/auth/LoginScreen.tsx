import React, { useEffect, useState } from 'react';
import {
  login as loginUser,
} from '../../services/authService';
import {
  isPermissionSetupComplete,
  saveAccessToken,
} from '../../storage/authStorage';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  AlertCircle,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  TreePine,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../constants/colors';
import {DEFAULT_API_ORIGIN} from '../../config/api';
import type { AuthStackParamList } from '../../navigation/types';
import {useAuth} from '../../auth/AuthContext';
import {getApiOrigin, saveApiOrigin} from '../../storage/apiConfigStorage';
import {isGoogleAuthConfigured, signInWithGoogle} from '../../services/googleAuthService';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Login'
>;

interface LoginErrors {
  email?: string;
  password?: string;
}

function GoogleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path
        d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.77h5.4c-.23 1.25-.93 2.3-1.97 3.01v2.5h3.18c1.86-1.71 2.99-4.24 2.99-7.28z"
        fill="#4285F4"
      />
      <Path
        d="M10 20c2.7 0 4.97-.9 6.62-2.43l-3.18-2.5c-.9.6-2.04.96-3.44.96-2.65 0-4.89-1.79-5.69-4.2H1.04v2.57A9.99 9.99 0 0010 20z"
        fill="#34A853"
      />
      <Path
        d="M4.31 11.83A6.1 6.1 0 013.99 10c0-.63.11-1.25.32-1.83V5.6H1.04A10 10 0 000 10c0 1.61.38 3.13 1.04 4.4l3.27-2.57z"
        fill="#FBBC04"
      />
      <Path
        d="M10 3.96c1.47 0 2.8.51 3.84 1.5l2.87-2.87C14.97.9 12.7 0 10 0A9.99 9.99 0 001.04 5.6l3.27 2.57C5.11 5.75 7.35 3.96 10 3.96z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function LoginScreen({ navigation }: Props) {
  const googleAuthConfigured = isGoogleAuthConfigured();
  const {setUser} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [apiOrigin, setApiOrigin] = useState(DEFAULT_API_ORIGIN);
  const [showServerConfig, setShowServerConfig] = useState(false);

  useEffect(() => {
    getApiOrigin().then(setApiOrigin);
  }, []);

  function clearError(field: keyof LoginErrors) {
    setErrors(current => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const newErrors: LoginErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      newErrors.email = 'Địa chỉ email không hợp lệ.';
    }

    if (password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function resetAfterLogin() {
    const permissionSetupComplete = await isPermissionSetupComplete();
    navigation.reset({
      index: 0,
      routes: [{name: permissionSetupComplete ? 'Home' : 'Permission'}],
    });
  }

  async function handleLogin() {
    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await saveApiOrigin(apiOrigin);
      const authResponse = await loginUser({
        email: email.toLowerCase().trim(),
        password,
      });

      await saveAccessToken(
        authResponse.accessToken,
      );
      setUser(authResponse.user);

      Alert.alert(
        'Đăng nhập thành công',
        `Chào mừng ${authResponse.user.fullName} quay lại Touch Grass!`,
        [
          {
            text: 'Tiếp tục',
            onPress: resetAfterLogin,
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể đăng nhập.';

      Alert.alert(
        'Đăng nhập thất bại',
        message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await saveApiOrigin(apiOrigin);
      const authResponse = await signInWithGoogle();
      if (!authResponse) return;
      await saveAccessToken(authResponse.accessToken);
      setUser(authResponse.user);
      await resetAfterLogin();
    } catch (error) {
      Alert.alert('Không thể đăng nhập Google', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Logo Touch Grass"
              accessibilityHint="Nhấn giữ để mở cấu hình máy chủ thử nghiệm"
              delayLongPress={800}
              style={styles.logo}
              onLongPress={() => setShowServerConfig(current => !current)}>
              <TreePine
                size={34}
                color="#FFFFFF"
                strokeWidth={2.4}
              />
            </Pressable>

            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để tiếp tục hành trình
            </Text>
          </View>

          <View style={styles.form}>
            {showServerConfig ? <View style={styles.field}>
              <Text style={styles.label}>Địa chỉ kết nối</Text>
              <TextInput
                style={styles.input}
                value={apiOrigin}
                placeholder="http://192.168.1.10:3000"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                onChangeText={setApiOrigin}
                onEndEditing={() => saveApiOrigin(apiOrigin).catch(() => undefined)}
              />
              <Text style={styles.serverHint}>
                Cấu hình thử nghiệm · Nhấn giữ logo để đóng
              </Text>
            </View> : null}
            <View style={styles.field}>
              <Text
                style={[
                  styles.label,
                  errors.email && styles.errorLabel,
                ]}>
                Địa chỉ email
              </Text>

              <TextInput
                style={[
                  styles.input,
                  errors.email && styles.errorInput,
                ]}
                value={email}
                placeholder="email@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                onChangeText={value => {
                  setEmail(value);
                  clearError('email');
                }}
              />

              {errors.email ? (
                <View style={styles.errorRow}>
                  <AlertCircle
                    size={13}
                    color={colors.error}
                  />
                  <Text style={styles.errorText}>
                    {errors.email}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text
                style={[
                  styles.label,
                  errors.password && styles.errorLabel,
                ]}>
                Mật khẩu
              </Text>

              <View>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.password && styles.errorInput,
                  ]}
                  value={password}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onChangeText={value => {
                    setPassword(value);
                    clearError('password');
                  }}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword
                      ? 'Ẩn mật khẩu'
                      : 'Hiện mật khẩu'
                  }
                  style={styles.eyeButton}
                  hitSlop={10}
                  onPress={() =>
                    setShowPassword(current => !current)
                  }>
                  {showPassword ? (
                    <EyeOff
                      size={20}
                      color={colors.textSecondary}
                    />
                  ) : (
                    <Eye
                      size={20}
                      color={colors.textSecondary}
                    />
                  )}
                </Pressable>
              </View>

              {errors.password ? (
                <View style={styles.errorRow}>
                  <AlertCircle
                    size={13}
                    color={colors.error}
                  />
                  <Text style={styles.errorText}>
                    {errors.password}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.optionsRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberLogin }}
              style={styles.rememberButton}
              onPress={() =>
                setRememberLogin(current => !current)
              }>
              <View
                style={[
                  styles.checkbox,
                  rememberLogin && styles.checkboxChecked,
                ]}>
                {rememberLogin ? (
                  <Check
                    size={13}
                    color="#FFFFFF"
                    strokeWidth={3}
                  />
                ) : null}
              </View>
              <Text style={styles.optionText}>
                Ghi nhớ đăng nhập
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>
                Quên mật khẩu?
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed &&
              !isSubmitting &&
              styles.pressed,
            ]}
            onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>
              {isSubmitting
                ? 'Đang đăng nhập...'
                : 'Đăng nhập'}
            </Text>

            {!isSubmitting ? (
              <ChevronRight
                size={19}
                color="#FFFFFF"
              />
            ) : null}
          </Pressable>

          {googleAuthConfigured ? <><View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>
              HOẶC TIẾP TỤC VỚI
            </Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialList}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.pressed,
              ]}
              onPress={handleGoogleLogin}>
              <GoogleLogo />
              <Text style={styles.socialText}>
                Tiếp tục với Google
              </Text>
            </Pressable>

          </View></> : null}

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Chưa có tài khoản?{' '}
            </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Đăng ký</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.primaryButton,
    shadowColor: colors.primaryButton,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 7,
  },
  title: {
    marginBottom: 6,
    color: colors.primary,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  form: {
    rowGap: 16,
    marginBottom: 16,
  },
  field: {
    rowGap: 6,
  },
  label: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  serverHint: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  errorLabel: {
    color: colors.error,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    fontSize: 15,
  },
  passwordInput: {
    paddingRight: 48,
  },
  errorInput: {
    borderColor: colors.error,
    backgroundColor: colors.errorBackground,
  },
  eyeButton: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 46,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: 12,
    lineHeight: 16,
  },
  optionsRow: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 6,
  },
  checkboxChecked: {
    borderColor: colors.primaryButton,
    backgroundColor: colors.primaryButton,
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
  },
  forgotText: {
    color: colors.primaryButton,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    borderRadius: 26,
    backgroundColor: colors.primaryButton,
    shadowColor: colors.primaryButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  dividerRow: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  socialList: {
    rowGap: 12,
    marginBottom: 24,
  },
  socialButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 26,
    backgroundColor: colors.surface,
  },
  socialText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primaryButton,
    fontSize: 14,
    fontWeight: '700',
  },
});
