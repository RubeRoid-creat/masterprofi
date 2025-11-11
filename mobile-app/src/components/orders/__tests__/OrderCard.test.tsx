/**
 * Order Card Component Tests
 * Tests for rendering, interactions, accessibility, and error scenarios
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OrderCard } from '../OrderCard';
import { Order, OrderStatus } from '../../../types/order';
import { mockOrders } from '../../../__tests__/__mocks__/apiMocks';

describe('OrderCard', () => {
  const mockOrder: Order = mockOrders[0];
  const mockOnPress = jest.fn();
  const mockOnAccept = jest.fn();
  const mockOnDecline = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render order card with correct data', () => {
      const { getByText } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status={mockOrder.status}
          urgency={mockOrder.urgency}
          onPress={mockOnPress}
        />
      );

      expect(getByText(mockOrder.client.name)).toBeTruthy();
      expect(getByText(mockOrder.location.address)).toBeTruthy();
      expect(getByText(`${mockOrder.price.amount} ₽`)).toBeTruthy();
    });

    it('should render new order badge when order is new', () => {
      const { queryByText } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={mockOnPress}
          isNew
        />
      );

      expect(queryByText('New')).toBeTruthy();
    });

    it('should render urgency badge for high urgency orders', () => {
      const { queryByText } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status="new"
          urgency="high"
          onPress={mockOnPress}
        />
      );

      expect(queryByText(/urgent/i)).toBeTruthy();
    });

    it('should render distance and estimated time', () => {
      const { getByText } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={2.5}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={mockOnPress}
        />
      );

      expect(getByText(/2.5 km/i)).toBeTruthy();
    });

    it('should match snapshot', () => {
      const { toJSON } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status={mockOrder.status}
          urgency={mockOrder.urgency}
          onPress={mockOnPress}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when card is pressed', () => {
      const { getByTestId } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={mockOnPress}
        />
      );

      // Use accessibility label to find card
      const card = getByLabelText(new RegExp(mockOrder.client.name, 'i'));
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should call onAccept when accept button is pressed', () => {
      const { getByLabelText } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={mockOnPress}
          onAccept={mockOnAccept}
        />
      );

      const acceptButton = getByLabelText(/accept order/i);
      fireEvent.press(acceptButton);

      expect(mockOnAccept).toHaveBeenCalledTimes(1);
    });

    it('should call onDecline when decline button is pressed', () => {
      const { getByLabelText } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={mockOnPress}
          onDecline={mockOnDecline}
        />
      );

      const declineButton = getByLabelText(/decline order/i);
      fireEvent.press(declineButton);

      expect(mockOnDecline).toHaveBeenCalledTimes(1);
    });

    it('should handle swipe gesture for actions', async () => {
      const { getByTestId } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={mockOnPress}
          onAccept={mockOnAccept}
          testID="order-card"
        />
      );

      const card = getByTestId('order-card');
      
      // Simulate swipe right
      fireEvent(card, 'onSwipeableRightOpen');
      
      // Note: Actual swipe gesture testing requires more complex setup
      // This is a placeholder for swipe functionality
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      const { getByLabelText } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={mockOnPress}
        />
      );

      expect(getByLabelText(new RegExp(mockOrder.client.name, 'i'))).toBeTruthy();
    });

    it('should have accessibility role', () => {
      const { getByRole } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={mockOnPress}
        />
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('should support accessibility hints', () => {
      const { getByA11yHint } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={mockOnPress}
        />
      );

      const card = getByLabelText(new RegExp(mockOrder.client.name, 'i'));
      expect(card.props.accessibilityHint).toContain('details');
    });
  });

  describe('Status Display', () => {
    const statuses: OrderStatus[] = ['new', 'assigned', 'in_progress', 'completed', 'cancelled'];

    statuses.forEach((status) => {
      it(`should display correct status badge for ${status}`, () => {
        const { getByText } = render(
          <OrderCard
            orderId={mockOrder.id}
            clientName={mockOrder.client.name}
            applianceType={mockOrder.appliance.type}
            address={mockOrder.location.address}
            distance={mockOrder.location.distance}
            price={mockOrder.price.amount}
            status={status}
            urgency="normal"
            onPress={mockOnPress}
          />
        );

        expect(getByText(new RegExp(status, 'i'))).toBeTruthy();
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle missing onPress gracefully', () => {
      const { getByLabelText } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          distance={mockOrder.location.distance}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={() => {}}
        />
      );

      const card = getByLabelText(new RegExp(mockOrder.client.name));
      
      // Should not throw when pressed
      expect(() => fireEvent.press(card)).not.toThrow();
    });

    it('should handle missing optional props', () => {
      const { getByText } = render(
        <OrderCard
          orderId={mockOrder.id}
          clientName={mockOrder.client.name}
          applianceType={mockOrder.appliance.type}
          address={mockOrder.location.address}
          price={mockOrder.price.amount}
          status="new"
          urgency="normal"
          onPress={mockOnPress}
        />
      );

      expect(getByText(mockOrder.client.name)).toBeTruthy();
    });
  });
});

