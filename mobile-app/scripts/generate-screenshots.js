/**
 * Screenshot Generation Script
 * Guidelines and templates for App Store screenshots
 */

const fs = require('fs');
const path = require('path');

const screenshotConfig = {
  ios: {
    required: [
      { device: 'iPhone 6.7" Display', width: 1290, height: 2796, name: 'iPhone 14 Pro Max' },
      { device: 'iPhone 6.5" Display', width: 1284, height: 2778, name: 'iPhone 11 Pro Max' },
      { device: 'iPhone 5.5" Display', width: 1242, height: 2208, name: 'iPhone 8 Plus' },
      { device: 'iPad Pro (12.9-inch)', width: 2048, height: 2732, name: 'iPad Pro 12.9' },
      { device: 'iPad Pro (11-inch)', width: 1668, height: 2388, name: 'iPad Pro 11' },
    ],
    optional: [
      { device: 'iPhone 6.1" Display', width: 1179, height: 2556, name: 'iPhone 13' },
      { device: 'iPhone 5.8" Display', width: 1125, height: 2436, name: 'iPhone X' },
    ],
  },
  android: {
    required: [
      { device: 'Phone', width: 1080, height: 1920, name: 'Phone' },
      { device: '7-inch Tablet', width: 1200, height: 1920, name: '7inch Tablet' },
      { device: '10-inch Tablet', width: 1600, height: 2560, name: '10inch Tablet' },
    ],
  },
  locales: ['en-US', 'ru-RU'],
};

const screenshotTemplates = {
  screens: [
    {
      name: 'Orders Feed',
      description: 'Main screen showing available orders',
      keyFeatures: ['Order cards', 'Filters', 'Map view'],
    },
    {
      name: 'Order Details',
      description: 'Detailed view of an order',
      keyFeatures: ['Client info', 'Appliance details', 'Photo gallery'],
    },
    {
      name: 'Chat',
      description: 'Real-time chat with client',
      keyFeatures: ['Message bubbles', 'Media attachments', 'Quick replies'],
    },
    {
      name: 'MLM Network',
      description: 'Network visualization',
      keyFeatures: ['Team tree', 'Statistics', 'Commissions'],
    },
    {
      name: 'Earnings',
      description: 'Earnings and payments dashboard',
      keyFeatures: ['Balance', 'Charts', 'Payment history'],
    },
  ],
};

/**
 * Generate screenshot manifest
 */
function generateScreenshotManifest() {
  const manifest = {
    ios: screenshotConfig.ios,
    android: screenshotConfig.android,
    templates: screenshotTemplates,
    instructions: {
      ios: `
iOS Screenshot Requirements:
============================

1. Required Screenshots:
   - At least 3 screenshots for each device size
   - Maximum 10 screenshots per device
   - JPG or PNG format
   - No transparent backgrounds
   - No rounded corners (Apple adds them automatically)

2. Screenshot Sizes:
   - iPhone 14 Pro Max: 1290x2796px
   - iPhone 11 Pro Max: 1284x2778px
   - iPhone 8 Plus: 1242x2208px
   - iPad Pro 12.9": 2048x2732px
   - iPad Pro 11": 1668x2388px

3. Content Guidelines:
   - Show key features and functionality
   - Use real data (no placeholder text)
   - Highlight unique selling points
   - Include call-to-action if possible

4. Best Practices:
   - Use actual device frames
   - Ensure text is readable
   - Show different app states
   - Include localization if applicable
      `,
      android: `
Android Screenshot Requirements:
================================

1. Required Screenshots:
   - At least 2 screenshots (minimum)
   - Maximum 8 screenshots
   - JPG or PNG format
   - No transparent backgrounds

2. Screenshot Sizes:
   - Phone: 1080x1920px (16:9)
   - 7" Tablet: 1200x1920px (5:8)
   - 10" Tablet: 1600x2560px (5:8)

3. Content Guidelines:
   - Show main features
   - Use real UI elements
   - Highlight benefits

4. Feature Graphic:
   - 1024x500px PNG
   - No text overlay (text added separately)
   - Represents app branding
      `,
    },
  };

  fs.writeFileSync(
    path.join(__dirname, '../assets/screenshots/manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('Screenshot manifest generated');
  console.log('\nScreenshot templates created in assets/screenshots/');
}

generateScreenshotManifest();








