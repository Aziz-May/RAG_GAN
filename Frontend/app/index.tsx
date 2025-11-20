import React, { useContext } from 'react';
import { Redirect } from 'expo-router';
import { AuthContext } from '@/contexts/AuthContext';
import { USER_ROLES, ROUTES } from '@/utils/constants';

export default function Index() {
  const auth = useContext(AuthContext);

  if (!auth || auth.isLoading) return null;

  // If fully authenticated with a user, route by role
  if (auth.isAuthenticated && auth.user) {
    const href = auth.user.role === USER_ROLES.CONSULTANT ? '/(consultant-tabs)' : '/(tabs)';
    return <Redirect href={href} />;
  }

  // If we have a token but no user yet, wait for user to be loaded
  // This prevents routing to wrong tabs during hydration
  if (auth.token && !auth.user) {
    return null; // Wait for user to load
  }

  return <Redirect href={ROUTES.AUTH.LOGIN as any} />;
}
