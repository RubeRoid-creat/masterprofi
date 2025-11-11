// Earnings types

export interface EarningsBalance {
  current: number;
  available: number; // Available for withdrawal
  pending: number; // Pending transactions
  onHold: number; // On hold (disputes, etc.)
  currency: string;
}

export interface IncomeBreakdown {
  serviceFees: number;
  commissions: number;
  bonuses: number;
  referrals: number;
  total: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  periodStart: string;
  periodEnd: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'withdrawal' | 'refund' | 'bonus' | 'commission';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  timestamp: string;
  serviceId?: string; // For service-related transactions
  orderId?: string; // For order-related transactions
  paymentMethod?: string;
  taxAmount?: number;
  netAmount?: number;
  metadata?: Record<string, any>;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
  fee: number;
  netAmount: number;
  reason?: string; // If rejected
}

export interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'card' | 'e_wallet' | 'crypto';
  name: string;
  details: string; // Last 4 digits, account number, etc.
  isDefault: boolean;
  isVerified: boolean;
  icon?: string;
}

export interface TaxCalculation {
  totalEarnings: number;
  taxRate: number; // Percentage
  taxAmount: number;
  netEarnings: number;
  period: string;
  breakdown: {
    federalTax: number;
    regionalTax?: number;
    socialTax?: number;
  };
}

export interface EarningsProjection {
  period: 'week' | 'month' | 'quarter' | 'year';
  projected: number;
  basedOn: 'average' | 'trend' | 'conservative';
  confidence: number; // 0-100
  factors: {
    currentTrend: number;
    historicalAverage: number;
    seasonalAdjustment?: number;
  };
}

export interface TransactionFilters {
  type?: Transaction['type'][];
  status?: Transaction['status'][];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}









