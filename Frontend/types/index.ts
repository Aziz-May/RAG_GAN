// ============================================
// USER TYPES (Compatible with FastAPI schemas)
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'consultant';
  avatar?: string;
  created_at: string;
}

export interface ClientProfile extends User {
  school?: string;
  dream_job?: string;
  bio?: string;
  phone?: string;
}

export interface ConsultantProfile extends User {
  specialization: string;
  experience: number;
  license_number: string;
  biography: string;
  rating: number;
  available: boolean;
  verified: boolean;
}

// ============================================
// AUTHENTICATION TYPES
// ============================================

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'consultant';
}

export interface ConsultantSignupRequest extends SignupRequest {
  license_number: string;
  specialization: string;
  years_of_experience: string;
  biography: string;
}

// ============================================
// CONSULTANT TYPES
// ============================================

export interface Consultant {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  available: boolean;
  bio: string;
  verified: boolean;
}

// ============================================
// SESSION TYPES
// ============================================

export interface Session {
  id: string;
  client_id: string;
  consultant_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
}

// ============================================
// API RESPONSE TYPES (FastAPI compliant)
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiError {
  detail: string; // FastAPI default error field
}

// ============================================
// CONTEXT TYPES
// ============================================

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  signupConsultant: (data: ConsultantSignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// ============================================
// FORM TYPES
// ============================================

export interface FormErrors {
  [key: string]: string;
}

export interface UseFormState<T> {
  values: T;
  errors: FormErrors;
  touched: { [key: string]: boolean };
  isSubmitting: boolean;
  setValues: (values: T | ((prev: T) => T)) => void;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  setErrors: (errors: FormErrors) => void;
  resetForm: () => void;
}

// ============================================
// ASYNC OPERATION TYPES
// ============================================

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: () => Promise<T>;
  reset: () => void;
}
