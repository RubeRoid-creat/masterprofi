import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Transaction } from '../../types/earnings';

interface TransactionDetailsProps {
  transaction: Transaction;
  visible: boolean;
  onClose: () => void;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  visible,
  onClose,
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-xl font-semibold text-gray-900">Transaction Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-600 font-medium">Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Amount */}
          <View className="items-center mb-6 py-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(transaction.amount, transaction.currency)}
            </Text>
            <View className={`px-4 py-2 rounded-full bg-gray-100`}>
              <Text className={`font-semibold capitalize ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View className="space-y-4">
            <DetailRow label="Description" value={transaction.description} />
            <DetailRow label="Type" value={transaction.type} capitalize />
            <DetailRow label="Date & Time" value={formatDateTime(transaction.timestamp)} />
            {transaction.paymentMethod && (
              <DetailRow label="Payment Method" value={transaction.paymentMethod} />
            )}
            {transaction.orderId && (
              <DetailRow label="Order ID" value={transaction.orderId} />
            )}
            {transaction.serviceId && (
              <DetailRow label="Service ID" value={transaction.serviceId} />
            )}
            {transaction.taxAmount !== undefined && (
              <DetailRow
                label="Tax"
                value={formatCurrency(transaction.taxAmount, transaction.currency)}
              />
            )}
            {transaction.netAmount !== undefined && (
              <DetailRow
                label="Net Amount"
                value={formatCurrency(transaction.netAmount, transaction.currency)}
              />
            )}
          </View>

          {/* Metadata */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <View className="mt-6 pt-6 border-t border-gray-200">
              <Text className="text-base font-semibold text-gray-900 mb-3">Additional Info</Text>
              {Object.entries(transaction.metadata).map(([key, value]) => (
                <DetailRow key={key} label={key} value={String(value)} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const DetailRow: React.FC<{
  label: string;
  value: string;
  capitalize?: boolean;
}> = ({ label, value, capitalize }) => (
  <View className="flex-row justify-between py-3 border-b border-gray-100">
    <Text className="text-sm text-gray-600 flex-1">{label}</Text>
    <Text className={`text-sm font-medium text-gray-900 flex-1 text-right ${capitalize ? 'capitalize' : ''}`}>
      {value}
    </Text>
  </View>
);









