import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StepConfig, RegistrationStep } from '../../types/registration';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface ProgressIndicatorProps {
  steps: StepConfig[];
  currentStep: RegistrationStep;
  progress: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  progress,
}) => {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Step Info */}
      <View style={styles.stepInfo}>
        <View style={styles.stepInfoLeft}>
          <Text style={styles.stepTitle}>
            {steps[currentIndex]?.title}
          </Text>
          <Text style={styles.stepCounter}>
            Шаг {currentIndex + 1} из {steps.length}
          </Text>
        </View>
        <Text style={styles.progressPercent}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      {/* Step Dots */}
      <View style={styles.stepDots}>
        {steps.map((step, index) => (
          <View
            key={step.id}
            style={[
              styles.stepDot,
              index <= currentIndex ? styles.stepDotActive : styles.stepDotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  progressBarContainer: {
    marginBottom: spacing.md,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.full,
  },
  stepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepInfoLeft: {
    flex: 1,
  },
  stepTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
  },
  stepCounter: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  progressPercent: {
    ...typography.body.small,
    fontWeight: '600',
    color: colors.primary[600],
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  stepDotActive: {
    backgroundColor: colors.primary[600],
  },
  stepDotInactive: {
    backgroundColor: colors.gray[300],
  },
});

