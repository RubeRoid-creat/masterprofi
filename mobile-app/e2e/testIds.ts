/**
 * Test IDs for E2E Tests
 * Centralized test identifiers for consistent test selectors
 */

export const TestIDs = {
  // Authentication
  loginEmailInput: 'login-email-input',
  loginPasswordInput: 'login-password-input',
  loginButton: 'login-button',
  loginError: 'login-error',
  registerButton: 'register-button',
  forgotPasswordButton: 'forgot-password-button',

  // Registration
  registrationEmailInput: 'registration-email-input',
  registrationPhoneInput: 'registration-phone-input',
  registrationPasswordInput: 'registration-password-input',
  registrationNameInput: 'registration-name-input',
  registrationNextButton: 'registration-next-button',
  registrationSubmitButton: 'registration-submit-button',
  otpInput: 'otp-input',
  otpVerifyButton: 'otp-verify-button',

  // Orders
  orderCard: (orderId: string) => `order-card-${orderId}`,
  orderAcceptButton: (orderId: string) => `order-accept-${orderId}`,
  orderDeclineButton: (orderId: string) => `order-decline-${orderId}`,
  orderTab: 'orders-tab',
  orderDetailsScreen: 'order-details-screen',
  orderStatusBadge: (status: string) => `order-status-${status}`,

  // Chat
  chatInput: 'chat-input',
  chatSendButton: 'chat-send-button',
  chatMessage: (messageId: string) => `chat-message-${messageId}`,
  chatAttachmentButton: 'chat-attachment-button',
  chatVoiceButton: 'chat-voice-button',

  // Payment
  paymentScreen: 'payment-screen',
  paymentMethodSelector: 'payment-method-selector',
  paymentAmountInput: 'payment-amount-input',
  paymentSubmitButton: 'payment-submit-button',
  withdrawalRequestButton: 'withdrawal-request-button',

  // Navigation
  bottomTabNavigator: 'bottom-tab-navigator',
  ordersTab: 'orders-tab',
  networkTab: 'network-tab',
  earningsTab: 'earnings-tab',
  profileTab: 'profile-tab',

  // Offline
  offlineIndicator: 'offline-indicator',
  actionQueueIndicator: 'action-queue-indicator',

  // Notifications
  notificationPermissionButton: 'notification-permission-button',
  notificationBanner: 'notification-banner',
};








