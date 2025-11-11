import { LinkingOptions } from '@react-navigation/native';
import { Linking } from 'react-native';
import { RootStackParamList } from './types';

/**
 * Deep linking configuration
 * Supports URLs like:
 * - masterprofi://orders/123
 * - masterprofi://network/member/456
 * - masterprofi://earnings
 * - masterprofi://profile
 */

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['masterprofi://', 'https://masterprofi.app', 'https://masterprofi.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Registration: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
      Main: {
        screens: {
          OrdersTab: {
            screens: {
              OrderFeed: 'orders',
              OrderDetails: 'orders/:orderId',
              OrderChat: 'orders/:orderId/chat/:chatId',
            },
          },
          NetworkTab: {
            screens: {
              MLMDashboard: 'network',
              MLMMemberDetails: 'network/member/:memberId',
              MLMInvite: 'network/invite',
            },
          },
          EarningsTab: {
            screens: {
              EarningsHome: 'earnings',
              EarningsDetails: 'earnings/:transactionId',
              WithdrawalRequest: 'earnings/withdrawal',
              PaymentMethods: 'earnings/payment-methods',
            },
          },
          ProfileTab: {
            screens: {
              ProfileHome: 'profile',
              ProfileEdit: 'profile/edit',
              Settings: 'profile/settings',
              KnowledgeBase: 'profile/knowledge-base',
              Certificates: 'profile/certificates',
            },
          },
        },
      },
      Modals: {
        screens: {
          OrderDetailsModal: 'modal/orders/:orderId',
          ChatModal: 'modal/chat/:chatId',
          RepairCalculatorModal: 'modal/calculator/:orderId',
          SignatureModal: 'modal/signature/:orderId',
          PDFViewerModal: 'modal/pdf',
        },
      },
    },
  },
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }
  },
  subscribe(listener) {
    // Listen to incoming links from deep linking
    const onReceiveURL = ({ url }: { url: string }) => {
      listener(url);
    };

    // Listen to initial URL if app was opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        onReceiveURL({ url });
      }
    });

    // Listen to incoming links while app is running
    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      subscription.remove();
    };
  },
};

