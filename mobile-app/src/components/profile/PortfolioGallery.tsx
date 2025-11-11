import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PortfolioItem } from '../../types/profile';

interface PortfolioGalleryProps {
  portfolio: PortfolioItem[];
  onPortfolioChange: (portfolio: PortfolioItem[]) => Promise<void>;
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  portfolio,
  onPortfolioChange,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAddImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Photo library access is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newItem: PortfolioItem = {
          id: Date.now().toString(),
          imageUri: result.assets[0].uri,
          title: '',
          description: '',
          createdAt: new Date().toISOString(),
        };
        await onPortfolioChange([...portfolio, newItem]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add image');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove this photo from your portfolio?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onPortfolioChange(portfolio.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Portfolio Gallery</Text>
        <TouchableOpacity onPress={handleAddImage}>
          <Text className="text-blue-600 font-medium">+ Add</Text>
        </TouchableOpacity>
      </View>

      {portfolio.length === 0 ? (
        <View className="py-12 items-center">
          <Text className="text-gray-500 mb-4">No portfolio items yet</Text>
          <TouchableOpacity onPress={handleAddImage} className="bg-blue-600 px-6 py-3 rounded-lg">
            <Text className="text-white font-semibold">Add Your First Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {portfolio.map((item) => (
              <View key={item.id} className="relative">
                <TouchableOpacity onPress={() => setSelectedImage(item.imageUri)}>
                  <Image
                    source={{ uri: item.imageUri }}
                    className="rounded-lg"
                    style={{ width: 150, height: 150 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 bg-red-600 rounded-full w-6 h-6 items-center justify-center"
                >
                  <Text className="text-white text-xs font-bold">×</Text>
                </TouchableOpacity>
                {item.title && (
                  <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 rounded-b-lg p-2">
                    <Text className="text-white text-xs" numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity
              onPress={handleAddImage}
              className="w-36 h-36 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center bg-gray-50"
            >
              <Text className="text-3xl text-gray-400 mb-2">+</Text>
              <Text className="text-xs text-gray-500">Add Photo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Full Screen Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View className="flex-1 bg-black items-center justify-center">
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            className="absolute top-12 right-4 z-10 bg-white bg-opacity-20 rounded-full w-10 h-10 items-center justify-center"
          >
            <Text className="text-white text-2xl font-bold">×</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};








