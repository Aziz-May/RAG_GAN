import { router } from 'expo-router';
import { User } from '@/types';
import { USER_ROLES, ROUTES } from '@/utils/constants';

/**
 * Auth navigation service - Centralized routing logic
 * Handles all navigation after login/signup based on user role
 */

/**
 * Navigate user to appropriate home page based on role
 */
export const navigateToHome = (user: User) => {
  if (user.role === USER_ROLES.CONSULTANT) {
    router.replace(ROUTES.CONSULTANT_TABS.INDEX as any);
  } else {
    router.replace(ROUTES.TABS.INDEX as any);
  }
};

/**
 * Navigate user to appropriate login page
 */
export const navigateToLogin = (role: 'client' | 'consultant' = 'client') => {
  if (role === USER_ROLES.CONSULTANT) {
    router.replace(ROUTES.AUTH.CONSULTANT_LOGIN as any);
  } else {
    router.replace(ROUTES.AUTH.LOGIN as any);
  }
};

/**
 * Navigate user to appropriate signup page
 */
export const navigateToSignup = (role: 'client' | 'consultant' = 'client') => {
  if (role === USER_ROLES.CONSULTANT) {
    router.replace(ROUTES.AUTH.CONSULTANT_SIGNUP as any);
  } else {
    router.replace(ROUTES.AUTH.SIGNUP as any);
  }
};

/**
 * Navigate from signup to login (when user clicks "already have account")
 */
export const navigateToSignupComplete = () => {
  // Show confirmation, then navigate to appropriate login
  router.replace(ROUTES.AUTH.LOGIN as any);
};

/**
 * Navigate from consultant signup to login after application submitted
 */
export const navigateToConsultantApplicationPending = () => {
  // Could show a pending approval screen if needed
  router.replace(ROUTES.AUTH.CONSULTANT_LOGIN as any);
};

/**
 * Redirect to auth if user tries to access protected route
 */
export const redirectToAuth = () => {
  router.replace(ROUTES.AUTH.LOGIN as any);
};

/**
 * Handle logout and cleanup
 */
export const handleLogout = async () => {
  // Clear any cached data
  // Token is already cleared by AuthContext
  router.replace(ROUTES.AUTH.LOGIN as any);
};

export default {
  navigateToHome,
  navigateToLogin,
  navigateToSignup,
  navigateToSignupComplete,
  navigateToConsultantApplicationPending,
  redirectToAuth,
  handleLogout,
};
