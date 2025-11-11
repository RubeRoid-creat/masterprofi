import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { SkillsInfo } from '../../types/registration';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledInput } from '../common/StyledInput';
import { StyledButton } from '../common/StyledButton';

interface SkillsStepProps {
  initialData?: Partial<SkillsInfo>;
  onNext: (data: { skills: SkillsInfo }) => void;
  onBack: () => void;
}

const APPLIANCES = [
  'Стиральная машина',
  'Холодильник',
  'Посудомоечная машина',
  'Духовка',
  'Микроволновка',
  'Кондиционер',
  'Водонагреватель',
  'Сушилка',
  'Плита',
  'Пылесос',
  'Кофемашина',
  'Блендер',
  'Утюг',
  'Телевизор',
  'Другое',
];

export const SkillsStep: React.FC<SkillsStepProps> = ({
  initialData,
  onNext,
  onBack,
}) => {
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>(
    initialData?.appliances || []
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<SkillsInfo, 'appliances'>>({
    defaultValues: {
      experienceYears: initialData?.experienceYears || 0,
      certifications: initialData?.certifications || [],
      specialties: initialData?.specialties || [],
    },
  });

  const toggleAppliance = (appliance: string) => {
    setSelectedAppliances((prev) =>
      prev.includes(appliance)
        ? prev.filter((item) => item !== appliance)
        : [...prev, appliance]
    );
  };

  const onSubmit = (data: Omit<SkillsInfo, 'appliances'>) => {
    if (selectedAppliances.length === 0) {
      return;
    }
    onNext({
      skills: {
        ...data,
        appliances: selectedAppliances,
      },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Выберите типы техники, которую вы можете ремонтировать
        </Text>

        {/* Appliances Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Типы техники * (выберите все подходящие)
          </Text>
          <View style={styles.appliancesGrid}>
            {APPLIANCES.map((appliance) => {
              const isSelected = selectedAppliances.includes(appliance);
              return (
                <TouchableOpacity
                  key={appliance}
                  onPress={() => toggleAppliance(appliance)}
                  style={[
                    styles.applianceTag,
                    isSelected ? styles.applianceTagSelected : styles.applianceTagUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.applianceTagText,
                      isSelected ? styles.applianceTagTextSelected : styles.applianceTagTextUnselected,
                    ]}
                  >
                    {appliance}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedAppliances.length === 0 && (
            <Text style={styles.errorText}>
              Пожалуйста, выберите хотя бы один тип техники
            </Text>
          )}
        </View>

        {/* Experience Years */}
        <Controller
          control={control}
          name="experienceYears"
          rules={{
            required: 'Опыт обязателен',
            min: { value: 0, message: 'Должно быть 0 или больше' },
          }}
          render={({ field: { onChange, value } }) => (
            <StyledInput
              label="Годы опыта *"
              placeholder="0"
              value={value?.toString() || ''}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                onChange(num);
              }}
              keyboardType="number-pad"
              error={errors.experienceYears?.message}
            />
          )}
        />

        {/* Specialties (Optional) */}
        <Controller
          control={control}
          name="specialties"
          render={({ field: { onChange, value } }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Специализации (необязательно)
              </Text>
              <Text style={styles.sectionHint}>
                Опишите области вашей экспертизы, например: "Специалист по немецкой технике"
              </Text>
              <StyledInput
                placeholder="Введите ваши специализации"
                value={value?.join(', ') || ''}
                onChangeText={(text) => {
                  const specialties = text
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s);
                  onChange(specialties);
                }}
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        />
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
          title="Продолжить"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          size="large"
          style={styles.button}
          disabled={selectedAppliances.length === 0}
        />
      </View>
    </ScrollView>
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
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  sectionHint: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  appliancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  applianceTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
  },
  applianceTagSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  applianceTagUnselected: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.default,
  },
  applianceTagText: {
    ...typography.body.small,
    fontWeight: '600',
  },
  applianceTagTextSelected: {
    color: colors.primary[600],
  },
  applianceTagTextUnselected: {
    color: colors.text.secondary,
  },
  errorText: {
    ...typography.body.small,
    color: colors.error[600],
    marginTop: spacing.xs,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  button: {
    flex: 1,
  },
});
