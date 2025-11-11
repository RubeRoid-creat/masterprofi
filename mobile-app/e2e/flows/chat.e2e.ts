/**
 * Chat Functionality E2E Tests
 */

import { device, element, by, waitFor } from 'detox';
import { TestIDs } from '../testIds';
import { tapElement, typeText, waitForElement, waitForNetworkIdle } from '../helpers/testHelpers';

describe('Chat Functionality', () => {
  beforeAll(async () => {
    await device.launchApp();
    await waitForNetworkIdle(2000);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await waitForNetworkIdle(1000);
  });

  it('should send text message', async () => {
    // Navigate to order details
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(2000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    // Open chat
    const chatButton = element(by.text('Chat'));
    await tapElement(chatButton);

    await waitFor(element(by.id(TestIDs.chatInput)))
      .toBeVisible()
      .withTimeout(5000);

    // Type and send message
    const message = 'Hello, I will arrive in 30 minutes';
    await typeText(element(by.id(TestIDs.chatInput)), message);
    await tapElement(element(by.id(TestIDs.chatSendButton)));

    // Verify message was sent
    await waitFor(element(by.text(message)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should send image attachment', async () => {
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(2000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    const chatButton = element(by.text('Chat'));
    await tapElement(chatButton);

    await waitFor(element(by.id(TestIDs.chatInput)))
      .toBeVisible()
      .withTimeout(5000);

    // Attach image
    await tapElement(element(by.id(TestIDs.chatAttachmentButton)));

    // Select image from gallery
    const selectImage = element(by.text('Select from Gallery'));
    await tapElement(selectImage);

    // Wait for image picker (in real app, would select actual image)
    await waitForNetworkIdle(2000);

    // Send message with attachment
    await typeText(element(by.id(TestIDs.chatInput)), 'Check this photo');
    await tapElement(element(by.id(TestIDs.chatSendButton)));

    // Verify attachment was sent
    await waitFor(element(by.text(/photo/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should record and send voice message', async () => {
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(2000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    const chatButton = element(by.text('Chat'));
    await tapElement(chatButton);

    await waitFor(element(by.id(TestIDs.chatInput)))
      .toBeVisible()
      .withTimeout(5000);

    // Start recording
    await tapElement(element(by.id(TestIDs.chatVoiceButton)));

    // Wait for recording (simulate 3 seconds)
    await waitForNetworkIdle(3000);

    // Stop recording and send
    await tapElement(element(by.id(TestIDs.chatVoiceButton)));

    // Verify voice message was sent
    await waitFor(element(by.text(/voice message/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should use quick reply templates', async () => {
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(2000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    const chatButton = element(by.text('Chat'));
    await tapElement(chatButton);

    await waitFor(element(by.id(TestIDs.chatInput)))
      .toBeVisible()
      .withTimeout(5000);

    // Find quick reply
    const quickReply = element(by.text('On my way'));
    await waitFor(quickReply).toBeVisible().withTimeout(3000);
    await tapElement(quickReply);

    // Verify message was sent
    await waitFor(element(by.text('On my way')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should receive and display messages', async () => {
    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(2000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    const chatButton = element(by.text('Chat'));
    await tapElement(chatButton);

    // Wait for incoming message (simulated)
    await waitFor(element(by.text(/client message/i)))
      .toBeVisible()
      .withTimeout(10000);

    // Verify message bubble is displayed
    await waitFor(element(by.id(TestIDs.chatMessage('message-1'))))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle chat while offline', async () => {
    await device.setNetworkCondition('none');

    await tapElement(element(by.id(TestIDs.ordersTab)));
    await waitForNetworkIdle(1000);

    const orderCard = element(by.id(TestIDs.orderCard('order-1')));
    await waitForElement(orderCard, 5000);
    await tapElement(orderCard);

    const chatButton = element(by.text('Chat'));
    await tapElement(chatButton);

    await waitFor(element(by.id(TestIDs.chatInput)))
      .toBeVisible()
      .withTimeout(5000);

    // Send message offline
    await typeText(element(by.id(TestIDs.chatInput)), 'Offline message');
    await tapElement(element(by.id(TestIDs.chatSendButton)));

    // Should show queued indicator
    await waitFor(element(by.text(/sending/i)))
      .toBeVisible()
      .withTimeout(3000);

    // Restore network
    await device.setNetworkCondition('wifi');
    await waitForNetworkIdle(3000);

    // Verify message was sent after sync
    await waitFor(element(by.text('Offline message')))
      .toBeVisible()
      .withTimeout(5000);
  });
});








