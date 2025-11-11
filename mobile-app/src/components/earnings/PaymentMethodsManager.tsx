import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { PaymentMethod } from '../../types/earnings';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface PaymentMethodsManagerProps {
  paymentMethods: PaymentMethod[];
  onAdd: () => void;
  onEdit: (method: PaymentMethod) => void;
  onDelete: (methodId: string) => void;
  onSetDefault: (methodId: string) => void;
}

export const PaymentMethodsManager: React.FC<PaymentMethodsManagerProps> = ({
  paymentMethods,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleDelete = (method: PaymentMethod) => {
    if (method.isDefault) {
      Alert.alert('Error', 'Cannot delete default payment method');
      return;
    }

    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete ${method.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(method.id);
            setIsModalVisible(false);
          },
        },
      ]
    );
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Payment Methods</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Text className="text-blue-600 font-medium text-sm">Manage</Text>
        </TouchableOpacity>
      </View>

      {/* Quick View */}
      <View>
        {paymentMethods.slice(0, 2).map((method) => (
          <View
            key={method.id}
            className="flex-row items-center p-3 mb-2 bg-gray-50 rounded-lg"
          >
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Text className="text-xl">
                {method.type === 'bank_account'
                  ? '🏦'
                  : method.type === 'card'
                  ? '💳'
                  : method.type === 'e_wallet'
                  ? '📱'
                  : '₿'}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-sm font-semibold text-gray-900 mr-2">
                  {method.name}
                </Text>
                {method.isDefault && (
                  <Text className="text-xs text-blue-600">Default</Text>
                )}
              </View>
              <Text className="text-xs text-gray-500">{method.details}</Text>
            </View>
          </View>
        ))}
        {paymentMethods.length > 2 && (
          <Text className="text-sm text-gray-500 text-center mt-2">
            +{paymentMethods.length - 2} more
          </Text>
        )}
      </View>

      {/* Management Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-semibold text-gray-900">
              Payment Methods
            </Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text className="text-blue-600 font-medium">Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {paymentMethods.map((method) => (
              <View
                key={method.id}
                className="flex-row items-center justify-between p-4 mb-3 bg-gray-50 rounded-lg"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-2xl">
                      {method.type === 'bank_account'
                        ? '🏦'
                        : method.type === 'card'
                        ? '💳'
                        : method.type === 'e_wallet'
                        ? '📱'
                        : '₿'}
                    </Text>
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
                      {!method.isVerified && (
                        <View className="bg-yellow-100 px-2 py-0.5 rounded">
                          <Text className="text-yellow-800 text-xs font-medium">
                            Pending
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-gray-600">{method.details}</Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  {!method.isDefault && (
                    <TouchableOpacity
                      onPress={() => onSetDefault(method.id)}
                      className="bg-blue-600 px-3 py-2 rounded-lg"
                    >
                      <Text className="text-white text-xs font-medium">Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => onEdit(method)}
                    className="bg-gray-200 px-3 py-2 rounded-lg"
                  >
                    <Text className="text-gray-700 text-xs font-medium">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(method)}
                    className="bg-red-100 px-3 py-2 rounded-lg"
                  >
                    <Text className="text-red-600 text-xs font-medium">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={onAdd}
              className="flex-row items-center justify-center p-4 bg-blue-600 rounded-lg mt-4"
            >
              <Text className="text-white font-semibold text-base">+ Add Payment Method</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};








