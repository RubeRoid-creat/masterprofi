// Registration form data types

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  city: string;
  address?: string;
}

export interface SkillsInfo {
  appliances: string[];
  experienceYears: number;
  certifications: string[];
  specialties?: string[];
}

export interface LocationInfo {
  serviceArea: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  address: string;
  city: string;
  postalCode?: string;
}

export interface DocumentsInfo {
  certificates: DocumentFile[];
  portfolio: DocumentFile[];
  idDocument?: DocumentFile;
}

export interface DocumentFile {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

export interface RegistrationFormData {
  personalInfo: PersonalInfo;
  phoneVerified: boolean;
  skills: SkillsInfo;
  location: LocationInfo;
  documents: DocumentsInfo;
  termsAccepted: boolean;
}

export type RegistrationStep = 
  | 'personal'
  | 'verification'
  | 'skills'
  | 'location'
  | 'documents'
  | 'terms'
  | 'complete';

export interface StepConfig {
  id: RegistrationStep;
  title: string;
  description: string;
  progress: number;
}









