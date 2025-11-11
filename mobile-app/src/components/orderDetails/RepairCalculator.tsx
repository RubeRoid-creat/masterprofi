import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  QuoteBreakdown,
  PartItem,
  LaborEstimate,
  TaxCalculation,
  Discount,
  RepairQuote,
} from '../../types/repairCalculator';
import { PartsSelector } from './repairCalculator/PartsSelector';
import { LaborTimeEstimator } from './repairCalculator/LaborTimeEstimator';
import { ServiceFeeCalculator } from './repairCalculator/ServiceFeeCalculator';
import { TaxCalculator } from './repairCalculator/TaxCalculator';
import { DiscountApplicator } from './repairCalculator/DiscountApplicator';
import { QuoteSummary } from './repairCalculator/QuoteSummary';
import { ClientApprovalWorkflow } from './repairCalculator/ClientApprovalWorkflow';
import { PDFGenerator } from './repairCalculator/PDFGenerator';

interface RepairCalculatorProps {
  orderId: string;
  applianceType: string;
  initialParts?: PartItem[];
  onQuoteGenerated?: (quote: RepairQuote) => void;
  onQuoteApproved?: (quote: RepairQuote) => void;
  hourlyRate?: number;
  taxRate?: number;
}

export const RepairCalculator: React.FC<RepairCalculatorProps> = ({
  orderId,
  applianceType,
  initialParts = [],
  onQuoteGenerated,
  onQuoteApproved,
  hourlyRate = 1500, // Default hourly rate in RUB
  taxRate = 20, // Default VAT rate in Russia
}) => {
  const [parts, setParts] = useState<PartItem[]>(initialParts);
  const [laborEstimate, setLaborEstimate] = useState<LaborEstimate>({
    hours: 0,
    minutes: 0,
    hourlyRate,
    description: '',
    category: 'repair',
  });
  const [serviceFee, setServiceFee] = useState(500);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<'draft' | 'sent' | 'approved' | 'rejected'>('draft');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentStep, setCurrentStep] = useState<'parts' | 'labor' | 'review' | 'approval'>('parts');

  // Calculate breakdown
  const calculateBreakdown = (): QuoteBreakdown => {
    const partsTotal = parts.reduce((sum, part) => sum + part.price * part.quantity, 0);
    const laborTotal = laborEstimate.hours * laborEstimate.hourlyRate +
      (laborEstimate.minutes / 60) * laborEstimate.hourlyRate;
    const subtotal = partsTotal + laborTotal + serviceFee;

    // Calculate discount
    let discountAmount = 0;
    if (discount) {
      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100;
        if (discount.maxAmount) {
          discountAmount = Math.min(discountAmount, discount.maxAmount);
        }
      } else {
        discountAmount = discount.value;
      }
      discountAmount = Math.min(discountAmount, subtotal); // Prevent negative
    }

    const afterDiscount = subtotal - discountAmount;

    // Calculate tax
    const taxAmount = (afterDiscount * taxRate) / 100;
    const total = afterDiscount + taxAmount;

    const tax: TaxCalculation = {
      subtotal: afterDiscount,
      taxRate,
      taxAmount,
      totalWithTax: total,
    };

    return {
      parts,
      partsTotal,
      labor: laborEstimate,
      laborTotal,
      serviceFee,
      subtotal,
      discount: discount || undefined,
      discountAmount,
      tax,
      total,
      currency: 'RUB',
    };
  };

  const breakdown = calculateBreakdown();

  // Generate quote
  const handleGenerateQuote = async () => {
    const quote: RepairQuote = {
      id: `quote-${Date.now()}`,
      orderId,
      quoteNumber: `QT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      breakdown,
      status: 'sent',
    };

    setQuoteStatus('sent');
    onQuoteGenerated?.(quote);
    setCurrentStep('approval');
  };

  // Generate PDF
  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const quote: RepairQuote = {
        id: `quote-${Date.now()}`,
        orderId,
        quoteNumber: `QT-${Date.now()}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        breakdown,
        status: 'sent',
      };

      // Generate PDF (placeholder - requires react-native-pdf-lib or similar)
      const pdfUrl = await PDFGenerator.generate(quote);
      quote.pdfUrl = pdfUrl;

      Alert.alert('PDF Generated', 'Quote PDF has been generated successfully.');
      setIsGeneratingPDF(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
      setIsGeneratingPDF(false);
    }
  };

  // Handle approval
  const handleApproval = (approved: boolean) => {
    if (approved) {
      setQuoteStatus('approved');
      const quote: RepairQuote = {
        id: `quote-${Date.now()}`,
        orderId,
        quoteNumber: `QT-${Date.now()}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        breakdown,
        status: 'approved',
        approvedAt: new Date().toISOString(),
      };
      onQuoteApproved?.(quote);
    } else {
      setQuoteStatus('rejected');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">Repair Cost Calculator</Text>

      {/* Progress Steps */}
      <View className="flex-row items-center justify-between mb-6">
        {[
          { key: 'parts', label: 'Parts' },
          { key: 'labor', label: 'Labor' },
          { key: 'review', label: 'Review' },
          { key: 'approval', label: 'Approval' },
        ].map((step, index) => (
          <View key={step.key} className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => setCurrentStep(step.key as any)}
              className={`flex-1 items-center ${
                currentStep === step.key ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  currentStep === step.key
                    ? 'bg-blue-600'
                    : index < ['parts', 'labor', 'review', 'approval'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              >
                <Text className="text-white text-xs font-bold">{index + 1}</Text>
              </View>
              <Text className="text-xs text-gray-600 mt-1">{step.label}</Text>
            </TouchableOpacity>
            {index < 3 && (
              <View
                className={`h-0.5 flex-1 mx-1 ${
                  index < ['parts', 'labor', 'review', 'approval'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
        {/* Step 1: Parts Selection */}
        {currentStep === 'parts' && (
          <PartsSelector
            applianceType={applianceType}
            selectedParts={parts}
            onPartsChange={setParts}
            onNext={() => setCurrentStep('labor')}
          />
        )}

        {/* Step 2: Labor Time Estimation */}
        {currentStep === 'labor' && (
          <LaborTimeEstimator
            laborEstimate={laborEstimate}
            onLaborChange={setLaborEstimate}
            applianceType={applianceType}
            onBack={() => setCurrentStep('parts')}
            onNext={() => setCurrentStep('review')}
          />
        )}

        {/* Step 3: Service Fee */}
        {currentStep === 'labor' && (
          <View className="mb-4">
            <ServiceFeeCalculator
              serviceFee={serviceFee}
              onServiceFeeChange={setServiceFee}
            />
          </View>
        )}

        {/* Step 4: Review & Calculate */}
        {currentStep === 'review' && (
          <View>
            <QuoteSummary breakdown={breakdown} />

            {/* Tax Calculator */}
            <TaxCalculator
              subtotal={breakdown.subtotal - breakdown.discountAmount}
              taxRate={taxRate}
              onTaxChange={(tax) => {
                // Tax rate can be adjusted if needed
              }}
            />

            {/* Discount Applicator */}
            <DiscountApplicator
              subtotal={breakdown.subtotal}
              currentDiscount={discount}
              onDiscountChange={setDiscount}
            />

            {/* Final Total */}
            <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-900">Final Total</Text>
                <Text className="text-2xl font-bold text-blue-600">
                  {formatCurrency(breakdown.total)}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                Including {taxRate}% VAT
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={() => setCurrentStep('labor')}
                className="flex-1 bg-gray-200 px-4 py-3 rounded-lg"
              >
                <Text className="text-gray-800 font-semibold text-center">Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGenerateQuote}
                className="flex-1 bg-blue-600 px-4 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold text-center">Generate Quote</Text>
              </TouchableOpacity>
            </View>

            {/* PDF Generation */}
            <TouchableOpacity
              onPress={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="bg-green-600 px-4 py-3 rounded-lg mb-4"
            >
              {isGeneratingPDF ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="white" />
                  <Text className="text-white font-semibold ml-2">Generating PDF...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-center">Generate PDF Quote</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Step 5: Client Approval */}
        {currentStep === 'approval' && (
          <ClientApprovalWorkflow
            quote={{
              id: `quote-${Date.now()}`,
              orderId,
              quoteNumber: `QT-${Date.now()}`,
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              breakdown,
              status: quoteStatus,
            }}
            onApproval={handleApproval}
            onBack={() => setCurrentStep('review')}
          />
        )}
      </ScrollView>
    </View>
  );
};








