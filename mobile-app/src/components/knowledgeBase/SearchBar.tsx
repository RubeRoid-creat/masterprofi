import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFiltersPress?: () => void;
  filterCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Поиск статей, руководств, уроков...',
  onSearch,
  onFiltersPress,
  filterCount = 0,
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearIcon}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      {onFiltersPress && (
        <TouchableOpacity
          onPress={onFiltersPress}
          style={styles.filtersButton}
        >
          <Text style={styles.filtersIcon}>🔧</Text>
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={handleSearch}
        style={styles.searchButton}
      >
        <Text style={styles.searchButtonText}>Поиск</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    ...typography.body.medium,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.body.medium,
    color: colors.text.primary,
  },
  clearButton: {
    marginLeft: spacing.xs,
  },
  clearIcon: {
    ...typography.body.medium,
    color: colors.text.disabled,
  },
  filtersButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  filtersIcon: {
    ...typography.body.medium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
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
  searchButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  searchButtonText: {
    ...typography.body.medium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});
