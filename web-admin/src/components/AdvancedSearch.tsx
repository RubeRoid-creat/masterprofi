import React, { useState, useRef, useEffect } from "react";
import type { SearchFilter, SavedFilter } from "../hooks/useAdvancedSearch";

interface AdvancedSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  autocompleteSuggestions: string[];
  showAutocomplete: boolean;
  onShowAutocompleteChange: (show: boolean) => void;
  searchHistory: string[];
  filters: SearchFilter[];
  onAddFilter: (filter: SearchFilter) => void;
  onRemoveFilter: (index: number) => void;
  onClearFilters: () => void;
  savedFilters: SavedFilter[];
  onSaveFilter: (name: string, filters: SearchFilter[]) => SavedFilter | undefined;
  onLoadFilter: (filterId: string) => void;
  onDeleteFilter: (filterId: string) => void;
  availableFields: Array<{ value: string; label: string; type: "text" | "number" | "date" }>;
}

export function AdvancedSearch({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  autocompleteSuggestions,
  showAutocomplete,
  onShowAutocompleteChange,
  searchHistory,
  filters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  savedFilters,
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  availableFields,
}: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [newFilter, setNewFilter] = useState<Partial<SearchFilter>>({
    field: "",
    operator: "contains",
    value: "",
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Закрытие автодополнения при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        onShowAutocompleteChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onShowAutocompleteChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearchSubmit(searchQuery);
    } else if (e.key === "Escape") {
      onShowAutocompleteChange(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    onSearchSubmit(suggestion);
  };

  const handleAddFilter = () => {
    if (newFilter.field && newFilter.value && newFilter.operator) {
      onAddFilter({
        field: newFilter.field,
        operator: newFilter.operator,
        value: newFilter.value,
      });
      setNewFilter({ field: "", operator: "contains", value: "" });
    }
  };

  const handleSaveFilter = () => {
    if (newFilterName.trim() && filters.length > 0) {
      onSaveFilter(newFilterName, filters);
      setNewFilterName("");
      setShowSavedFilters(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Основная строка поиска */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchQuery.length >= 2 || searchHistory.length > 0) {
                  onShowAutocompleteChange(true);
                }
              }}
              placeholder="Поиск по всем полям..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange("");
                  onShowAutocompleteChange(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            🔍 Фильтры
          </button>
          {savedFilters.length > 0 && (
            <button
              onClick={() => setShowSavedFilters(!showSavedFilters)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
            >
              ⭐ Сохраненные
            </button>
          )}
        </div>

        {/* Автодополнение */}
        {showAutocomplete && (autocompleteSuggestions.length > 0 || searchHistory.length > 0) && (
          <div
            ref={autocompleteRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {autocompleteSuggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-500 px-2 py-1">Предложения</div>
                {autocompleteSuggestions.map((suggestion: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {searchHistory.length > 0 && (
              <div className="border-t border-gray-200 p-2">
                <div className="text-xs text-gray-500 px-2 py-1">История</div>
                {searchHistory.slice(0, 5).map((item: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
                  >
                    <span className="text-gray-400">🕐</span>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Активные фильтры */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Активные фильтры:</span>
          {filters.map((filter: SearchFilter, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>
                {availableFields.find((f: { value: string; label: string; type: "text" | "number" | "date" }) => f.value === filter.field)?.label || filter.field}{" "}
                {filter.operator === "contains" && "содержит"}
                {filter.operator === "equals" && "равно"}
                {filter.operator === "startsWith" && "начинается с"}
                {filter.operator === "endsWith" && "заканчивается на"}
                {filter.operator === "greaterThan" && "больше"}
                {filter.operator === "lessThan" && "меньше"}{" "}
                "{filter.value}"
              </span>
              <button
                onClick={() => onRemoveFilter(index)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={onClearFilters}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Очистить все
          </button>
        </div>
      )}

      {/* Расширенные фильтры */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex gap-2 mb-3">
            <select
              value={newFilter.field || ""}
              onChange={(e) => setNewFilter({ ...newFilter, field: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Выберите поле</option>
              {availableFields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
            <select
              value={newFilter.operator || "contains"}
              onChange={(e) =>
                setNewFilter({ ...newFilter, operator: e.target.value as SearchFilter["operator"] })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="contains">Содержит</option>
              <option value="equals">Равно</option>
              <option value="startsWith">Начинается с</option>
              <option value="endsWith">Заканчивается на</option>
              <option value="greaterThan">Больше</option>
              <option value="lessThan">Меньше</option>
            </select>
            <input
              type="text"
              value={newFilter.value || ""}
              onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
              placeholder="Значение"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleAddFilter}
              disabled={!newFilter.field || !newFilter.value}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Добавить
            </button>
          </div>
        </div>
      )}

      {/* Сохраненные фильтры */}
      {showSavedFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Сохраненные фильтры</h3>
            {filters.length > 0 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  placeholder="Название фильтра"
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={handleSaveFilter}
                  disabled={!newFilterName.trim()}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300"
                >
                  Сохранить
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {savedFilters.length === 0 ? (
              <p className="text-gray-500 text-sm">Нет сохраненных фильтров</p>
            ) : (
              savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                >
                  <div>
                    <div className="font-medium">{filter.name}</div>
                    <div className="text-xs text-gray-500">
                      {filter.filters.length} фильтр(ов) ·{" "}
                      {new Date(filter.createdAt).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onLoadFilter(filter.id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Загрузить
                    </button>
                    <button
                      onClick={() => onDeleteFilter(filter.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

