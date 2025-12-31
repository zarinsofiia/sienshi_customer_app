// app/(tabs)/tracking/detail.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AppHeader } from "../../../components/AppHeader";
import ScreenHero from "../../../components/layout/ScreenHero";
import SectionCard from "../../../components/card/SectionCard";

const ORANGE = "#f59e0b";

type TrackingItem = {
  trackingId: string;
  status: string;
  statusColor: string;
  statusBg: string;
  fromCity: string;
  fromDate: string;
  toCity: string;
  toDate: string;
};

const MOCK_TRACKINGS: TrackingItem[] = [
  {
    trackingId: "TRK123887349AS83",
    status: "IN TRANSIT",
    statusColor: "#0284c7",
    statusBg: "#e0f2fe",
    fromCity: "Kuching, Sarawak",
    fromDate: "June 20, 2025 (Estimated)",
    toCity: "Pulau Pinang, Malaysia",
    toDate: "June 10, 2025",
  },
  {
    trackingId: "TRK123889123WQ11",
    status: "OUT FOR DELIVERY",
    statusColor: "#f97316",
    statusBg: "#ffedd5",
    fromCity: "Sabah, Malaysia",
    fromDate: "June 08, 2025",
    toCity: "Johor, Malaysia",
    toDate: "June 09, 2025",
  },
  {
    trackingId: "TRK123882098DS21",
    status: "DELIVERED",
    statusColor: "#16a34a",
    statusBg: "#dcfce7",
    fromCity: "Bau, Sarawak",
    fromDate: "April 01, 2025",
    toCity: "Negeri Sembilan, Malaysia",
    toDate: "April 05, 2025",
  },
];

const MOCK_STEPS = [
  {
    key: "step1",
    title: "Parcel in transit",
    time: "June 10, 2025 15:00",
    active: true,
  },
  {
    key: "step2",
    title: "Parcel loaded in container",
    time: "June 10, 2025 13:00",
    active: false,
  },
  {
    key: "step3",
    title: "Parcel picked up",
    time: "June 10, 2025 10:00",
    active: false,
  },
  {
    key: "step4",
    title: "Preparing Parcel",
    time: "June 10, 2025 09:00",
    active: false,
  },
];

export default function TrackingDetailScreen() {
  const router = useRouter();
  const { trackingId, backTo } = useLocalSearchParams<{
    trackingId?: string;
    backTo?: string;
  }>();

  const item =
    MOCK_TRACKINGS.find((t) => t.trackingId === trackingId) ||
    MOCK_TRACKINGS[0];

  const handleBack = () => {
    if (backTo) {
      router.replace(backTo as any);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader title="Tracking Details" showBack onBack={handleBack} />

      {/* orange hero */}
      <ScreenHero
        backgroundColor={ORANGE}
        style={styles.hero}
        contentStyle={styles.heroContent}
      >
        <Text style={styles.heroLabel}>Tracking ID</Text>
        <Text style={styles.heroTrackingId}>{item.trackingId}</Text>

        <Text style={[styles.heroLabel, { marginTop: 16 }]}>
          Estimated Delivery
        </Text>
        <Text style={styles.heroDate}>{item.fromDate}</Text>
      </ScreenHero>

      {/* MAIN CONTENT */}
      <View style={styles.main}>
        <SectionCard
          containerStyle={styles.timelineCard}
          title="TRACK PARCEL"
          titleStyle={styles.cardTitle}
        >
          {/* illustration */}
          <View style={styles.illustrationWrapper}>
            <Ionicons name="boat-outline" size={40} color={ORANGE} />
          </View>

          {/* steps */}
          <View style={styles.stepsWrapper}>
            {MOCK_STEPS.map((step, index) => (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepIconCol}>
                  {step.active ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={ORANGE}
                    />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={18}
                      color="#e5e7eb"
                    />
                  )}

                  {index < MOCK_STEPS.length - 1 && (
                    <View style={styles.stepConnector} />
                  )}
                </View>

                <View style={styles.stepTextCol}>
                  <Text
                    style={[
                      styles.stepTitle,
                      step.active && styles.stepTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepTime}>{step.time}</Text>
                </View>
              </View>
            ))}
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
  heroDate: {
    marginTop: 4,
    fontSize: 16,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
  },

  main: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: -40,
  },

  timelineCard: {
    // extra margin / overrides if needed
  },

  cardTitle: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  illustrationWrapper: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  stepsWrapper: {
    marginTop: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  stepIconCol: {
    width: 24,
    alignItems: "center",
  },
  stepConnector: {
    width: 2,
    flex: 1,
    backgroundColor: "#e5e7eb",
    marginTop: 2,
    marginBottom: -2,
  },
  stepTextCol: {
    flex: 1,
    paddingLeft: 4,
  },
  stepTitle: {
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: "#6b7280",
  },
  stepTitleActive: {
    fontFamily: "Karla-Bold",
    color: "#111827",
  },
  stepTime: {
    fontSize: 11,
    fontFamily: "Karla-Regular",
    color: "#9ca3af",
    marginTop: 2,
  },
});
