import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Order } from '../../types/order';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface ApplianceDetailsProps {
  appliance: Order['appliance'];
  symptoms?: string[];
  notes?: string;
}

export const ApplianceDetails: React.FC<ApplianceDetailsProps> = ({
  appliance,
  symptoms,
  notes,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Детали техники</Text>

      {/* Basic Info */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Тип</Text>
          <Text style={styles.value}>{appliance.type}</Text>
        </View>

        {appliance.brand && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Бренд</Text>
            <Text style={styles.value}>{appliance.brand}</Text>
          </View>
        )}

        {appliance.model && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Модель</Text>
            <Text style={styles.value}>{appliance.model}</Text>
          </View>
        )}
      </View>

      {/* Symptoms */}
      {symptoms && symptoms.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Симптомы</Text>
          <View style={styles.symptomsContainer}>
            {symptoms.map((symptom, index) => (
              <View
                key={index}
                style={styles.symptomTag}
              >
                <Text style={styles.symptomText}>{symptom}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Issue Description */}
      {appliance.issue && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Описание проблемы</Text>
          <Text style={styles.descriptionText}>{appliance.issue}</Text>
        </View>
      )}

      {/* Additional Notes */}
      {notes && (
        <View>
          <Text style={styles.sectionTitle}>Дополнительные заметки</Text>
          <Text style={styles.descriptionText}>{notes}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoRow: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionTitle: {
    ...typography.label.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  symptomTag: {
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  symptomText: {
    ...typography.body.small,
    color: colors.error[800],
  },
  descriptionText: {
    ...typography.body.small,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
