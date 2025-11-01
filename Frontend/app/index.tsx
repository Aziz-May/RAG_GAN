import { Redirect } from 'expo-router';

export default function Index() {
  // Check if user is authenticated (placeholder logic)
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href={"/(tabs)" as any} />;
  }

  return <Redirect href={"/(auth)/login" as any} />;
}
