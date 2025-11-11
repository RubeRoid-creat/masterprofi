import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  AccessibilityInfo,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../store/hooks';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { isDevelopment } from '../config/environments';
import { StyledInput } from '../components/common/StyledInput';
import { StyledButton } from '../components/common/StyledButton';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

// TypeScript interfaces
interface LoginFormData {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
}

interface LoginScreenProps {
  onLogin?: (data: LoginFormData) => Promise<void>;
  onForgotPassword?: () => void;
  onSocialLogin?: (provider: 'google' | 'apple' | 'facebook') => Promise<void>;
  showSocialLogin?: boolean;
}

interface ErrorMessage {
  type: 'network' | 'validation' | 'auth' | 'general';
  message: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onForgotPassword,
  onSocialLogin,
  showSocialLogin = true,
}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      emailOrPhone: '',
      password: '',
      rememberMe: false,
    },
  });

  // Check biometric availability
  React.useEffect(() => {
    const checkBiometric = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (compatible) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          if (enrolled) {
            setIsBiometricAvailable(true);
            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
              setBiometricType('Face ID');
            } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
              setBiometricType('Touch ID');
            } else {
              setBiometricType('биометрию');
            }
          }
        }
      } catch (err) {
        console.error('Biometric check error:', err);
      }
    };
    checkBiometric();
  }, []);

  // Check network status
  React.useEffect(() => {
    const checkNetwork = async () => {
      try {
        const NetInfo = await import('@react-native-community/netinfo');
        const state = await NetInfo.default.fetch();
        setIsOffline(!state.isConnected);
        
        const unsubscribe = NetInfo.default.addEventListener((state) => {
          setIsOffline(!state.isConnected);
        });
        
        return () => unsubscribe();
      } catch (err) {
        console.error('Network check error:', err);
      }
    };
    checkNetwork();
  }, []);

  const validateEmailOrPhone = (value: string): string | true => {
    if (!value) {
      return 'Введите email или телефон';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!emailRegex.test(value) && !phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Введите корректный email или телефон';
    }
    return true;
  };

  const validatePassword = (value: string): string | true => {
    if (!value) {
      return 'Введите пароль';
    }
    if (value.length < 6) {
      return 'Пароль должен содержать минимум 6 символов';
    }
    return true;
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Войдите с помощью биометрии',
        cancelLabel: 'Отмена',
      });
      
      if (result.success) {
        // For demo, use demo credentials
        const demoCredentials = {
          emailOrPhone: 'master@masterprofi.ru',
          password: 'master123',
        };
        await onSubmit(demoCredentials);
      }
    } catch (err) {
      console.error('Biometric login error:', err);
      setError({
        type: 'auth',
        message: 'Ошибка биометрической аутентификации',
      });
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setError(null);

    try {
      let result;
      
      if (onLogin) {
        await onLogin(data);
        return;
      }

      try {
        result = await login({
          emailOrPhone: data.emailOrPhone,
          password: data.password,
          rememberMe: data.rememberMe,
        }).unwrap();
      } catch (apiError: any) {
                // No fallback - only use real API
                throw apiError;
      }

      // Save credentials to Redux
      dispatch(setCredentials({
        user: result.user,
        token: result.token,
      }));

      // Save to AsyncStorage
      await AsyncStorage.setItem('auth_token', result.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(result.user));
      
      if (data.rememberMe && result.refreshToken) {
        await AsyncStorage.setItem('refresh_token', result.refreshToken);
      }

      // Navigation will happen automatically via RootNavigator based on auth state
      console.log('Login successful');
    } catch (err: any) {
      console.error('Login error:', err);
      setError({
        type: err?.type || 'auth',
        message: err?.data?.message || err?.message || 'Login failed. Please check your credentials.',
      });
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    if (isOffline) {
      setError({
        type: 'network',
        message: 'No internet connection. Please check your network.',
      });
      return;
    }

    setError(null);

    try {
      if (onSocialLogin) {
        await onSocialLogin(provider);
      } else {
        // Default social login handler
        console.log(`Social login: ${provider}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (err: any) {
      setError({
        type: err?.type || 'general',
        message: `Failed to login with ${provider}. Please try again.`,
      });
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      Alert.alert('Forgot Password', 'Password reset functionality will be implemented');
    }
  };

  return (
    <LinearGradient
      colors={colors.gradients.login}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        accessible={true}
        accessibilityLabel="Login screen"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: spacing['2xl'],
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContainer}>
            <View style={styles.contentContainer}>
              {/* Header */}
              <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoEmoji}>🔧</Text>
                </View>
                <Text style={styles.title} accessibilityRole="header">
                  Добро пожаловать!
                </Text>
                <Text style={styles.subtitle} accessibilityRole="text">
                  Войдите, чтобы продолжить
                </Text>
                {/* Test Accounts Hint (Development only) */}
                {isDevelopment && (
                  <View style={styles.testAccountsHint}>
                    <Text style={styles.testAccountsTitle}>
                      Тестовые аккаунты:
                    </Text>
                    <Text style={styles.testAccountsText}>
                      Мастер: master@masterprofi.ru / master123{'\n'}
                      Или телефон: +79991234567 / master123
                    </Text>
                  </View>
                )}
              </View>

              {/* Error Message */}
              {error && (
                <View
                  style={styles.errorContainer}
                  accessible={true}
                  accessibilityRole="alert"
                  accessibilityLabel={`Ошибка: ${error.message}`}
                >
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>
                    {error.message}
                  </Text>
                </View>
              )}

              {/* Offline Indicator */}
              {isOffline && (
                <View
                  style={styles.offlineContainer}
                  accessible={true}
                  accessibilityRole="alert"
                >
                  <Text style={styles.offlineIcon}>📡</Text>
                  <Text style={styles.offlineText}>
                    Вы находитесь в офлайн режиме
                  </Text>
                </View>
              )}

              {/* Email/Phone Input */}
              <Controller
                control={control}
                name="emailOrPhone"
                rules={{ validate: validateEmailOrPhone }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledInput
                    label="Email или телефон"
                    placeholder="Введите email или телефон"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="username"
                    editable={!isLoading}
                    error={errors.emailOrPhone?.message}
                    leftIcon={<Text style={{ fontSize: 18 }}>📧</Text>}
                  />
                )}
              />

              {/* Password Input */}
              <Controller
                control={control}
                name="password"
                rules={{ validate: validatePassword }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledInput
                    label="Пароль"
                    placeholder="Введите пароль"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    editable={!isLoading}
                    error={errors.password?.message}
                    leftIcon={<Text style={{ fontSize: 18 }}>🔒</Text>}
                  />
                )}
              />

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsRow}>
                <Controller
                  control={control}
                  name="rememberMe"
                  render={({ field: { onChange, value } }) => (
                    <TouchableOpacity
                      onPress={() => onChange(!value)}
                      style={styles.rememberMeContainer}
                      accessible={true}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: value }}
                      accessibilityLabel="Запомнить меня"
                      disabled={isLoading}
                    >
                      <View style={[
                        styles.checkbox,
                        value && styles.checkboxChecked,
                      ]}>
                        {value && (
                          <Text style={styles.checkboxCheckmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.rememberMeText}>Запомнить меня</Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Забыли пароль?"
                  disabled={isLoading}
                >
                  <Text style={styles.forgotPasswordText}>
                    Забыли пароль?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <StyledButton
                title={isLoading ? "Вход..." : "Войти"}
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                size="large"
                disabled={isLoading}
                loading={isLoading}
                fullWidth
              />

              {/* Biometric Login */}
              {isBiometricAvailable && (
                <StyledButton
                  title={`Войти с помощью ${biometricType}`}
                  onPress={handleBiometricLogin}
                  variant="outline"
                  size="large"
                  disabled={isLoading}
                  fullWidth
                  style={{ marginBottom: spacing.lg }}
                />
              )}

              {/* Social Login */}
              {showSocialLogin && (
                <>
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Или войти через</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.socialButtonsContainer}>
                    <StyledButton
                      title="Google"
                      onPress={() => handleSocialLogin('google')}
                      variant="outline"
                      size="medium"
                      disabled={isLoading}
                      style={{ flex: 1 }}
                    />
                    <StyledButton
                      title="Apple"
                      onPress={() => handleSocialLogin('apple')}
                      variant="outline"
                      size="medium"
                      disabled={isLoading}
                      style={{ flex: 1, marginHorizontal: spacing.sm }}
                    />
                    <StyledButton
                      title="Facebook"
                      onPress={() => handleSocialLogin('facebook')}
                      variant="outline"
                      size="medium"
                      disabled={isLoading}
                      style={{ flex: 1 }}
                    />
                  </View>
                </>
              )}

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Нет аккаунта? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Registration' as never)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Регистрация"
                >
                  <Text style={styles.signUpLink}>Зарегистрироваться</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    marginHorizontal: spacing.lg,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    ...shadows.xl,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing['5xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['3xl'],
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    ...typography.display.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  testAccountsHint: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 400,
  },
  testAccountsTitle: {
    ...typography.label.small,
    color: colors.primary[700],
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  testAccountsText: {
    ...typography.body.xsmall,
    color: colors.primary[800],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    borderRadius: borderRadius.lg,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  errorText: {
    flex: 1,
    ...typography.body.small,
    color: colors.error[700],
    fontWeight: '500',
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[200],
    borderRadius: borderRadius.lg,
  },
  offlineIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  offlineText: {
    flex: 1,
    ...typography.body.small,
    color: colors.warning[700],
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.default,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  checkboxCheckmark: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '700',
  },
  rememberMeText: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  forgotPasswordText: {
    ...typography.body.small,
    color: colors.primary[600],
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    ...typography.body.small,
    color: colors.text.tertiary,
    marginHorizontal: spacing.md,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  signUpContainer: {
    marginTop: spacing['3xl'],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  signUpLink: {
    ...typography.body.medium,
    color: colors.primary[600],
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

