// components/card/SectionCard.tsx
import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

type SectionCardProps = {
  /** Optional title at the top of the card */
  title?: string;
  children?: ReactNode;
  /** Extra style overrides for the outer card container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Extra style overrides for the title text */
  titleStyle?: StyleProp<TextStyle>;
  footer?: ReactNode;
};

export default function SectionCard({
  title,
  children,
  containerStyle,
  titleStyle,
  footer
}: SectionCardProps) {
  return (
    <View style={[styles.card, containerStyle]}>
      {title || footer ? (
        <View style={styles.headerRow}>
          {title ? (
            <Text style={[styles.cardTitle, titleStyle]}>{title}</Text>
          ) : (
            <View />
          )}

          {footer ? <View>{footer}</View> : null}
        </View>
      ) : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
    // marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

});
