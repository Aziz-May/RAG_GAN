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

  // If we have a token but user isn't hydrated (dev/mock), send to client tabs by default
  if (auth.token) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href={ROUTES.AUTH.LOGIN as any} />;
}
