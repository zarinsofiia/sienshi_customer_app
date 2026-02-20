// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "../../contexts/LanguageContext";

const ORANGE = "#f59e0b";

function CircleIcon({
  focused,
  iconOn,
  iconOff,
  color,
  size,
}: {
  focused: boolean;
  iconOn: React.ComponentProps<typeof Ionicons>["name"];
  iconOff: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  size: number;
}) {
  if (!focused) {
    return <Ionicons name={iconOff as any} color={color} size={size} />;
  }

  return (
    <View style={styles.activeCircle}>
      <Ionicons name={iconOn as any} color={ORANGE} size={size} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const BASE_TAB_HEIGHT = 56;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: "#33302e9c",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          borderRadius:16,
          borderTopWidth: 1,
          height: BASE_TAB_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom || 4,
          paddingTop: 4,
          marginBottom: 10
        },
      }}
    >
      {/* DASHBOARD */}
      <Tabs.Screen
        name="dashboard/index"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/dashboard");
          },
        }}
        options={{
          title: t("tab_home"),
          tabBarIcon: ({ color, size, focused }) => (
            <CircleIcon
              focused={focused}
              iconOn="home"
              iconOff="home-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* TRACKING STACK */}
      <Tabs.Screen
        name="tracking"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/tracking");
          },
        }}
        options={{
          title: t("tab_tracking") || "Tracking",
          tabBarIcon: ({ color, size, focused }) => (
            <CircleIcon
              focused={focused}
              iconOn="map"
              iconOff="map-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* Hidden routes */}
      <Tabs.Screen name="parcel" options={{ href: null }} />
      <Tabs.Screen name="calculator" options={{ href: null }} />
      <Tabs.Screen name="shipment" options={{ href: null }} />
      <Tabs.Screen name="announcement" options={{ href: null }} />
      <Tabs.Screen name="payment" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />

      {/* USER / ACCOUNT */}
      <Tabs.Screen
        name="me"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/me");
          },
        }}
        options={{
          title: t("tab_me"),
          tabBarIcon: ({ color, size, focused }) => (
            <CircleIcon
              focused={focused}
              iconOn="person"
              iconOff="person-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeCircle: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    alignItems: "center",
    justifyContent: "center",
  },
});
