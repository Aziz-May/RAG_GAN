import { httpClient } from '../http';
import { Message, PaginatedResponse } from '@/types';

export interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  is_online?: boolean;
}

/**
 * Messages API service - handles all messaging API calls
 * Compatible with FastAPI endpoints
 */
export const messagesAPI = {
  /**
   * Get all conversations for the current user
   * GET /api/messages/conversations?page=1&limit=20
   */
  getConversations: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Conversation>> => {
    const queryString = new URLSearchParams();
    if (params?.page) queryString.append('page', String(params.page));
    if (params?.limit) queryString.append('limit', String(params.limit));
    if (params?.search) queryString.append('search', params.search);

    const endpoint = `/messages/conversations${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    const response = await httpClient.get<PaginatedResponse<Conversation>>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch conversations');
    }
    return response.data!;
  },

  /**
   * Get messages in a conversation
   * GET /api/messages/conversations/{conversation_id}?page=1&limit=50
   */
  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Message>> => {
    const queryString = new URLSearchParams();
    if (params?.page) queryString.append('page', String(params.page));
    if (params?.limit) queryString.append('limit', String(params.limit));

    const endpoint = `/messages/conversations/${conversationId}${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    const response = await httpClient.get<PaginatedResponse<Message>>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch messages');
    }
    return response.data!;
  },

  /**
   * Send a message
   * POST /api/messages
   */
  sendMessage: async (data: {
    recipient_id: string;
    content: string;
  }): Promise<Message> => {
    const response = await httpClient.post<Message>('/messages', data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to send message');
    }
    return response.data!;
  },

  /**
   * Mark messages as read in a conversation
   * PUT /api/messages/conversations/{conversation_id}/read
   */
  markAsRead: async (conversationId: string): Promise<{ success: boolean }> => {
    const response = await httpClient.put<{ success: boolean }>(
      `/messages/conversations/${conversationId}/read`,
      {}
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark as read');
    }
    return response.data!;
  },

  /**
   * Delete a message
   * DELETE /api/messages/{message_id}
   */
  deleteMessage: async (messageId: string): Promise<{ success: boolean }> => {
    const response = await httpClient.delete<{ success: boolean }>(
      `/messages/${messageId}`
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete message');
    }
    return response.data!;
  },

  /**
   * Edit a message
   * PATCH /api/messages/{message_id}
   */
  editMessage: async (messageId: string, data: { content: string }): Promise<Message> => {
    const response = await httpClient.patch<Message>(`/messages/${messageId}`, data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to edit message');
    }
    return response.data!;
  },

  /**
   * Get unread message count
   * GET /api/messages/unread/count
   */
  getUnreadCount: async (): Promise<{ total_unread: number }> => {
    const response = await httpClient.get<{ total_unread: number }>(
      '/messages/unread/count'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch unread count');
    }
    return response.data!;
  },

  /**
   * Search messages
   * GET /api/messages/search?q=query&page=1&limit=20
   */
  searchMessages: async (query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Message>> => {
    const queryString = new URLSearchParams({ q: query });
    if (params?.page) queryString.append('page', String(params.page));
    if (params?.limit) queryString.append('limit', String(params.limit));

    const endpoint = `/messages/search?${queryString.toString()}`;
    const response = await httpClient.get<PaginatedResponse<Message>>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to search messages');
    }
    return response.data!;
  },

  /**
   * Get typing indicator status
   * GET /api/messages/conversations/{conversation_id}/typing
   */
  getTypingStatus: async (conversationId: string): Promise<{ is_typing: boolean; user_id: string }> => {
    const response = await httpClient.get<{ is_typing: boolean; user_id: string }>(
      `/messages/conversations/${conversationId}/typing`
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to get typing status');
    }
    return response.data!;
  },

  /**
   * Send typing indicator
   * POST /api/messages/conversations/{conversation_id}/typing
   */
  sendTypingIndicator: async (conversationId: string): Promise<{ success: boolean }> => {
    const response = await httpClient.post<{ success: boolean }>(
      `/messages/conversations/${conversationId}/typing`,
      {}
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to send typing indicator');
    }
    return response.data!;
  },
};

export default messagesAPI;
