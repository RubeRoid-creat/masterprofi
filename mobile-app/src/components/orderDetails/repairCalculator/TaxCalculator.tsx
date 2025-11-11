import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { TaxCalculation } from '../../../types/repairCalculator';

interface TaxCalculatorProps {
  subtotal: number;
  taxRate: number;
  onTaxChange?: (tax: TaxCalculation) => void;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({
  subtotal,
  taxRate,
  onTaxChange,
}) => {
  const taxAmount = (subtotal * taxRate) / 100;
  const totalWithTax = subtotal + taxAmount;

  const tax: TaxCalculation = {
    subtotal,
    taxRate,
    taxAmount,
    totalWithTax,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  React.useEffect(() => {
    onTaxChange?.(tax);
  }, [subtotal, taxRate]);

  return (
    <View className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
      <Text className="text-base font-semibold text-gray-900 mb-3">Tax Calculation</Text>
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm text-gray-600">Subtotal</Text>
        <Text className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm text-gray-600">VAT ({taxRate}%)</Text>
        <Text className="text-sm font-medium text-gray-900">{formatCurrency(taxAmount)}</Text>
      </View>
      <View className="flex-row justify-between items-center pt-2 mt-2 border-t border-gray-300">
        <Text className="text-base font-bold text-gray-900">Total with Tax</Text>
        <Text className="text-lg font-bold text-blue-600">{formatCurrency(totalWithTax)}</Text>
      </View>
    </View>
  );
};








