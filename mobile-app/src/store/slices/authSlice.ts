import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { sessionService } from '../../services/sessionService';
import { remoteWipeService } from '../../services/remoteWipeService';
import { encryptionService } from '../../services/encryptionService';

// Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'client' | 'master' | 'admin';
  avatar?: string;
  verified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface BiometricSettings {
  enabled: boolean;
  type: 'fingerprint' | 'face' | 'iris' | null;
  lastUsed?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  biometric: BiometricSettings;
  rememberMe: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  tokenExpiry: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  biometric: {
    enabled: false,
    type: null,
  },
  rememberMe: false,
};

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (
    credentials: { emailOrPhone: string; password: string; rememberMe?: boolean },
    { rejectWithValue }
  ) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: credentials.emailOrPhone,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Initialize security services
      await encryptionService.initialize(data.user.id);
      sessionService.initialize();
      remoteWipeService.initialize(data.user.id);
      
      // Store tokens securely
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('refresh_token', data.refreshToken);
      if (credentials.rememberMe) {
        // Store user data securely
        await encryptionService.encryptAndStore('user_data', data.user);
      }

      return {
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || 3600, // Default 1 hour
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Call logout API endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // End security services
      sessionService.endSession();
      remoteWipeService.stop();
      
      // Clear encryption keys
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          await encryptionService.clearKey(user.id);
        } catch (e) {
          // Ignore errors
        }
      }
      
      // Clear storage
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'biometric_enabled',
      ]);

      return null;
    } catch (error: any) {
      // Still logout even if API call fails
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'biometric_enabled',
      ]);
      return null;
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return rejectWithValue('Token refresh failed');
      }

      const data = await response.json();

      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('refresh_token', data.refreshToken);

      return {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || 3600,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const checkBiometricSupport = createAsyncThunk(
  'auth/checkBiometricSupport',
  async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricType: 'fingerprint' | 'face' | 'iris' | null = null;
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'face';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'fingerprint';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'iris';
    }

    return {
      compatible,
      enrolled,
      type: biometricType,
    };
  }
);

export const authenticateWithBiometric = createAsyncThunk(
  'auth/authenticateWithBiometric',
  async (_, { rejectWithValue }) => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        return rejectWithValue('Biometric authentication failed');
      }

      // Load stored credentials
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (!token || !userData) {
        return rejectWithValue('No stored credentials found');
      }

      return {
        token,
        user: JSON.parse(userData),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Biometric authentication error');
    }
  }
);

export const loadPersistedAuth = createAsyncThunk(
  'auth/loadPersistedAuth',
  async () => {
    const [token, refreshToken, userData, biometricEnabled] = await Promise.all([
      AsyncStorage.getItem('auth_token'),
      AsyncStorage.getItem('refresh_token'),
      AsyncStorage.getItem('user_data'),
      AsyncStorage.getItem('biometric_enabled'),
    ]);

    if (token && userData) {
      const user = JSON.parse(userData);
      return {
        user,
        token,
        refreshToken: refreshToken || null,
        biometricEnabled: biometricEnabled === 'true',
      };
    }

    return null;
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken?: string; expiresIn?: number }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      
      // Set token expiry
      if (action.payload.expiresIn) {
        state.tokenExpiry = Date.now() + action.payload.expiresIn * 1000;
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Persist updated user
        AsyncStorage.setItem('user_data', JSON.stringify(state.user));
      }
    },
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometric.enabled = action.payload;
      AsyncStorage.setItem('biometric_enabled', action.payload ? 'true' : 'false');
      if (action.payload) {
        state.biometric.lastUsed = new Date().toISOString();
      }
    },
    setBiometricType: (state, action: PayloadAction<'fingerprint' | 'face' | 'iris' | null>) => {
      state.biometric.type = action.payload;
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
        state.tokenExpiry = Date.now() + action.payload.expiresIn * 1000;
        state.user.lastLoginAt = new Date().toISOString();
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.tokenExpiry = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.biometric.enabled = false;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpiry = Date.now() + action.payload.expiresIn * 1000;
      })
      .addCase(refreshToken.rejected, (state) => {
        // Token refresh failed - logout user
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.tokenExpiry = null;
        state.isAuthenticated = false;
      });

    // Check Biometric Support
    builder
      .addCase(checkBiometricSupport.fulfilled, (state, action) => {
        if (action.payload.compatible && action.payload.enrolled) {
          state.biometric.type = action.payload.type;
        }
      });

    // Authenticate with Biometric
    builder
      .addCase(authenticateWithBiometric.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authenticateWithBiometric.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.biometric.lastUsed = new Date().toISOString();
      })
      .addCase(authenticateWithBiometric.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load Persisted Auth
    builder
      .addCase(loadPersistedAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadPersistedAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          state.biometric.enabled = action.payload.biometricEnabled;
        }
        state.isInitialized = true;
      })
      .addCase(loadPersistedAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      });
  },
});

export const {
  setCredentials,
  clearCredentials,
  setLoading,
  setInitialized,
  setError,
  updateUser,
  setBiometricEnabled,
  setBiometricType,
  setRememberMe,
} = authSlice.actions;

export default authSlice.reducer;
