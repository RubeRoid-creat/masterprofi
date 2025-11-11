import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { PaymentMethod } from '../../types/earnings';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface WithdrawalRequestProps {
  availableBalance: number;
  paymentMethods: PaymentMethod[];
  onRequest: (amount: number, paymentMethodId: string) => Promise<void>;
}

export const WithdrawalRequest: React.FC<WithdrawalRequestProps> = ({
  availableBalance,
  paymentMethods,
  onRequest,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    paymentMethods.find((m) => m.isDefault) || paymentMethods[0] || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const withdrawalFee = 0.02; // 2% fee
  const minWithdrawal = 1000;
  const maxWithdrawal = availableBalance;

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const calculateNetAmount = () => {
    const amountNum = parseFloat(amount) || 0;
    return amountNum * (1 - withdrawalFee);
  };

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = Math.floor(availableBalance * percentage);
    setAmount(quickAmount.toString());
  };

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum < minWithdrawal) {
      Alert.alert('Error', `Minimum withdrawal is ${formatCurrency(minWithdrawal)}`);
      return;
    }

    if (amountNum > maxWithdrawal) {
      Alert.alert('Error', 'Amount exceeds available balance');
      return;
    }

    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRequest(amountNum, selectedMethod.id);
      Alert.alert('Success', 'Withdrawal request submitted successfully');
      setIsModalVisible(false);
      setAmount('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="bg-white rounded-lg p-4 mb-4 border border-gray-200"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">
              Request Withdrawal
            </Text>
            <Text className="text-sm text-gray-500">
              Available: {formatCurrency(availableBalance)}
            </Text>
          </View>
          <Text className="text-2xl">→</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-semibold text-gray-900">Withdraw Funds</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Amount Input */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">
                Withdrawal Amount
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg bg-white text-gray-900 text-2xl font-semibold"
                  placeholder="0"
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="number-pad"
                />
                <Text className="absolute right-4 top-4 text-gray-500 text-lg">₽</Text>
              </View>
              <Text className="text-sm text-gray-500 mt-2">
                Min: {formatCurrency(minWithdrawal)} • Max: {formatCurrency(maxWithdrawal)}
              </Text>
            </View>

            {/* Quick Amount Buttons */}
            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-2">Quick Amount</Text>
              <View className="flex-row gap-2">
                {[0.25, 0.5, 0.75, 1.0].map((percentage) => (
                  <TouchableOpacity
                    key={percentage}
                    onPress={() => handleQuickAmount(percentage)}
                    className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
                  >
                    <Text className="text-sm font-medium text-gray-700">
                      {percentage * 100}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Method */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-3">
                Payment Method
              </Text>
              <PaymentMethodSelector
                paymentMethods={paymentMethods}
                selectedId={selectedMethod?.id}
                onSelect={setSelectedMethod}
              />
            </View>

            {/* Summary */}
            <View className="bg-gray-50 rounded-lg p-4 mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Amount</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {amount ? formatCurrency(parseFloat(amount) || 0) : formatCurrency(0)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Fee ({withdrawalFee * 100}%)</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {amount
                    ? formatCurrency((parseFloat(amount) || 0) * withdrawalFee)
                    : formatCurrency(0)}
                </Text>
              </View>
              <View className="border-t border-gray-300 pt-2 mt-2">
                <View className="flex-row justify-between">
                  <Text className="text-base font-semibold text-gray-900">
                    You'll Receive
                  </Text>
                  <Text className="text-base font-bold text-blue-600">
                    {amount ? formatCurrency(calculateNetAmount()) : formatCurrency(0)}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!amount || !selectedMethod || isSubmitting}
              className={`py-4 rounded-lg items-center ${
                !amount || !selectedMethod || isSubmitting
                  ? 'bg-gray-300'
                  : 'bg-blue-600'
              }`}
            >
              <Text className="text-white font-semibold text-base">
                {isSubmitting ? 'Processing...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};









