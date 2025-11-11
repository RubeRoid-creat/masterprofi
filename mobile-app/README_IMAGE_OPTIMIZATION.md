# Image Optimization

Комплексная система оптимизации изображений с поддержкой прогрессивной загрузки, кэширования, WebP, lazy loading и управления памятью.

## Реализованные функции

✅ **Progressive Image Loading** - Прогрессивная загрузка изображений
✅ **Caching Strategy** - Многоуровневое кэширование (memory + disk)
✅ **Format Selection** - Поддержка WebP, JPEG, PNG с авто-выбором
✅ **Lazy Loading in Lists** - Lazy loading в списках с preloading
✅ **Memory Management** - Управление памятью с LRU eviction
✅ **Preloading Critical Images** - Предзагрузка критических изображений

## Использование

### OptimizedImage Component

Базовый компонент для оптимизированных изображений:

```tsx
import { OptimizedImage } from '../components/images';

<OptimizedImage
  source="https://example.com/image.jpg"
  width={300}
  height={200}
  progressive
  format="webp"
  quality={80}
  priority="high"
  cachePolicy="memory-disk"
/>
```

### Lazy Loading в списках

```tsx
import { LazyImageList } from '../components/images';

const data = [
  { id: '1', imageUri: 'https://...', width: 300, height: 200 },
  { id: '2', imageUri: 'https://...', width: 300, height: 200 },
];

<LazyImageList
  data={data}
  imageKey="imageUri"
  preloadCount={5}
  imageProps={{
    progressive: true,
    format: 'webp',
  }}
/>
```

### Image Gallery

```tsx
import { ImageGallery } from '../components/images';

<ImageGallery
  images={[
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ]}
  showThumbnails
  thumbnailSize={80}
  onImagePress={(index, uri) => console.log(index, uri)}
/>
```

### Preloading Images

```tsx
import { useImagePreload, useCriticalImagePreload } from '../hooks/useImagePreload';

// Preload on mount
const { preload, isLoading } = useImagePreload(
  ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  { priority: 'high', format: 'webp' }
);

// Preload critical images
useCriticalImagePreload([
  'https://example.com/critical-image.jpg',
]);
```

## Image Service API

### Load Image

```tsx
import { imageService } from '../services/imageService';

const cachedUri = await imageService.loadImage('https://example.com/image.jpg', {
  width: 300,
  height: 200,
  quality: 80,
  format: 'webp',
  progressive: true,
  priority: 'high',
});
```

### Preload Images

```tsx
// Preload single image
await imageService.preloadImage('https://example.com/image.jpg', {
  priority: 'high',
  format: 'webp',
});

// Preload multiple images
await imageService.preloadImages([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
], {
  priority: 'normal',
  format: 'webp',
});
```

### Get Optimized URI

```tsx
const optimizedUri = imageService.getOptimizedUri('https://example.com/image.jpg', {
  width: 300,
  height: 200,
  quality: 80,
  format: 'webp',
});
```

### Cache Management

```tsx
// Get cache size
const size = await imageService.getCacheSize();

// Clear cache
await imageService.clearCache();

// Check WebP support
const supportsWebP = imageService.supportsWebP();
```

## Caching Strategy

### Three-Level Cache

1. **Memory Cache** - Быстрый доступ, ограничен по размеру (50MB)
2. **Disk Cache** - Постоянное хранение, до 100MB
3. **Network** - Загрузка с оптимизацией

### Cache Eviction

- **Memory**: LRU (Least Recently Used) - удаляет 25% при переполнении
- **Disk**: По времени (7 дней) и размеру (100MB)

### Cache Policy

- `none` - Без кэширования
- `disk` - Только диск
- `memory` - Только память
- `memory-disk` - Память и диск (по умолчанию)

## Format Selection

Автоматический выбор формата:

- **WebP** - Поддерживается на большинстве платформ (меньший размер)
- **JPEG** - Fallback для WebP, хорошая поддержка
- **PNG** - Для изображений с прозрачностью

```tsx
// Автоматический выбор формата
const format = imageService.supportsWebP() ? 'webp' : 'jpeg';
```

## Progressive Loading

Прогрессивная загрузка с placeholder:

```tsx
<OptimizedImage
  source="https://example.com/image.jpg"
  progressive
  placeholder="https://example.com/placeholder.jpg"
  placeholderStyle={{ opacity: 0.5 }}
/>
```

## Memory Management

### LRU Eviction

При достижении лимита памяти (50MB):
- Удаляется 25% самых старых записей
- Освобождается место для новых изображений

### Cache Size Limits

- **Memory**: 50MB
- **Disk**: 100MB
- **Max Age**: 7 дней

## Preloading Strategies

### Critical Images

```tsx
// Preload on app start
useCriticalImagePreload([
  '/assets/logo.png',
  '/assets/splash.jpg',
]);
```

### On Visibility

```tsx
import { usePreloadOnVisible } from '../hooks/useImagePreload';

const { isVisible } = useVisibility();

usePreloadOnVisible(imageUri, isVisible, {
  priority: 'high',
  format: 'webp',
});
```

### On Navigation

```tsx
// Preload images for next screen
useFocusEffect(() => {
  imageService.preloadImages(nextScreenImages, {
    priority: 'normal',
  });
});
```

## Best Practices

1. **Use WebP When Possible** - Меньший размер файла
2. **Set Appropriate Sizes** - Указывайте width/height для оптимизации
3. **Preload Critical Images** - Предзагружайте важные изображения
4. **Use Progressive Loading** - Для лучшего UX
5. **Monitor Cache Size** - Регулярно очищайте кэш
6. **Lazy Load in Lists** - Используйте LazyImageList для больших списков

## Performance Tips

### Reduce Image Size

```tsx
// Use appropriate dimensions
<OptimizedImage
  source={uri}
  width={300}  // Actual display width
  height={200} // Actual display height
  quality={75} // Lower quality for thumbnails
/>
```

### Batch Preloading

```tsx
// Preload in priority order
await imageService.preloadImages(highPriorityImages, { priority: 'high' });
await imageService.preloadImages(normalPriorityImages, { priority: 'normal' });
await imageService.preloadImages(lowPriorityImages, { priority: 'low' });
```

### Cache Management

```tsx
// Check cache size periodically
const cacheSize = await imageService.getCacheSize();
if (cacheSize > 80 * 1024 * 1024) {
  // Clean up old cache
  await imageService.clearCache();
}
```

## Troubleshooting

### Images Not Loading

1. Проверьте URI изображения
2. Убедитесь что формат поддерживается
3. Проверьте размер кэша
4. Очистите кэш при необходимости

### Memory Issues

1. Уменьшите maxMemoryCacheSize
2. Используйте lower quality
3. Регулярно очищайте кэш
4. Используйте lazy loading для списков

### Cache Not Working

1. Проверьте права доступа к файловой системе
2. Убедитесь что cachePolicy установлен правильно
3. Проверьте размер диска








