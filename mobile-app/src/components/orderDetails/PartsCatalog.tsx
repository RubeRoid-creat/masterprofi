import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { Part } from '../../types/orderDetails';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledButton } from '../common/StyledButton';
import { StyledInput } from '../common/StyledInput';

interface PartsCatalogProps {
  selectedParts: Part[];
  onPartsChange: (parts: Part[]) => void;
  availableParts?: Part[];
}

export const PartsCatalog: React.FC<PartsCatalogProps> = ({
  selectedParts,
  onPartsChange,
  availableParts = [],
}) => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(availableParts.map(p => p.category)));

  const filteredParts = availableParts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || part.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addPart = (part: Part) => {
    const existing = selectedParts.find(p => p.id === part.id);
    if (existing) {
      onPartsChange(
        selectedParts.map(p =>
          p.id === part.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      onPartsChange([...selectedParts, { ...part, quantity: 1 }]);
    }
  };

  const removePart = (partId: string) => {
    onPartsChange(selectedParts.filter(p => p.id !== partId));
  };

  const updateQuantity = (partId: string, quantity: number) => {
    if (quantity <= 0) {
      removePart(partId);
      return;
    }
    onPartsChange(
      selectedParts.map(p =>
        p.id === partId ? { ...p, quantity } : p
      )
    );
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalPartsCost = selectedParts.reduce(
    (sum, part) => sum + part.price * part.quantity,
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Запчасти и компоненты</Text>
        <StyledButton
          title="Каталог"
          onPress={() => setIsCatalogOpen(true)}
          variant="primary"
          size="small"
        />
      </View>

      {/* Selected Parts */}
      {selectedParts.length === 0 ? (
        <Text style={styles.emptyText}>Запчасти не выбраны</Text>
      ) : (
        <View>
          {selectedParts.map((part) => (
            <View
              key={part.id}
              style={styles.partItem}
            >
              <View style={styles.partInfo}>
                <Text style={styles.partName}>{part.name}</Text>
                <Text style={styles.partNumber}>{part.partNumber}</Text>
                <Text style={styles.partPrice}>
                  {formatPrice(part.price)} × {part.quantity} = {formatPrice(part.price * part.quantity)}
                </Text>
              </View>
              <View style={styles.partControls}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(part.id, part.quantity - 1)}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>
                    {part.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(part.id, part.quantity + 1)}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => removePart(part.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Удалить</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.totalSection}>
            <Text style={styles.totalText}>
              Итого: {formatPrice(totalPartsCost)}
            </Text>
          </View>
        </View>
      )}

      {/* Catalog Modal */}
      <Modal
        visible={isCatalogOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCatalogOpen(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Каталог запчастей</Text>
            <TouchableOpacity onPress={() => setIsCatalogOpen(false)}>
              <Text style={styles.modalCloseText}>Готово</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <StyledInput
              placeholder="Поиск запчастей..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              style={[
                styles.categoryTag,
                selectedCategory === null ? styles.categoryTagSelected : styles.categoryTagUnselected,
              ]}
            >
              <Text
                style={[
                  styles.categoryTagText,
                  selectedCategory === null ? styles.categoryTagTextSelected : styles.categoryTagTextUnselected,
                ]}
              >
                Все
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryTag,
                  selectedCategory === category ? styles.categoryTagSelected : styles.categoryTagUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryTagText,
                    selectedCategory === category ? styles.categoryTagTextSelected : styles.categoryTagTextUnselected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Parts List */}
          <ScrollView style={styles.partsList}>
            {filteredParts.length === 0 ? (
              <View style={styles.emptyPartsContainer}>
                <Text style={styles.emptyPartsText}>Нет доступных запчастей</Text>
                <Text style={styles.emptyPartsSubtext}>
                  Запчасти будут загружены из базы данных
                </Text>
              </View>
            ) : (
              filteredParts.map((part) => {
                const isSelected = selectedParts.some(p => p.id === part.id);
                return (
                  <TouchableOpacity
                    key={part.id}
                    onPress={() => addPart(part)}
                    style={[
                      styles.partCard,
                      isSelected && styles.partCardSelected,
                    ]}
                    disabled={!part.inStock}
                  >
                    <View style={styles.partCardContent}>
                      <View style={styles.partCardLeft}>
                        <View style={styles.partCardHeader}>
                          <Text style={styles.partCardName}>
                            {part.name}
                          </Text>
                          {!part.inStock && (
                            <View style={styles.outOfStockBadge}>
                              <Text style={styles.outOfStockText}>
                                Нет в наличии
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.partCardMeta}>
                          {part.partNumber} • {part.category}
                        </Text>
                        <Text style={styles.partCardPrice}>
                          {formatPrice(part.price)}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedCheckmark}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const emptyPartsStyles = StyleSheet.create({
  emptyPartsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyPartsText: {
    ...typography.body.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  emptyPartsSubtext: {
    ...typography.body.small,
    color: colors.text.disabled,
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.body.medium,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    ...typography.body.small,
    fontWeight: '600',
    color: colors.text.primary,
  },
  partNumber: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
  },
  partPrice: {
    ...typography.body.small,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  partControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  quantityButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  quantityButtonText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  quantityValue: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...typography.body.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: colors.error[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  removeButtonText: {
    ...typography.body.small,
    color: colors.error[600],
    fontWeight: '600',
  },
  totalSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  totalText: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'right',
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
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  categoryTagSelected: {
    backgroundColor: colors.primary[600],
  },
  categoryTagUnselected: {
    backgroundColor: colors.gray[100],
  },
  categoryTagText: {
    ...typography.body.small,
    fontWeight: '600',
  },
  categoryTagTextSelected: {
    color: colors.text.inverse,
  },
  categoryTagTextUnselected: {
    color: colors.text.secondary,
  },
  partsList: {
    flex: 1,
    padding: spacing.md,
  },
  partCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    backgroundColor: colors.background.primary,
    borderColor: colors.border.light,
  },
  partCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  partCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  partCardLeft: {
    flex: 1,
  },
  partCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  partCardName: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  outOfStockBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.error[100],
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  outOfStockText: {
    ...typography.body.xsmall,
    color: colors.error[800],
    fontWeight: '600',
  },
  partCardMeta: {
    ...typography.body.small,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  partCardPrice: {
    ...typography.heading.h3,
    fontWeight: '700',
    color: colors.text.primary,
  },
  selectedBadge: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  selectedCheckmark: {
    ...typography.body.small,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  emptyPartsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyPartsText: {
    ...typography.body.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  emptyPartsSubtext: {
    ...typography.body.small,
    color: colors.text.disabled,
  },
});
