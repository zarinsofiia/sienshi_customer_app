// app/(tabs)/payment/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function PaymentStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
