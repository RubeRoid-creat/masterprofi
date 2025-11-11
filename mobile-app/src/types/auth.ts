export interface LoginFormData {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
}

export interface ErrorMessage {
  type: 'network' | 'validation' | 'auth' | 'general';
  message: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  error?: ErrorMessage;
}

export interface BiometricAuth {
  available: boolean;
  type: 'Face ID' | 'Fingerprint' | 'Iris' | null;
}









