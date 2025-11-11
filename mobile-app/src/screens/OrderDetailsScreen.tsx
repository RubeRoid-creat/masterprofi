import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateOrderStatus, useGetOrderQuery } from '../store/api/ordersApi';
import { config } from '../config/environments';
import { Order, OrderStatus } from '../types/order';
import { OrderDetails, Part, CostBreakdown, ChatMessage, WorkTimer } from '../types/orderDetails';
import { StatusTimeline } from '../components/orderDetails/StatusTimeline';
import { ClientInfo } from '../components/orderDetails/ClientInfo';
import { ApplianceDetails } from '../components/orderDetails/ApplianceDetails';
import { PhotoGallery } from '../components/orderDetails/PhotoGallery';
import { PartsCatalog } from '../components/orderDetails/PartsCatalog';
import { CostCalculator } from '../components/orderDetails/CostCalculator';
import { ChatComponent } from '../components/orderDetails/ChatComponent';
import { WorkTimer as WorkTimerComponent } from '../components/orderDetails/WorkTimer';
import { SignatureCapture } from '../components/orderDetails/SignatureCapture';
import { NavigationButton } from '../components/orderDetails/NavigationButton';

interface OrderDetailsScreenProps {
  orderId?: string;
  order?: Order;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
}

export const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({
  orderId: propsOrderId,
  order: propsOrder,
  onStatusChange,
}) => {
  const route = useRoute();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  // Get order ID from route params or props
  const routeOrderId = (route.params as any)?.orderId;
  const orderId = propsOrderId || routeOrderId;

  // Use RTK Query to fetch order details
  const { 
    data: orderData, 
    isLoading: isLoadingOrder, 
    error: orderError,
    refetch: refetchOrder 
  } = useGetOrderQuery(orderId || '', { skip: !orderId || !!propsOrder });

  useEffect(() => {
    if (orderError) {
      Alert.alert('Ошибка', 'Не удалось загрузить детали заказа');
    }
  }, [orderError]);

  // Transform order data to OrderDetails format
  // OrderDetails extends Order, so we can use orderData directly and add missing fields
  const orderDetails: OrderDetails | null = propsOrder ? {
    ...propsOrder,
    statusTimeline: [],
    photos: [],
    symptoms: propsOrder.appliance.issue ? [propsOrder.appliance.issue] : [],
    parts: [],
    chatMessages: [],
  } : orderData ? {
    ...orderData,
    statusTimeline: [], // Will be loaded from API when available
    photos: [], // Will be loaded from API when available
    symptoms: orderData.appliance.issue ? [orderData.appliance.issue] : [],
    parts: [], // Will be loaded from API when available
    chatMessages: [], // Will be loaded from API when available
  } : null;

  const [isLoading, setIsLoading] = useState(!propsOrder && isLoadingOrder);
  const [selectedParts, setSelectedParts] = useState<Part[]>(orderDetails?.parts || []);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
    labor: 0,
    parts: 0,
    serviceFee: orderDetails?.price?.amount || 0,
    total: orderDetails?.price?.amount || 0,
  });
  const [workTimer, setWorkTimer] = useState<WorkTimer>({
    isRunning: false,
    elapsedTime: 0,
    breaks: [],
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(orderDetails?.chatMessages || []);

  useEffect(() => {
    setIsLoading(isLoadingOrder && !propsOrder);
  }, [isLoadingOrder, propsOrder]);

  useEffect(() => {
    if (orderDetails) {
      setSelectedParts(orderDetails.parts || []);
      setChatMessages(orderDetails.chatMessages || []);
      setCostBreakdown({
        labor: 0,
        parts: (orderDetails.parts || []).reduce((sum, p) => sum + p.price * p.quantity, 0),
        serviceFee: orderDetails.price?.amount || 0,
        total: orderDetails.price?.amount || 0,
      });
    }
  }, [orderDetails]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!orderDetails) return;

    try {
      // Update via API
      // await dispatch(updateOrderStatus({ id: orderDetails.id, status: newStatus })).unwrap();
      
      setOrderDetails({
        ...orderDetails,
        status: newStatus,
        statusTimeline: [
          ...orderDetails.statusTimeline,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
          },
        ],
      });

      onStatusChange?.(orderDetails.id, newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleStartWork = () => {
    setWorkTimer({
      isRunning: true,
      startTime: new Date().toISOString(),
      elapsedTime: workTimer.elapsedTime,
      breaks: workTimer.breaks,
    });
  };

  const handleStopWork = () => {
    setWorkTimer({
      isRunning: false,
      startTime: workTimer.startTime,
      elapsedTime: workTimer.elapsedTime,
      breaks: workTimer.breaks,
    });
    if (orderDetails) {
      setOrderDetails({
        ...orderDetails,
        workEndTime: new Date().toISOString(),
        totalWorkTime: Math.floor(workTimer.elapsedTime / 60),
      });
    }
  };

  const handleSendMessage = async (message: string, attachments?: string[]) => {
    if (!orderDetails) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'master-1', // Current user ID
      senderName: 'You',
      senderType: 'master',
      message,
      timestamp: new Date().toISOString(),
      attachments,
    };

    setChatMessages([...chatMessages, newMessage]);
    // Send to API/WebSocket
  };

  const handleSignatureCapture = (signature: string, type: 'client' | 'master' = 'master') => {
    if (!orderDetails) return;

    setOrderDetails({
      ...orderDetails,
      signature: {
        ...orderDetails.signature,
        [type === 'client' ? 'clientSignature' : 'masterSignature']: signature,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Загрузка деталей заказа...</Text>
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Заказ не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header with Status */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.orderTitle}>Заказ #{orderDetails.id}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {orderDetails.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.createdText}>
            Создан: {new Date(orderDetails.createdAt).toLocaleString('ru-RU')}
          </Text>
        </View>

        {/* Navigation */}
        <NavigationButton
          address={orderDetails.location.address}
          latitude={orderDetails.location.latitude}
          longitude={orderDetails.location.longitude}
        />

        {/* Status Timeline */}
        <StatusTimeline
          timeline={orderDetails.statusTimeline}
          currentStatus={orderDetails.status}
        />

        {/* Client Info */}
        <ClientInfo
          client={orderDetails.client}
          onCall={() => {}}
          onMessage={() => {}}
        />

        {/* Appliance Details */}
        <ApplianceDetails
          appliance={orderDetails.appliance}
          symptoms={orderDetails.symptoms}
          notes={orderDetails.notes}
        />

        {/* Photo Gallery */}
        <PhotoGallery
          photos={orderDetails.photos}
          onPhotosChange={(photos) => {
            setOrderDetails({ ...orderDetails, photos });
          }}
          allowAdd={true}
        />

        {/* Work Timer */}
        <WorkTimerComponent
          timer={workTimer}
          onStart={handleStartWork}
          onStop={handleStopWork}
        />

        {/* Parts Catalog */}
        <PartsCatalog
          selectedParts={selectedParts}
          onPartsChange={setSelectedParts}
        />

        {/* Cost Calculator */}
        <CostCalculator
          parts={selectedParts}
          onCostChange={setCostBreakdown}
          initialCost={costBreakdown}
        />

        {/* Chat */}
        <ChatComponent
          messages={chatMessages}
          currentUserId="master-1"
          onSendMessage={handleSendMessage}
        />

        {/* Signature Capture */}
        <SignatureCapture
          title="Client Signature"
          required={orderDetails.status === 'completed'}
          onSignatureCapture={(signature) => handleSignatureCapture(signature, 'client')}
        />

        {/* Status Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Действия</Text>
          <View style={styles.actionsContainer}>
            {orderDetails.status === 'assigned' && (
              <TouchableOpacity
                onPress={() => handleStatusChange('in_progress')}
                style={[styles.actionButton, styles.actionButtonSuccess]}
              >
                <Text style={styles.actionButtonText}>Начать работу</Text>
              </TouchableOpacity>
            )}
            {orderDetails.status === 'in_progress' && (
              <TouchableOpacity
                onPress={() => handleStatusChange('completed')}
                style={[styles.actionButton, styles.actionButtonPrimary]}
              >
                <Text style={styles.actionButtonText}>Завершить заказ</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {}}
              style={[styles.actionButton, styles.actionButtonSecondary]}
            >
              <Text style={styles.actionButtonText}>Сохранить изменения</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  errorText: {
    ...typography.heading.h3,
    color: colors.text.primary,
  },
  headerCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  orderTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.body.small,
    color: colors.primary[800],
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  createdText: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  actionsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  actionsTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary[600],
  },
  actionButtonSuccess: {
    backgroundColor: colors.success[600],
  },
  actionButtonSecondary: {
    backgroundColor: colors.gray[600],
  },
  actionButtonText: {
    ...typography.body.medium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});

