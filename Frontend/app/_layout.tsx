import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, AuthContext } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useContext } from 'react';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const auth = useContext(AuthContext);




  if (!auth || auth.isLoading) {
    // Show loading screen while initializing
    return null;
  }

  // No root-level redirects; screens handle navigation

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Always register all route groups to avoid unmatched route during auth state transitions */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(consultant-auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(consultant-tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="messages/[clientName]"
          options={{ headerShown: false, presentation: 'card' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
