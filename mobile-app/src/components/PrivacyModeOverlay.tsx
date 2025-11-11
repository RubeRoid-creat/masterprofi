/**
 * Privacy Mode Overlay Component
 * Shows overlay when privacy mode is enabled
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { privacyModeService } from '../services/privacyModeService';

interface PrivacyModeOverlayProps {
  children: React.ReactNode;
}

export const PrivacyModeOverlay: React.FC<PrivacyModeOverlayProps> = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsPrivacyMode(privacyModeService.isPrivacyModeEnabled());

    // Subscribe to changes
    const unsubscribe = privacyModeService.onPrivacyModeChange((enabled) => {
      setIsPrivacyMode(enabled);
    });

    return unsubscribe;
  }, []);

  if (!isPrivacyMode) {
    return <>{children}</>;
  }

  const handleDisable = async () => {
    console.log('Disabling privacy mode...');
    try {
      await privacyModeService.disable();
      console.log('Privacy mode disabled');
    } catch (error) {
      console.error('Error disabling privacy mode:', error);
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.overlay} pointerEvents="auto">
        <Text style={styles.text}>Режим конфиденциальности активен</Text>
        <Text style={styles.subtext}>Конфиденциальные данные скрыты</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleDisable}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Отключить</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content} pointerEvents={isPrivacyMode ? 'none' : 'auto'}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999, // Android
  },
  content: {
    flex: 1,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtext: {
    color: '#999',
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  buttonText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

