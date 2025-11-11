/**
 * Splash Screen Generation Script
 * Generates splash screens for all required resolutions
 */

const fs = require('fs');
const path = require('path');

const splashConfig = {
  ios: {
    sizes: [
      { width: 2048, height: 2732, name: 'iPad Pro 12.9' },
      { width: 1668, height: 2388, name: 'iPad Pro 11' },
      { width: 1536, height: 2048, name: 'iPad Air' },
      { width: 1242, height: 2688, name: 'iPhone XS Max' },
      { width: 1125, height: 2436, name: 'iPhone X' },
      { width: 828, height: 1792, name: 'iPhone XR' },
      { width: 750, height: 1334, name: 'iPhone 8' },
      { width: 640, height: 1136, name: 'iPhone SE' },
    ],
  },
  android: {
    densities: [
      { density: 'ldpi', width: 320, height: 426 },
      { density: 'mdpi', width: 320, height: 470 },
      { density: 'hdpi', width: 480, height: 640 },
      { density: 'xhdpi', width: 720, height: 960 },
      { density: 'xxhdpi', width: 1080, height: 1440 },
      { density: 'xxxhdpi', width: 1440, height: 1920 },
    ],
    statusBarHeight: 24,
  },
};

/**
 * Generate splash manifest
 */
function generateSplashManifest() {
  const manifest = {
    ios: {
      splash: {
        image: './assets/splash-ios.png',
        resizeMode: 'contain',
        backgroundColor: '#3B82F6',
        tabletImage: './assets/splash-ios-tablet.png',
      },
      sizes: splashConfig.ios.sizes,
    },
    android: {
      splash: {
        image: './assets/splash-android.png',
        resizeMode: 'contain',
        backgroundColor: '#3B82F6',
      },
      densities: splashConfig.android.densities,
    },
  };

  fs.writeFileSync(
    path.join(__dirname, '../assets/splash-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('Splash manifest generated');
}

console.log(`
Splash Screen Generation Instructions:
======================================

1. Prepare source splash:
   - 2732x2732px PNG (square)
   - Logo centered
   - Background color: #3B82F6

2. For iOS, create in assets/ios/:
   - Default-Retina.png (2048x2732) - iPad Pro 12.9"
   - Default-2048x2732.png
   - Default-1668x2388.png - iPad Pro 11"
   - Default-1536x2048.png - iPad Air
   - Default-1242x2688.png - iPhone XS Max
   - Default-1125x2436.png - iPhone X/XS
   - Default-828x1792.png - iPhone XR
   - Default-750x1334.png - iPhone 8
   - Default-640x1136.png - iPhone SE

3. For Android, create in assets/android/:
   - drawable-ldpi/splash.png (320x426)
   - drawable-mdpi/splash.png (320x470)
   - drawable-hdpi/splash.png (480x640)
   - drawable-xhdpi/splash.png (720x960)
   - drawable-xxhdpi/splash.png (1080x1440)
   - drawable-xxxhdpi/splash.png (1440x1920)

4. Use tools:
   - ImageMagick for resizing
   - Expo: npx expo-splash-screen
`);

generateSplashManifest();








