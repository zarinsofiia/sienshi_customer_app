// app/(tabs)/dashboard/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  useWindowDimensions,
  ViewToken,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ServiceCard from "../../../components/card/ServiceCard";
import DashboardRecentCard from "../../../components/card/DashboardRecentCard";
import SearchBar from "../../../components/search/SearchBar";
import ScreenHero from "../../../components/layout/ScreenHero";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../../../contexts/LanguageContext";
import { API_BASE_URL } from "../../../config/api";
import { authedFetch } from "@/config/mobileApiClient";
const ORANGE = "#f59e0b";
const TITLE_ORANGE = "#E89923";
const ANN_GAP = 12;

type Announcement = {
  id: string;
  title: string;
  content?: string;
  date?: string;
  imageUrl?: string;
};


function normalizeImageUrl(url?: string | null) {
  const u = (url || "").trim();
  if (!u) return undefined;

  // already absolute
  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  // relative path -> prefix base url
  // ensure only single slash
  if (u.startsWith("/")) return `${API_BASE_URL}${u}`;
  return `${API_BASE_URL}/${u}`;
}

async function fetchAnnouncementsFromApi(): Promise<Announcement[]> {
  const res = await authedFetch(
    `${API_BASE_URL}/api/cust_app/announcement/get_announcement_list`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.log("[announcement] status:", res.status, "body:", text);
    throw new Error("Failed to fetch announcements");
  }

  const rows: any[] = (await res.json()) || [];
  if (!Array.isArray(rows)) return [];

  return rows.map((x: any) => ({
    id: String(x?.id ?? ""),
    title: String(x?.title ?? ""),
    content: x?.content ? String(x.content) : undefined,
    date: x?.date ? String(x.date) : undefined,
    imageUrl: normalizeImageUrl(x?.image_url),
  }));
}

