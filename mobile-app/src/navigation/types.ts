/**
 * Type-safe navigation types for React Navigation
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { Order } from '../types/order';
import { Chat } from '../types/chat';
import { MLMMember } from '../types/mlm';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Registration: undefined;
  ForgotPassword: undefined;
};

// Orders Stack
export type OrdersStackParamList = {
  OrderFeed: undefined;
  OrderDetails: { orderId: string; order?: Order };
  OrderChat: { orderId: string; chatId: string };
};

// Network (MLM) Stack
export type NetworkStackParamList = {
  MLMDashboard: undefined;
  MLMMemberDetails: { memberId: string; member?: MLMMember };
  MLMInvite: undefined;
};

// Earnings Stack
export type EarningsStackParamList = {
  EarningsHome: undefined;
  EarningsDetails: { transactionId: string };
  WithdrawalRequest: undefined;
  PaymentMethods: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileHome: undefined;
  ProfileEdit: undefined;
  Settings: undefined;
  KnowledgeBase: undefined;
  Certificates: undefined;
  PrivacyPolicy: undefined;
  CrmSync: undefined;
};

// Bottom Tabs
export type MainTabParamList = {
  OrdersTab: NavigatorScreenParams<OrdersStackParamList>;
  NetworkTab: NavigatorScreenParams<NetworkStackParamList>;
  EarningsTab: NavigatorScreenParams<EarningsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Modal Screens
export type ModalStackParamList = {
  OrderDetailsModal: { orderId: string; order?: Order };
  ChatModal: { chatId: string; chat?: Chat };
  RepairCalculatorModal: { orderId: string };
  SignatureModal: { orderId: string };
  PDFViewerModal: { pdfUrl: string; title: string };
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Modals: NavigatorScreenParams<ModalStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

