/**
 * Detox Initialization
 */

import { device } from 'detox';

beforeAll(async () => {
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: 'YES',
      location: 'YES',
      camera: 'YES',
    },
  });
});

beforeEach(async () => {
  await device.reloadReactNative();
});

afterEach(async () => {
  // Clean up after each test if needed
});








