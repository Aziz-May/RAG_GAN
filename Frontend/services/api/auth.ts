import { AuthResponse, LoginRequest, SignupRequest, ConsultantSignupRequest, User } from '@/types';

/**
 * Generate mock user for development/testing when backend is unavailable
 */
const createMockAuthResponse = (email: string, name: string, role: 'client' | 'consultant'): AuthResponse => {
  const mockUser: User = {
    id: `mock_${role}_${Date.now()}`,
    email,
    name,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    created_at: new Date().toISOString(),
  };

  return {
    access_token: `mock_token_${Date.now()}`,
    token_type: 'bearer',
    user: mockUser,
  };
};

/**
 * Authentication API service - Development mode with mock data
 * When backend is ready, replace these functions with real API calls
 */
export const authAPI = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('[AuthAPI] Login with mock data:', credentials.email);
    return createMockAuthResponse(credentials.email, credentials.email.split('@')[0], 'client');
  },

  /**
   * Login as consultant (mock)
   */
  loginConsultant: async (credentials: LoginRequest): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('[AuthAPI] Consultant login with mock data:', credentials.email);
    return createMockAuthResponse(
      credentials.email,
      credentials.email.split('@')[0],
      'consultant'
    );
  },

  /**
   * Sign up a new client user
   */
  signupClient: async (data: SignupRequest): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('[AuthAPI] Client signup with mock data:', data.email);
    return createMockAuthResponse(data.email, data.name, 'client');
  },

  /**
   * Sign up a new consultant user
   */
  signupConsultant: async (data: ConsultantSignupRequest): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('[AuthAPI] Consultant signup with mock data:', data.email);
    return createMockAuthResponse(data.email, data.name, 'consultant');
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('[AuthAPI] Email verification with mock data');
    return { success: true };
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    // In development mode, this won't be called on startup
    throw new Error('Profile fetch not available in development mode');
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    console.log('[AuthAPI] Logout');
    // No-op in development mode
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('[AuthAPI] Password reset requested for:', email);
    return { message: 'Password reset email sent' };
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('[AuthAPI] Password reset with mock data');
    return { message: 'Password reset successful' };
  },
};

export default authAPI;
