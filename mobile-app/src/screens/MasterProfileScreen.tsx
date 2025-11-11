import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
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
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAppSelector } from '../store/hooks';
import { useGetCurrentUserQuery } from '../store/api/authApi';
import { ProfileStackParamList } from '../navigation/types';
import { ModernCard } from '../components/common/ModernCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { StyledButton } from '../components/common/StyledButton';
import { useUpdateProfileMutation } from '../store/api/authApi';

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
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const personalInfoYPosition = React.useRef<number>(0);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // Get current user ID from Redux store
  const authUser = useAppSelector((state) => state.auth.user);
  const profileId = propsProfileId || authUser?.id;

  // Fetch user data from API
  const { data: userData, isLoading: isLoadingUser, refetch: refetchUser } = useGetCurrentUserQuery(
    undefined,
    { skip: !!propsProfile || !profileId }
  );

  // Update profile mutation
  const [updateProfileMutation, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

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
    try {
      // If updating personal info, also update via API
      if (updates.personalInfo) {
        const personalInfo = updates.personalInfo;
        await updateProfileMutation({
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          avatar: personalInfo.avatar,
          city: personalInfo.city,
          bio: personalInfo.bio,
        }).unwrap();
        
        // Refetch user data to get latest from server
        await refetchUser();
      }

      // Update local state
      setLocalUpdates((prev) => ({ ...prev, ...updates }));
      if (profile) {
        const updated = { ...profile, ...updates };
        onProfileUpdate?.(updated);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" text="Загрузка профиля..." />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Alert
          variant="error"
          title="Ошибка"
          message="Профиль не найден"
          showIcon={true}
        />
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh}
          tintColor={colors.primary[600]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header Card */}
      <ModernCard variant="elevated" padding="large" style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              {profile.personalInfo.avatar ? (
                <View style={styles.avatarWrapper}>
                  <Text style={styles.avatarPlaceholder}>
                    {profile.personalInfo.firstName?.[0] || 'U'}
                  </Text>
                </View>
              ) : (
                <View style={styles.avatarPlaceholderContainer}>
                  <Text style={styles.avatarPlaceholderText}>
                    {profile.personalInfo.firstName?.[0] || 'U'}
                    {profile.personalInfo.lastName?.[0] || ''}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.profileName}>
                {profile.personalInfo.firstName} {profile.personalInfo.lastName}
              </Text>
              {profile.personalInfo.city && (
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>{profile.personalInfo.city}</Text>
                </View>
              )}
              {profile.rating.average > 0 && (
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingIcon}>⭐</Text>
                  <Text style={styles.ratingText}>
                    {profile.rating.average.toFixed(1)} ({profile.rating.total} отзывов)
                  </Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editHeaderButton}
            onPress={() => {
              setIsEditingPersonalInfo(true);
              // Scroll to personal info section after a short delay
              setTimeout(() => {
                if (scrollViewRef.current && personalInfoYPosition.current > 0) {
                  scrollViewRef.current.scrollTo({
                    y: personalInfoYPosition.current - spacing.lg,
                    animated: true,
                  });
                }
              }, 300);
            }}
          >
            <Text style={styles.editHeaderIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
        {profile.personalInfo.bio && (
          <Text style={styles.bioText}>{profile.personalInfo.bio}</Text>
        )}
      </ModernCard>

      {/* Statistics */}
      <View style={styles.section}>
        <Statistics statistics={profile.statistics} />
      </View>

      {/* Personal Information */}
      <View
        style={styles.section}
        onLayout={(event) => {
          personalInfoYPosition.current = event.nativeEvent.layout.y;
        }}
      >
        <PersonalInfoEditor
          personalInfo={profile.personalInfo}
          onSave={async (info) => {
            await updateProfile({ personalInfo: info });
          }}
          showHeader={true}
          isEditing={isEditingPersonalInfo}
          onEditToggle={setIsEditingPersonalInfo}
        />
      </View>

      {/* Rating & Reviews */}
      <View style={styles.section}>
        <RatingReviews rating={profile.rating} reviews={profile.reviews} />
      </View>

      {/* Skills & Specialties */}
      <View style={styles.section}>
        <ModernCard variant="flat" padding="medium" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Навыки и специализация</Text>
          <SkillsManager
            skills={profile.skills}
            onSkillsChange={async (skills) => {
              await updateProfile({ skills });
            }}
          />
        </ModernCard>
      </View>

      {/* Service Area */}
      <View style={styles.section}>
        <ModernCard variant="flat" padding="medium" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Зона обслуживания</Text>
          <ServiceAreaConfig
            serviceArea={profile.serviceArea}
            onSave={async (area) => {
              await updateProfile({ serviceArea: area });
            }}
          />
        </ModernCard>
      </View>

      {/* Portfolio */}
      <View style={styles.section}>
        <ModernCard variant="flat" padding="medium" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Портфолио</Text>
          <PortfolioGallery
            portfolio={profile.portfolio}
            onPortfolioChange={async (portfolio) => {
              await updateProfile({ portfolio });
            }}
          />
        </ModernCard>
      </View>

      {/* Certificates */}
      <View style={styles.section}>
        <ModernCard variant="flat" padding="medium" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Сертификаты</Text>
          <CertificatesDisplay
            certificates={profile.certificates}
            onAdd={() => {
              // Navigate to add certificate screen
            }}
          />
        </ModernCard>
      </View>

      {/* Availability */}
      <View style={styles.section}>
        <ModernCard variant="flat" padding="medium" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Доступность</Text>
          <AvailabilityCalendar
            availability={profile.availability}
            onSave={async (availability) => {
              await updateProfile({ availability });
            }}
          />
        </ModernCard>
      </View>

      {/* CRM Sync Section */}
      <View style={styles.section}>
        <ModernCard variant="elevated" padding="medium" style={styles.crmSyncCard}>
          <View style={styles.crmSyncContent}>
            <Text style={styles.crmSyncIcon}>🔄</Text>
            <View style={styles.crmSyncTextContainer}>
              <Text style={styles.crmSyncTitle}>Синхронизация CRM</Text>
              <Text style={styles.crmSyncSubtitle}>
                Синхронизация данных с админ-панелью
              </Text>
            </View>
          </View>
          <StyledButton
            title="Открыть"
            onPress={() => navigation.navigate('CrmSync')}
            variant="primary"
            size="medium"
            fullWidth={true}
          />
        </ModernCard>
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
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
  },
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  editHeaderIcon: {
    fontSize: 20,
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary[300],
  },
  avatarPlaceholder: {
    ...typography.heading.h2,
    color: colors.primary[700],
    fontWeight: '700',
  },
  avatarPlaceholderContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  avatarPlaceholderText: {
    ...typography.heading.h2,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.heading.h2,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  locationText: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  ratingText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  bioText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    lineHeight: 22,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionCard: {
    marginBottom: 0,
  },
  sectionTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  crmSyncCard: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  crmSyncContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  crmSyncIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  crmSyncTextContainer: {
    flex: 1,
  },
  crmSyncTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  crmSyncSubtitle: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
});

