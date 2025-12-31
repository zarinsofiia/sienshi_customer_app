// app/(tabs)/parcel/detail.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AppHeader } from "../../../components/AppHeader";
import ScreenHero from "../../../components/layout/ScreenHero";
import SectionCard from "../../../components/card/SectionCard";

const ORANGE = "#f59e0b";

type ParcelItem = {
  id: string;
  trackingId: string;
  customerName: string;
  status: string;
  statusColor: string;
  statusBg: string;
  fromCity: string;
  toCity: string;
};

const MOCK_PARCELS: ParcelItem[] = [
  {
    id: "1",
    trackingId: "TRK123887349AS83",
    customerName: "Mei Tan",
    status: "IN TRANSIT",
    statusColor: "#0284c7",
    statusBg: "#e0f2fe",
    fromCity: "Kuching, Sarawak",
    toCity: "Pulau Pinang, Malaysia",
  },
  {
    id: "2",
    trackingId: "TRK123889123WQ11",
    customerName: "Ali Bin Abu",
    status: "OUT FOR DELIVERY",
    statusColor: "#f97316",
    statusBg: "#ffedd5",
    fromCity: "Sabah, Malaysia",
    toCity: "Johor, Malaysia",
  },
  {
    id: "3",
    trackingId: "TRK123882098DS21",
    customerName: "Chen Wei",
    status: "DELIVERED",
    statusColor: "#16a34a",
    statusBg: "#dcfce7",
    fromCity: "Bau, Sarawak",
    toCity: "Negeri Sembilan, Malaysia",
  },
];

export default function ParcelDetailScreen() {
  const router = useRouter();
  const { id, backTo } = useLocalSearchParams<{
    id?: string;
    backTo?: string;
  }>();

  const item =
    MOCK_PARCELS.find((p) => p.id === id) ?? MOCK_PARCELS[0];

  const handleBack = () => {
    if (backTo) {
      router.replace(backTo as any);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader
        title="Parcel Details"
        showBack
        onBack={handleBack}
      />

      {/* ORANGE HERO */}
      <ScreenHero
        backgroundColor={ORANGE}
        style={styles.hero}
        contentStyle={styles.heroContent}
      >
        <Text style={styles.heroLabel}>Tracking ID</Text>
        <Text style={styles.heroTrackingId}>{item.trackingId}</Text>

        <View style={styles.heroStatusWrapper}>
          <View
            style={[
              styles.heroStatusPill,
              { backgroundColor: item.statusBg },
            ]}
          >
            <Text
              style={[
                styles.heroStatusText,
                { color: item.statusColor },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </ScreenHero>

      {/* MAIN CONTENT */}
      <View style={styles.main}>
        <SectionCard containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Parcel Info</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{item.customerName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>From</Text>
            <Text style={styles.infoValue}>{item.fromCity}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>To</Text>
            <Text style={styles.infoValue}>{item.toCity}</Text>
          </View>
        </SectionCard>

        <SectionCard containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Route Summary</Text>

          <View style={styles.routeRow}>
            <Ionicons
              name="location-sharp"
              size={16}
              color={ORANGE}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.routeText}>{item.fromCity}</Text>
          </View>

          <View style={styles.routeConnector} />

          <View style={styles.routeRow}>
            <Ionicons
              name="flag-outline"
              size={16}
              color={ORANGE}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.routeText}>{item.toCity}</Text>
          </View>
        </SectionCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 60,
  },
  heroContent: {
    alignItems: "center",
  },
  heroLabel: {
    fontSize: 11,
    fontFamily: "Karla-Regular",
    color: "#fef3c7",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTrackingId: {
    marginTop: 4,
    fontSize: 16,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
  },
  heroStatusWrapper: {
    marginTop: 12,
  },
  heroStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroStatusText: {
    fontSize: 11,
    fontFamily: "Karla-Bold",
    textTransform: "uppercase",
  },

  main: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: -40,
  },

  card: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Karla-Regular",
    color: "#6b7280",
    flex: 0.4,
  },
  infoValue: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: "#111827",
    flex: 0.6,
    textAlign: "right",
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  routeConnector: {
    width: 2,
    height: 18,
    marginLeft: 8,
    marginVertical: 4,
    backgroundColor: "#e5e7eb",
  },
  routeText: {
    fontSize: 12,
    fontFamily: "Karla-Regular",
    color: "#374151",
  },
});
