// components/card/ListingCard.tsx
import React, { ReactNode } from "react";
import {
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  StyleSheet,
  View,
} from "react-native";

const LISTING_PRIMARY = "#F2C545";

type ListingCardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function ListingCard({
  children,
  onPress,
  style,
}: ListingCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View>{children}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 1)", // soft tint using F2C545
    borderColor: LISTING_PRIMARY,            // main border color
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
});