export default function DashboardScreen() {
  const [trackingId, setTrackingId] = useState("");
  const [displayName, setDisplayName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [annIndex, setAnnIndex] = useState(0);

  const annListRef = useRef<FlatList<Announcement>>(null);

  const router = useRouter();
  const { t } = useLanguage();
  const { width: screenW } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // main has paddingHorizontal: 20, so available width = screenW - 40
  const ANN_CARD_W = screenW - 40;
  const ANN_SNAP = ANN_CARD_W + ANN_GAP;

  // ✅ reliable index tracking for nested scroll (FlatList inside ScrollView)
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const idx = viewableItems?.[0]?.index ?? 0;
      setAnnIndex(idx);
    }
  ).current;

  // ✅ ScreenHero is fixed height (140). Override ONLY on this screen.
  const HERO_H = 140 + insets.top + 34; // tweak 28–44 if needed
  const HERO_PT = insets.top + 10; // replace ScreenHero paddingTop=10
  const HERO_PB = 48; // replace ScreenHero paddingBottom=40 (more room)

  useEffect(() => {
    const loadUser = async () => {
      try {
        setAuthLoading(true);

        const json = await AsyncStorage.getItem("currentUser");
        if (!json) {
          setIsLoggedIn(false);
          setDisplayName("");
          return;
        }

        const user = JSON.parse(json);
        const name = (user?.username || "").toString().trim();

        setIsLoggedIn(true);
        setDisplayName(name || "");
      } catch (e) {
        console.log("Failed to load currentUser:", e);
        setIsLoggedIn(false);
        setDisplayName("");
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setAnnLoading(true);
        const list = await fetchAnnouncementsFromApi();
        if (!cancelled) setAnnouncements(Array.isArray(list) ? list : []);
      } catch (e) {
        console.log("Failed to load announcements:", e);
        if (!cancelled) setAnnouncements([]);
      } finally {
        if (!cancelled) setAnnLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const welcomeTitle = useMemo(() => {
    const base = t("dashboard_welcome_title") || "Welcome, {name}!";
    const guest = t("dashboard_guest") || "Guest";
    return base.replace("{name}", displayName || guest);
  }, [displayName, t]);

  const handleSearch = () => {
    const id = trackingId.trim();
    if (!id) return;

    router.push({
      pathname: "/tracking",
      params: { trackingId: id, backTo: "/dashboard" },
    });
  };

  const handleOpenAnnouncements = (announcementId?: string) => {
    router.push({
      pathname: "/announcement",
      params: {
        backTo: "/dashboard",
        announcementId: announcementId ? String(announcementId) : "",
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      {/* ✅ AppHeader removed */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHero
          backgroundColor={ORANGE}
          style={{ height: HERO_H, paddingTop: HERO_PT, paddingBottom: HERO_PB }}
        >
          {/* ✅ Dashboard header row in hero */}
          <View style={styles.heroHeaderRow}>
            <View style={{ width: 36 }} />
            <Text style={styles.heroHeaderTitle}>
              {(t("header_dashboard" as any) as any) || "DASHBOARD"}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/notification" as any)}
              style={styles.heroBellBtn}
            >
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

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

        {/* ✅ floating search bar */}
        <View style={styles.searchFloatingWrapper}>
          <SearchBar
            value={trackingId}
            onChangeText={setTrackingId}
            placeholder={t("dashboard_search_placeholder")}
            leftIconName="cube-outline"
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
              style={styles.serviceItem}
              onPress={() => router.push("/tracking")}
            />
            <ServiceCard
              iconName="albums-outline"
              label={t("dashboard_shipment_list") || "Shipment List"}
              style={styles.serviceItem}
              onPress={() => router.push("/shipment")}
            />
            <ServiceCard
              iconName="calculator-outline"
              label={t("dashboard_calculator") || "Calculator"}
              style={styles.serviceItem}
              onPress={() => router.push("/calculator")}
            />
          </View>

          {/* ✅ Announcement Section */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            {t("dashboard_announcement") || "Announcement"}
          </Text>

          {annLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator />
              <Text style={styles.centerText}>
                {(t("common_loading" as any) as any) || "Loading..."}
              </Text>
            </View>
          ) : announcements.length === 0 ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleOpenAnnouncements()}
              style={styles.announcementBanner}
            >
              <View style={styles.announcementIconWrap}>
                <Ionicons
                  name="megaphone-outline"
                  size={18}
                  color={TITLE_ORANGE}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.announcementEmptyTitle}>
                  {t("dashboard_no_announcement_title") ||
                    "No announcements yet"}
                </Text>
                <Text style={styles.announcementEmptySub}>
                  {t("dashboard_no_announcement_sub") ||
                    "Updates from our team will appear here."}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={{ width: "100%" }}>
              <FlatList
                ref={annListRef}
                data={announcements}
                keyExtractor={(item) => String(item.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={ANN_SNAP}
                snapToAlignment="start"
                disableIntervalMomentum
                contentContainerStyle={{ paddingRight: ANN_GAP }}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(_, index) => ({
                  length: ANN_SNAP,
                  offset: ANN_SNAP * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleOpenAnnouncements(item.id)}
                    style={[
                      styles.announcementImageCard,
                      { width: ANN_CARD_W, marginRight: ANN_GAP },
                    ]}
                  >
                    <ImageBackground
                      source={{
                        uri:
                          item.imageUrl ,
                      }}
                      style={styles.announcementImage}
                      imageStyle={styles.announcementImageStyle}
                    >
                      
                      {announcements.length > 1 && (
                        <View style={styles.annCountPill}>
                          <Text style={styles.annCountText}>
                            {annIndex + 1}/{announcements.length}
                          </Text>
                        </View>
                      )}
                    </ImageBackground>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* ✅ Do not show anything when not logged in */}
          {authLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator />
              <Text style={styles.centerText}>{t("loading")}</Text>
            </View>
          ) : isLoggedIn ? (
            <>
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
            </>
          ) : null}
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

  // ✅ hero header row (Dashboard + bell)
  heroHeaderRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroHeaderTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Karla-ExtraBold",
    color: "#fff",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  heroBellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
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
    marginTop: 14,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 20,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
    textAlign: "center",
    textTransform: "uppercase",
  },
  welcomeSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: "Karla-Medium",
    color: "#fef3c7",
    textAlign: "center",
  },

  // ✅ floating search bar (tuned)
  searchFloatingWrapper: {
    marginTop: -22, // try -18 to -26 if you want higher/lower
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  serviceItem: {
    flexBasis: "48%",
    maxWidth: "48%",
    marginBottom: 12,
  },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  centerText: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: "#6b7280",
  },

  announcementBanner: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F2C545",
  },
  announcementIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
  },
  announcementEmptyTitle: {
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
  },
  announcementEmptySub: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: "#6b7280",
    lineHeight: 16,
  },

  announcementImageCard: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  announcementImage: {
    width: "100%",
    height: 140,
  },
  announcementImageStyle: {
    resizeMode: "cover",
  },

  // ✅ scalable indicator (works for many items)
  annCountPill: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  annCountText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Karla-ExtraBold",
  },
});
