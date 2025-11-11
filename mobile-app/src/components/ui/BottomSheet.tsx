/**
 * Bottom Sheet Component
 * Similar to Yandex Go style bottom sheet
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  children: React.ReactNode;
  visible: boolean;
  onClose?: () => void;
  snapPoints?: number[]; // Heights in pixels (e.g., [200, 400, SCREEN_HEIGHT * 0.9])
  initialSnapPoint?: number; // Index of initial snap point
  enablePanDownToClose?: boolean;
  backdropOpacity?: number;
  showHandle?: boolean;
  title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  visible,
  onClose,
  snapPoints = [200, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.9],
  initialSnapPoint = 0,
  enablePanDownToClose = true,
  backdropOpacity = 0.5,
  showHandle = true,
  title,
}) => {
  const translateY = useRef(new Animated.Value(snapPoints[initialSnapPoint] || snapPoints[0])).current;
  const currentSnapIndex = useRef(initialSnapPoint);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(translateY._value);
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.max(0, translateY._value + gestureState.dy);
        translateY.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        const currentValue = translateY._value;
        const velocity = gestureState.vy;

        // Find nearest snap point
        let targetIndex = currentSnapIndex.current;
        let minDistance = Math.abs(currentValue - snapPoints[targetIndex]);

        snapPoints.forEach((point, index) => {
          const distance = Math.abs(currentValue - point);
          if (distance < minDistance) {
            minDistance = distance;
            targetIndex = index;
          }
        });

        // Consider velocity
        if (Math.abs(velocity) > 0.5) {
          if (velocity > 0) {
            // Swiping down
            targetIndex = Math.min(targetIndex + 1, snapPoints.length - 1);
          } else {
            // Swiping up
            targetIndex = Math.max(targetIndex - 1, 0);
          }
        }

        // Close if swiped down enough and enablePanDownToClose
        if (enablePanDownToClose && gestureState.dy > 100 && currentSnapIndex.current === 0) {
          if (onClose) {
            onClose();
          }
          return;
        }

        currentSnapIndex.current = targetIndex;
        const targetValue = snapPoints[targetIndex];

        Animated.spring(translateY, {
          toValue: targetValue,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      const targetValue = snapPoints[initialSnapPoint] || snapPoints[0];
      currentSnapIndex.current = initialSnapPoint;
      translateY.setValue(targetValue);
      Animated.spring(translateY, {
        toValue: targetValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: snapPoints[snapPoints.length - 1],
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialSnapPoint]);

  const backdropOpacityAnimated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(backdropOpacityAnimated, {
      toValue: visible ? backdropOpacity : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, backdropOpacity]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacityAnimated,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={enablePanDownToClose ? onClose : undefined}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          )}

          {title && (
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}

          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.gray[900],
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: SCREEN_HEIGHT * 0.95,
    ...Platform.select({
      ios: {
        shadowColor: colors.gray[900],
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: 2,
  },
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.heading.h3,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});

