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

interface DocumentScannerProps {
  orderId?: string;
  maxDocuments?: number;
  onDocumentsChange?: (documents: MediaItem[]) => void;
  existingDocuments?: MediaItem[];
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  orderId,
  maxDocuments = 10,
  onDocumentsChange,
  existingDocuments = [],
}) => {
  const { scanDocument, pickDocument, isCapturing, error } = useMediaCapture({
    orderId,
    autoUpload: true,
    autoAddToGallery: true,
  });

  const [documents, setDocuments] = useState<MediaItem[]>(existingDocuments);

  const handleScan = async () => {
    if (documents.length >= maxDocuments) {
      Alert.alert('Limit Reached', `Maximum ${maxDocuments} documents allowed`);
      return;
    }

    const document = await scanDocument({
      quality: 'high',
    });

    if (document) {
      const newDocuments = [...documents, document];
      setDocuments(newDocuments);
      onDocumentsChange?.(newDocuments);
    }
  };

  const handlePick = async () => {
    if (documents.length >= maxDocuments) {
      Alert.alert('Limit Reached', `Maximum ${maxDocuments} documents allowed`);
      return;
    }

    const document = await pickDocument();

    if (document) {
      const newDocuments = [...documents, document];
      setDocuments(newDocuments);
      onDocumentsChange?.(newDocuments);
    }
  };

  const handleRemove = (documentId: string) => {
    Alert.alert('Remove Document', 'Are you sure you want to remove this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newDocuments = documents.filter((d) => d.id !== documentId);
          setDocuments(newDocuments);
          onDocumentsChange?.(newDocuments);
        },
      },
    ]);
  };

  return (
    <View className="bg-white rounded-lg p-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Documents ({documents.length}/{maxDocuments})
      </Text>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-800 text-sm">{error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-4">
        <TouchableOpacity
          onPress={handleScan}
          disabled={isCapturing || documents.length >= maxDocuments}
          className={`flex-1 bg-blue-600 px-4 py-3 rounded-lg ${
            isCapturing || documents.length >= maxDocuments ? 'opacity-50' : ''
          }`}
        >
          {isCapturing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-center">📄 Scan</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePick}
          disabled={isCapturing || documents.length >= maxDocuments}
          className={`flex-1 bg-gray-600 px-4 py-3 rounded-lg ${
            isCapturing || documents.length >= maxDocuments ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-white font-semibold text-center">📁 Pick File</Text>
        </TouchableOpacity>
      </View>

      {/* Documents List */}
      {documents.length > 0 && (
        <ScrollView className="max-h-64">
          <View className="gap-2">
            {documents.map((doc) => (
              <View
                key={doc.id}
                className="flex-row items-center bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                {doc.type === 'scan' && doc.thumbnailUri && (
                  <Image
                    source={{ uri: doc.thumbnailUri }}
                    className="w-12 h-12 rounded mr-3"
                    resizeMode="cover"
                  />
                )}
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {doc.type === 'scan' ? 'Scanned Document' : 'Document'}
                  </Text>
                  {doc.size && (
                    <Text className="text-xs text-gray-500">
                      {(doc.size / 1024).toFixed(2)} KB
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(doc.id)}
                  className="bg-red-100 px-3 py-1 rounded"
                >
                  <Text className="text-red-600 text-xs font-semibold">Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};








