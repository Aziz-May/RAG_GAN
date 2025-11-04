import * as SecureStore from 'expo-secure-store';
import { ApiError } from '@/types';

// Backend does not use "/api" prefix; default to FastAPI root
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

export interface HttpResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * HTTP Client for communicating with FastAPI backend
 * Handles token management, error parsing, and request/response formatting
 */
class HttpClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    // Debug log to verify backend URL wiring
    try {
      // eslint-disable-next-line no-console
      console.log(`[HttpClient] Base URL: ${this.baseURL}`);
    } catch {}
  }

  /**
   * Get authorization header with bearer token
   */
  private async getAuthHeader(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[HttpClient] Error retrieving token:', error);
    }

    return headers;
  }

  /**
   * Parse error response from FastAPI
   * FastAPI returns errors with a 'detail' field
   */
  private parseError(data: any, status: number): string {
    if (typeof data === 'string') {
      return data;
    }

    // FastAPI error format: { "detail": "error message" }
    if (data?.detail) {
      return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }

    // Fallback error formats
    if (data?.error) {
      return data.error;
    }

    if (data?.message) {
      return data.message;
    }

    // HTTP status code fallback
    const statusMessages: Record<number, string> = {
      400: 'Bad request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not found',
      409: 'Conflict',
      422: 'Validation error',
      500: 'Server error',
      503: 'Service unavailable',
    };

    return statusMessages[status] || 'An error occurred';
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeader();

    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers: { ...headers, ...options.headers },
    };

    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }

    try {
      console.log(`[HttpClient] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, requestOptions);
      
      // Try to parse as JSON
      let data: any;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      // Handle non-OK responses
      if (!response.ok) {
        const errorMessage = this.parseError(data, response.status);

        // Handle 401 Unauthorized
        if (response.status === 401) {
          try {
            await SecureStore.deleteItemAsync('auth_token');
            console.log('[HttpClient] Token cleared due to 401');
          } catch (err) {
            console.error('[HttpClient] Error clearing token:', err);
          }
        }

        console.error(`[HttpClient] Error ${response.status}: ${errorMessage}`);

        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      console.error('[HttpClient] Network error:', errorMessage);

      return {
        success: false,
        error: errorMessage,
        status: 0,
      };
    }
  }

  // ========================================
  // HTTP Methods
  // ========================================

  async get<T>(endpoint: string): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string, body: any): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async delete<T>(endpoint: string): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, body: any): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }
}

export const httpClient = new HttpClient();
export default httpClient;
