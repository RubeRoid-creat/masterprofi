/**
 * API Error Display Component
 * Shows user-friendly error messages for API errors
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Alert } from '../ui/Alert';
import { StyledButton } from '../common/StyledButton';

export interface ApiErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  title?: string;
  showDetails?: boolean;
  variant?: 'alert' | 'fullscreen' | 'inline';
}

export const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({
  error,
  onRetry,
  title,
  showDetails = false,
  variant = 'alert',
}) => {
  const getErrorMessage = (): string => {
    if (!error) return 'Произошла неизвестная ошибка';

    // Handle RTK Query errors
    if (error.status) {
      if (error.status === 'FETCH_ERROR') {
        return 'Ошибка сети. Проверьте подключение к интернету.';
      }
      if (error.status === 'PARSING_ERROR') {
        return 'Ошибка обработки данных от сервера.';
      }
      if (error.status === 'TIMEOUT_ERROR') {
        return 'Превышено время ожидания. Попробуйте еще раз.';
      }
      if (error.status === 'CUSTOM_ERROR') {
        return error.error || 'Произошла ошибка';
      }
    }

    // Handle HTTP status codes
    if (error.status === 401) {
      return 'Требуется авторизация. Пожалуйста, войдите в систему.';
    }
    if (error.status === 403) {
      return 'Доступ запрещен. У вас нет прав для выполнения этого действия.';
    }
    if (error.status === 404) {
      return 'Запрашиваемый ресурс не найден.';
    }
    if (error.status === 500) {
      return 'Ошибка сервера. Пожалуйста, попробуйте позже или обратитесь в поддержку.';
    }
    if (error.status === 503) {
      return 'Сервис временно недоступен. Пожалуйста, попробуйте позже.';
    }

    // Handle error data
    if (error.data?.message) {
      return error.data.message;
    }
    if (error.message) {
      return error.message;
    }

    return 'Произошла ошибка при загрузке данных';
  };

  const getErrorDetails = (): string | null => {
    if (!showDetails) return null;

    if (error.status && typeof error.status === 'number') {
      return `HTTP ${error.status}`;
    }
    if (error.status && typeof error.status === 'string') {
      return `Статус: ${error.status}`;
    }
    return null;
  };

  const errorMessage = getErrorMessage();
  const errorDetails = getErrorDetails();

  if (variant === 'fullscreen') {
    return (
      <View style={styles.fullscreenContainer}>
        <View style={styles.fullscreenContent}>
          <Text style={styles.fullscreenIcon}>⚠️</Text>
          <Text style={styles.fullscreenTitle}>
            {title || 'Ошибка загрузки данных'}
          </Text>
          <Text style={styles.fullscreenMessage}>{errorMessage}</Text>
          {errorDetails && (
            <Text style={styles.fullscreenDetails}>{errorDetails}</Text>
          )}
          {onRetry && (
            <StyledButton
              title="Повторить попытку"
              onPress={onRetry}
              variant="primary"
              size="large"
              style={styles.retryButton}
            />
          )}
        </View>
      </View>
    );
  }

  if (variant === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        <Text style={styles.inlineText}>{errorMessage}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.inlineRetry}>
            <Text style={styles.inlineRetryText}>Повторить</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default: alert variant
  return (
    <Alert
      variant="error"
      title={title || 'Ошибка'}
      message={errorMessage}
      onClose={onRetry ? undefined : undefined}
      showIcon={true}
    >
      {errorDetails && (
        <Text style={styles.detailsText}>{errorDetails}</Text>
      )}
      {onRetry && (
        <View style={styles.alertActions}>
          <StyledButton
            title="Повторить"
            onPress={onRetry}
            variant="primary"
            size="medium"
            fullWidth={false}
          />
        </View>
      )}
    </Alert>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.background.secondary,
  },
  fullscreenContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  fullscreenIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  fullscreenTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  fullscreenMessage: {
    ...typography.body.large,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  fullscreenDetails: {
    ...typography.body.small,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    marginTop: spacing.xl,
    minWidth: 200,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.error[50],
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error[600],
  },
  inlineText: {
    ...typography.body.medium,
    color: colors.error[800],
    flex: 1,
  },
  inlineRetry: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inlineRetryText: {
    ...typography.label.medium,
    color: colors.error[700],
    fontWeight: '600',
  },
  detailsText: {
    ...typography.body.small,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  alertActions: {
    marginTop: spacing.md,
    alignItems: 'flex-end',
  },
});

