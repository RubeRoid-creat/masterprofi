/**
 * Icon Generation Script
 * Generates app icons for all required resolutions
 */

const fs = require('fs');
const path = require('path');

const iconConfig = {
  ios: {
    sizes: [
      { size: 20, scales: [2, 3] }, // Notification
      { size: 29, scales: [2, 3] }, // Settings
      { size: 40, scales: [2, 3] },  // Spotlight
      { size: 60, scales: [2, 3] }, // App
      { size: 76, scales: [1, 2] }, // iPad
      { size: 83.5, scales: [2] },  // iPad Pro
      { size: 1024, scales: [1] },  // App Store
    ],
  },
  android: {
    directories: [
      { name: 'mipmap-mdpi', density: 1.0 },
      { name: 'mipmap-hdpi', density: 1.5 },
      { name: 'mipmap-xhdpi', density: 2.0 },
      { name: 'mipmap-xxhdpi', density: 3.0 },
      { name: 'mipmap-xxxhdpi', density: 4.0 },
    ],
    adaptive: [
      { size: 108, name: 'ic_launcher' },
      { size: 108, name: 'ic_launcher_foreground' },
      { size: 432, name: 'ic_launcher_background' },
    ],
  },
};

/**
 * Generate icon manifest
 */
function generateIconManifest() {
  const manifest = {
    ios: {
      icon: './assets/icon-ios.png',
      iconFiles: iconConfig.ios.sizes.flatMap(({ size, scales }) =>
        scales.map((scale) => ({
          size: size * scale,
          filename: `icon-${size}@${scale}x.png`,
        }))
      ),
    },
    android: {
      icon: './assets/icon-android.png',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon-foreground.png',
        backgroundColor: '#3B82F6',
      },
      iconFiles: iconConfig.android.directories.map(({ name }) => ({
        directory: name,
        files: ['ic_launcher.png', 'ic_launcher_round.png'],
      })),
    },
  };

  fs.writeFileSync(
    path.join(__dirname, '../assets/icon-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('Icon manifest generated');
}

/**
 * Instructions for icon generation
 */
console.log(`
Icon Generation Instructions:
============================

1. Prepare source icon:
   - iOS: 1024x1024px PNG (no transparency)
   - Android: 1024x1024px PNG

2. For iOS, create icons in assets/ios/:
   - icon-20@2x.png (40x40)
   - icon-20@3x.png (60x60)
   - icon-29@2x.png (58x58)
   - icon-29@3x.png (87x87)
   - icon-40@2x.png (80x80)
   - icon-40@3x.png (120x120)
   - icon-60@2x.png (120x120)
   - icon-60@3x.png (180x180)
   - icon-76@1x.png (76x76)
   - icon-76@2x.png (152x152)
   - icon-83.5@2x.png (167x167)
   - icon-1024.png (1024x1024)

3. For Android, create icons in assets/android/:
   - mipmap-mdpi/ic_launcher.png (48x48)
   - mipmap-hdpi/ic_launcher.png (72x72)
   - mipmap-xhdpi/ic_launcher.png (96x96)
   - mipmap-xxhdpi/ic_launcher.png (144x144)
   - mipmap-xxxhdpi/ic_launcher.png (192x192)
   - Adaptive icon foreground (108x108)
   - Adaptive icon background (432x432)

4. Use tools:
   - ImageMagick: magick convert icon.png -resize SIZE icon-SIZE.png
   - Online tools: https://www.appicon.co/
   - Expo: npx @expo/image-utils
`);

generateIconManifest();








