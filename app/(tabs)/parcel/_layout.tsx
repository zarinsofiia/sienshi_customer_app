// app/(tabs)/parcel/_layout.tsx

import React from "react";
import { Stack } from "expo-router";

export default function ParcelLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="detail" />
    </Stack>
  );
}
