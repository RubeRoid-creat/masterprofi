/**
 * Privacy Policy Component
 * Displays privacy policy and terms of service
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme';

interface PrivacyPolicyProps {
  onAccept?: () => void;
  onDecline?: () => void;
  showAcceptButtons?: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  onAccept,
  onDecline,
  showAcceptButtons = false,
}) => {

  const privacyPolicyUrl = 'https://masterprofi.com/privacy-policy';
  const termsOfServiceUrl = 'https://masterprofi.com/terms-of-service';

  const handleOpenPrivacy = async () => {
    const url = await Linking.canOpenURL(privacyPolicyUrl);
    if (url) {
      await Linking.openURL(privacyPolicyUrl);
    }
  };

  const handleOpenTerms = async () => {
    const url = await Linking.canOpenURL(termsOfServiceUrl);
    if (url) {
      await Linking.openURL(termsOfServiceUrl);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We collect information you provide directly to us, such as when you create an account,
          make a request, or contact us for support.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use the information we collect to provide, maintain, and improve our services,
          process transactions, and communicate with you.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
        <Text style={styles.text}>
          We implement appropriate security measures to protect your personal information.
          Data is encrypted and stored securely.
        </Text>

        <Text style={styles.sectionTitle}>4. Your Rights</Text>
        <Text style={styles.text}>
          You have the right to access, update, or delete your personal information at any time.
          Contact us at privacy@masterprofi.com
        </Text>

        <Text style={styles.sectionTitle}>5. Contact Us</Text>
        <Text style={styles.text}>
          If you have questions about this Privacy Policy, please contact us at:
          {'\n'}Email: privacy@masterprofi.com
          {'\n'}Address: [Your Company Address]
        </Text>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={handleOpenPrivacy} style={styles.linkButton}>
            <Text style={styles.linkText}>View Full Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleOpenTerms} style={styles.linkButton}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {showAcceptButtons && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={onDecline}
              style={[styles.button, styles.declineButton]}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onAccept}
              style={[styles.button, styles.acceptButton]}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#374151',
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    marginBottom: 15,
  },
  linksContainer: {
    marginTop: 30,
    gap: 15,
  },
  linkButton: {
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  linkText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#3B82F6',
  },
  declineButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

