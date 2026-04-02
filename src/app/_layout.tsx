import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { colours } from '@/theme/colours';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in and not on auth screens — redirect to onboarding
      router.replace('/(auth)/onboarding');
    }
    // Do NOT redirect if authenticated — let normal navigation work
  }, [isAuthenticated, segments]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colours.bg },
          animation: 'slide_from_right',
        }}
      />
    </View>
  );
}
