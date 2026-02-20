// app/components/ui/PageHeader.tsx
import React, { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORANGE = "#f59e0b";

interface PageHeaderProps {
  /** Main heading text or JSX */
  children: ReactNode;
  /** Optional sub-title text (small line under title) */
  subtitle?: ReactNode;
  /** Optional icon on the left side of the title (e.g. tracking icon) */
  icon?: ReactNode;
  /** Extra container styles if you need spacing overrides */
  style?: ViewStyle;
}

export default function PageHeader({
  children,
  subtitle,
  icon,
  style,
}: PageHeaderProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.headerContainer, style]}>
        <View style={styles.titleRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}

          <View style={{ flex: 1 }}>
            <Text style={styles.titleText}>{children}</Text>

            {subtitle ? (
              <Text style={styles.subtitleText}>{subtitle}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: ORANGE,
  },
  headerContainer: {
    backgroundColor: ORANGE,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    marginRight: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  subtitleText: {
    marginTop: 4,
    fontSize: 13,
    color: "#fef3c7",
  },
});
