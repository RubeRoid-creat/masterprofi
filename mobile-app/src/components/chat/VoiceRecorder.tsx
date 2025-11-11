import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onCancel?: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Доступ запрещен', 'Требуется разрешение на микрофон');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Ошибка', 'Не удалось начать запись');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        onRecordingComplete(uri, recordingTime);
      }

      setRecording(null);
      setRecordingTime(0);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Ошибка', 'Не удалось остановить запись');
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      } catch (error) {
        console.error('Error canceling recording:', error);
      }
    }
    setIsRecording(false);
    setRecordingTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onCancel?.();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <TouchableOpacity
        onPress={startRecording}
        style={styles.startButton}
      >
        <Text style={styles.startButtonText}>🎤 Начать запись</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.recordingText}>Запись...</Text>
          <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
        </View>
        <TouchableOpacity
          onPress={cancelRecording}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={stopRecording}
          style={styles.stopButton}
        >
          <Text style={styles.stopButtonIcon}>⏹</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.error[50],
    borderWidth: 2,
    borderColor: colors.error[200],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordingDot: {
    width: 12,
    height: 12,
    backgroundColor: colors.error[500],
    borderRadius: 6,
  },
  recordingText: {
    ...typography.body.small,
    color: colors.error[600],
    fontWeight: '600',
  },
  recordingTime: {
    ...typography.body.medium,
    color: colors.error[500],
    fontFamily: 'monospace',
  },
  cancelButton: {
    backgroundColor: colors.error[600],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  cancelButtonText: {
    ...typography.body.xsmall,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: colors.error[600],
    borderRadius: borderRadius.full,
    padding: spacing.md,
  },
  stopButtonIcon: {
    ...typography.heading.h3,
    color: colors.text.inverse,
  },
  startButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  startButtonText: {
    ...typography.body.medium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});
