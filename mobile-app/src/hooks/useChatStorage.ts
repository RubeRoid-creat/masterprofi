import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Chat } from '../types/chat';

const MESSAGES_KEY = '@chat_messages';
const CHATS_KEY = '@chat_list';

export const useChatStorage = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const data = await AsyncStorage.getItem(`${MESSAGES_KEY}_${chatId}`);
      if (data) {
        const parsedMessages: Message[] = JSON.parse(data);
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessage = async (message: Message) => {
    try {
      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);
      await AsyncStorage.setItem(
        `${MESSAGES_KEY}_${chatId}`,
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const saveMessages = async (newMessages: Message[]) => {
    try {
      setMessages(newMessages);
      await AsyncStorage.setItem(
        `${MESSAGES_KEY}_${chatId}`,
        JSON.stringify(newMessages)
      );
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const updateMessageStatus = async (messageId: string, status: Message['status']) => {
    try {
      const updatedMessages = messages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      );
      setMessages(updatedMessages);
      await AsyncStorage.setItem(
        `${MESSAGES_KEY}_${chatId}`,
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const clearMessages = async () => {
    try {
      setMessages([]);
      await AsyncStorage.removeItem(`${MESSAGES_KEY}_${chatId}`);
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  };

  return {
    messages,
    isLoading,
    saveMessage,
    saveMessages,
    updateMessageStatus,
    clearMessages,
    loadMessages,
  };
};

export const useChatListStorage = () => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data = await AsyncStorage.getItem(CHATS_KEY);
      if (data) {
        const parsedChats: Chat[] = JSON.parse(data);
        setChats(parsedChats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const saveChat = async (chat: Chat) => {
    try {
      const updatedChats = [...chats.filter((c) => c.id !== chat.id), chat];
      setChats(updatedChats);
      await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(updatedChats));
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  return {
    chats,
    loadChats,
    saveChat,
  };
};









