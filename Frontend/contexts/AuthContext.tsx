import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '@/services/api/auth';
import { User, SignupRequest, ConsultantSignupRequest } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Methods
  login: (email: string, password: string) => Promise<void>;
  loginConsultant: (email: string, password: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  signupConsultant: (data: ConsultantSignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
  updateProfile: (patch: Partial<User>) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Try to restore token from SecureStore
        const storedToken = await SecureStore.getItemAsync('auth_token');
        const storedUser = await SecureStore.getItemAsync('auth_user');
        
        if (storedToken) {
          setToken(storedToken);
          
          // In development mode with mock API, we can't fetch profile
          // Just skip profile fetch and keep the token
          console.log('Token restored from storage');
          // Restore user if available
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser) as User;
              setUser(parsed);
            } catch (e) {
              console.warn('Failed to parse stored user');
            }
          }
          // In production, you would call getProfile() here
          // For now, we'll just validate that the token exists
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authAPI.login({ email, password });
      
      // Store token
      await SecureStore.setItemAsync('auth_token', response.access_token);
      setToken(response.access_token);
      
      // Set user (if included in response)
      if (response.user) {
        setUser(response.user);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(response.user));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginConsultant = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authAPI.loginConsultant({ email, password });

      await SecureStore.setItemAsync('auth_token', response.access_token);
      setToken(response.access_token);

      if (response.user) {
        setUser(response.user);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(response.user));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authAPI.signupClient(data);
      
      // Store token
      await SecureStore.setItemAsync('auth_token', response.access_token);
      setToken(response.access_token);
      
      // Set user
      if (response.user) {
        setUser(response.user);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(response.user));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signupConsultant = async (data: ConsultantSignupRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authAPI.signupConsultant(data);
      
      // Store token
      await SecureStore.setItemAsync('auth_token', response.access_token);
      setToken(response.access_token);
      
      // Set user
      if (response.user) {
        setUser(response.user);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(response.user));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Consultant signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call backend logout if available
      try {
        await authAPI.logout();
      } catch (err) {
        console.log('Backend logout failed, proceeding with client-side logout');
      }
      
      // Clear local state and storage
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
      setToken(null);
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Persist in SecureStore so it survives reloads
    try {
      SecureStore.setItemAsync('auth_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Failed to persist updated user', e);
    }
  };

  // Convenience: update profile via API and persist
  const updateProfile = async (patch: Partial<User>) => {
    try {
      setIsLoading(true);
      const updated = await authAPI.updateProfile(patch);
      setUser(updated);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(updated));
      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    error,
    login,
    loginConsultant,
    signup,
    signupConsultant,
    logout,
    clearError,
    updateUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
