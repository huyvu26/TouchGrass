import React, { useState } from 'react';
import {
  saveAccessToken,
} from '../../storage/authStorage';
import {
  register as registerUser,
} from '../../services/authService';
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
  ChevronLeft,
  Eye,
  EyeOff,
  TreePine,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../constants/colors';
import {
  isStrongPassword,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from '../../utils/passwordValidation';
import type { AuthStackParamList } from '../../navigation/types';
import {useAuth} from '../../auth/AuthContext';
import {isGoogleAuthConfigured, signInWithGoogle} from '../../services/googleAuthService';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface AuthInputProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoComplete?: 'name' | 'email' | 'new-password';
  rightElement?: React.ReactNode;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
}

function AuthInput({
  label,
  value,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoComplete,
  rightElement,
  onChangeText,
  onSubmitEditing,
}: AuthInputProps) {
  return (
    <View style={styles.field}>
      <Text
        style={[
          styles.label,
          error ? styles.errorLabel : null,
        ]}>
        {label}
      </Text>

      <View>
        <TextInput
          style={[
            styles.input,
            rightElement ? styles.inputWithAction : null,
            error ? styles.errorInput : null,
          ]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          autoCorrect={false}
          autoComplete={autoComplete}
          returnKeyType={onSubmitEditing ? 'done' : 'next'}
          onSubmitEditing={onSubmitEditing}
          onChangeText={onChangeText}
        />

        {rightElement ? (
          <View style={styles.inputAction}>{rightElement}</View>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <AlertCircle
            size={13}
            color={colors.error}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
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

function getPasswordStrength(password: string) {
  if (!password) {
    return { score: 0, color: colors.border, label: '' };
  }

  if (password.length < 6) {
    return { score: 1, color: colors.error, label: 'Rất yếu' };
  }

  if (password.length < 8) {
    return { score: 2, color: '#E8A020', label: 'Yếu' };
  }

  if (isStrongPassword(password)) {
    return {
      score: 4,
      color: colors.primaryButton,
      label: 'Mạnh',
    };
  }

  return { score: 3, color: '#B0A000', label: 'Trung bình' };
}

export function RegisterScreen({ navigation }: Props) {
  const googleAuthConfigured = isGoogleAuthConfigured();
  const {setUser} = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const passwordStrength = getPasswordStrength(password);

  function clearError(field: keyof FormErrors) {
    setErrors(current => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (fullName.trim().length < 3) {
      newErrors.fullName = 'Vui lòng nhập họ và tên.';
    }

    if (!emailPattern.test(email.trim())) {
      newErrors.email = 'Địa chỉ email không hợp lệ.';
    }

    if (!isStrongPassword(password)) {
      newErrors.password = PASSWORD_REQUIREMENTS_MESSAGE;
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword =
        'Mật khẩu xác nhận không khớp.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (
      !acceptedTerms ||
      !validateForm() ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const authResponse = await registerUser({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password,
      });
      await saveAccessToken(
        authResponse.accessToken,
      );
      setUser(authResponse.user);

      Alert.alert(
        'Tạo tài khoản thành công',
        `Chào mừng ${authResponse.user.fullName} đến với Touch Grass!`,
        [
          {
            text: 'Tiếp tục',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{name: 'Permission'}],
            }),
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể đăng ký tài khoản.';

      Alert.alert(
        'Đăng ký thất bại',
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
      const authResponse = await signInWithGoogle();
      if (!authResponse) return;
      await saveAccessToken(authResponse.accessToken);
      setUser(authResponse.user);
      navigation.reset({index: 0, routes: [{name: 'Permission'}]});
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
          <Pressable
            accessibilityRole="button"
            style={styles.backButton}
            hitSlop={8}
            onPress={() => navigation.goBack()}>
            <ChevronLeft
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.backText}>Quay lại</Text>
          </Pressable>

          <View style={styles.header}>
            <View style={styles.logo}>
              <TreePine
                size={30}
                color="#FFFFFF"
                strokeWidth={2.4}
              />
            </View>

            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>
              Bắt đầu hành trình cân bằng thời gian sử dụng màn hình.
            </Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Họ và tên"
              value={fullName}
              placeholder="Nguyễn Hải Đăng"
              autoComplete="name"
              error={errors.fullName}
              onChangeText={value => {
                setFullName(value);
                clearError('fullName');
              }}
            />

            <AuthInput
              label="Địa chỉ email"
              value={email}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email}
              onChangeText={value => {
                setEmail(value);
                clearError('email');
              }}
            />

            <View>
              <AuthInput
                label="Mật khẩu"
                value={password}
                placeholder="8+ ký tự, hoa, thường và số"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                error={errors.password}
                rightElement={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? 'Ẩn mật khẩu'
                        : 'Hiện mật khẩu'
                    }
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
                }
                onChangeText={value => {
                  setPassword(value);
                  clearError('password');
                  clearError('confirmPassword');
                }}
              />

              {password.length > 0 ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map(level => (
                      <View
                        key={level}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              level <= passwordStrength.score
                                ? passwordStrength.color
                                : colors.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.strengthText,
                      { color: passwordStrength.color },
                    ]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              ) : null}
            </View>

            <AuthInput
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              placeholder="Nhập lại mật khẩu"
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              error={errors.confirmPassword}
              onSubmitEditing={handleRegister}
              rightElement={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword
                      ? 'Ẩn mật khẩu xác nhận'
                      : 'Hiện mật khẩu xác nhận'
                  }
                  hitSlop={10}
                  onPress={() =>
                    setShowConfirmPassword(current => !current)
                  }>
                  {showConfirmPassword ? (
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
              }
              onChangeText={value => {
                setConfirmPassword(value);
                clearError('confirmPassword');
              }}
            />
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedTerms }}
            style={styles.termsButton}
            onPress={() =>
              setAcceptedTerms(current => !current)
            }>
            <View
              style={[
                styles.checkbox,
                acceptedTerms && styles.checkboxChecked,
              ]}>
              {acceptedTerms ? (
                <Check
                  size={13}
                  color="#FFFFFF"
                  strokeWidth={3}
                />
              ) : null}
            </View>

            <Text style={styles.termsText}>
              Tôi đồng ý với{' '}
              <Text style={styles.termsLink}>
                Điều khoản sử dụng
              </Text>{' '}
              và{' '}
              <Text style={styles.termsLink}>
                Chính sách quyền riêng tư
              </Text>
              .
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={!acceptedTerms || isSubmitting}
            style={({ pressed }) => [
              styles.primaryButton,
              (!acceptedTerms || isSubmitting) &&
              styles.disabledButton,
              pressed &&
              acceptedTerms &&
              !isSubmitting &&
              styles.pressed,
            ]}
            onPress={handleRegister}>
            <Text style={styles.primaryButtonText}>
              {isSubmitting
                ? 'Đang tạo tài khoản...'
                : 'Tạo tài khoản'}
            </Text>
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
              Bạn đã có tài khoản?{' '}
            </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Đăng nhập</Text>
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
    paddingTop: 8,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 14,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 14,
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
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 280,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  form: {
    rowGap: 14,
    marginBottom: 14,
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
  inputWithAction: {
    paddingRight: 48,
  },
  errorInput: {
    borderColor: colors.error,
    backgroundColor: colors.errorBackground,
  },
  inputAction: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 48,
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
  strengthContainer: {
    marginTop: 8,
  },
  strengthBars: {
    marginBottom: 4,
    flexDirection: 'row',
    columnGap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '500',
  },
  termsButton: {
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 1,
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
  termsText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primaryButton,
    fontWeight: '600',
  },
  primaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: colors.primaryButton,
    shadowColor: colors.primaryButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.45,
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
    marginVertical: 16,
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
    rowGap: 10,
    marginBottom: 18,
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
