import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { RepairQuote } from '../../../types/repairCalculator';
import { QuoteSummary } from './QuoteSummary';

interface ClientApprovalWorkflowProps {
  quote: RepairQuote;
  onApproval: (approved: boolean) => void;
  onBack: () => void;
}

export const ClientApprovalWorkflow: React.FC<ClientApprovalWorkflowProps> = ({
  quote,
  onApproval,
  onBack,
}) => {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [clientNotes, setClientNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'online' | null>(null);

  const handleApprove = () => {
    if (!paymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method before approving.');
      return;
    }

    Alert.alert(
      'Approve Quote?',
      'Are you sure you want to approve this quote? This will send it to the client for approval.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            setIsApproved(true);
            onApproval(true);
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Quote?',
      'Are you sure you want to reject this quote?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setIsApproved(false);
            onApproval(false);
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View className="flex-1">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Client Approval</Text>

      <ScrollView showsVerticalScrollIndicator={true}>
        {/* Quote Info */}
        <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700">Quote Number</Text>
            <Text className="text-sm font-bold text-blue-600">{quote.quoteNumber}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700">Created</Text>
            <Text className="text-sm text-gray-900">{formatDate(quote.createdAt)}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-700">Expires</Text>
            <Text className="text-sm text-gray-900">{formatDate(quote.expiresAt)}</Text>
          </View>
        </View>

        {/* Quote Summary */}
        <QuoteSummary breakdown={quote.breakdown} />

        {/* Payment Method Selection */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Payment Method
          </Text>
          <View className="flex-row gap-3">
            {[
              { value: 'card', label: '💳 Card', color: 'bg-blue-100 border-blue-300' },
              { value: 'cash', label: '💵 Cash', color: 'bg-green-100 border-green-300' },
              { value: 'online', label: '🌐 Online', color: 'bg-purple-100 border-purple-300' },
            ].map((method) => (
              <TouchableOpacity
                key={method.value}
                onPress={() => setPaymentMethod(method.value as any)}
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  paymentMethod === method.value
                    ? `${method.color} border-2`
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    paymentMethod === method.value ? 'text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Client Notes */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-base font-semibold text-gray-900 mb-2">
            Client Notes (Optional)
          </Text>
          <TextInput
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
            placeholder="Add any notes or special requests..."
            value={clientNotes}
            onChangeText={setClientNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Approval Status */}
        {isApproved !== null && (
          <View
            className={`rounded-lg p-4 mb-4 border ${
              isApproved
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                isApproved ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {isApproved ? '✓ Quote Approved' : '✗ Quote Rejected'}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={onBack}
            className="flex-1 bg-gray-200 px-4 py-3 rounded-lg"
          >
            <Text className="text-gray-800 font-semibold text-center">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReject}
            disabled={isApproved !== null}
            className={`flex-1 px-4 py-3 rounded-lg ${
              isApproved !== null ? 'bg-gray-300' : 'bg-red-600'
            }`}
          >
            <Text className="text-white font-semibold text-center">Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleApprove}
            disabled={isApproved !== null || !paymentMethod}
            className={`flex-1 px-4 py-3 rounded-lg ${
              isApproved !== null || !paymentMethod ? 'bg-gray-300' : 'bg-green-600'
            }`}
          >
            <Text className="text-white font-semibold text-center">Approve & Send</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};








