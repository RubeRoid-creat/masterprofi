import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatusEvent } from '../../types/orderDetails';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface StatusTimelineProps {
  timeline: OrderStatusEvent[];
  currentStatus: string;
}

const STATUS_ICONS: Record<string, string> = {
  new: '🆕',
  assigned: '✅',
  in_progress: '🔧',
  completed: '✓',
  cancelled: '✗',
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  timeline,
  currentStatus,
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>История заказа</Text>
      <View style={styles.timelineContainer}>
        {timeline.map((event, index) => {
          const isLast = index === timeline.length - 1;
          const isCurrent = event.status === currentStatus;
          
          return (
            <View key={index} style={styles.timelineItem}>
              {/* Timeline Line */}
              <View style={styles.timelineIconContainer}>
                <View
                  style={[
                    styles.timelineIcon,
                    isCurrent ? styles.timelineIconActive : styles.timelineIconInactive,
                  ]}
                >
                  <Text style={styles.timelineIconText}>
                    {STATUS_ICONS[event.status] || '•'}
                  </Text>
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.timelineLine,
                      isCurrent ? styles.timelineLineActive : styles.timelineLineInactive,
                    ]}
                  />
                )}
              </View>

              {/* Event Content */}
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text
                    style={[
                      styles.eventStatus,
                      isCurrent && styles.eventStatusActive,
                    ]}
                  >
                    {event.status.replace('_', ' ')}
                  </Text>
                  <Text style={styles.eventTime}>
                    {formatTime(event.timestamp)}
                  </Text>
                </View>
                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconActive: {
    backgroundColor: colors.primary[600],
  },
  timelineIconInactive: {
    backgroundColor: colors.gray[300],
  },
  timelineIconText: {
    ...typography.body.medium,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
  },
  timelineLineActive: {
    backgroundColor: colors.primary[600],
  },
  timelineLineInactive: {
    backgroundColor: colors.gray[300],
  },
  eventContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  eventStatus: {
    ...typography.body.medium,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: colors.text.secondary,
  },
  eventStatusActive: {
    color: colors.primary[600],
  },
  eventTime: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
  },
  eventDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
});
