/**
 * Offline Mode Testing E2E Tests
 */

import { device, element, by, waitFor } from 'detox';
import { TestIDs } from '../testIds';
import { tapElement, waitForElement, waitForNetworkIdle, setNetworkCondition } from '../helpers/testHelpers';

describe('Offline Mode Testing', () => {
  beforeAll(async () => {
    await device.launchApp();
    await waitForNetworkIdle(2000);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await waitForNetworkIdle(1000);
  });

  afterEach(async () => {
    // Restore network connection after each test
    await device.setNetworkCondition('wifi');
  });

  it('should display offline indicator', async () => {
    // Set network to offline
    await device.setNetworkCondition('none');
    await waitForNetworkIdle(1000);

    // Verify offline indicator is shown
    await waitFor(element(by.id(TestIDs.offlineIndicator)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should queue actions when offline', async () => {
    await device.setNetworkCondition('none');

    // Navigate to orders
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(1000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    // Try to accept order offline
    const acceptButton = element(by.id(TestIDs.orderAcceptButton('order-1')));
    await tapElement(acceptButton);

    // Verify action was queued
    await waitFor(element(by.id(TestIDs.actionQueueIndicator)))
      .toBeVisible()
      .withTimeout(3000);

    // Restore network
    await device.setNetworkCondition('wifi');
    await waitForNetworkIdle(5000);

    // Verify queue was processed
    await waitFor(element(by.id(TestIDs.actionQueueIndicator)))
      .not.toBeVisible()
      .withTimeout(10000);
  });

  it('should sync queued actions when connection restored', async () => {
    await device.setNetworkCondition('none');

    // Create multiple offline actions
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(1000);

    // Accept order offline
    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    const acceptButton = element(by.id(TestIDs.orderAcceptButton('order-1')));
    await tapElement(acceptButton);

    // Send chat message offline
    const chatButton = element(by.text('Chat'));
    await tapElement(chatButton);

    await waitFor(element(by.id(TestIDs.chatInput)))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id(TestIDs.chatInput)).typeText('Offline message');
    await tapElement(element(by.id(TestIDs.chatSendButton)));

    // Verify queue count
    await waitFor(element(by.text(/2 pending/i)))
      .toBeVisible()
      .withTimeout(3000);

    // Restore network
    await device.setNetworkCondition('wifi');
    await waitForNetworkIdle(5000);

    // Wait for sync to complete
    await waitFor(element(by.id(TestIDs.actionQueueIndicator)))
      .not.toBeVisible()
      .withTimeout(15000);
  });

  it('should cache orders for offline viewing', async () => {
    // Load orders while online
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(3000);

    // Verify orders are loaded
    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);

    // Go offline
    await device.setNetworkCondition('none');
    await waitForNetworkIdle(1000);

    // Verify cached orders are still visible
    await waitFor(orderCard).toBeVisible().withTimeout(3000);
  });

  it('should handle offline order details', async () => {
    await device.setNetworkCondition('none');

    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(1000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    // Verify order details are displayed from cache
    await waitFor(element(by.id(TestIDs.orderDetailsScreen)))
      .toBeVisible()
      .withTimeout(5000);

    await waitFor(element(by.text(/client/i)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should retry failed sync actions', async () => {
    await device.setNetworkCondition('none');

    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(1000);

    // Create action offline
    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    const acceptButton = element(by.id(TestIDs.orderAcceptButton('order-1')));
    await tapElement(acceptButton);

    // Restore network briefly, then go offline again
    await device.setNetworkCondition('wifi');
    await waitForNetworkIdle(2000);
    await device.setNetworkCondition('none');

    // Action should retry when network is restored again
    await device.setNetworkCondition('wifi');
    await waitForNetworkIdle(5000);

    // Verify action was eventually processed
    await waitFor(element(by.id(TestIDs.actionQueueIndicator)))
      .not.toBeVisible()
      .withTimeout(15000);
  });
});








