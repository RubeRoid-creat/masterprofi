/**
 * Script to create placeholder assets for development
 * Run: node scripts/create-placeholder-assets.js
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Create a simple 1x1 transparent PNG as placeholder
// This is a minimal valid PNG file (1x1 transparent pixel)
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Create a minimal WAV file (silent 1 second)
const minimalWAV = Buffer.from(
  'UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAA==',
  'base64'
);

// Files to create
const files = {
  'icon.png': minimalPNG,
  'splash.png': minimalPNG,
  'adaptive-icon.png': minimalPNG,
  'favicon.png': minimalPNG,
  'notification-icon.png': minimalPNG,
  'notification-sound.wav': minimalWAV,
};

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder files
Object.entries(files).forEach(([filename, content]) => {
  const filepath = path.join(assetsDir, filename);
  fs.writeFileSync(filepath, content);
  console.log(`✓ Created ${filename}`);
});

console.log('\n✅ Placeholder assets created successfully!');
console.log('⚠️  Note: Replace these with actual assets before production builds.');








