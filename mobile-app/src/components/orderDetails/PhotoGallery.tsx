import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledButton } from '../common/StyledButton';

interface PhotoGalleryProps {
  photos: string[];
  onPhotosChange?: (photos: string[]) => void;
  allowAdd?: boolean;
}

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3;

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onPhotosChange,
  allowAdd = true,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Требуется доступ к галерее!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhotos = [...photos, result.assets[0].uri];
        onPhotosChange?.(newPhotos);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange?.(newPhotos);
  };

  const openFullScreen = (uri: string) => {
    setSelectedPhoto(uri);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Галерея фото ({photos.length})
        </Text>
        {allowAdd && (
          <StyledButton
            title="+ Добавить фото"
            onPress={handleAddPhoto}
            variant="primary"
            size="small"
          />
        )}
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Нет доступных фото</Text>
          {allowAdd && (
            <StyledButton
              title="Добавить первое фото"
              onPress={handleAddPhoto}
              variant="outline"
              size="medium"
            />
          )}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <TouchableOpacity onPress={() => openFullScreen(photo)}>
                  <Image
                    source={{ uri: photo }}
                    style={[styles.photo, { width: PHOTO_SIZE, height: PHOTO_SIZE }]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                {allowAdd && (
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {allowAdd && (
              <TouchableOpacity
                onPress={handleAddPhoto}
                style={styles.addPhotoButton}
              >
                <Text style={styles.addPhotoIcon}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* Full Screen Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    ...typography.body.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    borderRadius: borderRadius.lg,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error[600],
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    ...typography.body.small,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  addPhotoButton: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
  },
  addPhotoIcon: {
    ...typography.heading.h2,
    color: colors.text.disabled,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 48,
    right: spacing.md,
    zIndex: 10,
  },
  modalCloseText: {
    ...typography.heading.h2,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  modalImage: {
    width: width,
    height: width,
  },
});
