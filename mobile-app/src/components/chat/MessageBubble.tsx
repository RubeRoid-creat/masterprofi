import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Message, MessageStatus } from '../../types/chat';
import { getFirstChar } from '../../utils/stringHelpers';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onPress?: (message: Message) => void;
  onLongPress?: (message: Message) => void;
  onReply?: (message: Message) => void;
}

const STATUS_ICONS: Record<MessageStatus, string> = {
  sending: '⏳',
  sent: '✓',
  delivered: '✓✓',
  read: '✓✓✓',
  failed: '✗',
};

const STATUS_COLORS: Record<MessageStatus, string> = {
  sending: colors.text.disabled,
  sent: colors.text.disabled,
  delivered: colors.primary[600],
  read: colors.primary[600],
  failed: colors.error[600],
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  onPress,
  onLongPress,
  onReply,
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return `Вчера ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <View>
            {message.attachments?.map((attachment) => (
              <Image
                key={attachment.id}
                source={{ uri: attachment.uri }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            ))}
            {message.message && (
              <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
                {message.message}
              </Text>
            )}
          </View>
        );
      case 'video':
        return (
          <View>
            {message.attachments?.map((attachment) => (
              <View key={attachment.id} style={styles.videoContainer}>
                {attachment.thumbnail && (
                  <Image
                    source={{ uri: attachment.thumbnail }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.videoPlayButton}>
                  <Text style={styles.videoPlayIcon}>▶</Text>
                </View>
              </View>
            ))}
            {message.message && (
              <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
                {message.message}
              </Text>
            )}
          </View>
        );
      case 'audio':
        return (
          <View style={styles.audioContainer}>
            <View style={[styles.audioIconContainer, isOwn && styles.audioIconContainerOwn]}>
              <Text style={styles.audioIcon}>🎵</Text>
            </View>
            <View style={styles.audioInfo}>
              <Text style={[styles.audioTitle, isOwn && styles.audioTitleOwn]}>
                Голосовое сообщение
              </Text>
              {message.attachments?.[0]?.duration && (
                <Text style={[styles.audioDuration, isOwn && styles.audioDurationOwn]}>
                  {Math.floor(message.attachments[0].duration)}с
                </Text>
              )}
            </View>
          </View>
        );
      case 'file':
        return (
          <View style={styles.fileContainer}>
            <View style={[styles.fileIconContainer, isOwn && styles.fileIconContainerOwn]}>
              <Text style={styles.fileIcon}>📄</Text>
            </View>
            <View style={styles.fileInfo}>
              <Text style={[styles.fileName, isOwn && styles.fileNameOwn]}>
                {message.attachments?.[0]?.name || 'Файл'}
              </Text>
              {message.attachments?.[0]?.size && (
                <Text style={[styles.fileSize, isOwn && styles.fileSizeOwn]}>
                  {(message.attachments[0].size / 1024).toFixed(1)} KB
                </Text>
              )}
            </View>
          </View>
        );
      default:
        return (
          <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
            {message.message}
          </Text>
        );
    }
  };

  return (
    <View style={[styles.container, isOwn ? styles.containerOwn : styles.containerOther]}>
      {!isOwn && showAvatar && (
        <View style={styles.avatarContainer}>
          {message.senderAvatar ? (
            <Image
              source={{ uri: message.senderAvatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {getFirstChar(message.senderName)}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={[styles.messageContainer, isOwn ? styles.messageContainerOwn : styles.messageContainerOther]}>
        {!isOwn && showAvatar && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        <TouchableOpacity
          onPress={() => onPress?.(message)}
          onLongPress={() => onLongPress?.(message)}
          activeOpacity={0.8}
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : styles.bubbleOther,
          ]}
        >
          {message.replyTo && (
            <View style={styles.replyContainer}>
              <Text style={styles.replyText}>Ответ на сообщение</Text>
            </View>
          )}

          {renderContent()}

          <View style={styles.footer}>
            {message.isEdited && (
              <Text style={[styles.footerText, isOwn && styles.footerTextOwn]}>
                (изменено)
              </Text>
            )}
            {showTimestamp && (
              <Text style={[styles.footerText, isOwn && styles.footerTextOwn]}>
                {formatTime(message.timestamp)}
              </Text>
            )}
            {isOwn && (
              <Text style={[styles.statusText, { color: STATUS_COLORS[message.status] }]}>
                {STATUS_ICONS[message.status]}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: spacing.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.body.xsmall,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  messageContainer: {
    maxWidth: '75%',
  },
  messageContainerOwn: {
    alignItems: 'flex-end',
  },
  messageContainerOther: {
    alignItems: 'flex-start',
  },
  senderName: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  bubble: {
    borderRadius: borderRadius['2xl'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  bubbleOwn: {
    backgroundColor: colors.primary[600],
    borderTopRightRadius: borderRadius.sm,
  },
  bubbleOther: {
    backgroundColor: colors.gray[200],
    borderTopLeftRadius: borderRadius.sm,
  },
  replyContainer: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary[400],
    paddingLeft: spacing.xs,
    marginBottom: spacing.xs,
    opacity: 0.8,
  },
  replyText: {
    ...typography.body.xsmall,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  messageText: {
    ...typography.body.small,
    color: colors.text.primary,
  },
  messageTextOwn: {
    color: colors.text.inverse,
  },
  messageImage: {
    width: 250,
    height: 200,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  videoContainer: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  videoPlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayIcon: {
    ...typography.heading.h3,
    color: colors.text.inverse,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.full,
    padding: spacing.sm,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  audioIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.full,
    padding: spacing.md,
  },
  audioIconContainerOwn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  audioIcon: {
    fontSize: 24,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    ...typography.body.small,
    fontWeight: '600',
    color: colors.text.primary,
  },
  audioTitleOwn: {
    color: colors.text.inverse,
  },
  audioDuration: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  audioDurationOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fileIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  fileIconContainerOwn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  fileIcon: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    ...typography.body.small,
    fontWeight: '600',
    color: colors.text.primary,
  },
  fileNameOwn: {
    color: colors.text.inverse,
  },
  fileSize: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  fileSizeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  footerText: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
  },
  footerTextOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusText: {
    ...typography.body.xsmall,
  },
});
