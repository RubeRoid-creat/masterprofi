/**
 * Test Helpers for Detox E2E Tests
 */

export const waitForElement = async (element: Detox.IndexableNativeElement, timeout = 5000) => {
  await waitFor(element).toBeVisible().withTimeout(timeout);
};

export const tapElement = async (element: Detox.IndexableNativeElement) => {
  await waitForElement(element);
  await element.tap();
};

export const typeText = async (element: Detox.IndexableNativeElement, text: string) => {
  await waitForElement(element);
  await element.typeText(text);
};

export const clearText = async (element: Detox.IndexableNativeElement) => {
  await waitForElement(element);
  await element.clearText();
};

export const scrollToElement = async (
  element: Detox.IndexableNativeElement,
  direction: 'up' | 'down' | 'left' | 'right',
  distance = 100
) => {
  await element.scroll(distance, direction);
};

export const swipeOnElement = async (
  element: Detox.IndexableNativeElement,
  direction: 'left' | 'right' | 'up' | 'down',
  speed = 'fast'
) => {
  await waitForElement(element);
  await element.swipe(direction, speed);
};

export const takeScreenshot = async (name: string) => {
  await device.takeScreenshot(name);
};

export const setNetworkCondition = async (condition: 'wifi' | 'cellular' | 'none') => {
  await device.setNetworkCondition(condition);
};

export const reloadApp = async () => {
  await device.reloadReactNative();
};

export const sendToBackground = async (seconds = 1) => {
  await device.sendToHome();
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  await device.launchApp({ newInstance: false });
};

export const waitForNetworkIdle = async (timeout = 5000) => {
  await new Promise((resolve) => setTimeout(resolve, timeout));
};








