import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChatMessage } from '../../types/orderDetails';
import * as ImagePicker from 'expo-image-picker';

interface ChatComponentProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string, attachments?: string[]) => void;
  onAddPhoto?: () => void;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  onAddPhoto,
}) => {
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new message arrives
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleAddPhoto = async () => {
    if (onAddPhoto) {
      onAddPhoto();
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onSendMessage('', [result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.senderId === currentUserId;

    return (
      <View
        className={`mb-3 ${isOwn ? 'items-end' : 'items-start'}`}
        key={item.id}
      >
        <View className={`max-w-[80%] ${isOwn ? 'bg-blue-600' : 'bg-gray-200'} rounded-lg p-3`}>
          {!isOwn && (
            <Text className="text-xs font-medium text-gray-600 mb-1">
              {item.senderName}
            </Text>
          )}
          
          {item.message && (
            <Text className={`text-sm ${isOwn ? 'text-white' : 'text-gray-900'}`}>
              {item.message}
            </Text>
          )}

          {item.attachments && item.attachments.length > 0 && (
            <View className="mt-2 gap-2">
              {item.attachments.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  className="rounded-lg"
                  style={{ width: 200, height: 200 }}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          <Text
            className={`text-xs mt-1 ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-1 bg-white rounded-lg mb-4">
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500">No messages yet</Text>
              <Text className="text-sm text-gray-400 mt-1">
                Start a conversation with the client
              </Text>
            </View>
          }
        />

        {/* Input Area */}
        <View className="border-t border-gray-200 p-3 bg-white">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleAddPhoto}
              className="bg-gray-100 p-3 rounded-lg"
            >
              <Text className="text-xl">📷</Text>
            </TouchableOpacity>
            <TextInput
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!messageText.trim()}
              className={`px-6 py-3 rounded-lg ${
                messageText.trim() ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <Text className="text-white font-semibold">Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};









