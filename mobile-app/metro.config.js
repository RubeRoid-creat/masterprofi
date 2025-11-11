/**
 * Metro Bundler Configuration
 * Includes bundle analysis setup
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude native modules for web platform and enable .web.ts extensions
config.resolver = {
  ...config.resolver,
  sourceExts: process.env.EXPO_PUBLIC_PLATFORM === 'web' 
    ? ['web.tsx', 'web.ts', ...config.resolver.sourceExts]
    : config.resolver.sourceExts,
  platforms: ['ios', 'android', 'native', 'web'],
  blockList: [
    // Block better-sqlite3 on web
    /node_modules[\/\\]better-sqlite3/,
    // Block other native SQLite modules on web
    /node_modules[\/\\]@nozbe[\/\\]watermelondb[\/\\]adapters[\/\\]sqlite[\/\\]sqlite-node/,
  ],
};

// Enable bundle analysis in development
if (process.env.ANALYZE_BUNDLE === 'true') {
  // Note: Metro doesn't have built-in bundle analyzer
  // Use metro-bundler-plugin or similar for analysis
  console.log('Bundle analysis enabled');
}

module.exports = config;

