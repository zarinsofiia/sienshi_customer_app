// app/(tabs)/tracking/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppHeader } from "../../../components/AppHeader";
import SearchBar from "../../../components/search/SearchBar";
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

// dummy tracking list for now
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

export default function TrackingScreen() {
  const [trackingId, setTrackingId] = useState("");

  const handleSearch = () => {
    // later: call your API with trackingId
    console.log("Search tracking:", trackingId);
  };

  const handleOpenDetail = (item: TrackingItem) => {
    router.push({
      pathname: "/tracking/detail",
      params: {
        trackingId: item.trackingId,
        backTo: "/tracking", // 👈 tell detail page where to go back
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Top header */}
      <AppHeader titleKey="header_tracking" showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ORANGE HERO */}
        <ScreenHero
          backgroundColor={ORANGE}
          title="Tracking"
          subtitle="View your shipment status"
          style={styles.hero}
          contentStyle={styles.heroContent}
        >
          {/* Search bar */}
          <View style={styles.searchWrapper}>
            <SearchBar
              value={trackingId}
              onChangeText={setTrackingId}
              placeholder="Tracking ID"
              leftIconName="cube-outline"
              onSearch={handleSearch}
            />
          </View>
        </ScreenHero>

        {/* MAIN CONTENT */}
        <View style={styles.main}>
          {MOCK_TRACKINGS.map((t) => (
            <TouchableOpacity
              key={t.trackingId}
              activeOpacity={0.9}
              onPress={() => handleOpenDetail(t)}
              style={styles.trackingCard}
            >
              <SectionCard>
                {/* header row */}
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.trackingId}>{t.trackingId}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: t.statusBg },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: t.statusColor }]}
                    >
                      {t.status}
                    </Text>
                  </View>
                </View>

                {/* locations */}
                <View style={styles.cardBodyRow}>
                  <View style={styles.locationsColumn}>
                    {/* from */}
                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-sharp"
                        size={16}
                        color={ORANGE}
                        style={{ marginRight: 6 }}
                      />
                      <View style={styles.locationTextBlock}>
                        <Text style={styles.cityText}>{t.fromCity}</Text>
                        <Text style={styles.dateText}>{t.fromDate}</Text>
                      </View>
                    </View>

                    {/* dotted line */}
                    <View style={styles.dottedLine} />

                    {/* to */}
                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-sharp"
                        size={16}
                        color={ORANGE}
                        style={{ marginRight: 6 }}
                      />
                      <View style={styles.locationTextBlock}>
                        <Text style={styles.cityText}>{t.toCity}</Text>
                        <Text style={styles.dateText}>{t.toDate}</Text>
                      </View>
                    </View>
                  </View>

                  {/* right illustration */}
                  <View style={styles.illustration}>
                    <Ionicons name="bus-outline" size={34} color={ORANGE} />
                  </View>
                </View>
              </SectionCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // ORANGE HERO overrides
  hero: {
    paddingBottom: 60, // more bottom space so list can overlap nicely
  },
  heroContent: {
    // tweak if needed
  },

  searchWrapper: {
    marginTop: 0,
  },

  // MAIN CONTENT
  main: {
    marginTop: -30, // overlap into orange area
    paddingHorizontal: 20,
    paddingBottom: 24,
    zIndex: 1,
  },

  trackingCard: {
    marginBottom: 12,
  },

  // inner layout (tracking-specific)
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  trackingId: {
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Karla-Bold",
    textTransform: "uppercase",
  },
  cardBodyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationsColumn: {
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationTextBlock: {
    flex: 1,
  },
  cityText: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: "#111827",
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Karla-Regular",
    color: "#9ca3af",
  },
  dottedLine: {
    width: 1,
    height: 16,
    marginVertical: 6,
    marginLeft: 7,
    borderStyle: "dotted",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  illustration: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
