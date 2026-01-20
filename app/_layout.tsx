// app/_layout.tsx
import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import {
  useFonts,
  Karla_400Regular,
  Karla_500Medium,
  Karla_700Bold,
  Karla_800ExtraBold,
} from "@expo-google-fonts/karla";
import { LanguageProvider } from "../contexts/LanguageContext";
import Toast from "react-native-toast-message";

// ✅ add this
import * as Notifications from "expo-notifications";

// ✅ Show notification banners even when app is open (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,

    // ✅ required by newer expo-notifications types
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Karla-Regular": Karla_400Regular,
    "Karla-Medium": Karla_500Medium,
    "Karla-Bold": Karla_700Bold,
    "Karla-ExtraBold": Karla_800ExtraBold,
  });

  // ✅ Tap listener (optional but useful for testing)
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const data = res.notification.request.content.data as any;
      console.log("Tapped notification data:", data);

      // optional navigation test
      if (data?.screen === "dashboard") {
        router.push("/dashboard");
      }
    });

    return () => sub.remove();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <Toast />
    </LanguageProvider>
  );
}
