/**
 * Environment Indicator Component
 * Shows current environment in development/staging builds
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { config, isDevelopment, isStaging } from '../config/environments';

export const EnvironmentIndicator: React.FC = () => {
  // Only show in development or staging
  if (!isDevelopment && !isStaging) {
    return null;
  }

  const getEnvironmentColor = () => {
    if (isDevelopment) return '#EF4444'; // Red
    if (isStaging) return '#F59E0B'; // Orange
    return '#10B981'; // Green
  };

  return (
    <View style={[styles.container, { backgroundColor: getEnvironmentColor() }]}>
      <Text style={styles.text}>{config.environment.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});








