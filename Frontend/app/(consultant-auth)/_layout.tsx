import { Stack } from 'expo-router';
import React from 'react';
import "../../global.css";

export default function ConsultantAuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}