/**
 * RAG (Retrieval-Augmented Generation) API Service
 * 
 * Provides AI-powered parenting guidance by querying indexed documents
 * and generating contextual answers with source attribution.
 */

import httpClient from '../http';

/**
 * Source chunk returned with each answer
 */
export interface SourceChunk {
  id: string;
  text: string;
  source: string;
}

/**
 * Request payload for RAG queries
 */
export interface RAGQueryRequest {
  question: string;
  top_k?: number; // Optional: 1-10, defaults to 3
}

/**
 * Response from RAG query endpoints
 */
export interface RAGQueryResponse {
  question: string;
  answer: string;
  chunks: SourceChunk[];
  prompt?: string;
  error?: string;
}

/**
 * RAG service status information
 */
export interface RAGStatus {
  ready: boolean;
  collection?: string;
  document_count?: number;
  chroma_dir?: string;
  model?: string;
  message?: string;
  error?: string;
}

/**
 * RAG health check response
 */
export interface RAGHealth {
  service: string;
  ready: boolean;
  status: string;
}

/**
 * RAG API Service
 */
export const ragAPI = {
  /**
   * Query the RAG system with a parenting question
   * 
   * @param query - Question and optional parameters
   * @returns Answer with source attribution
   * 
   * @example
   * ```typescript
   * const result = await ragAPI.query({
   *   question: "How can I support my child's emotional development?",
   *   top_k: 3
   * });
   * console.log(result.answer);
   * ```
   */
  query: async (query: RAGQueryRequest): Promise<RAGQueryResponse> => {
    const resp = await httpClient.post<RAGQueryResponse>('/rag/query', query);
    
    if (!resp.success || !resp.data) {
      throw new Error(resp.error || 'RAG query failed');
    }
    
    return resp.data;
  },

  /**
   * Query using GET request (convenient for simple queries)
   * 
   * @param question - The parenting question
   * @param top_k - Optional number of sources to retrieve (1-10)
   * @returns Answer with source attribution
   * 
   * @example
   * ```typescript
   * const result = await ragAPI.queryGet(
   *   "What are good bedtime routines?",
   *   3
   * );
   * ```
   */
  queryGet: async (question: string, top_k?: number): Promise<RAGQueryResponse> => {
    const params = new URLSearchParams({ question });
    if (top_k !== undefined) {
      params.append('top_k', top_k.toString());
    }
    
    const resp = await httpClient.get<RAGQueryResponse>(`/rag/query?${params.toString()}`);
    
    if (!resp.success || !resp.data) {
      throw new Error(resp.error || 'RAG query failed');
    }
    
    return resp.data;
  },

  /**
   * Get RAG service status and configuration
   * 
   * @returns Service status including document count and readiness
   * 
   * @example
   * ```typescript
   * const status = await ragAPI.getStatus();
   * if (status.ready) {
   *   console.log(`${status.document_count} documents available`);
   * }
   * ```
   */
  getStatus: async (): Promise<RAGStatus> => {
    const resp = await httpClient.get<RAGStatus>('/rag/status');
    
    if (!resp.success || !resp.data) {
      throw new Error(resp.error || 'Failed to get RAG status');
    }
    
    return resp.data;
  },

  /**
   * Quick health check for RAG service
   * 
   * @returns Basic health status
   * 
   * @example
   * ```typescript
   * const health = await ragAPI.healthCheck();
   * console.log(`RAG service: ${health.status}`);
   * ```
   */
  healthCheck: async (): Promise<RAGHealth> => {
    const resp = await httpClient.get<RAGHealth>('/rag/health');
    
    if (!resp.success || !resp.data) {
      throw new Error(resp.error || 'Health check failed');
    }
    
    return resp.data;
  },
};

/**
 * Example parenting questions that work well with the RAG system
 */
export const EXAMPLE_QUESTIONS = [
  "How can I support my child's emotional development?",
  "What are effective strategies for managing toddler tantrums?",
  "How do I talk to my teenager about difficult topics?",
  "What are age-appropriate chores for a 7-year-old?",
  "How can I help my child with test anxiety?",
  "What are signs of learning difficulties in children?",
  "How do I set healthy screen time boundaries?",
  "What are good bedtime routines for young children?",
  "How can I encourage my child to be more independent?",
  "What should I do if my child is being bullied?",
];

export default ragAPI;
