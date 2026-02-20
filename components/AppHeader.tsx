// components/AppHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLanguage } from "../contexts/LanguageContext";

type AppHeaderProps = {
  title?: string;
  titleKey?: string;
  showBack?: boolean;
  showNotification?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onBack?: () => void;

  // ✅ overrides
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  leftIconColor?: string;
  rightIconColor?: string;
  // ✅ custom right action (e.g. QR button)
  rightAction?: React.ReactNode;

};

export function AppHeader({
  title,
  titleKey,
  showBack = false,
  showNotification = false,
  notificationCount = 0,
  onNotificationPress,
  onBack,

  containerStyle,
  titleStyle,
  leftIconColor = "#ffffff",
  rightIconColor = "#ffffff",
  rightAction,
}: AppHeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const rawTitle = titleKey ? t(titleKey as any) : title ?? "";
  const upperTitle = rawTitle.toUpperCase();

  const handleBack = () => {
    if (onBack) return onBack();
    router.replace("/dashboard" as any);
  };

  const handleNotification = () => {
    if (onNotificationPress) onNotificationPress();
    else router.push("/notifications" as any);
  };
  const count = Number.isFinite(notificationCount) ? notificationCount : 0;
  const showBadge = showNotification && count > 0;
  const badgeText = count > 99 ? "99+" : String(count);


  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={20} color={leftIconColor} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        <Text style={[styles.title, titleStyle]}>{upperTitle}</Text>
      </View>

      <View style={[styles.side, styles.rightSide]}>
        {rightAction ? (
          rightAction
        ) : showNotification ? (
          <TouchableOpacity onPress={handleNotification} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#E89923" />

            {showBadge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {badgeText}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ) : null}
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
    fontSize: 18,
    fontFamily: "Karla-ExtraBold",
    fontWeight: "900",
    color: "#ffffffff",
    textAlign: "center",
  },
  // ✅ badge
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
  },
});
