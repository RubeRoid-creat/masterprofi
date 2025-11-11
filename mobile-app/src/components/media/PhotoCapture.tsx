import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useMediaCapture } from '../../hooks/useMediaCapture';
import { MediaItem } from '../../types/media';

interface PhotoCaptureProps {
  orderId?: string;
  maxPhotos?: number;
  onPhotosChange?: (photos: MediaItem[]) => void;
  existingPhotos?: MediaItem[];
  compress?: boolean;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  orderId,
  maxPhotos = 10,
  onPhotosChange,
  existingPhotos = [],
  compress = true,
}) => {
  const { capturePhoto, selectPhoto, selectMultiplePhotos, isCapturing, error } =
    useMediaCapture({
      orderId,
      autoUpload: true,
      autoAddToGallery: true,
    });

  const [photos, setPhotos] = useState<MediaItem[]>(existingPhotos);

  const handleCapture = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const photo = await capturePhoto({
      compress,
      quality: 0.8,
      allowsEditing: true,
    });

    if (photo) {
      const newPhotos = [...photos, photo];
      setPhotos(newPhotos);
      onPhotosChange?.(newPhotos);
    }
  };

  const handleSelect = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const remaining = maxPhotos - photos.length;
    if (remaining > 1) {
      // Offer multiple selection
      Alert.alert(
        'Select Photos',
        'How would you like to select photos?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Single Photo', onPress: async () => {
            const photo = await selectPhoto({ compress, quality: 0.8 });
            if (photo) {
              const newPhotos = [...photos, photo];
              setPhotos(newPhotos);
              onPhotosChange?.(newPhotos);
            }
          }},
          { text: 'Multiple Photos', onPress: async () => {
            const selected = await selectMultiplePhotos({ compress, quality: 0.8 });
            if (selected.length > 0) {
              const newPhotos = [...photos, ...selected.slice(0, remaining)];
              setPhotos(newPhotos);
              onPhotosChange?.(newPhotos);
            }
          }},
        ]
      );
    } else {
      const photo = await selectPhoto({ compress, quality: 0.8 });
      if (photo) {
        const newPhotos = [...photos, photo];
        setPhotos(newPhotos);
        onPhotosChange?.(newPhotos);
      }
    }
  };

  const handleRemove = (photoId: string) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newPhotos = photos.filter((p) => p.id !== photoId);
          setPhotos(newPhotos);
          onPhotosChange?.(newPhotos);
        },
      },
    ]);
  };

  return (
    <View className="bg-white rounded-lg p-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Photos ({photos.length}/{maxPhotos})
      </Text>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-800 text-sm">{error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-4">
        <TouchableOpacity
          onPress={handleCapture}
          disabled={isCapturing || photos.length >= maxPhotos}
          className={`flex-1 bg-blue-600 px-4 py-3 rounded-lg ${
            isCapturing || photos.length >= maxPhotos ? 'opacity-50' : ''
          }`}
        >
          {isCapturing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-center">📷 Camera</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSelect}
          disabled={isCapturing || photos.length >= maxPhotos}
          className={`flex-1 bg-green-600 px-4 py-3 rounded-lg ${
            isCapturing || photos.length >= maxPhotos ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-white font-semibold text-center">🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {photos.map((photo) => (
              <View key={photo.id} className="relative">
                <Image
                  source={{ uri: photo.uri }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => handleRemove(photo.id)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                >
                  <Text className="text-white text-xs font-bold">×</Text>
                </TouchableOpacity>
                {photo.uploaded && (
                  <View className="absolute bottom-1 right-1 bg-green-500 rounded-full w-4 h-4" />
                )}
                {photo.uploadProgress !== undefined && photo.uploadProgress < 100 && (
                  <View className="absolute inset-0 bg-black bg-opacity-50 rounded-lg items-center justify-center">
                    <Text className="text-white text-xs">
                      {photo.uploadProgress}%
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};








