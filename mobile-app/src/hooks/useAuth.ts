import { useState, useCallback } from 'react';
import { LoginFormData, AuthResponse } from '../types/auth';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginFormData): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone: data.emailOrPhone,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result: AuthResponse = await response.json();
      
      if (result.success && result.token) {
        // Store token securely
        // await SecureStore.setItemAsync('authToken', result.token);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      
      return {
        success: false,
        error: {
          type: 'network',
          message: errorMessage,
        },
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    isLoading,
    error,
  };
};









