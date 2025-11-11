import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { QuoteBreakdown } from '../../../types/repairCalculator';

interface QuoteSummaryProps {
  breakdown: QuoteBreakdown;
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({ breakdown }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (hours: number, minutes: number) => {
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}min`);
    return parts.join(' ') || '0min';
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
      <Text className="text-lg font-bold text-gray-900 mb-4">Quote Summary</Text>

      <ScrollView>
        {/* Parts Breakdown */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-2">Parts</Text>
          {breakdown.parts.length > 0 ? (
            breakdown.parts.map((part) => (
              <View
                key={part.id}
                className="flex-row justify-between items-center py-2 border-b border-gray-100"
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">{part.name}</Text>
                  <Text className="text-xs text-gray-500">
                    {formatCurrency(part.price)} × {part.quantity}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-gray-900">
                  {formatCurrency(part.price * part.quantity)}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-500">No parts selected</Text>
          )}
          <View className="flex-row justify-between items-center pt-2 mt-2 border-t border-gray-200">
            <Text className="text-sm font-medium text-gray-700">Parts Total</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {formatCurrency(breakdown.partsTotal)}
            </Text>
          </View>
        </View>

        {/* Labor Breakdown */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-2">Labor</Text>
          <View className="bg-blue-50 rounded-lg p-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">Time</Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatTime(breakdown.labor.hours, breakdown.labor.minutes)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">Rate</Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatCurrency(breakdown.labor.hourlyRate)}/hr
              </Text>
            </View>
            {breakdown.labor.description && (
              <Text className="text-xs text-gray-500 mt-2">
                {breakdown.labor.description}
              </Text>
            )}
            <View className="flex-row justify-between items-center pt-2 mt-2 border-t border-blue-200">
              <Text className="text-sm font-medium text-gray-700">Labor Total</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {formatCurrency(breakdown.laborTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Fee */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-700">Service Fee</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {formatCurrency(breakdown.serviceFee)}
            </Text>
          </View>
        </View>

        {/* Subtotal */}
        <View className="mb-3 pb-3 border-b border-gray-300">
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-semibold text-gray-900">Subtotal</Text>
            <Text className="text-base font-semibold text-gray-900">
              {formatCurrency(breakdown.subtotal)}
            </Text>
          </View>
        </View>

        {/* Discount */}
        {breakdown.discount && breakdown.discountAmount > 0 && (
          <View className="mb-3 pb-3 border-b border-gray-300">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm font-medium text-red-600">
                  Discount{' '}
                  {breakdown.discount.type === 'percentage'
                    ? `(${breakdown.discount.value}%)`
                    : '(Fixed)'}
                </Text>
                {breakdown.discount.reason && (
                  <Text className="text-xs text-gray-500 mt-1">
                    {breakdown.discount.reason}
                  </Text>
                )}
              </View>
              <Text className="text-sm font-semibold text-red-600">
                -{formatCurrency(breakdown.discountAmount)}
              </Text>
            </View>
          </View>
        )}

        {/* Tax */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-gray-600">Subtotal after discount</Text>
            <Text className="text-sm font-medium text-gray-900">
              {formatCurrency(breakdown.tax.subtotal)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-gray-600">VAT ({breakdown.tax.taxRate}%)</Text>
            <Text className="text-sm font-medium text-gray-900">
              {formatCurrency(breakdown.tax.taxAmount)}
            </Text>
          </View>
        </View>

        {/* Total */}
        <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-gray-900">Total</Text>
            <Text className="text-2xl font-bold text-blue-600">
              {formatCurrency(breakdown.total)}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            Including {breakdown.tax.taxRate}% VAT
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};








