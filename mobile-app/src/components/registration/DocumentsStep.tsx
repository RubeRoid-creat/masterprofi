import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { DocumentsInfo, DocumentFile } from '../../types/registration';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledButton } from '../common/StyledButton';

interface DocumentsStepProps {
  initialData?: Partial<DocumentsInfo>;
  onNext: (data: { documents: DocumentsInfo }) => void;
  onBack: () => void;
}

export const DocumentsStep: React.FC<DocumentsStepProps> = ({
  initialData,
  onNext,
  onBack,
}) => {
  const [certificates, setCertificates] = useState<DocumentFile[]>(
    initialData?.certificates || []
  );
  const [portfolio, setPortfolio] = useState<DocumentFile[]>(
    initialData?.portfolio || []
  );
  const [idDocument, setIdDocument] = useState<DocumentFile | undefined>(
    initialData?.idDocument
  );

  const pickCertificate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file: DocumentFile = {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType || 'application/pdf',
          name: result.assets[0].name,
          size: result.assets[0].size,
        };
        setCertificates([...certificates, file]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать документ');
    }
  };

  const pickPortfolioImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Доступ запрещен', 'Пожалуйста, включите доступ к фото в настройках');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file: DocumentFile = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: `portfolio_${Date.now()}.jpg`,
          size: result.assets[0].fileSize,
        };
        setPortfolio([...portfolio, file]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const pickIdDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file: DocumentFile = {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType || 'application/pdf',
          name: result.assets[0].name,
          size: result.assets[0].size,
        };
        setIdDocument(file);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать документ');
    }
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const removePortfolioItem = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (certificates.length === 0) {
      Alert.alert('Обязательно', 'Пожалуйста, загрузите хотя бы один сертификат');
      return;
    }

    onNext({
      documents: {
        certificates,
        portfolio,
        idDocument,
      },
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Загрузите ваши сертификаты и портфолио для повышения доверия клиентов
        </Text>

        {/* Certificates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Сертификаты * (минимум 1)
          </Text>
          <Text style={styles.sectionHint}>
            Загрузите PDF или изображения ваших профессиональных сертификатов
          </Text>

          {certificates.map((cert, index) => (
            <View key={index} style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={1}>
                  {cert.name}
                </Text>
                {cert.size && (
                  <Text style={styles.documentSize}>
                    {formatFileSize(cert.size)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => removeCertificate(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={pickCertificate}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Добавить сертификат</Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Портфолио (необязательно)
          </Text>
          <Text style={styles.sectionHint}>
            Загрузите изображения ваших работ
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioContainer}>
            {portfolio.map((item, index) => (
              <View key={index} style={styles.portfolioItem}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.portfolioImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removePortfolioItem(index)}
                  style={styles.removePortfolioButton}
                >
                  <Text style={styles.removePortfolioButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={pickPortfolioImage}
              style={styles.addPortfolioButton}
            >
              <Text style={styles.addPortfolioButtonText}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ID Document */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Документ удостоверения личности (необязательно)
          </Text>
          <Text style={styles.sectionHint}>
            Загрузите ваш документ для верификации
          </Text>

          {idDocument ? (
            <View style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={1}>
                  {idDocument.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIdDocument(undefined)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={pickIdDocument}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Добавить документ</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <StyledButton
          title="Назад"
          onPress={onBack}
          variant="outline"
          size="large"
          style={styles.button}
        />
        <StyledButton
          title="Продолжить"
          onPress={handleNext}
          variant="primary"
          size="large"
          style={styles.button}
          disabled={certificates.length === 0}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  sectionHint: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    ...typography.body.small,
    color: colors.text.primary,
    fontWeight: '600',
  },
  documentSize: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  removeButton: {
    marginLeft: spacing.sm,
  },
  removeButtonText: {
    ...typography.body.small,
    color: colors.error[600],
    fontWeight: '600',
  },
  addButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.body.medium,
    color: colors.primary[600],
    fontWeight: '600',
  },
  portfolioContainer: {
    marginBottom: spacing.sm,
  },
  portfolioItem: {
    position: 'relative',
    marginRight: spacing.xs,
  },
  portfolioImage: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.lg,
  },
  removePortfolioButton: {
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
  removePortfolioButtonText: {
    ...typography.body.small,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  addPortfolioButton: {
    width: 96,
    height: 96,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
  },
  addPortfolioButtonText: {
    ...typography.heading.h2,
    color: colors.text.disabled,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  button: {
    flex: 1,
  },
});
