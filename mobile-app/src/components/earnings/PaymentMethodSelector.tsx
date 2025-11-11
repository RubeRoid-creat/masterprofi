import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PaymentMethod } from '../../types/earnings';

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedId?: string;
  onSelect: (method: PaymentMethod) => void;
  onAdd?: () => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethods,
  selectedId,
  onSelect,
  onAdd,
}) => {
  const getMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'bank_account':
        return '🏦';
      case 'card':
        return '💳';
      case 'e_wallet':
        return '📱';
      case 'crypto':
        return '₿';
      default:
        return '💳';
    }
  };

  return (
    <View>
      {paymentMethods.map((method) => {
        const isSelected = method.id === selectedId;

        return (
          <TouchableOpacity
            key={method.id}
            onPress={() => onSelect(method)}
            className={`flex-row items-center p-4 mb-3 rounded-lg border-2 ${
              isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Text className="text-2xl">{getMethodIcon(method.type)}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-base font-semibold text-gray-900 mr-2">
                  {method.name}
                </Text>
                {method.isDefault && (
                  <View className="bg-blue-600 px-2 py-0.5 rounded">
                    <Text className="text-white text-xs font-medium">Default</Text>
                  </View>
                )}
              </View>
              <Text className="text-sm text-gray-600">{method.details}</Text>
              {!method.isVerified && (
                <Text className="text-xs text-yellow-600 mt-1">Verification pending</Text>
              )}
            </View>
            {isSelected && (
              <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {onAdd && (
        <TouchableOpacity
          onPress={onAdd}
          className="flex-row items-center p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
        >
          <Text className="text-blue-600 font-medium">+ Add Payment Method</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};








