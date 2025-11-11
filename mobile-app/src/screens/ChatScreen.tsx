import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { Message, Chat, Attachment, QuickReply, TypingIndicator } from '../types/chat';
import { MessageBubble } from '../components/chat/MessageBubble';
import { MediaAttachment } from '../components/lazy';
import { VoiceRecorder } from '../components/chat/VoiceRecorder';
import { QuickRepliesComponent } from '../components/chat/QuickReplies';
import { TypingIndicator as TypingIndicatorComponent } from '../components/chat/TypingIndicator';
import { useChatStorage } from '../hooks/useChatStorage';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { getFirstChar } from '../utils/stringHelpers';
import { colors, typography, spacing, borderRadius } from '../theme';

interface ChatScreenProps {
  chat: Chat;
  currentUserId: string;
  currentUserName?: string;
  onBack?: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  chat,
  currentUserId,
  currentUserName = 'You',
  onBack,
}) => {
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isOnline, setIsOnline] = useState(chat.isOnline);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    isLoading,
    saveMessage,
    saveMessages,
    updateMessageStatus,
  } = useChatStorage(chat.id);

  const { connected, sendMessage: sendWSMessage, sendTyping, markAsRead } = useChatWebSocket({
    chatId: chat.id,
    userId: currentUserId,
    enabled: true,
    onMessage: (message) => {
      saveMessage(message);
      scrollToBottom();
      // Mark as read if not from current user
      if (message.senderId !== currentUserId) {
        markAsRead([message.id]);
      }
    },
    onTyping: (indicator) => {
      if (indicator.userId !== currentUserId) {
        setTypingUsers((prev) => {
          const existing = prev.find((u) => u.userId === indicator.userId);
          if (indicator.isTyping) {
            if (existing) {
              return prev.map((u) =>
                u.userId === indicator.userId ? indicator : u
              );
            }
            return [...prev, indicator];
          }
          return prev.filter((u) => u.userId !== indicator.userId);
        });

        // Auto-remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter((u) => u.userId !== indicator.userId)
          );
        }, 3000);
      }
    },
    onMessageStatus: (messageId, status) => {
      updateMessageStatus(messageId, status);
    },
    onOnlineStatus: (userId, online) => {
      if (userId === chat.participantId) {
        setIsOnline(online);
      }
    },
  });

  useEffect(() => {
    scrollToBottom();
    // Mark all messages as read when opening chat
    const unreadIds = messages
      .filter((m) => m.senderId !== currentUserId && m.status !== 'read')
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
      unreadIds.forEach((id) => updateMessageStatus(id, 'read'));
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!messageText.trim() && attachments.length === 0) {
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(),
      chatId: chat.id,
      senderId: currentUserId,
      senderName: currentUserName,
      message: messageText.trim(),
      type: attachments.length > 0 ? (attachments[0].type === 'image' ? 'image' : attachments[0].type === 'video' ? 'video' : 'file') : 'text',
      timestamp: new Date().toISOString(),
      status: connected ? 'sending' : 'sent',
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Optimistic update
    saveMessage(newMessage);
    scrollToBottom();

    // Send via WebSocket
    if (connected) {
      sendWSMessage(newMessage);
    }

    // Update status
    setTimeout(() => {
      updateMessageStatus(newMessage.id, 'sent');
      if (connected) {
        setTimeout(() => {
          updateMessageStatus(newMessage.id, 'delivered');
        }, 1000);
      }
    }, 500);

    setMessageText('');
    setAttachments([]);
    setShowQuickReplies(false);
  };

  const handleTyping = (text: string) => {
    setMessageText(text);

    // Send typing indicator
    if (text.length > 0 && connected) {
      sendTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 2000);
    }
  };

  const handleVoiceComplete = (uri: string, duration: number) => {
    const voiceAttachment: Attachment = {
      id: Date.now().toString(),
      type: 'audio',
      uri,
      duration,
      mimeType: 'audio/m4a',
    };

    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(),
      chatId: chat.id,
      senderId: currentUserId,
      senderName: currentUserName,
      message: 'Voice message',
      type: 'audio',
      timestamp: new Date().toISOString(),
      status: connected ? 'sending' : 'sent',
      attachments: [voiceAttachment],
    };

    saveMessage(newMessage);
    scrollToBottom();

    if (connected) {
      sendWSMessage(newMessage);
    }

    setIsRecording(false);
  };

  const handleQuickReply = (reply: QuickReply) => {
    setMessageText(reply.text);
    setShowQuickReplies(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === currentUserId;
    const showAvatar = !isOwn;
    const showTimestamp = true;

    return (
      <MessageBubble
        message={item}
        isOwn={isOwn}
        showAvatar={showAvatar}
        showTimestamp={showTimestamp}
        onPress={() => {}}
        onLongPress={() => {}}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Загрузка сообщений...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            )}
            {chat.participantAvatar ? (
              <Image
                source={{ uri: chat.participantAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {getFirstChar(chat.participantName)}
                </Text>
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.participantName}>
                {chat.participantName}
              </Text>
              <View style={styles.statusRow}>
                {isOnline && (
                  <View style={styles.statusItem}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.statusText}>Онлайн</Text>
                  </View>
                )}
                {!connected && (
                  <Text style={styles.offlineText}>Офлайн</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Пока нет сообщений</Text>
              <Text style={styles.emptySubtext}>
                Начните разговор
              </Text>
            </View>
          }
        />

        {/* Typing Indicator */}
        <TypingIndicatorComponent typingUsers={typingUsers} />

        {/* Quick Replies */}
        {showQuickReplies && messages.length === 0 && (
          <QuickRepliesComponent
            replies={[]}
            onSelect={handleQuickReply}
            visible={true}
          />
        )}

        {/* Voice Recorder */}
        {isRecording && (
          <VoiceRecorder
            onRecordingComplete={handleVoiceComplete}
            onCancel={() => setIsRecording(false)}
          />
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && !isRecording && (
          <MediaAttachment
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              onPress={() => setIsRecording(true)}
              style={styles.inputButton}
            >
              <Text style={styles.inputButtonIcon}>🎤</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // Trigger media picker
                import('expo-image-picker').then((ImagePicker) => {
                  ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.All,
                    allowsEditing: true,
                    quality: 0.8,
                  }).then((result) => {
                    if (!result.canceled && result.assets[0]) {
                      const newAttachment: Attachment = {
                        id: Date.now().toString(),
                        type: result.assets[0].type === 'image' ? 'image' : 'video',
                        uri: result.assets[0].uri,
                        name: result.assets[0].fileName || `file_${Date.now()}`,
                        size: result.assets[0].fileSize,
                        mimeType: result.assets[0].type,
                      };
                      setAttachments([...attachments, newAttachment]);
                    }
                  });
                });
              }}
              style={styles.inputButton}
            >
              <Text style={styles.inputButtonIcon}>📎</Text>
            </TouchableOpacity>

            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Введите сообщение..."
                placeholderTextColor={colors.text.disabled}
                value={messageText}
                onChangeText={handleTyping}
                multiline
                maxLength={1000}
              />
            </View>

            <TouchableOpacity
              onPress={handleSend}
              disabled={!messageText.trim() && attachments.length === 0}
              style={[
                styles.sendButton,
                (messageText.trim() || attachments.length > 0)
                  ? styles.sendButtonActive
                  : styles.sendButtonDisabled,
              ]}
            >
              <Text style={styles.sendButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  header: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  backButtonText: {
    ...typography.heading.h4,
    color: colors.primary[600],
    fontWeight: '600',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.body.medium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  participantName: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success[500],
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.body.xsmall,
    color: colors.text.secondary,
  },
  offlineText: {
    ...typography.body.xsmall,
    color: colors.text.disabled,
  },
  messagesList: {
    paddingVertical: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  emptySubtext: {
    ...typography.body.small,
    color: colors.text.disabled,
    marginTop: spacing.xs,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  inputButton: {
    backgroundColor: colors.gray[100],
    padding: spacing.sm,
    borderRadius: borderRadius.full,
  },
  inputButtonIcon: {
    fontSize: 20,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius['2xl'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  textInput: {
    ...typography.body.medium,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
  },
  sendButtonActive: {
    backgroundColor: colors.primary[600],
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    ...typography.heading.h4,
    color: colors.text.inverse,
    fontWeight: '700',
  },
});

