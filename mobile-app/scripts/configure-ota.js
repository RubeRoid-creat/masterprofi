/**
 * OTA Updates Configuration Script
 * Sets up Over-The-Air updates via Expo Updates
 */

const fs = require('fs');
const path = require('path');

const otaConfig = {
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
    requestHeaders: {
      'expo-channel-name': 'production',
    },
  },
  channels: {
    production: {
      runtimeVersion: {
        policy: 'appVersion',
      },
    },
    preview: {
      runtimeVersion: {
        policy: 'appVersion',
      },
    },
    development: {
      runtimeVersion: {
        policy: 'appVersion',
      },
    },
  },
};

/**
 * Generate OTA configuration
 */
function generateOTAConfig() {
  const config = {
    ...otaConfig,
    instructions: `
OTA Updates Configuration
=========================

1. Expo Updates Setup:
   - Install: npm install expo-updates
   - Configure in app.json/app.config.js
   - Set runtimeVersion policy

2. Publishing Updates:
   # Development
   eas update --branch development --message "Update message"
   
   # Preview
   eas update --branch preview --message "Update message"
   
   # Production
   eas update --branch production --message "Update message"

3. Update Channels:
   - production: Live updates for production app
   - preview: Beta testing updates
   - development: Development builds

4. Runtime Version Strategy:
   - appVersion: Uses app.json version (recommended)
   - nativeVersion: Uses native version code
   - sdkVersion: Uses Expo SDK version

5. Update Policies:
   - ON_LOAD: Check on app start
   - ON_ERROR: Check only on errors
   - NEVER: Disable automatic checks

6. Best Practices:
   - Test updates in preview channel first
   - Use rollback if issues detected
   - Monitor update success rate
   - Keep updates small (<50MB)
   - No native changes in OTA updates
    `,
  };

  fs.writeFileSync(
    path.join(__dirname, '../ota-config.json'),
    JSON.stringify(config, null, 2)
  );

  console.log('OTA configuration generated');
  console.log('See ota-config.json for details');
}

/**
 * Generate update publishing script
 */
function generateUpdateScript() {
  const script = `#!/bin/bash
# OTA Update Publishing Script

BRANCH=\${1:-production}
MESSAGE=\${2:-"Update"}

echo "Publishing OTA update to \${BRANCH} channel..."

eas update --branch \${BRANCH} --message "\${MESSAGE}"

echo "Update published successfully!"
`;

  fs.writeFileSync(
    path.join(__dirname, '../scripts/publish-update.sh'),
    script
  );
  fs.chmodSync(path.join(__dirname, '../scripts/publish-update.sh'), '755');

  console.log('Update script generated: scripts/publish-update.sh');
}

generateOTAConfig();
generateUpdateScript();








