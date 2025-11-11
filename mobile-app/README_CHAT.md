# Real-Time Chat Screen

Полнофункциональный экран чата в реальном времени со всеми современными функциями мессенджеров.

## Особенности

✅ **Message Bubbles** - Пузырьки сообщений с временными метками  
✅ **Media Attachments** - Прикрепление изображений, видео и файлов  
✅ **Voice Messages** - Запись и отправка голосовых сообщений  
✅ **Quick Replies** - Шаблоны быстрых ответов  
✅ **Typing Indicators** - Индикаторы печатания в реальном времени  
✅ **Message Status** - Статусы сообщений (отправлено, доставлено, прочитано)  
✅ **File Sharing** - Обмен файлами любого типа  
✅ **Chat History** - Сохранение истории в AsyncStorage  
✅ **Real-time Updates** - Обновления через WebSocket  
✅ **Online Status** - Индикатор онлайн/офлайн статуса  

## Компоненты

### ChatScreen
Главный компонент экрана чата, объединяющий все функциональные блоки.

### MessageBubble
Компонент сообщения:
- Разные стили для своих/чужих сообщений
- Временные метки
- Статусы доставки
- Поддержка медиа контента
- Аватары пользователей

### MediaAttachment
Управление медиа вложениями:
- Изображения
- Видео
- Файлы
- Предпросмотр и удаление

### VoiceRecorder
Запись голосовых сообщений:
- Запись с таймером
- Сохранение длительности
- Отмена записи

### QuickReplies
Шаблоны быстрых ответов:
- Настраиваемые шаблоны
- Горизонтальный скролл
- Быстрая отправка

### TypingIndicator
Индикатор печатания:
- Анимация точек
- Имена печатающих пользователей
- Автоматическое скрытие

### MessageStatus
Отображение статуса сообщения:
- Sending (⏳)
- Sent (✓)
- Delivered (✓✓)
- Read (✓✓✓)
- Failed (✗)

## Использование

```tsx
import { ChatScreen } from './src/screens/ChatScreen';
import { Chat } from './src/types/chat';

function App() {
  const chat: Chat = {
    id: '1',
    participantId: 'user-2',
    participantName: 'John Doe',
    participantAvatar: 'https://example.com/avatar.jpg',
    unreadCount: 0,
    isOnline: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <ChatScreen
      chat={chat}
      currentUserId="user-1"
      currentUserName="You"
      onBack={() => navigation.goBack()}
    />
  );
}
```

## WebSocket Integration

### Подключение
```typescript
const { connected, sendMessage, sendTyping, markAsRead } = useChatWebSocket({
  chatId: 'chat-123',
  userId: 'user-1',
  onMessage: (message) => {
    // Handle new message
  },
  onTyping: (indicator) => {
    // Handle typing indicator
  },
});
```

### События WebSocket
- `join` - Присоединение к чату
- `message` - Новое сообщение
- `typing` - Индикатор печатания
- `message_status` - Обновление статуса сообщения
- `read` - Сообщение прочитано
- `online_status` - Изменение онлайн статуса

## Хранение данных

### AsyncStorage
Все сообщения автоматически сохраняются в AsyncStorage:
- `@chat_messages_{chatId}` - Сообщения чата
- `@chat_list` - Список чатов

### Персистентность
- Автоматическое сохранение при отправке
- Загрузка истории при открытии чата
- Обновление статусов сообщений

## Функции

### Отправка сообщений
- Текстовые сообщения
- Медиа вложения (изображения, видео)
- Голосовые сообщения
- Файлы

### Статусы сообщений
1. **Sending** - Отправляется
2. **Sent** - Отправлено
3. **Delivered** - Доставлено
4. **Read** - Прочитано
5. **Failed** - Ошибка отправки

### Индикаторы
- **Online Status** - Зеленый индикатор при онлайн статусе
- **Typing Indicator** - Анимация при печатании
- **Connection Status** - Статус подключения WebSocket

### Быстрые ответы
Предустановленные шаблоны:
- "On my way!"
- "I'll be there in 10 minutes"
- "Thanks!"
- "Got it"
- И другие настраиваемые шаблоны

## Зависимости

```bash
npm install expo-av @react-native-async-storage/async-storage
```

## Настройка WebSocket

Обновите URL в `src/hooks/useChatWebSocket.ts`:
```typescript
const wsUrl = `wss://your-api.com/api/chat/${chatId}/ws?userId=${userId}`;
```

## Типы данных

```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  message: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Attachment[];
}

interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  isOnline: boolean;
  unreadCount: number;
}
```

## Производительность

- Оптимистичные обновления UI
- Виртуализация списка сообщений через FlatList
- Ленивая загрузка медиа
- Кэширование изображений
- Автоматическая очистка таймеров

## Безопасность

- Валидация входящих сообщений
- Защита от XSS в текстовых сообщениях
- Ограничение размера файлов
- Шифрование чувствительных данных (рекомендуется)









