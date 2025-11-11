import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
} from 'react-native';
import { Certificate } from '../../types/profile';

interface CertificatesDisplayProps {
  certificates: Certificate[];
  onAdd?: () => void;
}

export const CertificatesDisplay: React.FC<CertificatesDisplayProps> = ({
  certificates,
  onAdd,
}) => {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const isExpired = (cert: Certificate) => {
    if (!cert.expiryDate) return false;
    return new Date(cert.expiryDate) < new Date();
  };

  const isExpiringSoon = (cert: Certificate) => {
    if (!cert.expiryDate) return false;
    const expiry = new Date(cert.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Certificates</Text>
        {onAdd && (
          <TouchableOpacity onPress={onAdd}>
            <Text className="text-blue-600 font-medium">+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {certificates.length === 0 ? (
        <View className="py-12 items-center">
          <Text className="text-gray-500 mb-4">No certificates added yet</Text>
          {onAdd && (
            <TouchableOpacity onPress={onAdd} className="bg-blue-600 px-6 py-3 rounded-lg">
              <Text className="text-white font-semibold">Add Certificate</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {certificates.map((cert) => (
              <TouchableOpacity
                key={cert.id}
                onPress={() => setSelectedCertificate(cert)}
                className="w-48 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
              >
                <Image
                  source={{ uri: cert.imageUri }}
                  className="w-full h-32"
                  resizeMode="cover"
                />
                <View className="p-3">
                  <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={1}>
                    {cert.title}
                  </Text>
                  <Text className="text-xs text-gray-600 mb-2">{cert.issuer}</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-gray-500">
                      {formatDate(cert.issueDate)}
                    </Text>
                    {isExpired(cert) ? (
                      <View className="bg-red-100 px-2 py-1 rounded">
                        <Text className="text-xs text-red-800 font-medium">Expired</Text>
                      </View>
                    ) : isExpiringSoon(cert) ? (
                      <View className="bg-yellow-100 px-2 py-1 rounded">
                        <Text className="text-xs text-yellow-800 font-medium">Expiring</Text>
                      </View>
                    ) : (
                      cert.expiryDate && (
                        <Text className="text-xs text-green-600 font-medium">Valid</Text>
                      )
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Certificate Details Modal */}
      <Modal
        visible={selectedCertificate !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedCertificate(null)}
      >
        {selectedCertificate && (
          <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-xl font-semibold text-gray-900">
                Certificate Details
              </Text>
              <TouchableOpacity onPress={() => setSelectedCertificate(null)}>
                <Text className="text-blue-600 font-medium">Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
              <Image
                source={{ uri: selectedCertificate.imageUri }}
                className="w-full h-64 rounded-lg mb-4"
                resizeMode="contain"
              />

              <View>
                <View className="mb-4">
                  <DetailRow label="Title" value={selectedCertificate.title} />
                </View>
                <View className="mb-4">
                  <DetailRow label="Issuer" value={selectedCertificate.issuer} />
                </View>
                <View className="mb-4">
                  <DetailRow
                    label="Issue Date"
                    value={formatDate(selectedCertificate.issueDate)}
                  />
                </View>
                {selectedCertificate.expiryDate && (
                  <View className="mb-4">
                    <DetailRow
                      label="Expiry Date"
                      value={formatDate(selectedCertificate.expiryDate)}
                    />
                  </View>
                )}
              </View>

              {selectedCertificate.verificationUrl && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(selectedCertificate.verificationUrl!)}
                  className="bg-blue-600 py-4 rounded-lg items-center mt-4"
                >
                  <Text className="text-white font-semibold">Verify Certificate</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View className="flex-row justify-between py-2 border-b border-gray-100">
    <Text className="text-sm text-gray-600 flex-1">{label}</Text>
    <Text className="text-sm font-medium text-gray-900 flex-1 text-right">{value}</Text>
  </View>
);

