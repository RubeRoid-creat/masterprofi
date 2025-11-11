import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Part, CostBreakdown } from '../../types/orderDetails';

interface CostCalculatorProps {
  parts: Part[];
  onCostChange?: (breakdown: CostBreakdown) => void;
  initialCost?: CostBreakdown;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  parts,
  onCostChange,
  initialCost,
}) => {
  const [laborCost, setLaborCost] = useState(initialCost?.labor || 0);
  const [serviceFee, setServiceFee] = useState(initialCost?.serviceFee || 500);
  const [discount, setDiscount] = useState(initialCost?.discount || 0);
  const [discountPercent, setDiscountPercent] = useState(false);

  const partsTotal = parts.reduce((sum, part) => sum + part.price * part.quantity, 0);
  
  const breakdown: CostBreakdown = {
    labor: laborCost,
    parts: partsTotal,
    serviceFee,
    discount: discount,
    total: laborCost + partsTotal + serviceFee - discount,
  };

  useEffect(() => {
    onCostChange?.(breakdown);
  }, [laborCost, partsTotal, serviceFee, discount]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const applyDiscountPercent = (percent: number) => {
    const subtotal = laborCost + partsTotal + serviceFee;
    setDiscount((subtotal * percent) / 100);
    setDiscountPercent(true);
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Cost Calculator</Text>

      <ScrollView>
        {/* Labor Cost */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Labor Cost *</Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
            placeholder="0"
            value={laborCost.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 0;
              setLaborCost(value);
              setDiscountPercent(false);
            }}
            keyboardType="number-pad"
          />
        </View>

        {/* Parts Total (Read-only) */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Parts Total</Text>
          <View className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
            <Text className="text-base font-semibold text-gray-900">
              {formatPrice(partsTotal)}
            </Text>
          </View>
        </View>

        {/* Service Fee */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Service Fee</Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
            placeholder="500"
            value={serviceFee.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 0;
              setServiceFee(value);
              setDiscountPercent(false);
            }}
            keyboardType="number-pad"
          />
        </View>

        {/* Discount */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-700">Discount</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => applyDiscountPercent(5)}
                className="bg-blue-100 px-3 py-1 rounded"
              >
                <Text className="text-blue-600 text-xs font-medium">5%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => applyDiscountPercent(10)}
                className="bg-blue-100 px-3 py-1 rounded"
              >
                <Text className="text-blue-600 text-xs font-medium">10%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => applyDiscountPercent(15)}
                className="bg-blue-100 px-3 py-1 rounded"
              >
                <Text className="text-blue-600 text-xs font-medium">15%</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
            placeholder="0"
            value={discount.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 0;
              setDiscount(value);
              setDiscountPercent(false);
            }}
            keyboardType="number-pad"
          />
        </View>

        {/* Cost Breakdown */}
        <View className="border-t border-gray-200 pt-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Labor</Text>
            <Text className="text-sm font-medium text-gray-900">{formatPrice(breakdown.labor)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Parts</Text>
            <Text className="text-sm font-medium text-gray-900">{formatPrice(breakdown.parts)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Service Fee</Text>
            <Text className="text-sm font-medium text-gray-900">{formatPrice(breakdown.serviceFee)}</Text>
          </View>
          {breakdown.discount && breakdown.discount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-red-600">Discount</Text>
              <Text className="text-sm font-medium text-red-600">
                -{formatPrice(breakdown.discount)}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between pt-3 mt-2 border-t border-gray-300">
            <Text className="text-lg font-bold text-gray-900">Total</Text>
            <Text className="text-xl font-bold text-blue-600">
              {formatPrice(breakdown.total)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};









