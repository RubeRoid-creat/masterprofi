import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TaxCalculation } from '../../types/earnings';

interface TaxCalculatorProps {
  earnings: number;
  period: string;
  onCalculate?: (calculation: TaxCalculation) => void;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({
  earnings,
  period,
  onCalculate,
}) => {
  const [federalRate, setFederalRate] = useState(13); // 13% standard rate
  const [regionalRate, setRegionalRate] = useState(0); // Regional tax if applicable
  const [socialRate, setSocialRate] = useState(0); // Social tax if applicable

  const calculateTax = (): TaxCalculation => {
    const federalTax = (earnings * federalRate) / 100;
    const regionalTax = (earnings * regionalRate) / 100;
    const socialTax = (earnings * socialRate) / 100;
    const totalTax = federalTax + regionalTax + socialTax;
    const netEarnings = earnings - totalTax;

    return {
      totalEarnings: earnings,
      taxRate: federalRate + regionalRate + socialRate,
      taxAmount: totalTax,
      netEarnings,
      period,
      breakdown: {
        federalTax,
        regionalTax: regionalRate > 0 ? regionalTax : undefined,
        socialTax: socialRate > 0 ? socialTax : undefined,
      },
    };
  };

  const calculation = calculateTax();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Tax Calculator</Text>
        <TouchableOpacity onPress={() => onCalculate?.(calculation)}>
          <Text className="text-blue-600 font-medium text-sm">Save</Text>
        </TouchableOpacity>
      </View>

      {/* Earnings */}
      <View className="mb-4 pb-4 border-b border-gray-200">
        <Text className="text-sm text-gray-600 mb-1">Total Earnings</Text>
        <Text className="text-2xl font-bold text-gray-900">
          {formatCurrency(calculation.totalEarnings)}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">Period: {period}</Text>
      </View>

      {/* Tax Rates */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-3">Tax Rates</Text>
        
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">Federal Tax</Text>
            <Text className="text-sm font-semibold text-gray-900">{federalRate}%</Text>
          </View>
          <View className="flex-row gap-2">
            {[13, 15, 20, 30].map((rate) => (
              <TouchableOpacity
                key={rate}
                onPress={() => setFederalRate(rate)}
                className={`flex-1 py-2 px-3 rounded-lg border-2 ${
                  federalRate === rate
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    federalRate === rate ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {rate}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Breakdown */}
      <View className="border-t border-gray-200 pt-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600">Federal Tax</Text>
          <Text className="text-sm font-semibold text-gray-900">
            {formatCurrency(calculation.breakdown.federalTax)}
          </Text>
        </View>
        {calculation.breakdown.regionalTax !== undefined && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Regional Tax</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {formatCurrency(calculation.breakdown.regionalTax)}
            </Text>
          </View>
        )}
        {calculation.breakdown.socialTax !== undefined && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Social Tax</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {formatCurrency(calculation.breakdown.socialTax)}
            </Text>
          </View>
        )}
        <View className="border-t border-gray-300 pt-2 mt-2">
          <View className="flex-row justify-between mb-2">
            <Text className="text-base font-semibold text-gray-900">Total Tax</Text>
            <Text className="text-base font-bold text-red-600">
              {formatCurrency(calculation.taxAmount)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-base font-semibold text-gray-900">Net Earnings</Text>
            <Text className="text-base font-bold text-green-600">
              {formatCurrency(calculation.netEarnings)}
            </Text>
          </View>
        </View>
      </View>

      {/* Disclaimer */}
      <View className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <Text className="text-xs text-yellow-800">
          ⚠️ This is an estimate. Consult a tax professional for accurate calculations.
        </Text>
      </View>
    </View>
  );
};








