/**
 * Payment Workflow E2E Tests
 */

import { device, element, by, waitFor } from 'detox';
import { TestIDs } from '../testIds';
import { tapElement, typeText, waitForElement, waitForNetworkIdle } from '../helpers/testHelpers';

describe('Payment Workflow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await waitForNetworkIdle(2000);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await waitForNetworkIdle(1000);
  });

  it('should view earnings balance', async () => {
    // Navigate to earnings tab
    await tapElement(element(by.id(TestIDs.earningsTab)));
    await waitForNetworkIdle(2000);

    // Verify balance is displayed
    await waitFor(element(by.text(/balance/i)))
      .toBeVisible()
      .withTimeout(5000);

    await waitFor(element(by.text(/₽/)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should request withdrawal', async () => {
    await tapElement(element(by.id(TestIDs.earningsTab)));
    await waitForNetworkIdle(2000);

    // Open withdrawal request
    await tapElement(element(by.id(TestIDs.withdrawalRequestButton)));

    await waitFor(element(by.id(TestIDs.paymentScreen)))
      .toBeVisible()
      .withTimeout(5000);

    // Enter withdrawal amount
    await typeText(element(by.id(TestIDs.paymentAmountInput)), '5000');

    // Select payment method
    await tapElement(element(by.id(TestIDs.paymentMethodSelector)));
    
    const bankCard = element(by.text('Bank Card'));
    await tapElement(bankCard);

    // Submit withdrawal request
    await tapElement(element(by.id(TestIDs.paymentSubmitButton)));

    // Verify withdrawal request was submitted
    await waitFor(element(by.text(/withdrawal requested/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should view payment history', async () => {
    await tapElement(element(by.id(TestIDs.earningsTab)));
    await waitForNetworkIdle(2000);

    // Find payment history section
    const historySection = element(by.text('Payment History'));
    await waitFor(historySection).toBeVisible().withTimeout(3000);
    await tapElement(historySection);

    // Verify transactions are listed
    await waitFor(element(by.text(/transaction/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should filter payment history by date', async () => {
    await tapElement(element(by.id(TestIDs.earningsTab)));
    await waitForNetworkIdle(2000);

    const historySection = element(by.text('Payment History'));
    await tapElement(historySection);

    // Filter by this month
    const thisMonthFilter = element(by.text('This Month'));
    await tapElement(thisMonthFilter);

    await waitForNetworkIdle(1000);

    // Verify filtered results
    await waitFor(element(by.text(/january/i)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should calculate tax', async () => {
    await tapElement(element(by.id(TestIDs.earningsTab)));
    await waitForNetworkIdle(2000);

    // Open tax calculator
    const taxCalculator = element(by.text('Tax Calculator'));
    await tapElement(taxCalculator);

    // Enter earnings amount
    const earningsInput = element(by.id('tax-earnings-input'));
    await typeText(earningsInput, '100000');

    // Verify tax calculation
    await waitFor(element(by.text(/tax/i)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should handle payment method management', async () => {
    await tapElement(element(by.id(TestIDs.earningsTab)));
    await waitForNetworkIdle(2000);

    // Open payment methods
    const paymentMethods = element(by.text('Payment Methods'));
    await tapElement(paymentMethods);

    // Add new payment method
    const addMethodButton = element(by.text('Add Payment Method'));
    await tapElement(addMethodButton);

    // Fill payment method details
    const cardNumberInput = element(by.id('card-number-input'));
    await typeText(cardNumberInput, '4111111111111111');

    const expiryInput = element(by.id('card-expiry-input'));
    await typeText(expiryInput, '12/25');

    // Save payment method
    const saveButton = element(by.text('Save'));
    await tapElement(saveButton);

    // Verify payment method was added
    await waitFor(element(by.text(/card added/i)))
      .toBeVisible()
      .withTimeout(5000);
  });
});








