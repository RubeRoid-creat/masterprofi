import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { PartItem } from '../../../types/repairCalculator';

interface PartsSelectorProps {
  applianceType: string;
  selectedParts: PartItem[];
  onPartsChange: (parts: PartItem[]) => void;
  onNext: () => void;
}

// Mock parts database - Replace with actual API call
const mockPartsDatabase: PartItem[] = [
  {
    id: '1',
    name: 'Motor Capacitor 35µF',
    partNumber: 'CAP-35-001',
    price: 850,
    quantity: 1,
    category: 'Electrical',
    brand: 'Samsung',
    inStock: true,
    compatibility: ['Samsung WF45T6000AW', 'Samsung WF50K7500AV'],
    warranty: 12,
    estimatedDelivery: '1-2',
  },
  {
    id: '2',
    name: 'Door Seal Gasket',
    partNumber: 'DSG-001',
    price: 3200,
    quantity: 1,
    category: 'Sealing',
    brand: 'Universal',
    inStock: true,
    compatibility: ['Universal'],
    warranty: 6,
    estimatedDelivery: '3-5',
  },
  {
    id: '3',
    name: 'Drain Pump',
    partNumber: 'DP-450',
    price: 4500,
    quantity: 1,
    category: 'Mechanical',
    brand: 'LG',
    inStock: false,
    compatibility: ['LG WM3900HWA', 'LG WM4000HWA'],
    warranty: 24,
    estimatedDelivery: '7-10',
  },
  {
    id: '4',
    name: 'Water Inlet Valve',
    partNumber: 'WIV-220',
    price: 2100,
    quantity: 1,
    category: 'Mechanical',
    brand: 'Bosch',
    inStock: true,
    compatibility: ['Bosch WAT28400UC', 'Bosch WAT28401UC'],
    warranty: 12,
    estimatedDelivery: '2-3',
  },
  {
    id: '5',
    name: 'Heating Element',
    partNumber: 'HE-1800W',
    price: 6500,
    quantity: 1,
    category: 'Electrical',
    brand: 'Electrolux',
    inStock: true,
    compatibility: ['Electrolux EFLS627UTT'],
    warranty: 12,
    estimatedDelivery: '1-2',
  },
];

export const PartsSelector: React.FC<PartsSelectorProps> = ({
  applianceType,
  selectedParts,
  onPartsChange,
  onNext,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [parts, setParts] = useState<PartItem[]>(mockPartsDatabase);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Simulate API call
  useEffect(() => {
    loadParts();
  }, [applianceType, categoryFilter, searchQuery]);

  const loadParts = async () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      let filtered = [...mockPartsDatabase];
      
      if (categoryFilter) {
        filtered = filtered.filter((p) => p.category === categoryFilter);
      }
      
      if (searchQuery) {
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setParts(filtered);
      setLoading(false);
    }, 300);
  };

  const categories = Array.from(new Set(mockPartsDatabase.map((p) => p.category)));

  const handleAddPart = (part: PartItem) => {
    const existing = selectedParts.find((p) => p.id === part.id);
    if (existing) {
      // Increase quantity
      const updated = selectedParts.map((p) =>
        p.id === part.id ? { ...p, quantity: p.quantity + 1 } : p
      );
      onPartsChange(updated);
    } else {
      // Add new part
      onPartsChange([...selectedParts, { ...part, quantity: 1 }]);
    }
  };

  const handleRemovePart = (partId: string) => {
    const updated = selectedParts.filter((p) => p.id !== partId);
    onPartsChange(updated);
  };

  const handleQuantityChange = (partId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemovePart(partId);
      return;
    }
    const updated = selectedParts.map((p) =>
      p.id === partId ? { ...p, quantity } : p
    );
    onPartsChange(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPartTotal = (part: PartItem) => part.price * part.quantity;

  const selectedPartsTotal = selectedParts.reduce(
    (sum, part) => sum + getPartTotal(part),
    0
  );

  return (
    <View className="flex-1">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Select Parts ({applianceType})
      </Text>

      {/* Search */}
      <TextInput
        className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 mb-3"
        placeholder="Search by name or part number..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setCategoryFilter(null)}
            className={`px-4 py-2 rounded-lg ${
              categoryFilter === null ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <Text
              className={`font-medium ${
                categoryFilter === null ? 'text-white' : 'text-gray-700'
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-lg ${
                categoryFilter === category ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`font-medium ${
                  categoryFilter === category ? 'text-white' : 'text-gray-700'
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Parts List */}
      {loading ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={parts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-500 mb-1">
                    Part #: {item.partNumber}
                  </Text>
                  {item.brand && (
                    <Text className="text-xs text-gray-500">Brand: {item.brand}</Text>
                  )}
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold text-blue-600">
                    {formatCurrency(item.price)}
                  </Text>
                  <View
                    className={`px-2 py-1 rounded mt-1 ${
                      item.inStock ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.inStock ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </Text>
                  </View>
                </View>
              </View>

              {item.warranty && (
                <Text className="text-xs text-gray-500 mb-2">
                  Warranty: {item.warranty} months
                </Text>
              )}

              <TouchableOpacity
                onPress={() => handleAddPart(item)}
                disabled={!item.inStock}
                className={`px-4 py-2 rounded-lg ${
                  item.inStock ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <Text
                  className={`font-medium text-center ${
                    item.inStock ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {selectedParts.find((p) => p.id === item.id)
                    ? 'Add More'
                    : 'Add to Quote'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Text className="text-gray-500">No parts found</Text>
            </View>
          }
        />
      )}

      {/* Selected Parts Summary */}
      {selectedParts.length > 0 && (
        <View className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Selected Parts ({selectedParts.length})
          </Text>
          {selectedParts.map((part) => (
            <View key={part.id} className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">{part.name}</Text>
                <Text className="text-xs text-gray-500">
                  {formatCurrency(part.price)} × {part.quantity}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(part.id, part.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 rounded items-center justify-center"
                  >
                    <Text className="text-gray-700 font-bold">−</Text>
                  </TouchableOpacity>
                  <Text className="text-sm font-semibold text-gray-900 w-8 text-center">
                    {part.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(part.id, part.quantity + 1)}
                    className="w-8 h-8 bg-gray-200 rounded items-center justify-center"
                  >
                    <Text className="text-gray-700 font-bold">+</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-sm font-semibold text-gray-900 w-20 text-right">
                  {formatCurrency(getPartTotal(part))}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemovePart(part.id)}
                  className="w-8 h-8 bg-red-100 rounded items-center justify-center"
                >
                  <Text className="text-red-600 font-bold">×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View className="flex-row justify-between items-center pt-3 mt-3 border-t border-gray-300">
            <Text className="text-base font-bold text-gray-900">Parts Total</Text>
            <Text className="text-lg font-bold text-blue-600">
              {formatCurrency(selectedPartsTotal)}
            </Text>
          </View>
        </View>
      )}

      {/* Next Button */}
      <TouchableOpacity
        onPress={onNext}
        className="bg-blue-600 px-4 py-3 rounded-lg mt-4"
      >
        <Text className="text-white font-semibold text-center">Next: Labor Time</Text>
      </TouchableOpacity>
    </View>
  );
};








