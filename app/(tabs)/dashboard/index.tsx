// app/(tabs)/dashboard/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../../../components/AppHeader";
import ServiceCard from "../../../components/card/ServiceCard";
import DashboardRecentCard from "../../../components/card/DashboardRecentCard";
import SearchBar from "../../../components/search/SearchBar";
import ScreenHero from "../../../components/layout/ScreenHero";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../../../contexts/LanguageContext";

const ORANGE = "#f59e0b";
const TITLE_ORANGE = "#E89923";

export default function DashboardScreen() {
  const [trackingId, setTrackingId] = useState("");
  const [displayName, setDisplayName] = useState<string>(""); // username from storage
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const json = await AsyncStorage.getItem("currentUser");
        if (!json) return;
        const user = JSON.parse(json);
        const name = (user?.username || "").toString().trim();
        if (name) setDisplayName(name);
      } catch (e) {
        console.log("Failed to load currentUser:", e);
      }
    };

    loadUser();
  }, []);

  const handleSearch = () => {
    console.log("Dashboard search:", trackingId);
  };

  const welcomeTitle = (t("dashboard_welcome_title") || "Welcome, {name}!")
    .replace("{name}", displayName || (t("dashboard_guest") || "Guest"));

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader titleKey="header_dashboard" showNotification />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHero backgroundColor={ORANGE}>
          <View style={styles.heroTopRow}>
            <View style={styles.locationPill}>
              <Ionicons
                name="location-outline"
                size={14}
                color="#fef3c7"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.locationText}>Kuching, Sarawak</Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color="#fef3c7"
                style={{ marginLeft: 2 }}
              />
            </View>
          </View>

          <View style={styles.welcomeBlock}>
            <Text style={styles.welcomeTitle}>{welcomeTitle}</Text>
            <Text style={styles.welcomeSubtitle}>
              {t("dashboard_welcome_subtitle") || "Track your shipment"}
            </Text>
          </View>
        </ScreenHero>

        <View style={styles.searchFloatingWrapper}>
          <SearchBar
            value={trackingId}
            onChangeText={setTrackingId}
            placeholder=""
            leftIconName="gift-outline"
            rightIconName="scan-outline"
            rightIconColor="#ffffff"
            containerStyle={styles.dashboardSearchBar}
            buttonStyle={styles.dashboardSearchButton}
            onSearch={handleSearch}
          />
        </View>

        <View style={styles.main}>
          <Text style={styles.sectionTitle}>
            {t("dashboard_services") || "Services"}
          </Text>

          <View style={styles.servicesRow}>
            <ServiceCard
              iconName="cube-outline"
              label={t("dashboard_track_parcel") || "Track Parcel"}
              style={{ marginRight: 12 }}
              onPress={() => router.push("/tracking")}
            />
            <ServiceCard
              iconName="albums-outline"
              label={t("dashboard_shipment_list") || "Shipment List"}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            {t("dashboard_recent") || "Recent"}
          </Text>

          <DashboardRecentCard
            style={{ marginTop: 8 }}
            trackingId="TRK123887349AS83"
            fromLabel="Pulau Pinang, Malaysia"
            toLabel="Kuching, Sarawak"
            status="In Transit"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollContent: {
    paddingBottom: 24,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  locationText: {
    fontSize: 11,
    color: "#fef3c7",
    fontFamily: "Karla-Medium",
  },

  welcomeBlock: {
    marginTop: 16,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 20,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
    textAlign: "center",
    textTransform: "uppercase"
  },
  welcomeSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: "Karla-Medium",
    color: "#fef3c7",
    textAlign: "center",
  },

  searchFloatingWrapper: {
    marginTop: -22,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 2,
  },
  dashboardSearchBar: {
    borderRadius: 9999,
    width: "85%",
  },
  dashboardSearchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2C545",
    marginLeft: 0,
  },

  main: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: TITLE_ORANGE,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  servicesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
