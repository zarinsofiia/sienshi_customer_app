// app/(tabs)/tracking/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function TrackingStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="detail" />
    </Stack>
  );
}
