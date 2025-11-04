import { httpClient } from '../http';
import { Consultant, Session, Message, PaginatedResponse } from '@/types';

export interface ConsultantListItem {
  id: string;
  name: string;
  email: string;
  role: string; // 'consultant'
  bio?: string;
}

/**
 * Consultant API service - handles all consultant-related API calls
 * Compatible with FastAPI endpoints
 */
export const consultantAPI = {
  /**
   * Lightweight list of consultants from backend
   * GET /consultant/list
   */
  listBasic: async (): Promise<ConsultantListItem[]> => {
    const res = await httpClient.get<ConsultantListItem[]>(`/consultant/list`);
    if (!res.success) throw new Error(res.error || 'Failed to fetch consultants');
    return res.data || [];
  },
  /**
   * Get all consultants with optional filters
   * GET /api/consultants?specialization=&page=1&limit=10
   */
  getAll: async (params?: {
    specialization?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Consultant>> => {
    const queryString = new URLSearchParams();
    if (params?.specialization) queryString.append('specialization', params.specialization);
    if (params?.page) queryString.append('page', String(params.page));
    if (params?.limit) queryString.append('limit', String(params.limit));

    const endpoint = `/consultants${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    const response = await httpClient.get<PaginatedResponse<Consultant>>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch consultants');
    }
    return response.data!;
  },

  /**
   * Get consultant by ID
   * GET /api/consultants/{consultant_id}
   */
  getById: async (id: string): Promise<Consultant> => {
    const response = await httpClient.get<Consultant>(`/consultants/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch consultant');
    }
    return response.data!;
  },

  /**
   * Get current consultant's profile
   * GET /api/consultants/me
   */
  getProfile: async (): Promise<Consultant> => {
    const response = await httpClient.get<Consultant>('/consultants/me');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch profile');
    }
    return response.data!;
  },

  /**
   * Update consultant profile
   * PUT /api/consultants/me
   */
  updateProfile: async (data: Partial<Consultant>): Promise<Consultant> => {
    const response = await httpClient.put<Consultant>('/consultants/me', data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update profile');
    }
    return response.data!;
  },

  /**
   * Get consultant's sessions
   * GET /api/consultants/me/sessions?status=upcoming
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

    const endpoint = `/consultants/me/sessions${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    const response = await httpClient.get<PaginatedResponse<Session>>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch sessions');
    }
    return response.data!;
  },

  /**
   * Get session by ID
   * GET /api/consultants/me/sessions/{session_id}
   */
  getSession: async (sessionId: string): Promise<Session> => {
    const response = await httpClient.get<Session>(`/consultants/me/sessions/${sessionId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch session');
    }
    return response.data!;
  },

  /**
   * Update session
   * PUT /api/consultants/me/sessions/{session_id}
   */
  updateSession: async (sessionId: string, data: Partial<Session>): Promise<Session> => {
    const response = await httpClient.put<Session>(`/consultants/me/sessions/${sessionId}`, data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update session');
    }
    return response.data!;
  },

  /**
   * Get consultant's availability
   * GET /api/consultants/me/availability
   */
  getAvailability: async (): Promise<{ available: boolean; reason?: string }> => {
    const response = await httpClient.get<{ available: boolean; reason?: string }>(
      '/consultants/me/availability'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch availability');
    }
    return response.data!;
  },

  /**
   * Update consultant's availability
   * PUT /api/consultants/me/availability
   */
  updateAvailability: async (available: boolean): Promise<{ available: boolean }> => {
    const response = await httpClient.put<{ available: boolean }>(
      '/consultants/me/availability',
      { available }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to update availability');
    }
    return response.data!;
  },
};

export default consultantAPI;
