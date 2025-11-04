import { AuthResponse, LoginRequest, SignupRequest, ConsultantSignupRequest, User } from '@/types';
import httpClient from '../http';
const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Authentication API service - Real backend integration
 */
export const authAPI = {
  /**
   * Login user with email and password
   * POST /auth/login -> { access_token, token_type }
   * GET /auth/me     -> User profile (using bearer token)
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const loginResp = await httpClient.post<{ access_token: string; token_type: string }>(
      '/auth/login',
      { email: credentials.email, password: credentials.password }
    );
    if (!loginResp.success || !loginResp.data) {
      throw new Error(loginResp.error || 'Login failed');
    }

    const token = loginResp.data.access_token;

    // Fetch profile using the freshly issued token (without relying on storage yet)
  const profileRes = await fetch(`${BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!profileRes.ok) {
      const errText = await profileRes.text();
      throw new Error(errText || 'Failed to fetch profile');
    }
    const user = (await profileRes.json()) as User;

    return {
      access_token: token,
      token_type: loginResp.data.token_type,
      user,
    };
  },

  /**
   * Login as consultant (same as login, server role in token determines permissions)
   */
  loginConsultant: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return authAPI.login(credentials);
  },

  /**
   * Sign up a new client user
   * POST /auth/signup -> UserOut
   * Then auto-login to get access token
   */
  signupClient: async (data: SignupRequest): Promise<AuthResponse> => {
    const payload = { ...data, role: 'client' as const };
    const signupResp = await httpClient.post<User>('/auth/signup', payload);
    if (!signupResp.success || !signupResp.data) {
      throw new Error(signupResp.error || 'Signup failed');
    }

    const login = await authAPI.login({ email: data.email, password: data.password });
    return login;
  },

  /**
   * Sign up a new consultant user (then auto-login)
   */
  signupConsultant: async (data: ConsultantSignupRequest): Promise<AuthResponse> => {
    const payload = { ...data, role: 'consultant' as const };
    const signupResp = await httpClient.post<User>('/auth/signup', payload);
    if (!signupResp.success || !signupResp.data) {
      throw new Error(signupResp.error || 'Consultant signup failed');
    }

    const login = await authAPI.login({ email: data.email, password: data.password });
    return login;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const resp = await httpClient.get<User>('/auth/me');
    if (!resp.success || !resp.data) {
      throw new Error(resp.error || 'Failed to fetch profile');
    }
    return resp.data;
  },

  /**
   * Logout (client-side)
   */
  logout: async (): Promise<void> => {
    // No-op for backend; token is stateless JWT
    return;
  },

  /**
   * Request password reset (placeholder if needed later)
   */
  requestPasswordReset: async (_email: string): Promise<{ message: string }> => {
    return { message: 'Not implemented' };
  },

  resetPassword: async (_token: string, _newPassword: string): Promise<{ message: string }> => {
    return { message: 'Not implemented' };
  },
};

export default authAPI;
