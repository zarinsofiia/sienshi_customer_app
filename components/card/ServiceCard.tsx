// components/card/ServiceCard.tsx
import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ORANGE = "#f59e0b";

type ServiceCardProps = {
  iconName: string;
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function ServiceCard({
  iconName,
  label,
  onPress,
  style,
}: ServiceCardProps) {
  return (
    <TouchableOpacity
      style={[styles.serviceCard, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={iconName as any} size={28} color={ORANGE} />
      <Text style={styles.serviceLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  serviceCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F2C545",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  serviceLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: "#111827",
    textAlign: "center",
    textTransform: "uppercase",
  },
});
