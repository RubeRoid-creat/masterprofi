# Media Capture Integration

Полная интеграция захвата и управления медиа с поддержкой фото, видео, документов, сжатия и офлайн-загрузки.

## Возможности

✅ **Photo Capture for Appliance Issues**
- Захват фото с камеры
- Выбор из галереи
- Множественный выбор
- Автоматическое сжатие

✅ **Video Recording for Complex Problems**
- Запись видео с камеры
- Выбор видео из галереи
- Ограничение длительности
- Генерация thumbnail

✅ **Document Scanning for Manuals**
- Сканирование документов
- Выбор файлов
- Оптимизация для документов
- Поддержка PDF

✅ **Image Compression and Optimization**
- Автоматическое сжатие
- Оптимизация размера
- Настройка качества
- Создание thumbnails

✅ **Gallery Management**
- Организация медиа по заказам
- Фильтрация по типу
- Поиск медиа
- Статистика использования

✅ **Cloud Storage Upload**
- Автоматическая загрузка
- Отслеживание прогресса
- Retry при ошибках
- Метadata сохранение

✅ **Offline Media Queue**
- Очередь офлайн загрузки
- Автоматическая синхронизация
- Retry механизм
- Статус очереди

## Использование

### Photo Capture

```tsx
import { PhotoCapture } from '../components/media/PhotoCapture';

<PhotoCapture
  orderId="order-123"
  maxPhotos={10}
  compress={true}
  onPhotosChange={(photos) => {
    console.log('Photos updated:', photos);
  }}
/>
```

### Video Capture

```tsx
import { VideoCapture } from '../components/media/VideoCapture';

<VideoCapture
  orderId="order-123"
  maxVideos={3}
  maxDuration={300}
  onVideosChange={(videos) => {
    console.log('Videos updated:', videos);
  }}
/>
```

### Document Scanner

```tsx
import { DocumentScanner } from '../components/media/DocumentScanner';

<DocumentScanner
  orderId="order-123"
  maxDocuments={10}
  onDocumentsChange={(documents) => {
    console.log('Documents updated:', documents);
  }}
/>
```

### Media Gallery

```tsx
import { MediaGallery } from '../components/media/MediaGallery';

<MediaGallery
  orderId="order-123"
  type="photo"
  onMediaSelect={(media) => {
    console.log('Media selected:', media);
  }}
  showUploadStatus={true}
/>
```

### Using Hooks

```tsx
import { useMediaCapture } from '../hooks/useMediaCapture';

const {
  capturePhoto,
  selectPhoto,
  recordVideo,
  scanDocument,
  isCapturing,
  error,
} = useMediaCapture({
  orderId: 'order-123',
  autoUpload: true,
  autoAddToGallery: true,
  onUploadComplete: (mediaId, cloudUrl) => {
    console.log('Upload complete:', mediaId, cloudUrl);
  },
});

// Capture photo
const photo = await capturePhoto({
  compress: true,
  quality: 0.8,
});

// Record video
const video = await recordVideo({
  quality: 'high',
  maxDuration: 300,
});
```

### Gallery Management

```tsx
import { useGallery } from '../hooks/useGallery';

const {
  media,
  isLoading,
  refresh,
  addMedia,
  removeMedia,
  search,
  getByDateRange,
} = useGallery({
  orderId: 'order-123',
  type: 'photo',
  autoLoad: true,
});

// Search media
const results = search('appliance');

// Get by date range
const recent = getByDateRange(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
```

## Services

### MediaCaptureService

```tsx
import { mediaCaptureService } from '../services/mediaCaptureService';

// Capture photo
const photo = await mediaCaptureService.capturePhoto({
  quality: 0.8,
  compress: true,
});

// Record video
const video = await mediaCaptureService.recordVideo({
  quality: 'high',
  maxDuration: 300,
});

// Scan document
const document = await mediaCaptureService.scanDocument({
  quality: 'high',
});
```

### ImageCompressionService

```tsx
import { imageCompressionService } from '../services/imageCompressionService';

// Compress image
const compressed = await imageCompressionService.compressImage(uri, {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
});

// Create thumbnail
const thumbnail = await imageCompressionService.createThumbnail(uri, 200);

// Optimize for web
const optimized = await imageCompressionService.optimizeForWeb(uri);
```

### CloudUploadService

```tsx
import { cloudUploadService } from '../services/cloudUploadService';

// Upload media
const cloudUrl = await cloudUploadService.uploadMedia(mediaItem, {
  orderId: 'order-123',
  onProgress: (progress) => {
    console.log('Upload progress:', progress.progress);
  },
  retryCount: 3,
});
```

### OfflineMediaQueue

```tsx
import { offlineMediaQueue } from '../services/offlineMediaQueue';

// Add to queue
await offlineMediaQueue.addToQueue(mediaItem, 'order-123');

// Get queue
const queue = offlineMediaQueue.getQueue();

// Process queue (automatic when online)
await offlineMediaQueue.processQueue();
```

### GalleryService

```tsx
import { galleryService } from '../services/galleryService';

// Add media
await galleryService.addMedia(mediaItem);

// Get by order
const orderMedia = galleryService.getMediaByOrder('order-123');

// Get by type
const photos = galleryService.getMediaByType('photo');

// Search
const results = galleryService.searchMedia('appliance');
```

## Настройка

### Установка зависимостей

```bash
npm install expo-image-picker expo-document-picker expo-image-manipulator expo-file-system expo-camera
```

### Permissions (app.json)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow access to your photos to attach images to orders.",
          "cameraPermission": "Allow access to camera to capture photos and videos."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow access to camera to capture photos and videos."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Allow access to camera to capture photos and videos.",
        "NSPhotoLibraryUsageDescription": "Allow access to photos to attach images to orders."
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

## Best Practices

1. **Compress Before Upload** - Всегда сжимайте изображения перед загрузкой
2. **Handle Permissions** - Запрашивайте разрешения заранее
3. **Show Progress** - Показывайте прогресс загрузки
4. **Offline Support** - Используйте очередь для офлайн-режима
5. **Error Handling** - Обрабатывайте ошибки загрузки
6. **Cleanup** - Удаляйте неиспользуемые медиа файлы
7. **Thumbnails** - Используйте thumbnails для галереи

## Troubleshooting

### Permission Denied

```tsx
// Request permissions before capturing
const hasPermission = await mediaCaptureService.requestCameraPermissions();
if (!hasPermission) {
  // Show settings button
}
```

### Upload Failed

```tsx
// Check network status
const netInfo = await NetInfo.fetch();
if (!netInfo.isConnected) {
  // Add to offline queue
  await offlineMediaQueue.addToQueue(mediaItem);
}
```

### Compression Not Working

Убедитесь что `expo-image-manipulator` установлен:

```bash
npx expo install expo-image-manipulator
```

### File Too Large

```tsx
// Compress before upload
const compressed = await imageCompressionService.compressImage(uri, {
  quality: 0.7,
  maxWidth: 1920,
  maxHeight: 1080,
});
```








