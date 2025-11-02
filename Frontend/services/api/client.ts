import { httpClient } from '../http';
import { ClientProfile, Session, PaginatedResponse } from '@/types';

/**
 * Client API service - handles all client-related API calls
 * Compatible with FastAPI endpoints
 */
export const clientAPI = {
  /**
   * Get client's profile
   * GET /api/clients/me
   */
  getProfile: async (): Promise<ClientProfile> => {
    const response = await httpClient.get<ClientProfile>('/clients/me');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch profile');
    }
    return response.data!;
  },

  /**
   * Update client profile
   * PUT /api/clients/me
   */
  updateProfile: async (data: Partial<ClientProfile>): Promise<ClientProfile> => {
    const response = await httpClient.put<ClientProfile>('/clients/me', data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update profile');
    }
    return response.data!;
  },

  /**
   * Upload client documents/files
   * POST /api/clients/me/upload
   */
  uploadDocument: async (file: FormData | { filename: string; data: string }): Promise<{ file_id: string; url: string }> => {
    const response = await httpClient.post<{ file_id: string; url: string }>(
      '/clients/me/upload',
      file
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to upload document');
    }
    return response.data!;
  },

  /**
   * Get client's past sessions/consultations
   * GET /api/clients/me/sessions?status=completed&page=1&limit=10
   */
  getSessions: async (params?: {
    status?: 'upcoming' | 'completed' | 'cancelled';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Session>> => {
    const queryString = new URLSearchParams();
    if (params?.status) queryString.append('status', params.status);
    if (params?.page) queryString.append('page', String(params.page));
    if (params?.limit) queryString.append('limit', String(params.limit));

    const endpoint = `/clients/me/sessions${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    const response = await httpClient.get<PaginatedResponse<Session>>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch sessions');
    }
    return response.data!;
  },

  /**
   * Get session by ID
   * GET /api/clients/me/sessions/{session_id}
   */
  getSession: async (sessionId: string): Promise<Session> => {
    const response = await httpClient.get<Session>(`/clients/me/sessions/${sessionId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch session');
    }
    return response.data!;
  },

  /**
   * Book a session with a consultant
   * POST /api/clients/me/sessions
   */
  bookSession: async (data: {
    consultant_id: string;
    start_time: string; // ISO 8601 datetime
    duration_minutes: number;
    notes?: string;
  }): Promise<Session> => {
    const response = await httpClient.post<Session>('/clients/me/sessions', data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to book session');
    }
    return response.data!;
  },

  /**
   * Reschedule a session
   * PATCH /api/clients/me/sessions/{session_id}/reschedule
   */
  rescheduleSession: async (
    sessionId: string,
    data: { start_time: string; duration_minutes: number }
  ): Promise<Session> => {
    const response = await httpClient.patch<Session>(
      `/clients/me/sessions/${sessionId}/reschedule`,
      data
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to reschedule session');
    }
    return response.data!;
  },

  /**
   * Cancel a session
   * POST /api/clients/me/sessions/{session_id}/cancel
   */
  cancelSession: async (sessionId: string, reason?: string): Promise<{ status: string }> => {
    const response = await httpClient.post<{ status: string }>(
      `/clients/me/sessions/${sessionId}/cancel`,
      { reason }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel session');
    }
    return response.data!;
  },

  /**
   * Get client's booking history/analytics
   * GET /api/clients/me/history
   */
  getHistory: async (): Promise<{
    total_sessions: number;
    completed_sessions: number;
    upcoming_sessions: number;
    total_spent: number;
    favorite_consultant_id?: string;
  }> => {
    const response = await httpClient.get<{
      total_sessions: number;
      completed_sessions: number;
      upcoming_sessions: number;
      total_spent: number;
      favorite_consultant_id?: string;
    }>('/clients/me/history');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch history');
    }
    return response.data!;
  },

  /**
   * Rate a completed session
   * POST /api/clients/me/sessions/{session_id}/rate
   */
  rateSession: async (
    sessionId: string,
    data: { rating: number; review?: string }
  ): Promise<{ success: boolean }> => {
    const response = await httpClient.post<{ success: boolean }>(
      `/clients/me/sessions/${sessionId}/rate`,
      data
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to rate session');
    }
    return response.data!;
  },
};

export default clientAPI;
