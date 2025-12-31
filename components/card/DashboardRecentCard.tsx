// components/card/DashboardRecentCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ListingCard from "./ListingCard";

const ORANGE = "#f59e0b";

type DashboardRecentCardProps = {
  trackingId: string;
  fromLabel: string;
  toLabel: string;
  status: string;
  iconName?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export default function DashboardRecentCard({
  trackingId,
  fromLabel,
  toLabel,
  status,
  iconName = "boat",
  style,
  onPress,
}: DashboardRecentCardProps) {
  return (
    <ListingCard style={[styles.card, style]} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.tracking}>{trackingId}</Text>
          <Text style={styles.meta}>From: {fromLabel}</Text>
          <Text style={styles.meta}>To: {toLabel}</Text>
        </View>

        <View style={styles.right}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconName as any} size={24} color="#ffffff" />
          </View>
          <Text style={styles.status}>{status}</Text>
        </View>
      </View>
    </ListingCard>
  );
}

const styles = StyleSheet.create({
  // override ListingCard’s pale bg/border
  card: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  tracking: {
    fontSize: 12,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
    marginBottom: 4,
  },
  meta: {
    fontSize: 11,
    fontFamily: "Karla-Regular",
    color: "#ffffffff", 
  },
  right: {
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  status: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: "Karla-Bold",
    color: "#ffffff",
  },
});
