import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Attachment } from '../../types/chat';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface MediaAttachmentProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxAttachments?: number;
}

export const MediaAttachment: React.FC<MediaAttachmentProps> = ({
  attachments,
  onAttachmentsChange,
  maxAttachments = 5,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets
          .slice(0, maxAttachments - attachments.length)
          .map((asset) => ({
            id: Date.now().toString() + Math.random().toString(),
            type: 'image',
            uri: asset.uri,
            name: asset.fileName || `image_${Date.now()}.jpg`,
            size: asset.fileSize,
            mimeType: asset.type || 'image/jpeg',
          }));

        onAttachmentsChange([...attachments, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          type: 'video',
          uri: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          size: asset.fileSize,
          mimeType: asset.type || 'video/mp4',
          duration: asset.duration,
        };

        onAttachmentsChange([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          type: 'file',
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType || 'application/octet-stream',
        };

        onAttachmentsChange([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  };

  const openImageViewer = (uri: string) => {
    setSelectedImage(uri);
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.attachmentsGrid}>
        {attachments.map((attachment) => (
          <View key={attachment.id} style={styles.attachmentItem}>
            {attachment.type === 'image' ? (
              <TouchableOpacity onPress={() => openImageViewer(attachment.uri)}>
                <Image
                  source={{ uri: attachment.uri }}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : attachment.type === 'video' ? (
              <View style={styles.videoContainer}>
                {attachment.thumbnail ? (
                  <Image
                    source={{ uri: attachment.thumbnail }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Text style={styles.videoIcon}>🎥</Text>
                  </View>
                )}
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </View>
            ) : (
              <View style={styles.fileContainer}>
                <Text style={styles.fileIcon}>📄</Text>
                <Text style={styles.fileName} numberOfLines={1}>
                  {attachment.name}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => removeAttachment(attachment.id)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {attachments.length < maxAttachments && (
        <View style={styles.addButtons}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>📷 Фото</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickVideo}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>🎥 Видео</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickFile}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>📄 Файл</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Viewer Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  attachmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    width: '100%',
  },
  attachmentItem: {
    position: 'relative',
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
  },
  videoContainer: {
    position: 'relative',
  },
  videoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    fontSize: 24,
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    ...typography.body.medium,
    color: colors.text.inverse,
  },
  fileContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  fileIcon: {
    fontSize: 24,
  },
  fileName: {
    ...typography.body.xsmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error[500],
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
  addButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
    width: '100%',
  },
  addButton: {
    flex: 1,
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.body.xsmall,
    color: colors.primary[600],
    fontWeight: '600',
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
    width: '100%',
    height: '80%',
  },
});
