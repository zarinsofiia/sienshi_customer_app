// app/(tabs)/calculator/_layout.tsx

import React from "react";
import { Stack } from "expo-router";

export default function CalculatorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
