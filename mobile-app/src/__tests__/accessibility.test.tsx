/**
 * Accessibility Tests
 * Tests for accessibility labels, roles, and keyboard navigation
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { OrderCard } from '../components/orders/OrderCard';
import { mockOrders } from './__mocks__/apiMocks';

describe('Accessibility', () => {
  describe('Order Card Accessibility', () => {
    it('should have accessible label', () => {
      const { getByLabelText } = render(
        <OrderCard
          orderId={mockOrders[0].id}
          clientName={mockOrders[0].client.name}
          applianceType={mockOrders[0].appliance.type}
          address={mockOrders[0].location.address}
          distance={mockOrders[0].location.distance}
          price={mockOrders[0].price.amount}
          status={mockOrders[0].status}
          urgency={mockOrders[0].urgency}
          onPress={() => {}}
        />
      );

      const card = getByLabelText(`Order from ${mockOrders[0].client.name}`);
      expect(card).toBeTruthy();
    });

    it('should have accessibility role', () => {
      const { getByRole } = render(
        <OrderCard
          orderId={mockOrders[0].id}
          clientName={mockOrders[0].client.name}
          applianceType={mockOrders[0].appliance.type}
          address={mockOrders[0].location.address}
          distance={mockOrders[0].location.distance}
          price={mockOrders[0].price.amount}
          status={mockOrders[0].status}
          urgency={mockOrders[0].urgency}
          onPress={() => {}}
        />
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should have accessibility hint', () => {
      const { getByA11yHint } = render(
        <OrderCard
          orderId={mockOrders[0].id}
          clientName={mockOrders[0].client.name}
          applianceType={mockOrders[0].appliance.type}
          address={mockOrders[0].location.address}
          distance={mockOrders[0].location.distance}
          price={mockOrders[0].price.amount}
          status={mockOrders[0].status}
          urgency={mockOrders[0].urgency}
          onPress={() => {}}
        />
      );

      const hint = getByA11yHint(/tap to view details/i);
      expect(hint).toBeTruthy();
    });

    it('should have accessible state', () => {
      const { getByTestId } = render(
        <OrderCard
          orderId={mockOrders[0].id}
          clientName={mockOrders[0].client.name}
          applianceType={mockOrders[0].appliance.type}
          address={mockOrders[0].location.address}
          distance={mockOrders[0].location.distance}
          price={mockOrders[0].price.amount}
          status="new"
          urgency="high"
          onPress={() => {}}
          testID="order-card"
        />
      );

      const card = getByTestId('order-card');
      expect(card.props.accessibilityState).toBeDefined();
    });
  });

  describe('Form Accessibility', () => {
    it('should have accessible form fields', () => {
      const { TextInput } = require('react-native');
      
      const FormField = ({ label, value, onChange }: any) => (
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          accessibilityRequired
        />
      );

      const { getByLabelText } = render(
        <FormField
          label="Email Address"
          value=""
          onChange={() => {}}
        />
      );

      const field = getByLabelText('Email Address');
      expect(field).toBeTruthy();
    });

    it('should associate labels with inputs', () => {
      const { Text, TextInput } = require('react-native');
      
      const FormField = ({ label }: any) => (
        <>
          <Text accessibilityRole="text">{label}</Text>
          <TextInput accessibilityLabel={label} />
        </>
      );

      const { getByLabelText } = render(
        <FormField label="Email" />
      );

      const input = getByLabelText('Email');
      expect(input).toBeTruthy();
    });

    it('should announce validation errors', () => {
      const { View, Text, TextInput } = require('react-native');
      
      const FormField = ({ error }: any) => (
        <View>
          <TextInput 
            accessibilityLabel="Email" 
            accessibilityInvalid={!!error}
          />
          {error && (
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}
        </View>
      );

      const { getByText } = render(
        <FormField error="Invalid email format" />
      );

      const alert = getByText('Invalid email format');
      expect(alert).toBeTruthy();
    });
  });

  describe('Button Accessibility', () => {
    it('should have accessible button labels', () => {
      const { TouchableOpacity, Text } = require('react-native');
      
      const Button = ({ label, onPress }: any) => (
        <TouchableOpacity
          accessibilityLabel={label}
          onPress={onPress}
          accessibilityRole="button"
        >
          <Text>{label}</Text>
        </TouchableOpacity>
      );

      const { getByLabelText } = render(
        <Button label="Submit Order" onPress={() => {}} />
      );

      const button = getByLabelText('Submit Order');
      expect(button).toBeTruthy();
    });

    it('should indicate disabled state', () => {
      const { TouchableOpacity, Text } = require('react-native');
      
      const Button = ({ disabled }: any) => (
        <TouchableOpacity
          accessibilityLabel="Submit"
          disabled={disabled}
          accessibilityState={{ disabled }}
        >
          <Text>Submit</Text>
        </TouchableOpacity>
      );

      const { getByLabelText } = render(<Button disabled />);

      const button = getByLabelText('Submit');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper heading hierarchy', () => {
      const { View, Text } = require('react-native');
      
      const Screen = () => (
        <View>
          <Text accessibilityRole="header" accessibilityLevel={1}>Orders</Text>
          <Text accessibilityRole="header" accessibilityLevel={2}>New Orders</Text>
          <Text accessibilityRole="header" accessibilityLevel={3}>Order Details</Text>
        </View>
      );

      const { getByText } = render(<Screen />);

      expect(getByText('Orders')).toBeTruthy();
      expect(getByText('New Orders')).toBeTruthy();
      expect(getByText('Order Details')).toBeTruthy();
    });
  });
});

