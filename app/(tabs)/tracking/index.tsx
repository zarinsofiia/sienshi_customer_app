// app/(tabs)/tracking/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { AppHeader } from "../../../components/AppHeader";
import SearchBar from "../../../components/search/SearchBar";
import ScreenHero from "../../../components/layout/ScreenHero";
import SectionCard from "../../../components/card/SectionCard";
import { useLanguage } from "../../../contexts/LanguageContext";
import { authedFetch } from "../../../config/mobileApiClient";

const ORANGE = "#f59e0b";
const APP_BG = "#f3f4f6";
const BORDER = "#e5e7eb";
const MUTED = "#6b7280";

type ParcelSearchItem = {
  id: number;
  box_amt: string | null;
  gross_weight: string | null;
  total_weight: string | null;
  box_height: string | null;
  box_length: string | null;
  box_width: string | null;
  box_m3: string | null;
  parcel_tracking: string | null;
  status: string | null;
};

type TimelineRow = {
  id: number;
  parcel_id: number;
  tracking_status: string;
  datetime: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  remarks?: string | null;
};

type TrackingItem = {
  parcelId: number;
  trackingId: string;

  // header pill
  status: string; // latest status title (translated)
  statusKey: string | null;
  statusBg: string;
  statusColor: string;

  // top row = latest
  fromCity: string; // latest status title (translated)
  fromDate: string; // latest datetime formatted

  // bottom row = previous
  toCity?: string;
  toDate?: string;
};

function prettifyStatus(s: string | null) {
  const raw = (s || "").toString().trim();
  if (!raw) return "-";
  return raw.replace(/_/g, " ").toUpperCase();
}

