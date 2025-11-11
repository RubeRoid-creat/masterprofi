/**
 * Privacy Policy Screen
 * Full-screen privacy policy viewer
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PrivacyPolicy } from '../components/PrivacyPolicy';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <PrivacyPolicy
        showAcceptButtons={false}
        onAccept={() => navigation.goBack()}
        onDecline={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
});

