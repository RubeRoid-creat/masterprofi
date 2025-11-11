import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { RegistrationScreen } from '../screens/RegistrationScreen';
import { OrderFeedScreen } from '../screens/OrderFeedScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { LoginFormData } from '../types/auth';
import { RegistrationFormData } from '../types/registration';
import { Order } from '../types/order';

type Screen = 'login' | 'registration' | 'orders' | 'orderDetails';

export default function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('orders');

  const handleLogin = async (data: LoginFormData) => {
    console.log('Login:', data);
    setCurrentScreen('orders');
  };

  const handleRegistration = async (data: RegistrationFormData) => {
    console.log('Registration:', data);
    setCurrentScreen('orders');
  };

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setCurrentScreen('orderDetails');
  };

  if (currentScreen === 'login') {
    return (
      <View style={{ flex: 1 }}>
        <LoginScreen
          onLogin={handleLogin}
          onForgotPassword={() => {}}
          showSocialLogin={true}
        />
        <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setCurrentScreen('registration')}>
            <Text style={{ color: '#3B82F6', fontWeight: '600' }}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (currentScreen === 'registration') {
    return (
      <RegistrationScreen
        onComplete={handleRegistration}
        onCancel={() => setCurrentScreen('login')}
      />
    );
  }

  if (currentScreen === 'orderDetails' && selectedOrder) {
    return (
      <View style={{ flex: 1 }}>
        <OrderDetailsScreen order={selectedOrder} />
        <TouchableOpacity
          onPress={() => setCurrentScreen('orders')}
          style={{
            position: 'absolute',
            top: 50,
            left: 16,
            backgroundColor: 'white',
            padding: 12,
            borderRadius: 8,
            zIndex: 1000,
          }}
        >
          <Text style={{ color: '#3B82F6', fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <OrderFeedScreen onOrderPress={handleOrderPress} />;
}

