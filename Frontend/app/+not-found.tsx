import React, { useContext } from 'react';
import { Redirect } from 'expo-router';
import { AuthContext } from '@/contexts/AuthContext';

export default function NotFound() {
  const auth = useContext(AuthContext);

  if (!auth || auth.isLoading) return null;

  if (auth.isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
