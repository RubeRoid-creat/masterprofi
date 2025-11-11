# Beta Testing Setup Guide

## TestFlight (iOS)

### Setup Steps

1. **App Store Connect Configuration**
   ```bash
   # Upload build via EAS
   eas build --platform ios --profile preview
   
   # Or manually via Xcode:
   # Archive -> Distribute App -> App Store Connect
   ```

2. **Create Beta Testing Group**
   - Go to App Store Connect
   - Navigate to TestFlight
   - Create testing group (e.g., "Internal Testers", "Beta Testers")

3. **Add Testers**
   - Internal Testers: Up to 100 (no review required)
   - External Testers: Unlimited (requires App Store review)

4. **Configure Test Information**
   - Add "What to Test" notes
   - Set expiration date (90 days max)
   - Configure feedback collection

### TestFlight Commands

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

## Google Play Internal Testing (Android)

### Setup Steps

1. **Create Internal Testing Track**
   ```bash
   # Build APK/AAB
   eas build --platform android --profile production
   
   # Submit to internal track
   eas submit --platform android --track internal
   ```

2. **Configure Testing Track**
   - Go to Google Play Console
   - Navigate to Testing -> Internal testing
   - Create release
   - Add testers via email list

3. **Testing Options**
   - **Internal Testing**: Up to 100 testers (instant)
   - **Closed Testing**: Up to 75,000 testers (24-48h review)
   - **Open Testing**: Unlimited (full review process)

### Testing Track Hierarchy

1. Internal testing (fastest)
2. Closed testing
3. Open testing
4. Production

## Firebase App Distribution (Both Platforms)

### Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init appdistribution

# Build and distribute
eas build --platform ios --profile preview
firebase appdistribution:distribute build.ipa --app APP_ID --groups "beta-testers"
```

## Beta Testing Checklist

### Pre-Beta

- [ ] Build passes all unit tests
- [ ] Build passes all E2E tests
- [ ] Code review completed
- [ ] Privacy policy updated
- [ ] Release notes prepared
- [ ] Known issues documented

### Beta Release

- [ ] Upload build to TestFlight/Play Console
- [ ] Configure testing groups
- [ ] Send invitation emails
- [ ] Provide testing instructions
- [ ] Set up feedback collection

### During Beta

- [ ] Monitor crash reports
- [ ] Collect user feedback
- [ ] Track analytics
- [ ] Fix critical bugs
- [ ] Document issues

### Post-Beta

- [ ] Review feedback
- [ ] Fix identified issues
- [ ] Update release notes
- [ ] Prepare production release
- [ ] Thank beta testers

## Feedback Collection

### Options

1. **In-App Feedback**
   - Implement feedback button
   - Screenshot capture
   - Auto-attach logs

2. **TestFlight Feedback**
   - Built-in feedback system
   - Automatic crash reports

3. **External Tools**
   - Firebase Crashlytics
   - Sentry
   - Bugsnag

## Beta Testing Communication Template

```markdown
# Beta Testing Invitation

Hi [Tester Name],

You've been invited to test MasterProfi Mobile Beta!

**What's New:**
- [Feature 1]
- [Feature 2]

**How to Install:**
- iOS: [TestFlight Link]
- Android: [Play Store Link]

**What to Test:**
- [Testing focus area 1]
- [Testing focus area 2]

**Known Issues:**
- [Issue 1]
- [Issue 2]

**Feedback:**
Please report issues to: beta@masterprofi.com

Thank you for helping us improve!
```

## Beta Testing Analytics

Track these metrics:
- Installation rate
- Crash-free rate
- Feature usage
- User feedback volume
- Bug reports count








