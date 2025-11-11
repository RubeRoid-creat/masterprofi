import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface ServiceFeeCalculatorProps {
  serviceFee: number;
  onServiceFeeChange: (fee: number) => void;
}

export const ServiceFeeCalculator: React.FC<ServiceFeeCalculatorProps> = ({
  serviceFee,
  onServiceFeeChange,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">Service Fee</Text>
      <TextInput
        className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
        placeholder="500"
        value={serviceFee.toString()}
        onChangeText={(text) => {
          const value = Math.max(0, parseInt(text) || 0);
          onServiceFeeChange(value);
        }}
        keyboardType="number-pad"
      />
      <Text className="text-xs text-gray-500 mt-1">
        Standard service call fee: {formatCurrency(serviceFee)}
      </Text>
    </View>
  );
};








