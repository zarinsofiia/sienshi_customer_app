// components/card/DetailCard.tsx
import React, { ReactNode } from "react";
import {
  TouchableOpacity,
  View,
  ViewStyle,
  StyleProp,
  StyleSheet,
} from "react-native";

type DetailCardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function DetailCard({ children, onPress, style }: DetailCardProps) {
  const Wrapper: any = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
});
