import React from 'react';
import { Stack } from 'expo-router';

export default function DesignLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="step1-dimensions" />
      <Stack.Screen name="step2-photo" />
      <Stack.Screen name="step3-brand" />
      <Stack.Screen name="step4-options" />
      <Stack.Screen 
        name="generating" 
        options={{ animation: 'fade' }} 
      />
      <Stack.Screen name="gallery" />
      <Stack.Screen name="design-detail" />
      <Stack.Screen name="compare" />
      <Stack.Screen name="approval" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
