import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/services/api';
import { storageService } from '@/services/storage';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is already authenticated
        const token = await storageService.getAuthToken();
        const userData = await storageService.getUserData();

        if (token && userData) {
          // Restore session
          apiService.setToken(token);

          // Only navigate if we're on the login screen
          if (!segments || segments[0] === 'login') {
            router.replace('/patients');
          }
        } else {
          // Navigate to login if not authenticated and not already there
          if (segments && segments[0] !== 'login') {
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        router.replace('/login');
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="patients" options={{ headerShown: false }} />
        <Stack.Screen
          name="patient/[id]"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
