// Profile types

export interface MasterProfile {
  id: string;
  personalInfo: PersonalInfo;
  skills: Skill[];
  specialties: string[];
  serviceArea: ServiceArea;
  portfolio: PortfolioItem[];
  rating: Rating;
  reviews: Review[];
  availability: Availability;
  statistics: Statistics;
  certificates: Certificate[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  city: string;
  address?: string;
  bio?: string;
  languages?: string[];
}

export interface Skill {
  id: string;
  applianceType: string;
  experienceYears: number;
  certification?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface ServiceArea {
  center: {
    latitude: number;
    longitude: number;
    address: string;
  };
  radius: number; // in kilometers
  cities?: string[];
  postalCodes?: string[];
}

export interface PortfolioItem {
  id: string;
  imageUri: string;
  title?: string;
  description?: string;
  orderId?: string;
  createdAt: string;
}

export interface Rating {
  average: number;
  total: number;
  breakdown: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
}

export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  orderId: string;
  createdAt: string;
  response?: string;
  responseDate?: string;
}

export interface Availability {
  schedule: WeeklySchedule;
  isAvailable: boolean;
  timezone: string;
  exceptions?: AvailabilityException[];
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface AvailabilityException {
  id: string;
  date: string;
  isAvailable: boolean;
  reason?: string;
}

export interface Statistics {
  completedOrders: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: number; // in minutes
  completionRate: number; // percentage
  onTimeRate: number; // percentage
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  imageUri: string;
  documentUri?: string;
  verificationUrl?: string;
}








