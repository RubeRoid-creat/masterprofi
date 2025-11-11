/**
 * Order Acceptance Process E2E Tests
 */

import { device, element, by, waitFor } from 'detox';
import { TestIDs } from '../testIds';
import { tapElement, swipeOnElement, waitForElement, waitForNetworkIdle } from '../helpers/testHelpers';

describe('Order Acceptance Process', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Assume user is logged in
    await waitForNetworkIdle(2000);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await waitForNetworkIdle(1000);
  });

  it('should accept order from order feed', async () => {
    // Navigate to orders tab
    await tapElement(element(by.id(TestIDs.ordersTab)));

    // Wait for orders to load
    await waitForNetworkIdle(2000);

    // Find and tap on an order card
    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);

    // View order details
    await tapElement(orderCard);

    // Wait for order details screen
    await waitFor(element(by.id(TestIDs.orderDetailsScreen)))
      .toBeVisible()
      .withTimeout(5000);

    // Accept the order
    const acceptButton = element(by.id(TestIDs.orderAcceptButton('order-1')));
    await tapElement(acceptButton);

    // Confirm acceptance
    const confirmButton = element(by.text('Confirm'));
    await tapElement(confirmButton);

    // Verify order status changed
    await waitFor(element(by.id(TestIDs.orderStatusBadge('assigned'))))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should accept order via swipe gesture', async () => {
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(2000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);

    // Swipe right to accept
    await swipeOnElement(orderCard, 'right', 'fast');

    // Verify acceptance action was triggered
    await waitFor(element(by.text(/order accepted/i)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should decline order', async () => {
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(2000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);

    await tapElement(orderCard);

    await waitFor(element(by.id(TestIDs.orderDetailsScreen)))
      .toBeVisible()
      .withTimeout(5000);

    // Decline the order
    const declineButton = element(by.id(TestIDs.orderDeclineButton('order-1')));
    await tapElement(declineButton);

    // Enter decline reason
    const reasonInput = element(by.text('Reason'));
    await tapElement(reasonInput);
    await element(by.text('Reason')).typeText('Too far away');

    // Submit decline
    const submitDecline = element(by.text('Decline Order'));
    await tapElement(submitDecline);

    // Verify order was declined
    await waitFor(element(by.text(/order declined/i)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should handle order acceptance while offline', async () => {
    await device.setNetworkCondition('none');

    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(1000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);

    await tapElement(orderCard);

    await waitFor(element(by.id(TestIDs.orderDetailsScreen)))
      .toBeVisible()
      .withTimeout(5000);

    // Try to accept offline
    const acceptButton = element(by.id(TestIDs.orderAcceptButton('order-1')));
    await tapElement(acceptButton);

    // Should show offline queue indicator
    await waitFor(element(by.id(TestIDs.actionQueueIndicator)))
      .toBeVisible()
      .withTimeout(3000);

    // Restore network
    await device.setNetworkCondition('wifi');
    await waitForNetworkIdle(3000);

    // Verify order was accepted after sync
    await waitFor(element(by.id(TestIDs.orderStatusBadge('assigned'))))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should filter orders by status', async () => {
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(2000);

    // Filter by new orders
    const newTab = element(by.text('New'));
    await tapElement(newTab);

    // Verify only new orders are shown
    await waitForNetworkIdle(1000);
    const statusBadge = element(by.id(TestIDs.orderStatusBadge('new')));
    await waitFor(statusBadge).toBeVisible().withTimeout(3000);

    // Filter by assigned orders
    const assignedTab = element(by.text('Assigned'));
    await tapElement(assignedTab);

    await waitForNetworkIdle(1000);
    const assignedBadge = element(by.id(TestIDs.orderStatusBadge('assigned')));
    await waitFor(assignedBadge).toBeVisible().withTimeout(3000);
  });

  it('should display order details correctly', async () => {
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(2000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    await waitFor(element(by.id(TestIDs.orderDetailsScreen)))
      .toBeVisible()
      .withTimeout(5000);

    // Verify order details are displayed
    await waitFor(element(by.text(/client/i))).toBeVisible().withTimeout(3000);
    await waitFor(element(by.text(/appliance/i))).toBeVisible().withTimeout(3000);
    await waitFor(element(by.text(/address/i))).toBeVisible().withTimeout(3000);
    await waitFor(element(by.text(/price/i))).toBeVisible().withTimeout(3000);
  });
});








