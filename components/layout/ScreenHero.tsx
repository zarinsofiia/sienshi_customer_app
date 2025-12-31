// components/layout/ScreenHero.tsx
import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

const DEFAULT_ORANGE = "#f59e0b";

// 🔒 single source of truth for hero height
export const HERO_HEIGHT = 150; // tweak this number
export const HERO_RADIUS = 50;

type ScreenHeroProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
};

export default function ScreenHero({
  title,
  subtitle,
  children,
  backgroundColor = DEFAULT_ORANGE,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
}: ScreenHeroProps) {
  return (
    <View style={[styles.hero, { backgroundColor }, style]}>
      {(title || subtitle) && (
        <View style={styles.titleBlock}>
          {title ? (
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          ) : null}
          {subtitle ? (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          ) : null}
        </View>
      )}

      {children ? (
        <View style={[styles.childrenBlock, contentStyle]}>{children}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: HERO_HEIGHT,               // ⬅️ fixed height
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    borderBottomLeftRadius: HERO_RADIUS,
    borderBottomRightRadius: HERO_RADIUS,
  },
  titleBlock: {
    marginTop: 4,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
    letterSpacing: 1,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: "Karla-Medium",
    color: "#fef3c7",
    textAlign: "center",
  },
  childrenBlock: {
    marginTop: 16,
  },
});
