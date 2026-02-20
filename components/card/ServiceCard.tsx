// components/card/ServiceCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
const ORANGE = "#f59e0b";

type ServiceCardProps = {
  iconName?: string;
  iconPng?: ImageSourcePropType,
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function ServiceCard({
  iconName,
  iconPng,
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

      {iconPng ? (
        <Image source={iconPng} style={styles.pngIcon} resizeMode="contain" />
      ) : (
        <Ionicons name={iconName as any} size={28} color={ORANGE} />
      )}


      <Text style={styles.serviceLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  serviceCard: {
    // flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F2C545",
    alignItems: "center",

  },
  serviceLabel: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Karla-Bold",
    color: "#E89923",
    textAlign: "center",
    textTransform: "uppercase",
  },
   pngIcon: {
    width: 28,
    height: 28,
  },
});
