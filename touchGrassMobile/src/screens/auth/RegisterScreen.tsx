import React, {useState} from 'react';
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
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  TreePine,
  UserRound,
} from 'lucide-react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  acceptedTerms?: string;
}

export function RegisterScreen({navigation}: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (password.length < 8) {
      newErrors.password =
        'Password must contain at least 8 characters.';
    }

    if (!acceptedTerms) {
      newErrors.acceptedTerms =
        'Please agree to the Terms of Service.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleRegister() {
    if (!validateForm()) {
      return;
    }

    // Hiện tại chỉ mô phỏng đăng ký thành công.
    Alert.alert(
      'Account created',
      `Welcome to Touch Grass, ${fullName.trim()}!`,
      [
        {
          text: 'Continue',
          onPress: () => navigation.replace('Permission'),
        },
      ],
    );
  }

  function handleGoogleRegister() {
    Alert.alert(
      'Google',
      'Google Sign-In will be connected later.',
    );
  }

  function handleAppleRegister() {
    Alert.alert(
      'Apple',
      'Apple Sign-In will be connected later.',
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoCircle}>
          <TreePine
            size={42}
            strokeWidth={2.5}
            color={colors.primaryButton}
          />
        </View>

        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Start your journey back to nature and find{'\n'}
          your daily balance.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Full Name</Text>

          <View
            style={[
              styles.inputContainer,
              errors.fullName && styles.inputError,
            ]}>
            <UserRound
              size={25}
              color={colors.textSecondary}
            />

            <TextInput
              style={styles.input}
              value={fullName}
              placeholder="John Doe"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="words"
              autoComplete="name"
              onChangeText={value => {
                setFullName(value);

                setErrors(current => ({
                  ...current,
                  fullName: undefined,
                }));
              }}
            />
          </View>

          {errors.fullName ? (
            <Text style={styles.errorText}>
              {errors.fullName}
            </Text>
          ) : null}

          <Text style={styles.label}>Email Address</Text>

          <View
            style={[
              styles.inputContainer,
              errors.email && styles.inputError,
            ]}>
            <Mail
              size={26}
              color={colors.textSecondary}
            />

            <TextInput
              style={styles.input}
              value={email}
              placeholder="hello@nature.com"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              onChangeText={value => {
                setEmail(value);

                setErrors(current => ({
                  ...current,
                  email: undefined,
                }));
              }}
            />
          </View>

          {errors.email ? (
            <Text style={styles.errorText}>
              {errors.email}
            </Text>
          ) : null}

          <Text style={styles.label}>Password</Text>

          <View
            style={[
              styles.inputContainer,
              errors.password && styles.inputError,
            ]}>
            <LockKeyhole
              size={25}
              color={colors.textSecondary}
            />

            <TextInput
              style={styles.input}
              value={password}
              placeholder="••••••••"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              onChangeText={value => {
                setPassword(value);

                setErrors(current => ({
                  ...current,
                  password: undefined,
                }));
              }}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
              hitSlop={10}
              onPress={() => setShowPassword(current => !current)}>
              {showPassword ? (
                <EyeOff
                  size={27}
                  color={colors.textSecondary}
                />
              ) : (
                <Eye
                  size={27}
                  color={colors.textSecondary}
                />
              )}
            </Pressable>
          </View>

          {errors.password ? (
            <Text style={styles.errorText}>
              {errors.password}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{checked: acceptedTerms}}
            style={styles.termsRow}
            onPress={() => {
              setAcceptedTerms(current => !current);

              setErrors(current => ({
                ...current,
                acceptedTerms: undefined,
              }));
            }}>
            <View
              style={[
                styles.checkbox,
                acceptedTerms && styles.checkboxChecked,
              ]}>
              {acceptedTerms ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : null}
            </View>

            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.link}>
                Terms of Service
              </Text>
              {'\n'}and{' '}
              <Text style={styles.link}>
                Privacy Policy.
              </Text>
            </Text>
          </Pressable>

          {errors.acceptedTerms ? (
            <Text style={styles.termsError}>
              {errors.acceptedTerms}
            </Text>
          ) : null}

          <Pressable
            style={({pressed}) => [
              styles.createButton,
              pressed && styles.pressed,
            ]}
            onPress={handleRegister}>
            <Text style={styles.createButtonText}>
              Create Account
            </Text>

            <ArrowRight
              size={28}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>
              OR CONTINUE WITH
            </Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            <Pressable
              style={({pressed}) => [
                styles.socialButton,
                pressed && styles.pressed,
              ]}
              onPress={handleGoogleRegister}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                styles.socialButton,
                pressed && styles.pressed,
              ]}
              onPress={handleAppleRegister}>
              <Text style={styles.appleIcon}>●</Text>
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginQuestion}>
              Already have an account?{' '}
            </Text>

            <Pressable
              accessibilityRole="link"
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.quoteDecoration}>
          <View style={styles.shortLine} />
          <Text style={styles.smallTree}>♧</Text>
          <View style={styles.shortLine} />
        </View>

        <Text style={styles.quote}>
          “In every walk with nature, one receives far{'\n'}
          more than he seeks.”
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 48,
  },

  logoCircle: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    backgroundColor: colors.lime,
  },

  title: {
    marginTop: 24,
    color: colors.primary,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '800',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
  },

  formCard: {
    marginTop: 34,
    paddingHorizontal: 28,
    paddingTop: 38,
    paddingBottom: 34,
    borderRadius: 36,
    backgroundColor: colors.surface,

    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,

    elevation: 4,
  },

  label: {
    marginBottom: 9,
    marginLeft: 4,
    color: colors.text,
    fontSize: 17,
    fontWeight: '400',
  },

  inputContainer: {
    minHeight: 68,
    marginBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 22,
    backgroundColor: colors.inputBackground,
  },

  inputError: {
    marginBottom: 5,
    borderColor: colors.error,
  },

  input: {
    flex: 1,
    marginLeft: 15,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 17,
  },

  errorText: {
    marginBottom: 16,
    marginLeft: 5,
    color: colors.error,
    fontSize: 12,
  },

  termsRow: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  checkbox: {
    width: 25,
    height: 25,
    marginTop: 2,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    borderRadius: 5,
    backgroundColor: colors.surface,
  },

  checkboxChecked: {
    borderColor: colors.primaryButton,
    backgroundColor: colors.primaryButton,
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  termsText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
  },

  link: {
    color: colors.primary,
    fontWeight: '800',
  },

  termsError: {
    marginTop: 6,
    marginLeft: 39,
    color: colors.error,
    fontSize: 12,
  },

  createButton: {
    minHeight: 64,
    marginTop: 24,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 16,
    borderRadius: 32,
    backgroundColor: colors.primaryButton,

    shadowColor: colors.primaryButton,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,

    elevation: 6,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },

  pressed: {
    opacity: 0.8,
  },

  dividerRow: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
    letterSpacing: 2,
  },

  socialRow: {
    marginTop: 26,
    flexDirection: 'row',
    columnGap: 16,
  },

  socialButton: {
    minHeight: 58,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  googleIcon: {
    color: '#4285F4',
    fontSize: 20,
    fontWeight: '800',
  },

  appleIcon: {
    color: '#111111',
    fontSize: 20,
  },

  socialText: {
    color: '#111111',
    fontSize: 17,
  },

  loginRow: {
    marginTop: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  loginQuestion: {
    color: colors.text,
    fontSize: 16,
  },

  loginLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  quoteDecoration: {
    marginTop: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shortLine: {
    width: 42,
    height: 1,
    backgroundColor: '#A0A89B',
  },

  smallTree: {
    marginHorizontal: 13,
    color: '#76936D',
    fontSize: 20,
  },

  quote: {
    marginTop: 20,
    color: '#888D84',
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});