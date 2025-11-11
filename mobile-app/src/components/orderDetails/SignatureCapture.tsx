import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
// Note: Full signature capture requires react-native-signature-capture library
// import { Svg, Path } from 'react-native-svg';

interface SignatureCaptureProps {
  onSignatureCapture: (signature: string) => void;
  title?: string;
  required?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSignatureCapture,
  title = 'Signature',
  required = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const canvasRef = useRef<View>(null);

  // Note: Full signature implementation requires react-native-signature-capture
  // This is a simplified version with SVG placeholder
  
  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const handleSave = () => {
    if (paths.length === 0 && required) {
      Alert.alert('Required', 'Please provide a signature');
      return;
    }

    // Convert paths to base64 string (simplified)
    const signatureData = JSON.stringify(paths);
    onSignatureCapture(signatureData);
    setIsModalVisible(false);
    setPaths([]);
    setCurrentPath([]);
  };

  const renderSignature = () => {
    if (paths.length === 0) {
      return (
        <View className="flex-1 items-center justify-center bg-gray-50">
          <Text className="text-gray-400 mb-2">Sign here</Text>
          <Text className="text-xs text-gray-400">
            Note: Full signature capture requires react-native-signature-capture library
          </Text>
        </View>
      );
    }

    // Simplified signature display - replace with react-native-signature-capture
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-400">Signature paths: {paths.length}</Text>
        <Text className="text-xs text-gray-400 mt-2">
          For production, use react-native-signature-capture library
        </Text>
      </View>
    );
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-semibold text-gray-900">
            {title} {required && <Text className="text-red-600">*</Text>}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">Tap to sign</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium text-sm">Sign</Text>
        </TouchableOpacity>
      </View>

      {/* Signature Preview */}
      {paths.length > 0 && (
        <View className="h-24 bg-gray-50 rounded-lg border border-gray-200 items-center justify-center">
          <Text className="text-sm text-gray-600">Signature captured</Text>
        </View>
      )}

      {/* Signature Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-semibold text-gray-900">{title}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text className="text-blue-600 font-medium">Close</Text>
            </TouchableOpacity>
          </View>

          {/* Canvas Area */}
          <View
            ref={canvasRef}
            className="flex-1 bg-white"
            onTouchStart={(e) => {
              const { locationX, locationY } = e.nativeEvent;
              setCurrentPath([{ x: locationX, y: locationY }]);
            }}
            onTouchMove={(e) => {
              const { locationX, locationY } = e.nativeEvent;
              setCurrentPath((prev) => [...prev, { x: locationX, y: locationY }]);
            }}
            onTouchEnd={() => {
              if (currentPath.length > 0) {
                setPaths((prev) => [...prev, currentPath]);
                setCurrentPath([]);
              }
            }}
          >
            {renderSignature()}
          </View>

          {/* Footer Controls */}
          <View className="flex-row gap-3 p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleClear}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg bg-white"
            >
              <Text className="text-center text-gray-700 font-medium">Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 py-3 px-6 bg-blue-600 rounded-lg"
            >
              <Text className="text-center text-white font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

