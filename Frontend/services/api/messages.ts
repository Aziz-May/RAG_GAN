import { httpClient } from '../http';

// Backend-aligned DTOs (FastAPI)
export interface BackendConversation {
  other_user_id: string;
  other_user_name: string;
  other_user_role: string;
  last_message?: string | null;
  last_message_time?: string | null; // ISO string from FastAPI
  unread_count: number;
}

export interface BackendMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string; // ISO string
  is_read: boolean;
}

/**
 * Messages API service wired to FastAPI backend routes
 */
export const messagesAPI = {
  // GET /messages/conversations
  listConversations: async (): Promise<BackendConversation[]> => {
    const res = await httpClient.get<BackendConversation[]>(`/messages/conversations`);
    if (!res.success) throw new Error(res.error || 'Failed to fetch conversations');
    return res.data || [];
  },

  // GET /messages/conversation/{other_user_id}
  getConversation: async (otherUserId: string): Promise<BackendMessage[]> => {
    const res = await httpClient.get<BackendMessage[]>(`/messages/conversation/${otherUserId}`);
    if (!res.success) throw new Error(res.error || 'Failed to fetch conversation');
    return res.data || [];
  },

  // POST /messages/send
  sendMessage: async (payload: { recipient_id: string; content: string }): Promise<BackendMessage> => {
    const res = await httpClient.post<BackendMessage>(`/messages/send`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to send message');
    return res.data!;
  },

  // GET /messages/unread-count
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const res = await httpClient.get<{ unread_count: number }>(`/messages/unread-count`);
    if (!res.success) throw new Error(res.error || 'Failed to get unread count');
    return res.data!;
  },

  // PUT /messages/{message_id}/read
  markMessageRead: async (messageId: string): Promise<{ status: string; message: string }> => {
    const res = await httpClient.put<{ status: string; message: string }>(`/messages/${messageId}/read`, {});
    if (!res.success) throw new Error(res.error || 'Failed to mark message read');
    return res.data!;
  },
};

export default messagesAPI;
