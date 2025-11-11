import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledButton } from '../common/StyledButton';

interface TermsStepProps {
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const TermsStep: React.FC<TermsStepProps> = ({
  onNext,
  onBack,
  isSubmitting,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSubmit = () => {
    if (!termsAccepted || !privacyAccepted) {
      return;
    }
    onNext();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Пожалуйста, ознакомьтесь и примите условия для завершения регистрации
          </Text>

          {/* Terms of Service */}
          <View style={styles.termsCard}>
            <ScrollView style={styles.termsScroll} nestedScrollEnabled>
              <Text style={styles.termsText}>
                {`Условия использования сервиса

1. Соглашение об услугах
Регистрируясь как мастер, вы соглашаетесь предоставлять точную информацию и поддерживать профессиональные стандарты.

2. Обязанности
Вы несете ответственность за качество предоставляемых услуг и должны соблюдать все применимые законы и правила.

3. Условия оплаты
Платежи обрабатываются согласно политике оплаты платформы. Комиссия может применяться к выполненным заказам.

4. Кодекс поведения
Вы должны поддерживать профессиональное поведение, уважать конфиденциальность клиентов и соблюдать все протоколы безопасности.

5. Прекращение
Платформа оставляет за собой право приостановить или прекратить учетные записи, нарушающие эти условия.

6. Ответственность
Вы несете ответственность за любой ущерб или травмы, возникающие во время предоставления услуг.`}
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={styles.checkboxContainer}
            >
              <View
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxChecked,
                ]}
              >
                {termsAccepted && (
                  <Text style={styles.checkboxCheckmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Я принимаю Условия использования сервиса *
              </Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Policy */}
          <View style={styles.termsCard}>
            <ScrollView style={styles.termsScroll} nestedScrollEnabled>
              <Text style={styles.termsText}>
                {`Политика конфиденциальности

1. Сбор данных
Мы собираем личную информацию, необходимую для предоставления услуг, включая имя, контактные данные и данные о местоположении.

2. Использование данных
Ваша информация используется для сопоставления вас с клиентами, обработки платежей и улучшения наших услуг.

3. Передача данных
Мы можем передавать вашу информацию клиентам для целей бронирования и процессорам платежей для транзакций.

4. Безопасность данных
Мы применяем меры безопасности для защиты вашей личной информации от несанкционированного доступа.

5. Ваши права
Вы имеете право получать доступ, обновлять или удалять вашу личную информацию в любое время.

6. Файлы cookie
Мы используем файлы cookie и аналогичные технологии для улучшения вашего опыта и анализа использования сервиса.`}
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setPrivacyAccepted(!privacyAccepted)}
              style={styles.checkboxContainer}
            >
              <View
                style={[
                  styles.checkbox,
                  privacyAccepted && styles.checkboxChecked,
                ]}
              >
                {privacyAccepted && (
                  <Text style={styles.checkboxCheckmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Я принимаю Политику конфиденциальности *
              </Text>
            </TouchableOpacity>
          </View>

          {(!termsAccepted || !privacyAccepted) && (
            <Text style={styles.errorText}>
              Пожалуйста, примите оба условия для продолжения
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <StyledButton
          title="Назад"
          onPress={onBack}
          variant="outline"
          size="large"
          style={styles.button}
          disabled={isSubmitting}
        />
        <StyledButton
          title={isSubmitting ? 'Отправка...' : 'Завершить регистрацию'}
          onPress={handleSubmit}
          variant="primary"
          size="large"
          style={styles.button}
          disabled={!termsAccepted || !privacyAccepted || isSubmitting}
          loading={isSubmitting}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  termsCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  termsScroll: {
    maxHeight: 160,
    marginBottom: spacing.md,
  },
  termsText: {
    ...typography.body.small,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    borderColor: colors.border.default,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  checkboxCheckmark: {
    ...typography.body.xsmall,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  checkboxLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
    flex: 1,
  },
  errorText: {
    ...typography.body.small,
    color: colors.error[600],
    marginBottom: spacing.md,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});
