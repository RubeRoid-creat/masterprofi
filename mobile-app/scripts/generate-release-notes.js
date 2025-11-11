/**
 * Release Notes Generator
 * Generates release notes from template based on version
 */

const fs = require('fs');
const path = require('path');

const version = process.argv[2] || '1.0.0';
const type = process.argv[3] || 'release'; // release, hotfix, beta, security

const templates = {
  release: `
## Version ${version} - Feature Update

### What's New
- [New feature 1]
- [New feature 2]
- [New feature 3]

### Improvements
- [Improvement 1]
- [Improvement 2]

### Bug Fixes
- [Bug fix 1]
- [Bug fix 2]
`,

  hotfix: `
## Version ${version} - Hotfix

### Bug Fixes
- Fixed critical issue with [specific feature]
- Resolved [specific bug description]
- Improved stability and performance
`,

  beta: `
## Beta Version ${version}

### New Features
- [Feature 1] - [Description]
- [Feature 2] - [Description]

### Known Issues
- [Issue 1] - [Workaround if available]
- [Issue 2] - [Status]

### Feedback
Please report any issues or suggestions to support@masterprofi.com
`,

  security: `
## Version ${version} - Security Update

### Security Changes
- Updated security protocols
- Enhanced data encryption
- Improved authentication system

### Recommendations
- Update to the latest version immediately
- Change your password if you haven't recently
`,
};

function generateReleaseNotes() {
  const template = templates[type] || templates.release;
  const timestamp = new Date().toISOString().split('T')[0];

  const releaseNotes = {
    version,
    type,
    date: timestamp,
    notes: template.trim(),
    platforms: {
      ios: {
        version: version,
        buildNumber: '1',
        notes: template.trim(),
      },
      android: {
        versionCode: 1,
        versionName: version,
        notes: template.trim(),
      },
    },
  };

  const outputDir = path.join(__dirname, '../release-notes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, `release-notes-${version}.json`),
    JSON.stringify(releaseNotes, null, 2)
  );

  fs.writeFileSync(
    path.join(outputDir, `release-notes-${version}.md`),
    releaseNotes.notes
  );

  console.log(`Release notes generated for version ${version} (${type})`);
  console.log(`Files created:`);
  console.log(`- release-notes/release-notes-${version}.json`);
  console.log(`- release-notes/release-notes-${version}.md`);
}

generateReleaseNotes();








