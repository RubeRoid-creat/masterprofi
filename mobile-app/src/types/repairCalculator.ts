// Repair calculator types

export interface PartItem {
  id: string;
  name: string;
  partNumber: string;
  price: number;
  quantity: number;
  category: string;
  brand?: string;
  inStock: boolean;
  compatibility: string[]; // Appliance models
  warranty?: number; // Months
  estimatedDelivery?: string; // Days
}

export interface LaborEstimate {
  hours: number;
  minutes: number;
  hourlyRate: number;
  description: string;
  category: 'diagnosis' | 'repair' | 'installation' | 'maintenance';
}

export interface TaxCalculation {
  subtotal: number;
  taxRate: number; // Percentage (e.g., 20 for 20%)
  taxAmount: number;
  totalWithTax: number;
}

export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  reason?: string;
  maxAmount?: number; // Maximum discount amount for percentage
}

export interface QuoteBreakdown {
  parts: PartItem[];
  partsTotal: number;
  labor: LaborEstimate;
  laborTotal: number;
  serviceFee: number;
  subtotal: number;
  discount?: Discount;
  discountAmount: number;
  tax: TaxCalculation;
  total: number;
  currency: string;
}

export interface RepairQuote {
  id: string;
  orderId: string;
  quoteNumber: string;
  createdAt: string;
  expiresAt: string;
  breakdown: QuoteBreakdown;
  notes?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  approvedAt?: string;
  approvedBy?: string;
  pdfUrl?: string;
}

export interface ClientApproval {
  quoteId: string;
  approved: boolean;
  approvedAt: string;
  clientSignature?: string;
  clientNotes?: string;
  paymentMethod?: 'card' | 'cash' | 'online';
}








