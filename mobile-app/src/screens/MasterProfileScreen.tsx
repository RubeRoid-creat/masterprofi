import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MasterProfile } from '../types/profile';
import { PersonalInfoEditor } from '../components/profile/PersonalInfoEditor';
import { SkillsManager } from '../components/profile/SkillsManager';
import { ServiceAreaConfig } from '../components/profile/ServiceAreaConfig';
import { PortfolioGallery } from '../components/profile/PortfolioGallery';
import { RatingReviews } from '../components/profile/RatingReviews';
import { AvailabilityCalendar } from '../components/profile/AvailabilityCalendar';
import { Statistics } from '../components/profile/Statistics';
import { CertificatesDisplay } from '../components/profile/CertificatesDisplay';
import { colors, typography, spacing } from '../theme';
import { useAppSelector } from '../store/hooks';
import { useGetCurrentUserQuery } from '../store/api/authApi';
import { ProfileStackParamList } from '../navigation/types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

interface MasterProfileScreenProps {
  profileId?: string;
  profile?: MasterProfile;
  onProfileUpdate?: (profile: MasterProfile) => void;
}

export const MasterProfileScreen: React.FC<MasterProfileScreenProps> = ({
  profileId: propsProfileId,
  profile: propsProfile,
  onProfileUpdate,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // Get current user ID from Redux store
  const authUser = useAppSelector((state) => state.auth.user);
  const profileId = propsProfileId || authUser?.id;

  // Fetch user data from API
  const { data: userData, isLoading: isLoadingUser, refetch: refetchUser } = useGetCurrentUserQuery(
    undefined,
    { skip: !!propsProfile || !profileId }
  );

  // Create default profile structure
  const createDefaultProfile = (user: any): MasterProfile => ({
    id: user?.id || profileId || '',
    personalInfo: {
      firstName: user?.firstName || user?.name?.split(' ')[0] || '',
      lastName: user?.lastName || user?.name?.split(' ')[1] || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar,
      city: user?.city || '',
      bio: user?.bio,
    },
    skills: [],
    specialties: [],
    serviceArea: {
      center: {
        latitude: 0,
        longitude: 0,
        address: '',
      },
      radius: 50,
    },
    portfolio: [],
    rating: {
      average: 0,
      total: 0,
      breakdown: {
        five: 0,
        four: 0,
        three: 0,
        two: 0,
        one: 0,
      },
    },
    reviews: [],
    availability: {
      schedule: {
        monday: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00' }] },
        tuesday: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00' }] },
        wednesday: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00' }] },
        thursday: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00' }] },
        friday: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00' }] },
        saturday: { isAvailable: false, timeSlots: [] },
        sunday: { isAvailable: false, timeSlots: [] },
      },
      isAvailable: true,
      timezone: 'Europe/Moscow',
    },
    statistics: {
      completedOrders: 0,
      totalEarnings: 0,
      averageRating: 0,
      responseTime: 0,
      completionRate: 0,
      onTimeRate: 0,
    },
    certificates: [],
  });

  // Base profile from API or props
  const baseProfile = useMemo(() => {
    if (propsProfile) {
      return propsProfile;
    }
    if (userData) {
      return createDefaultProfile(userData);
    }
    if (authUser) {
      return createDefaultProfile(authUser);
    }
    return null;
  }, [propsProfile, userData, authUser, profileId]);

  // Local state for profile updates
  const [localUpdates, setLocalUpdates] = useState<Partial<MasterProfile>>({});

  // Merge base profile with local updates
  const profile = useMemo(() => {
    if (!baseProfile) return null;
    return { ...baseProfile, ...localUpdates };
  }, [baseProfile, localUpdates]);

  const isLoading = !propsProfile && isLoadingUser && !userData && !authUser;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Clear local updates and fetch latest profile data
    setLocalUpdates({});
    if (!propsProfile && profileId) {
      await refetchUser();
    }
    setRefreshing(false);
  };

  const updateProfile = async (updates: Partial<MasterProfile>) => {
    setLocalUpdates((prev) => ({ ...prev, ...updates }));
    if (profile) {
      const updated = { ...profile, ...updates };
      onProfileUpdate?.(updated);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Профиль не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Personal Information */}
      <PersonalInfoEditor
        personalInfo={profile.personalInfo}
        onSave={async (info) => {
          await updateProfile({ personalInfo: info });
        }}
      />

      {/* Statistics */}
      <Statistics statistics={profile.statistics} />

      {/* Rating & Reviews */}
      <RatingReviews rating={profile.rating} reviews={profile.reviews} />

      {/* Skills & Specialties */}
      <SkillsManager
        skills={profile.skills}
        onSkillsChange={async (skills) => {
          await updateProfile({ skills });
        }}
      />

      {/* Service Area */}
      <ServiceAreaConfig
        serviceArea={profile.serviceArea}
        onSave={async (area) => {
          await updateProfile({ serviceArea: area });
        }}
      />

      {/* Portfolio */}
      <PortfolioGallery
        portfolio={profile.portfolio}
        onPortfolioChange={async (portfolio) => {
          await updateProfile({ portfolio });
        }}
      />

      {/* Certificates */}
      <CertificatesDisplay
        certificates={profile.certificates}
        onAdd={() => {
          // Navigate to add certificate screen
        }}
      />

      {/* Availability */}
      <AvailabilityCalendar
        availability={profile.availability}
        onSave={async (availability) => {
          await updateProfile({ availability });
        }}
      />

      {/* CRM Sync Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.crmSyncButton}
          onPress={() => navigation.navigate('CrmSync')}
        >
          <Text style={styles.crmSyncButtonText}>🔄 Синхронизация CRM</Text>
          <Text style={styles.crmSyncButtonSubtext}>
            Синхронизация данных с админ-панелью
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  errorText: {
    ...typography.heading.h3,
    color: colors.text.primary,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  crmSyncButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  crmSyncButtonText: {
    ...typography.heading.h4,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  crmSyncButtonSubtext: {
    ...typography.body.small,
    color: colors.white,
    opacity: 0.9,
  },
});

