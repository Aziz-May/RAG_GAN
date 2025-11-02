import { httpClient } from '../http';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  content: string;
  relevance_score: number;
  category: 'consultant' | 'article' | 'faq' | 'documentation';
  source_url?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatResponse {
  response: string;
  sources?: SearchResult[];
  confidence: number;
}

/**
 * Search & RAG API service - handles AI search, chat, and knowledge base queries
 * Compatible with FastAPI endpoints
 */
export const searchAPI = {
  /**
   * Search the knowledge base
   * GET /api/search?q=query&category=consultant&limit=10
   */
  search: async (query: string, params?: {
    category?: 'consultant' | 'article' | 'faq' | 'documentation';
    limit?: number;
  }): Promise<SearchResult[]> => {
    const queryString = new URLSearchParams({ q: query });
    if (params?.category) queryString.append('category', params.category);
    if (params?.limit) queryString.append('limit', String(params.limit));

    const endpoint = `/search?${queryString.toString()}`;
    const response = await httpClient.get<SearchResult[]>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Search failed');
    }
    return response.data || [];
  },

  /**
   * Get AI chat response with RAG (retrieval-augmented generation)
   * POST /api/chat/rag
   */
  chatWithRAG: async (data: {
    query: string;
    context?: ChatMessage[];
    include_sources?: boolean;
  }): Promise<AIChatResponse> => {
    const response = await httpClient.post<AIChatResponse>('/chat/rag', data);
    if (!response.success) {
      throw new Error(response.error || 'Chat request failed');
    }
    return response.data!;
  },

  /**
   * Get chat conversation history
   * GET /api/chat/history?limit=50
   */
  getChatHistory: async (limit?: number): Promise<ChatMessage[]> => {
    const queryString = new URLSearchParams();
    if (limit) queryString.append('limit', String(limit));

    const endpoint = `/chat/history${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    const response = await httpClient.get<ChatMessage[]>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch chat history');
    }
    return response.data || [];
  },

  /**
   * Clear chat history
   * DELETE /api/chat/history
   */
  clearChatHistory: async (): Promise<{ success: boolean }> => {
    const response = await httpClient.delete<{ success: boolean }>('/chat/history');
    if (!response.success) {
      throw new Error(response.error || 'Failed to clear history');
    }
    return response.data!;
  },

  /**
   * Get suggested questions based on context
   * GET /api/chat/suggestions
   */
  getSuggestedQuestions: async (): Promise<string[]> => {
    const response = await httpClient.get<string[]>('/chat/suggestions');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch suggestions');
    }
    return response.data || [];
  },

  /**
   * Get consultants by specialization or name
   * GET /api/search/consultants?q=psychology&limit=20
   */
  searchConsultants: async (query?: string, limit?: number): Promise<SearchResult[]> => {
    const queryString = new URLSearchParams();
    if (query) queryString.append('q', query);
    if (limit) queryString.append('limit', String(limit));

    const endpoint = `/search/consultants${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    const response = await httpClient.get<SearchResult[]>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to search consultants');
    }
    return response.data || [];
  },

  /**
   * Get FAQ entries
   * GET /api/search/faqs?limit=20
   */
  getFAQs: async (limit?: number): Promise<SearchResult[]> => {
    const queryString = new URLSearchParams();
    if (limit) queryString.append('limit', String(limit));

    const endpoint = `/search/faqs${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    const response = await httpClient.get<SearchResult[]>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch FAQs');
    }
    return response.data || [];
  },

  /**
   * Get articles/resources
   * GET /api/search/articles?category=mental-health&limit=20
   */
  getArticles: async (params?: {
    category?: string;
    limit?: number;
  }): Promise<SearchResult[]> => {
    const queryString = new URLSearchParams();
    if (params?.category) queryString.append('category', params.category);
    if (params?.limit) queryString.append('limit', String(params.limit));

    const endpoint = `/search/articles${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    const response = await httpClient.get<SearchResult[]>(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch articles');
    }
    return response.data || [];
  },
};

export default searchAPI;
