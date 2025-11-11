/**
 * Sensitive Data Component
 * Automatically masks data when privacy mode is enabled
 */

import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { privacyModeService } from '../services/privacyModeService';

interface SensitiveDataProps {
  value: string;
  visibleChars?: number;
  allowToggle?: boolean;
  style?: any;
}

export const SensitiveData: React.FC<SensitiveDataProps> = ({
  value,
  visibleChars = 4,
  allowToggle = false,
  style,
}) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(
    privacyModeService.isPrivacyModeEnabled()
  );
  const [isTemporarilyVisible, setIsTemporarilyVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = privacyModeService.onPrivacyModeChange((enabled) => {
      setIsPrivacyMode(enabled);
    });

    return unsubscribe;
  }, []);

  const displayValue = (() => {
    if (isTemporarilyVisible) {
      return value;
    }
    if (isPrivacyMode) {
      return privacyModeService.maskSensitiveData(value, visibleChars);
    }
    return value;
  })();

  const handleToggle = () => {
    if (allowToggle) {
      setIsTemporarilyVisible(!isTemporarilyVisible);
    }
  };

  if (allowToggle) {
    return (
      <TouchableOpacity onPress={handleToggle}>
        <Text style={[styles.text, style]}>{displayValue}</Text>
      </TouchableOpacity>
    );
  }

  return <Text style={[styles.text, style]}>{displayValue}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'monospace',
  },
});








