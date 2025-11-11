import { useState, useEffect, useCallback, useMemo } from "react";

export interface SearchFilter {
  field: string;
  operator: "contains" | "equals" | "startsWith" | "endsWith" | "greaterThan" | "lessThan";
  value: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: SearchFilter[];
  createdAt: Date;
}

interface UseAdvancedSearchOptions<T> {
  data: T[];
  searchFields: string[];
  storageKey?: string;
}

export const useAdvancedSearch = <T extends Record<string, any>>({
  data,
  searchFields,
  storageKey,
}: UseAdvancedSearchOptions<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Загрузка истории и сохраненных фильтров из localStorage
  useEffect(() => {
    if (storageKey) {
      const history = localStorage.getItem(`${storageKey}_history`);
      const saved = localStorage.getItem(`${storageKey}_savedFilters`);
      
      if (history) {
        try {
          setSearchHistory(JSON.parse(history));
        } catch (e) {
          console.error("Error loading search history:", e);
        }
      }
      
      if (saved) {
        try {
          setSavedFilters(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading saved filters:", e);
        }
      }
    }
  }, [storageKey]);

  // Сохранение истории поисков
  const saveToHistory = useCallback(
    (query: string) => {
      if (!query.trim() || !storageKey) return;
      
      const updated = [query, ...searchHistory.filter((q) => q !== query)].slice(0, 10);
      setSearchHistory(updated);
      localStorage.setItem(`${storageKey}_history`, JSON.stringify(updated));
    },
    [searchHistory, storageKey]
  );

  // Сохранение фильтра
  const saveFilter = useCallback(
    (name: string, filtersToSave: SearchFilter[]) => {
      if (!storageKey) return;
      
      const newFilter: SavedFilter = {
        id: `filter-${Date.now()}`,
        name,
        filters: filtersToSave,
        createdAt: new Date(),
      };
      
      const updated = [...savedFilters, newFilter];
      setSavedFilters(updated);
      localStorage.setItem(`${storageKey}_savedFilters`, JSON.stringify(updated));
      return newFilter;
    },
    [savedFilters, storageKey]
  );

  // Загрузка сохраненного фильтра
  const loadFilter = useCallback((filterId: string) => {
    const filter = savedFilters.find((f) => f.id === filterId);
    if (filter) {
      setFilters(filter.filters);
    }
  }, [savedFilters]);

  // Удаление сохраненного фильтра
  const deleteFilter = useCallback(
    (filterId: string) => {
      const updated = savedFilters.filter((f) => f.id !== filterId);
      setSavedFilters(updated);
      if (storageKey) {
        localStorage.setItem(`${storageKey}_savedFilters`, JSON.stringify(updated));
      }
    },
    [savedFilters, storageKey]
  );

  // Генерация автодополнения на основе данных
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const suggestions = new Set<string>();

    data.forEach((item) => {
      searchFields.forEach((field) => {
        const value = String(item[field] || "").toLowerCase();
        if (value.includes(query)) {
          // Извлекаем фразы, содержащие запрос
          const words = value.split(/\s+/);
          words.forEach((word) => {
            if (word.includes(query) && word.length > query.length) {
              suggestions.add(word);
            }
          });
        }
      });
    });

    // Также добавляем из истории
    searchHistory.forEach((historyItem) => {
      if (historyItem.toLowerCase().includes(query)) {
        suggestions.add(historyItem);
      }
    });

    return Array.from(suggestions).slice(0, 8);
  }, [searchQuery, data, searchFields, searchHistory]);

  // Применение поиска и фильтров
  const filteredData = useMemo(() => {
    let result = [...data];

    // Применяем текстовый поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        return searchFields.some((field) => {
          const value = String(item[field] || "").toLowerCase();
          return value.includes(query);
        });
      });
    }

    // Применяем расширенные фильтры
    filters.forEach((filter) => {
      result = result.filter((item) => {
        const fieldValue = String(item[filter.field] || "").toLowerCase();
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case "contains":
            return fieldValue.includes(filterValue);
          case "equals":
            return fieldValue === filterValue;
          case "startsWith":
            return fieldValue.startsWith(filterValue);
          case "endsWith":
            return fieldValue.endsWith(filterValue);
          case "greaterThan":
            const numValue = parseFloat(fieldValue);
            const numFilter = parseFloat(filterValue);
            return !isNaN(numValue) && !isNaN(numFilter) && numValue > numFilter;
          case "lessThan":
            const numValue2 = parseFloat(fieldValue);
            const numFilter2 = parseFloat(filterValue);
            return !isNaN(numValue2) && !isNaN(numFilter2) && numValue2 < numFilter2;
          default:
            return true;
        }
      });
    });

    return result;
  }, [data, searchQuery, filters, searchFields]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setShowAutocomplete(value.length >= 2);
    },
    []
  );

  const handleSearchSubmit = useCallback(
    (value: string) => {
      if (value.trim()) {
        saveToHistory(value);
      }
      setShowAutocomplete(false);
    },
    [saveToHistory]
  );

  const addFilter = useCallback((filter: SearchFilter) => {
    setFilters((prev) => [...prev, filter]);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    filters,
    filteredData,
    autocompleteSuggestions,
    showAutocomplete,
    searchHistory,
    savedFilters,
    handleSearchChange,
    handleSearchSubmit,
    setShowAutocomplete,
    addFilter,
    removeFilter,
    clearFilters,
    saveFilter,
    loadFilter,
    deleteFilter,
  };
};

// re-exports removed to avoid duplicate export conflicts
