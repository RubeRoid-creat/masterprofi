/**
 * Example usage of OrderCard component
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { OrderCard } from './OrderCard';
import { OrderStatus } from '../../types/order';

export const OrderCardExample = () => {
  const handlePress = (orderId: string) => {
    console.log('Order pressed:', orderId);
    // Navigate to order details
  };

  const handleAccept = (orderId: string) => {
    console.log('Order accepted:', orderId);
    // Accept order logic
  };

  const handleDecline = (orderId: string) => {
    console.log('Order declined:', orderId);
    // Decline order logic
  };

  return (
    <ScrollView className="flex-1 p-4">
      {/* Basic Usage */}
      <OrderCard
        orderId="ORD-12345"
        clientName="John Doe"
        applianceType="Washing Machine"
        address="123 Main Street, Moscow, Apt 4B"
        distance={2.5}
        price={3500}
        status="new"
        urgency="medium"
        onPress={() => handlePress('ORD-12345')}
      />

      {/* With Client Rating */}
      <OrderCard
        orderId="ORD-12346"
        clientName="Jane Smith"
        applianceType="Refrigerator"
        address="456 Oak Avenue, Moscow"
        distance={5.2}
        price={4500}
        status="new"
        urgency="high"
        clientRating={4.8}
        clientAvatar="https://example.com/avatar.jpg"
        onPress={() => handlePress('ORD-12346')}
        onAccept={() => handleAccept('ORD-12346')}
        onDecline={() => handleDecline('ORD-12346')}
      />

      {/* Completed Order */}
      <OrderCard
        orderId="ORD-12347"
        clientName="Bob Johnson"
        applianceType="Dishwasher"
        address="789 Pine Road, Moscow"
        distance={1.8}
        price={2800}
        status="completed"
        urgency="low"
        clientRating={5.0}
        onPress={() => handlePress('ORD-12347')}
      />

      {/* In Progress Order */}
      <OrderCard
        orderId="ORD-12348"
        clientName="Alice Williams"
        applianceType="Oven"
        address="321 Elm Street, Moscow"
        distance={3.7}
        price={5200}
        status="in_progress"
        urgency="medium"
        clientRating={4.5}
        onPress={() => handlePress('ORD-12348')}
      />
    </ScrollView>
  );
};








