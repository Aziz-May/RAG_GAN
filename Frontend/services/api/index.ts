/**
 * API Services - Centralized export of all API service modules
 * Each service encapsulates related endpoint calls and error handling
 */

export { authAPI, default } from './auth';
export { consultantAPI, default as consultantDefault } from './consultant';
export { clientAPI, default as clientDefault } from './client';
export { messagesAPI, Conversation, default as messagesDefault } from './messages';
export { searchAPI, SearchResult, ChatMessage, AIChatResponse, default as searchDefault } from './search';
