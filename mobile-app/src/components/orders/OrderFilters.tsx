import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { OrderFilters as OrderFiltersType, OrderStatus } from '../../types/order';
import { capitalize } from '../../utils/stringHelpers';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledInput } from '../common/StyledInput';
import { StyledButton } from '../common/StyledButton';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onApply: (filters: OrderFiltersType) => void;
  onReset: () => void;
}

const APPLIANCE_TYPES = [
  'Стиральная машина',
  'Холодильник',
  'Посудомоечная машина',
  'Духовка',
  'Микроволновка',
  'Кондиционер',
  'Водонагреватель',
  'Сушилка',
];

export const OrderFiltersComponent: React.FC<OrderFiltersProps> = ({
  filters,
  onApply,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<OrderFiltersType>(filters);
  const [isVisible, setIsVisible] = useState(false);

  const handleApply = () => {
    onApply(localFilters);
    setIsVisible(false);
  };

  const toggleApplianceType = (type: string) => {
    const types = localFilters.applianceTypes || [];
    if (types.includes(type)) {
      setLocalFilters({
        ...localFilters,
        applianceTypes: types.filter((t) => t !== type),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        applianceTypes: [...types, type],
      });
    }
  };

  const hasActiveFilters = () => {
    return !!(
      localFilters.minPrice ||
      localFilters.maxPrice ||
      localFilters.maxDistance ||
      (localFilters.applianceTypes && localFilters.applianceTypes.length > 0) ||
      localFilters.sortBy
    );
  };

  const getActiveFiltersCount = () => {
    return (
      (localFilters.applianceTypes?.length || 0) +
      (localFilters.minPrice ? 1 : 0) +
      (localFilters.maxPrice ? 1 : 0) +
      (localFilters.maxDistance ? 1 : 0) +
      (localFilters.sortBy ? 1 : 0)
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        style={styles.filterButton}
      >
        <Text style={styles.filterButtonText}>Фильтры</Text>
        {hasActiveFilters() && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>
              {getActiveFiltersCount()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Фильтры</Text>
            <TouchableOpacity onPress={() => setIsVisible(false)}>
              <Text style={styles.modalCloseText}>Закрыть</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Диапазон цены</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.inputLabel}>Мин. цена</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0"
                    value={localFilters.minPrice?.toString() || ''}
                    onChangeText={(text) =>
                      setLocalFilters({
                        ...localFilters,
                        minPrice: text ? parseInt(text) : undefined,
                      })
                    }
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.inputLabel}>Макс. цена</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="10000"
                    value={localFilters.maxPrice?.toString() || ''}
                    onChangeText={(text) =>
                      setLocalFilters({
                        ...localFilters,
                        maxPrice: text ? parseInt(text) : undefined,
                      })
                    }
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>

            {/* Max Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Макс. расстояние (км)</Text>
              <TextInput
                style={styles.input}
                placeholder="50"
                value={localFilters.maxDistance?.toString() || ''}
                onChangeText={(text) =>
                  setLocalFilters({
                    ...localFilters,
                    maxDistance: text ? parseInt(text) : undefined,
                  })
                }
                keyboardType="number-pad"
              />
            </View>

            {/* Appliance Types */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Типы техники</Text>
              <View style={styles.appliancesGrid}>
                {APPLIANCE_TYPES.map((type) => {
                  const isSelected = localFilters.applianceTypes?.includes(type);
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => toggleApplianceType(type)}
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
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Сортировка</Text>
              <View style={styles.sortRow}>
                {(['distance', 'price', 'date'] as const).map((sortBy) => (
                  <TouchableOpacity
                    key={sortBy}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        sortBy,
                        sortOrder:
                          localFilters.sortBy === sortBy && localFilters.sortOrder === 'asc'
                            ? 'desc'
                            : 'asc',
                      })
                    }
                    style={[
                      styles.sortButton,
                      localFilters.sortBy === sortBy ? styles.sortButtonSelected : styles.sortButtonUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        localFilters.sortBy === sortBy ? styles.sortButtonTextSelected : styles.sortButtonTextUnselected,
                      ]}
                    >
                      {sortBy === 'distance' ? 'Расстояние' : sortBy === 'price' ? 'Цена' : 'Дата'}
                      {localFilters.sortBy === sortBy && (
                        <Text> {localFilters.sortOrder === 'asc' ? '↑' : '↓'}</Text>
                      )}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <StyledButton
              title="Сбросить"
              onPress={() => {
                setLocalFilters({});
                onReset();
                setIsVisible(false);
              }}
              variant="outline"
              size="large"
              style={styles.footerButton}
            />
            <StyledButton
              title="Применить"
              onPress={handleApply}
              variant="primary"
              size="large"
              style={styles.footerButton}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
  },
  filterButtonText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  filterBadge: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    ...typography.body.xsmall,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  modalCloseText: {
    ...typography.body.medium,
    color: colors.primary[600],
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priceInputContainer: {
    flex: 1,
  },
  inputLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  priceInput: {
    ...typography.body.medium,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  input: {
    ...typography.body.medium,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  appliancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
  sortRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sortButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
  },
  sortButtonSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  sortButtonUnselected: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.default,
  },
  sortButtonText: {
    ...typography.body.small,
    fontWeight: '600',
    textAlign: 'center',
  },
  sortButtonTextSelected: {
    color: colors.primary[600],
  },
  sortButtonTextUnselected: {
    color: colors.text.secondary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerButton: {
    flex: 1,
  },
});
