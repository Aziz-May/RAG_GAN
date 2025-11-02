import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * useAuth - Custom hook to access AuthContext
 * Provides a simpler way to use authentication context
 * 
 * @throws Error if used outside AuthProvider
 * @returns AuthContext value with user, token, and auth methods
 * 
 * @example
 * const auth = useAuth();
 * if (auth.isAuthenticated) {
 *   return <Text>Welcome {auth.user?.name}</Text>;
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
