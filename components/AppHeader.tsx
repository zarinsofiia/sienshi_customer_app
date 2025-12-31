// components/AppHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLanguage } from "../contexts/LanguageContext";

type AppHeaderProps = {
  // either pass a raw title OR a translation key
  title?: string;
  titleKey?: string; // e.g. "header_dashboard"
  showBack?: boolean;          // show back button on left
  showNotification?: boolean;  // show notification icon on right (e.g. Dashboard)
  onBack?: () => void;         // optional custom back handler
};

export function AppHeader({
  title,
  titleKey,
  showBack = false,
  showNotification = false,
  onBack,
}: AppHeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const rawTitle = titleKey ? t(titleKey as any) : title ?? "";
  const upperTitle = rawTitle.toUpperCase();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    // default behaviour: go to dashboard root with replace
    router.replace("/dashboard" as any);
  };

  return (
    <View style={styles.container}>
      {/* LEFT SIDE (back button) */}
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* CENTER TITLE */}
      <View style={styles.center}>
        <Text style={styles.title}>{upperTitle}</Text>
      </View>

      {/* RIGHT SIDE (notification) */}
      <View style={[styles.side, styles.rightSide]}>
        {showNotification && (
          <TouchableOpacity
            onPress={() => {
              // TODO: navigate to notification screen later
              console.log("Notification pressed");
            }}
            style={styles.iconButton}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color="#ffffffff"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#f59e0b",
    borderBottomWidth: 1,
  },
  side: {
    width: 40, // fixed width so center stays centered
    alignItems: "flex-start",
    justifyContent: "center",
  },
  rightSide: {
    alignItems: "flex-end",
  },
  iconButton: {
    padding: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "Karla-ExtraBold",
    fontWeight: "900",
    color: "#ffffffff",
    textAlign: "center",
  },
});
