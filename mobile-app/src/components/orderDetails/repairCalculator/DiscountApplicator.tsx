import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Discount } from '../../../types/repairCalculator';

interface DiscountApplicatorProps {
  subtotal: number;
  currentDiscount: Discount | null;
  onDiscountChange: (discount: Discount | null) => void;
}

export const DiscountApplicator: React.FC<DiscountApplicatorProps> = ({
  subtotal,
  currentDiscount,
  onDiscountChange,
}) => {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    currentDiscount?.type || 'percentage'
  );
  const [discountValue, setDiscountValue] = useState(
    currentDiscount?.value.toString() || '0'
  );
  const [discountReason, setDiscountReason] = useState(currentDiscount?.reason || '');

  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue) || 0;
    
    if (value <= 0) {
      onDiscountChange(null);
      return;
    }

    let discount: Discount = {
      type: discountType,
      value: value > (discountType === 'percentage' ? 100 : subtotal) 
        ? (discountType === 'percentage' ? 100 : subtotal) 
        : value,
      reason: discountReason || undefined,
    };

    if (discountType === 'percentage') {
      discount.maxAmount = subtotal; // Prevent discount exceeding subtotal
    }

    onDiscountChange(discount);
  };

  const handleRemoveDiscount = () => {
    setDiscountValue('0');
    setDiscountReason('');
    onDiscountChange(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDiscountAmount = () => {
    if (!currentDiscount) return 0;
    if (currentDiscount.type === 'percentage') {
      const amount = (subtotal * currentDiscount.value) / 100;
      return currentDiscount.maxAmount ? Math.min(amount, currentDiscount.maxAmount) : amount;
    }
    return Math.min(currentDiscount.value, subtotal);
  };

  const discountAmount = currentDiscount ? calculateDiscountAmount() : 0;

  return (
    <View className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
      <Text className="text-base font-semibold text-gray-900 mb-3">Discount</Text>

      {/* Discount Type Toggle */}
      <View className="flex-row gap-2 mb-3">
        <TouchableOpacity
          onPress={() => {
            setDiscountType('percentage');
            setDiscountValue('0');
          }}
          className={`flex-1 px-4 py-2 rounded-lg border ${
            discountType === 'percentage'
              ? 'bg-yellow-600 border-yellow-600'
              : 'bg-white border-gray-300'
          }`}
        >
          <Text
            className={`font-medium text-center ${
              discountType === 'percentage' ? 'text-white' : 'text-gray-700'
            }`}
          >
            Percentage
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setDiscountType('fixed');
            setDiscountValue('0');
          }}
          className={`flex-1 px-4 py-2 rounded-lg border ${
            discountType === 'fixed'
              ? 'bg-yellow-600 border-yellow-600'
              : 'bg-white border-gray-300'
          }`}
        >
          <Text
            className={`font-medium text-center ${
              discountType === 'fixed' ? 'text-white' : 'text-gray-700'
            }`}
          >
            Fixed Amount
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Percentage Buttons */}
      {discountType === 'percentage' && (
        <View className="flex-row gap-2 mb-3">
          {[5, 10, 15, 20].map((percent) => (
            <TouchableOpacity
              key={percent}
              onPress={() => {
                setDiscountValue(percent.toString());
                handleApplyDiscount();
              }}
              className={`px-3 py-2 rounded-lg border ${
                currentDiscount?.value === percent && discountType === 'percentage'
                  ? 'bg-yellow-600 border-yellow-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  currentDiscount?.value === percent && discountType === 'percentage'
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {percent}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Discount Value Input */}
      <View className="mb-3">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {discountType === 'percentage' ? 'Discount %' : 'Discount Amount'}
        </Text>
        <TextInput
          className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
          placeholder={discountType === 'percentage' ? '0' : '0'}
          value={discountValue}
          onChangeText={(text) => {
            setDiscountValue(text);
            if (text && parseFloat(text) > 0) {
              const discount: Discount = {
                type: discountType,
                value: parseFloat(text) || 0,
                reason: discountReason || undefined,
              };
              if (discountType === 'percentage') {
                discount.maxAmount = subtotal;
              }
              onDiscountChange(discount.value > 0 ? discount : null);
            } else {
              onDiscountChange(null);
            }
          }}
          keyboardType="decimal-pad"
        />
        {discountType === 'fixed' && (
          <Text className="text-xs text-gray-500 mt-1">
            Max: {formatCurrency(subtotal)}
          </Text>
        )}
      </View>

      {/* Reason Input */}
      <View className="mb-3">
        <Text className="text-sm font-medium text-gray-700 mb-2">Reason (Optional)</Text>
        <TextInput
          className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
          placeholder="e.g., Loyalty discount, First-time customer..."
          value={discountReason}
          onChangeText={(text) => {
            setDiscountReason(text);
            if (currentDiscount) {
              onDiscountChange({
                ...currentDiscount,
                reason: text || undefined,
              });
            }
          }}
        />
      </View>

      {/* Discount Preview */}
      {discountAmount > 0 && (
        <View className="bg-white rounded-lg p-3 mb-3 border border-yellow-300">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-600">Discount Amount</Text>
            <Text className="text-lg font-bold text-red-600">
              -{formatCurrency(discountAmount)}
            </Text>
          </View>
          {currentDiscount?.reason && (
            <Text className="text-xs text-gray-500 mt-1">
              Reason: {currentDiscount.reason}
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row gap-2">
        {currentDiscount && (
          <TouchableOpacity
            onPress={handleRemoveDiscount}
            className="flex-1 bg-red-100 px-4 py-2 rounded-lg"
          >
            <Text className="text-red-600 font-semibold text-center">Remove Discount</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleApplyDiscount}
          className="flex-1 bg-yellow-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold text-center">Apply Discount</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};








