// app/(tabs)/calculator/_layout.tsx

import React from "react";
import { Stack } from "expo-router";

export default function AnnouncementLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
