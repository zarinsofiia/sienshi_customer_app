// app/(tabs)/me/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function MeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Me tab main screen */}
      <Stack.Screen name="index" />

      {/* Sub pages under Me */}
      <Stack.Screen name="profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
