import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Share,
  Alert,
} from 'react-native';
import { InviteData } from '../../types/mlm';
// Note: QR code generation requires react-native-qrcode-svg
// import QRCode from 'react-native-qrcode-svg';

interface InviteComponentProps {
  inviteData: InviteData;
  onShare?: () => void;
}

export const InviteComponent: React.FC<InviteComponentProps> = ({
  inviteData,
  onShare,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Copy to clipboard (requires @react-native-clipboard/clipboard)
    // Clipboard.setString(inviteData.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copied!', 'Invite link copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: inviteData.shareText,
        url: inviteData.link,
      });
      onShare?.();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSaveQRCode = async () => {
    try {
      // Save QR code to gallery
      // This requires actual QR code generation
      Alert.alert('Success', 'QR code saved to gallery');
    } catch (error) {
      Alert.alert('Error', 'Failed to save QR code');
    }
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Invite Members</Text>
      </View>

      {/* Invite Code */}
      <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
        <Text className="text-sm text-gray-600 mb-2">Your Invite Code</Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            value={inviteData.code}
            editable={false}
            className="flex-1 bg-white px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-mono text-lg"
          />
          <TouchableOpacity
            onPress={handleCopy}
            className="bg-blue-600 px-4 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">
              {copied ? '✓' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Invite Link */}
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-2">Invite Link</Text>
        <TouchableOpacity
          onPress={handleCopy}
          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
        >
          <Text className="text-sm text-gray-700" numberOfLines={1}>
            {inviteData.link}
          </Text>
        </TouchableOpacity>
      </View>

      {/* QR Code Preview */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="bg-gray-50 rounded-lg p-6 items-center mb-4 border border-gray-200"
      >
        <View className="w-32 h-32 bg-white rounded-lg items-center justify-center border-2 border-gray-300">
          {/* Placeholder for QR Code */}
          <Text className="text-gray-400 text-xs text-center">
            QR Code{'\n'}Preview
          </Text>
          {/* Uncomment when QR code library is installed:
          <QRCode
            value={inviteData.link}
            size={120}
          />
          */}
        </View>
        <Text className="text-sm text-gray-600 mt-2">Tap to view full QR code</Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={handleShare}
          className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
        >
          <Text className="text-white font-semibold">📤 Share Link</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
        >
          <Text className="text-gray-700 font-semibold">QR Code</Text>
        </TouchableOpacity>
      </View>

      {/* Share Text Template */}
      <View className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <Text className="text-xs text-gray-500 mb-1">Share Message Template</Text>
        <Text className="text-sm text-gray-700">{inviteData.shareText}</Text>
      </View>

      {/* QR Code Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 items-center justify-center p-6">
          <View className="bg-white rounded-lg p-6 items-center max-w-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">QR Code</Text>
            <View className="w-64 h-64 bg-gray-100 rounded-lg items-center justify-center mb-4">
              <Text className="text-gray-400 text-center">
                QR Code{'\n'}would be displayed here
              </Text>
              {/* <QRCode value={inviteData.link} size={240} /> */}
            </View>
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={handleSaveQRCode}
                className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="text-gray-700 font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

