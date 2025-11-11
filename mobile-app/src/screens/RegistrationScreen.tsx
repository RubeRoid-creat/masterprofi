import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { RegistrationFormData, RegistrationStep, StepConfig } from '../types/registration';
import { PersonalInfoStep } from '../components/registration/PersonalInfoStep';
import { PhoneVerificationStep } from '../components/registration/PhoneVerificationStep';
import { SkillsStep } from '../components/registration/SkillsStep';
import { LocationStep } from '../components/registration/LocationStep';
import { DocumentsStep } from '../components/registration/DocumentsStep';
import { TermsStep } from '../components/registration/TermsStep';
import { ProgressIndicator } from '../components/registration/ProgressIndicator';
import { colors, spacing } from '../theme';

const STEPS: StepConfig[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Tell us about yourself',
    progress: 0.16,
  },
  {
    id: 'verification',
    title: 'Phone Verification',
    description: 'Verify your phone number',
    progress: 0.33,
  },
  {
    id: 'skills',
    title: 'Skills & Experience',
    description: 'Select your specialties',
    progress: 0.5,
  },
  {
    id: 'location',
    title: 'Service Area',
    description: 'Set your service location',
    progress: 0.66,
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Upload certificates',
    progress: 0.83,
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    description: 'Review and accept',
    progress: 1.0,
  },
];

interface RegistrationScreenProps {
  onComplete?: (data: RegistrationFormData) => Promise<void>;
  onCancel?: () => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({});

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const currentStepConfig = STEPS[currentStepIndex];

  const handleNext = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }));

    if (currentStep === 'personal') {
      setCurrentStep('verification');
    } else if (currentStep === 'verification') {
      setCurrentStep('skills');
    } else if (currentStep === 'skills') {
      setCurrentStep('location');
    } else if (currentStep === 'location') {
      setCurrentStep('documents');
    } else if (currentStep === 'documents') {
      setCurrentStep('terms');
    }
  };

  const handleBack = () => {
    if (currentStep === 'verification') {
      setCurrentStep('personal');
    } else if (currentStep === 'skills') {
      setCurrentStep('verification');
    } else if (currentStep === 'location') {
      setCurrentStep('skills');
    } else if (currentStep === 'documents') {
      setCurrentStep('location');
    } else if (currentStep === 'terms') {
      setCurrentStep('documents');
    }
  };

  const handleSubmit = async (finalData: any) => {
    setIsSubmitting(true);
    try {
      const completeData: RegistrationFormData = {
        ...formData,
        ...finalData,
      } as RegistrationFormData;

      if (onComplete) {
        await onComplete(completeData);
      } else {
        console.log('Registration data:', completeData);
        // Default submission
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <PersonalInfoStep
            initialData={formData.personalInfo}
            onNext={handleNext}
            onCancel={onCancel}
          />
        );
      case 'verification':
        return (
          <PhoneVerificationStep
            phone={formData.personalInfo?.phone || ''}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'skills':
        return (
          <SkillsStep
            initialData={formData.skills}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'location':
        return (
          <LocationStep
            initialData={formData.location}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'documents':
        return (
          <DocumentsStep
            initialData={formData.documents}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'terms':
        return (
          <TermsStep
            onNext={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.content}>
        {/* Progress Indicator */}
        <ProgressIndicator
          steps={STEPS}
          currentStep={currentStep}
          progress={currentStepConfig?.progress || 0}
        />

        {/* Step Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
});

