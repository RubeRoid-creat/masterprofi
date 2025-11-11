/**
 * Push Notification Handling E2E Tests
 */

import { device, element, by, waitFor } from 'detox';
import { TestIDs } from '../testIds';
import { tapElement, waitForElement, waitForNetworkIdle, sendToBackground } from '../helpers/testHelpers';

describe('Push Notification Handling', () => {
  beforeAll(async () => {
    await device.launchApp();
    await waitForNetworkIdle(2000);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await waitForNetworkIdle(1000);
  });

  it('should request notification permission', async () => {
    // Navigate to profile/settings
    await tapElement(element(by.id(TestIDs.profileTab)));
    await waitForNetworkIdle(2000);

    // Open notification settings
    const notificationSettings = element(by.text('Notifications'));
    await tapElement(notificationSettings);

    // Request permission
    const permissionButton = element(by.id(TestIDs.notificationPermissionButton));
    await tapElement(permissionButton);

    // Handle permission dialog (platform specific)
    // On iOS, would interact with system alert
    // On Android, permission is typically granted automatically
    await waitForNetworkIdle(2000);
  });

  it('should display notification when received', async () => {
    // Simulate receiving a push notification
    // In real test, would trigger notification via backend
    
    // Wait for notification banner
    await waitFor(element(by.id(TestIDs.notificationBanner)))
      .toBeVisible()
      .withTimeout(10000);

    // Verify notification content
    await waitFor(element(by.text(/new order/i)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should navigate to order when notification tapped', async () => {
    // Trigger notification (simulated)
    // In real test, would send actual push notification

    // Tap notification
    const notification = element(by.id(TestIDs.notificationBanner));
    await waitFor(notification).toBeVisible().withTimeout(10000);
    await tapElement(notification);

    // Verify navigation to order details
    await waitFor(element(by.id(TestIDs.orderDetailsScreen)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle notification when app is in background', async () => {
    // Send app to background
    await sendToBackground(2);

    // Trigger notification while in background
    // In real test, would send actual push notification
    
    // Return to app
    await device.launchApp({ newInstance: false });

    // Verify notification was handled
    await waitFor(element(by.text(/notification/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle notification when app is closed', async () => {
    // Close app completely
    await device.terminateApp();

    // Trigger notification while app is closed
    // In real test, would send actual push notification

    // Launch app from notification
    await device.launchApp();

    // Verify app opened from notification
    await waitFor(element(by.id(TestIDs.orderDetailsScreen)))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle different notification types', async () => {
    // Test new order notification
    // Simulate notification with order data
    await waitFor(element(by.text(/new order/i)))
      .toBeVisible()
      .withTimeout(10000);

    await tapElement(element(by.id(TestIDs.notificationBanner)));
    await waitFor(element(by.id(TestIDs.orderDetailsScreen)))
      .toBeVisible()
      .withTimeout(5000);

    // Go back and test message notification
    await device.reloadReactNative();
    await waitForNetworkIdle(2000);

    // Simulate message notification
    await waitFor(element(by.text(/new message/i)))
      .toBeVisible()
      .withTimeout(10000);

    await tapElement(element(by.id(TestIDs.notificationBanner)));
    
    // Verify navigation to chat
    await waitFor(element(by.id(TestIDs.chatInput)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should update badge count', async () => {
    // Trigger notifications
    // In real test, would send multiple notifications

    // Verify badge is updated
    await waitForNetworkIdle(3000);

    // Check badge count (if accessible via test)
    // Badge count is typically shown in tab bar
    await waitFor(element(by.text(/^\d+$/))) // Matches numbers
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle notification tap with deep link', async () => {
    // Trigger notification with deep link
    // deep link: masterprofi://orders/order-123

    const notification = element(by.id(TestIDs.notificationBanner));
    await waitFor(notification).toBeVisible().withTimeout(10000);
    await tapElement(notification);

    // Verify deep link navigation worked
    await waitFor(element(by.id(TestIDs.orderDetailsScreen)))
      .toBeVisible()
      .withTimeout(5000);

    // Verify correct order is displayed
    await waitFor(element(by.text(/order-123/i)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should handle notification permissions denied', async () => {
    await tapElement(element(by.id(TestIDs.profileTab)));
    await waitForNetworkIdle(2000);

    const notificationSettings = element(by.text('Notifications'));
    await tapElement(notificationSettings);

    // Deny permission (simulate)
    // On iOS, would tap "Don't Allow" on system alert
    // On Android, would check if permission was denied

    // Verify appropriate message is shown
    await waitFor(element(by.text(/permission denied/i)))
      .toBeVisible()
      .withTimeout(5000);
  });
});








