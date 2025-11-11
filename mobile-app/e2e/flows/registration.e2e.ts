/**
 * User Registration Flow E2E Tests
 */

import { device, element, by, waitFor } from 'detox';
import { TestIDs } from '../testIds';
import { tapElement, typeText, waitForElement, waitForNetworkIdle } from '../helpers/testHelpers';

describe('User Registration Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full registration flow', async () => {
    // Step 1: Navigate to registration
    await tapElement(element(by.id(TestIDs.registerButton)));

    // Step 2: Fill personal information
    await typeText(element(by.id(TestIDs.registrationNameInput)), 'John Doe');
    await typeText(element(by.id(TestIDs.registrationEmailInput)), 'john.doe@example.com');
    await typeText(element(by.id(TestIDs.registrationPhoneInput)), '+7 (999) 123-45-67');
    await typeText(element(by.id(TestIDs.registrationPasswordInput)), 'Password123!');

    // Proceed to next step
    await tapElement(element(by.id(TestIDs.registrationNextButton)));

    // Step 3: Skills selection
    await waitForNetworkIdle(1000);
    const washingMachineSkill = element(by.text('Washing Machine'));
    await tapElement(washingMachineSkill);
    
    const refrigeratorSkill = element(by.text('Refrigerator'));
    await tapElement(refrigeratorSkill);

    await tapElement(element(by.id(TestIDs.registrationNextButton)));

    // Step 4: Service area selection
    await waitForNetworkIdle(1000);
    // Map interaction would go here
    await tapElement(element(by.id(TestIDs.registrationNextButton)));

    // Step 5: Phone verification
    await waitForNetworkIdle(1000);
    await waitFor(element(by.id(TestIDs.otpInput)))
      .toBeVisible()
      .withTimeout(10000);

    // Enter OTP (in real test, this would come from SMS)
    await typeText(element(by.id(TestIDs.otpInput)), '123456');
    await tapElement(element(by.id(TestIDs.otpVerifyButton)));

    // Step 6: Document upload
    await waitForNetworkIdle(1000);
    const documentUploadButton = element(by.text('Upload Certificate'));
    await tapElement(documentUploadButton);

    // Step 7: Terms acceptance
    await waitForNetworkIdle(1000);
    const termsCheckbox = element(by.text('I accept the terms and conditions'));
    await tapElement(termsCheckbox);

    // Step 8: Submit registration
    await tapElement(element(by.id(TestIDs.registrationSubmitButton)));

    // Step 9: Verify successful registration
    await waitFor(element(by.text('Registration successful')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should show validation errors for invalid input', async () => {
    await tapElement(element(by.id(TestIDs.registerButton)));

    // Try to proceed with invalid email
    await typeText(element(by.id(TestIDs.registrationEmailInput)), 'invalid-email');
    await tapElement(element(by.id(TestIDs.registrationNextButton)));

    // Should show validation error
    await waitFor(element(by.text(/invalid email/i)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should handle phone verification timeout', async () => {
    await tapElement(element(by.id(TestIDs.registerButton)));

    // Fill valid information
    await typeText(element(by.id(TestIDs.registrationNameInput)), 'John Doe');
    await typeText(element(by.id(TestIDs.registrationEmailInput)), 'john.doe@example.com');
    await typeText(element(by.id(TestIDs.registrationPhoneInput)), '+7 (999) 123-45-67');
    await typeText(element(by.id(TestIDs.registrationPasswordInput)), 'Password123!');

    await tapElement(element(by.id(TestIDs.registrationNextButton)));
    await waitForNetworkIdle(1000);
    await tapElement(element(by.id(TestIDs.registrationNextButton)));
    await waitForNetworkIdle(1000);
    await tapElement(element(by.id(TestIDs.registrationNextButton)));

    // Wait for OTP input
    await waitFor(element(by.id(TestIDs.otpInput)))
      .toBeVisible()
      .withTimeout(10000);

    // Wait for timeout (assuming 5 minutes)
    // In real test, would wait or mock timeout

    // Should show resend option
    const resendButton = element(by.text('Resend OTP'));
    await waitFor(resendButton).toBeVisible().withTimeout(6000);
  });

  it('should handle network error during registration', async () => {
    // Set network to offline
    await device.setNetworkCondition('none');

    await tapElement(element(by.id(TestIDs.registerButton)));
    await typeText(element(by.id(TestIDs.registrationNameInput)), 'John Doe');
    await typeText(element(by.id(TestIDs.registrationEmailInput)), 'john.doe@example.com');
    await typeText(element(by.id(TestIDs.registrationPhoneInput)), '+7 (999) 123-45-67');
    await typeText(element(by.id(TestIDs.registrationPasswordInput)), 'Password123!');

    await tapElement(element(by.id(TestIDs.registrationNextButton)));
    await waitForNetworkIdle(2000);

    // Should show offline indicator
    await waitFor(element(by.id(TestIDs.offlineIndicator)))
      .toBeVisible()
      .withTimeout(3000);

    // Restore network
    await device.setNetworkCondition('wifi');
  });
});