function formatPrettyDate(iso: string | null | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${mm} ${dd}, ${yyyy}`;
}

function getStatusColors(statusRaw: string | null | undefined): {
  statusBg: string;
  statusColor: string;
} {
  const s = (statusRaw || "").toString().trim().toLowerCase();

  if (s === "delivered") return { statusBg: "#dcfce7", statusColor: "#16a34a" };
  if (s === "out_for_delivery")
    return { statusBg: "#ffedd5", statusColor: "#f97316" };
  if (s === "kch_warehouse")
    return { statusBg: "#ecfccb", statusColor: "#4d7c0f" };
  if (s === "kch_custom")
    return { statusBg: "#fef9c3", statusColor: "#a16207" };
  if (s === "on_declaration")
    return { statusBg: "#fee2e2", statusColor: "#b91c1c" };
  if (s === "customs_clearance_in_progress")
    return { statusBg: "#e0f2fe", statusColor: "#0284c7" };
  if (s === "in_shipment" || s === "shipping_in_progress")
    return { statusBg: "#e0f2fe", statusColor: "#0284c7" };
  if (s === "cn_warehouse")
    return { statusBg: "#ede9fe", statusColor: "#6d28d9" };
  if (s.includes("estimated"))
    return { statusBg: "#fef9c3", statusColor: "#a16207" };

  return { statusBg: "#f3f4f6", statusColor: "#6b7280" };
}

/** icon mapping (same as detail page) */
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
function getStatusIcon(status: string | null | undefined): IoniconName {
  const s = (status || "").toString().trim().toLowerCase();

  const map: Record<string, IoniconName> = {
    cn_warehouse: "home-outline",
    on_declaration: "document-text-outline",
    container_packed: "cube-outline",
    cn_customs_clearance: "shield-checkmark-outline",
    cn_customs_inspection: "search-outline",
    shipping_in_progress: "boat-outline",
    in_shipment: "boat-outline",
    arrived_at_port: "pin-outline",
    my_customs_inspection_kch: "search-outline",
    customs_clearance_in_progress: "shield-outline",
    kch_custom: "shield-checkmark-outline",
    kch_warehouse: "business-outline",
    out_for_delivery: "car-outline",
    delivered: "checkmark-done-outline",
    estimated_arrival: "time-outline",
    ready_to_pickup: "storefront-outline",
    arranging: "settings-outline",
  };

  return map[s] || "cube-outline";
}

async function safeJson(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/**
 * Build 2 rows:
 * - Top row = latest timeline status + date
 * - Bottom row = previous distinct status + date (if exists)
 */
function buildTrackingItemFromTimeline(
  parcelId: number,
  trackingNumber: string,
  timeline: TimelineRow[] | undefined,
  fallbackStatus: string | null | undefined,
  statusTitle: (s: string) => string
): TrackingItem {
  const rows = Array.isArray(timeline) ? timeline : [];

  // sort oldest -> newest (by datetime)
  const sorted = [...rows].sort((a, b) => {
    const ta = a?.datetime ? new Date(a.datetime).getTime() : 0;
    const tb = b?.datetime ? new Date(b.datetime).getTime() : 0;
    return ta - tb;
  });

  // compress consecutive same statuses
  const compressed: Array<{
    status: string;
    first: TimelineRow;
    last: TimelineRow;
  }> = [];

  for (const r of sorted) {
    const s = (r.tracking_status || "").toString().trim().toLowerCase();
    if (!s) continue;

    const last = compressed[compressed.length - 1];
    if (last && last.status === s) last.last = r;
    else compressed.push({ status: s, first: r, last: r });
  }

  const latestStatusRaw =
    (compressed.length ? compressed[compressed.length - 1].status : null) ||
    (fallbackStatus || "").toString().trim().toLowerCase() ||
    null;

  const { statusBg, statusColor } = getStatusColors(latestStatusRaw);

  // no timeline at all
  if (compressed.length === 0) {
    const title = latestStatusRaw ? statusTitle(latestStatusRaw).toUpperCase() : "-";
    return {
      parcelId,
      trackingId: trackingNumber,
      status: title,
      statusKey: latestStatusRaw,
      statusBg,
      statusColor,
      fromCity: title,
      fromDate: "-",
    };
  }

  // only 1 distinct status
  if (compressed.length === 1) {
    const latest = compressed[0];
    const title = statusTitle(latest.status).toUpperCase();
    const date = formatPrettyDate(latest.last?.datetime);

    const isEstimated = latest.status.includes("estimated");
    return {
      parcelId,
      trackingId: trackingNumber,
      status: title,
      statusKey: latest.status,
      statusBg,
      statusColor,
      fromCity: title,
      fromDate: isEstimated ? `${date} (Estimated)` : date,
    };
  }

  // latest + previous
  const latest = compressed[compressed.length - 1];
  const prev = compressed[compressed.length - 2];

  const latestTitle = statusTitle(latest.status).toUpperCase();
  const latestDateRaw = formatPrettyDate(latest.last?.datetime);
  const latestIsEstimated = latest.status.includes("estimated");

  const prevTitle = statusTitle(prev.status).toUpperCase();
  const prevDateRaw = formatPrettyDate(prev.last?.datetime);
  const prevIsEstimated = prev.status.includes("estimated");

  return {
    parcelId,
    trackingId: trackingNumber,
    status: latestTitle,
    statusKey: latest.status,
    statusBg,
    statusColor,
    fromCity: latestTitle,
    fromDate: latestIsEstimated ? `${latestDateRaw} (Estimated)` : latestDateRaw,
    toCity: prevTitle,
    toDate: prevIsEstimated ? `${prevDateRaw} (Estimated)` : prevDateRaw,
  };
}

export default function TrackingScreen() {
  const { t } = useLanguage();
  type TKey = Parameters<typeof t>[0];

  const params = useLocalSearchParams<{ trackingId?: string; backTo?: string }>();

  const [trackingId, setTrackingId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchList, setSearchList] = useState<TrackingItem[]>([]);
  const [searchedOnce, setSearchedOnce] = useState(false);

  const statusTitle = (statusRaw: string) => {
    const status = (statusRaw || "").toString().trim().toLowerCase();
    if (!status) return "-";

    const key = (`tracking_status_${status}` as unknown) as TKey;
    const translated = t(key);

    // fallback when missing
    if (!translated || translated === (key as unknown as string)) {
      return prettifyStatus(status);
    }
    return translated;
  };

  useEffect(() => {
    const id = (params?.trackingId || "").toString().trim();
    if (!id) return;

    setTrackingId(id);
    void doSearch(id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.trackingId]);

  const doSearch = async (idRaw?: string) => {
    const id = (idRaw ?? trackingId).toString().trim();
    if (!id) return;

    try {
      setSearching(true);
      setSearchError(null);
      setSearchList([]);
      setSearchedOnce(true);

      // 1) search parcels
      const res = await authedFetch("/api/cust_app/parcels/get_parcel_by_tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_number: id }),
      });

      const parcels = await safeJson(res);
      if (!res.ok) throw new Error(parcels?.message || `Request failed (${res.status})`);

      const list: ParcelSearchItem[] = Array.isArray(parcels) ? parcels : [];

      // 2) fetch timeline per parcel
      const items = await Promise.all(
        list.map(async (p) => {
          const trackingNo = (p.parcel_tracking || id).toString();

          try {
            const tlRes = await authedFetch(
              `/api/cust_app/parcels/get_timeline?id=${encodeURIComponent(String(p.id))}`,
              { method: "GET" }
            );

            const tlData = await safeJson(tlRes);

            const timeline: TimelineRow[] = Array.isArray(tlData?.timeline)
              ? tlData.timeline
              : [];

            // note: tlData.parcel exists but we don't need it (we already have trackingNo)
            return buildTrackingItemFromTimeline(
              p.id,
              trackingNo,
              timeline,
              p.status,
              statusTitle
            );
          } catch {
            return buildTrackingItemFromTimeline(
              p.id,
              trackingNo,
              [],
              p.status,
              statusTitle
            );
          }
        })
      );

      setSearchList(items);
    } catch (e: unknown) {
      const msg = (e as any)?.message || "Failed to search tracking number.";
      setSearchError(msg);
      setSearchList([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = () => {
    void doSearch();
  };

  const goToDetail = (item: TrackingItem) => {
    router.push({
      pathname: "/tracking/detail" as any,
      params: {
        parcelId: String(item.parcelId),
        trackingId: item.trackingId,
        // backTo: "/tracking",
      },
    } as any);
  };

  const resultTitle = useMemo(() => {
    if (!searchedOnce) return "";
    const base = t("tracking_search_result") || "Search Results";
    return `${base} (${searchList.length})`;
  }, [searchedOnce, searchList.length, t]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader titleKey="header_tracking" showBack />

      <ScreenHero
        backgroundColor={ORANGE}
        title={t("tracking_title")}
        subtitle={t("tracking_subtitle")}
        style={styles.hero}
        contentStyle={styles.heroContent}
      >
        <View style={styles.searchWrapper}>
          <SearchBar
            value={trackingId}
            onChangeText={(v: string) => {
              setTrackingId(v);
              if (searchError) setSearchError(null);
              if (searchList.length) setSearchList([]);
              setSearchedOnce(false);
            }}
            placeholder={t("tracking_search_placeholder")}
            leftIconName="cube-outline"
            onSearch={handleSearch}
          />

          {searching ? (
            <View style={styles.searchInfoRow}>
              <ActivityIndicator />
              <Text style={styles.searchHint}>{t("tracking_searching")}</Text>
            </View>
          ) : null}

          {searchError ? <Text style={styles.searchError}>{searchError}</Text> : null}
        </View>
      </ScreenHero>

      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {searchedOnce ? (
            <View style={{ marginBottom: 14 }}>
              <Text style={styles.sectionTitle}>{resultTitle}</Text>

              {searchList.length === 0 && !searching ? (
                <View style={styles.emptyPill}>
                  <Ionicons name="cube-outline" size={18} color={ORANGE} />
                  <Text style={styles.emptyPillText}>
                    {t("tracking_no_parcels") || "No Parcels"}
                  </Text>
                </View>
              ) : null}

              {searchList.map((x) => (
                <TouchableOpacity
                  key={`${x.parcelId}-${x.trackingId}`}
                  activeOpacity={0.9}
                  onPress={() => goToDetail(x)}
                  style={styles.trackingCard}
                >
                  <SectionCard>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.trackingId} numberOfLines={1}>
                        {x.trackingId}
                      </Text>

                      {/* <View style={[styles.statusPill, { backgroundColor: x.statusBg }]}>
                        <Text style={[styles.statusText, { color: x.statusColor }]}>
                          {x.status}
                        </Text>
                      </View> */}
                    </View>

                    <View style={styles.cardBodyRow}>
                      <View style={styles.locationsColumn}>
                        {/* TOP: latest */}
                        <View style={styles.locationRow}>
                          <Ionicons
                            name="location-sharp"
                            size={16}
                            color={ORANGE}
                            style={{ marginRight: 6 }}
                          />
                          <View style={styles.locationTextBlock}>
                            <Text style={styles.cityText}>{x.fromCity}</Text>
                            <Text style={styles.dateText}>{x.fromDate}</Text>
                          </View>
                        </View>

                        {/* BOTTOM: previous */}
                        {x.toCity ? (
                          <>
                            <View style={styles.dottedLine} />

                            <View style={styles.locationRow}>
                              <Ionicons
                                name="location-sharp"
                                size={16}
                                color={ORANGE}
                                style={{ marginRight: 6 }}
                              />
                              <View style={styles.locationTextBlock}>
                                <Text style={styles.cityText}>{x.toCity}</Text>
                                <Text style={styles.dateText}>{x.toDate || "-"}</Text>
                              </View>
                            </View>
                          </>
                        ) : null}
                      </View>

                      <View style={styles.illustration}>
                        <Ionicons
                          name={getStatusIcon(x.statusKey)}
                          size={34}
                          color={ORANGE}
                        />
                      </View>
                    </View>
                  </SectionCard>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ height: 6 }} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: APP_BG,
  },

  scrollContent: {
    paddingBottom: 32,
    paddingTop: 10,
  },

  hero: {
    paddingBottom: 60,
   
  },
  heroContent: {},

  searchWrapper: {
    marginTop: 0,
  },
  searchInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  searchHint: {
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: MUTED,
  },
  searchError: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: "#dc2626",
  },

  main: {
    flex: 1,
    // marginTop: -20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    zIndex: 1,
  },

  sectionTitle: {
    fontSize: 12,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  trackingCard: {
    marginBottom: 12,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  // match your screenshot vibe
  trackingId: {
    flex: 1,
    paddingRight: 10,
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: ORANGE,
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

  // status label line (orange-ish like screenshot)
  cityText: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: ORANGE,
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
    borderColor: BORDER,
  },

  illustration: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyPill: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  emptyPillText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: "#111827",
  },
});
