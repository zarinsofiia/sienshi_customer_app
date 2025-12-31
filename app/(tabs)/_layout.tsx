// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const BASE_TAB_HEIGHT = 56;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          borderTopWidth: 1,
          height: BASE_TAB_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom || 4,
          paddingTop: 4,
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
            <Ionicons
              name={focused ? "home" : "home-outline"}
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
            <Ionicons
              name={focused ? "map" : "map-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* PARCEL TAB (HIDDEN FOR NOW) */}
      {/* Remove the visible tab button */}
      {/*
      <Tabs.Screen
        name="parcel"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/parcel");
          },
        }}
        options={{
          title: t("tab_parcel") || "Parcel",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      */}

      {/* Keep parcel route available but hidden from tab bar */}
      <Tabs.Screen
        name="parcel"
        options={{
          href: null,
        }}
      />

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
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
