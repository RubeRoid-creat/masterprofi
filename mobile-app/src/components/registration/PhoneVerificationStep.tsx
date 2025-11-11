import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledButton } from '../common/StyledButton';

interface PhoneVerificationStepProps {
  phone: string;
  onNext: (data: { phoneVerified: true }) => void;
  onBack: () => void;
}

export const PhoneVerificationStep: React.FC<PhoneVerificationStepProps> = ({
  phone,
  onNext,
  onBack,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (code.every((digit) => digit !== '') && code.length === 6) {
      handleVerify();
    }
  }, [code]);

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const sendOTP = async () => {
    setIsResending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Успешно', `Код отправлен на ${phone}`);
      setCode(['', '', '', '', '', '']);
      setTimer(60);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить код. Попробуйте еще раз.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const otpCode = code.join('');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (otpCode.length === 6) {
        onNext({ phoneVerified: true });
      } else {
        Alert.alert('Ошибка', 'Введите полный код');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Неверный код. Попробуйте еще раз.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    await sendOTP();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Мы отправили код подтверждения на:
        </Text>
        <Text style={styles.phoneNumber}>{phone}</Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {isVerifying && (
          <View style={styles.verifyingContainer}>
            <ActivityIndicator size="small" color={colors.primary[600]} />
            <Text style={styles.verifyingText}>Проверка...</Text>
          </View>
        )}

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendLabel}>
            Не получили код?
          </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={timer > 0 || isResending}
            style={[styles.resendButton, (timer > 0 || isResending) && styles.resendButtonDisabled]}
          >
            <Text style={styles.resendButtonText}>
              {isResending
                ? 'Отправка...'
                : timer > 0
                ? `Отправить повторно через ${timer}с`
                : 'Отправить повторно'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Change Phone Number */}
        <TouchableOpacity onPress={onBack} style={styles.changePhoneButton}>
          <Text style={styles.changePhoneText}>Изменить номер телефона</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <StyledButton
          title="Назад"
          onPress={onBack}
          variant="outline"
          size="large"
          style={styles.button}
        />
        <StyledButton
          title="Подтвердить"
          onPress={handleVerify}
          variant="primary"
          size="large"
          style={styles.button}
          disabled={code.some((digit) => !digit) || isVerifying}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  phoneNumber: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    textAlign: 'center',
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    backgroundColor: colors.background.primary,
  },
  otpInputFilled: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  verifyingText: {
    ...typography.body.small,
    color: colors.primary[600],
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resendLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  resendButton: {
    padding: spacing.xs,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    ...typography.body.small,
    fontWeight: '600',
    color: colors.primary[600],
  },
  changePhoneButton: {
    alignItems: 'center',
  },
  changePhoneText: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});
