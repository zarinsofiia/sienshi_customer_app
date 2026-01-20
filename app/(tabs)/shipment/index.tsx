// app/(tabs)/shipment/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppHeader } from "../../../components/AppHeader";
import SearchBar from "../../../components/search/SearchBar";
import ScreenHero from "../../../components/layout/ScreenHero";
import SectionCard from "../../../components/card/SectionCard";
import { useLanguage } from "../../../contexts/LanguageContext";
import { authedFetch } from "../../../config/mobileApiClient";

const ORANGE = "#f59e0b";

// keep same look/feel as Dashboard page
const APP_BG = "#f3f4f6";
const BORDER = "#e5e7eb";
const MUTED = "#6b7280";

const LOGIN_BTN_BG = "#f59e0b";
const LOGIN_TEXT = "#ffffffff";

const PAGE_SIZE = 10;

type ParcelListItem = {
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
  date_created: string | null;
  date_updated: string | null;
  remarks: string | null;
};

type TimelineResponse = {
  parcel?: any[];
  timeline?: TimelineRow[];
};

type TrackingItem = {
  parcelId?: number;
  trackingId: string;

  // Latest status pill
  status: string;
  statusColor: string;
  statusBg: string;

  // Top row (latest)
  fromCity: string;
  fromDate: string;

  // Bottom row (previous)
  toCity?: string;
  toDate?: string;

  statusKey?: string | null;
};

function prettifyStatus(s: string | null) {
  const raw = (s || "").toString().trim();
  if (!raw) return "-";
  return raw.replace(/_/g, " ").toUpperCase();
}

function formatDateOnly(iso: string | null | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().slice(0, 10);
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
  if (s === "in_shipment" || s === "shipping_in_progress")
    return { statusBg: "#e0f2fe", statusColor: "#0284c7" };
  if (s === "cn_warehouse")
    return { statusBg: "#ede9fe", statusColor: "#6d28d9" };
  if (s === "estimated_arrival")
    return { statusBg: "#e0e7ff", statusColor: "#4338ca" };

  return { statusBg: "#f3f4f6", statusColor: "#6b7280" };
}

/** icon mapping (same as tracking/detail) */
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
  };

  return map[s] || "cube-outline";
}

async function readJson(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Build card data:
 * - latest timeline at TOP
 * - previous timeline at BOTTOM
 */
function buildTrackingItemLatestFirst(
  parcelId: number,
  trackingNumber: string,
  timeline: TimelineRow[] | undefined,
  fallbackStatus: string | null | undefined
): TrackingItem {
  const safeTimeline = Array.isArray(timeline) ? timeline : [];

  // sort ascending first, then compress consecutive same statuses
  const sorted = [...safeTimeline].sort((a, b) => {
    const ta = a?.datetime ? new Date(a.datetime).getTime() : 0;
    const tb = b?.datetime ? new Date(b.datetime).getTime() : 0;
    return ta - tb;
  });

  const compressed: Array<{
    status: string;
    first: TimelineRow;
    last: TimelineRow;
  }> = [];

  for (const row of sorted) {
    const s = (row.tracking_status || "").toString().trim().toLowerCase();
    if (!s) continue;

    const last = compressed[compressed.length - 1];
    if (last && last.status === s) last.last = row;
    else compressed.push({ status: s, first: row, last: row });
  }

  const latestStatusRaw =
    (compressed.length ? compressed[compressed.length - 1].status : null) ||
    (fallbackStatus || "").toString().trim().toLowerCase() ||
    null;

  const { statusBg, statusColor } = getStatusColors(latestStatusRaw);

  if (compressed.length === 0) {
    return {
      parcelId,
      trackingId: trackingNumber,
      status: prettifyStatus(latestStatusRaw),
      statusBg,
      statusColor,
      fromCity: prettifyStatus(latestStatusRaw),
      fromDate: "-",
      statusKey: latestStatusRaw,
    };
  }

  const latest = compressed[compressed.length - 1];
  const prev = compressed.length >= 2 ? compressed[compressed.length - 2] : null;

  return {
    parcelId,
    trackingId: trackingNumber,
    status: prettifyStatus(latestStatusRaw),
    statusBg,
    statusColor,
    fromCity: prettifyStatus(latest.status),
    fromDate: formatDateOnly(latest.last?.datetime),
    toCity: prev ? prettifyStatus(prev.status) : undefined,
    toDate: prev ? formatDateOnly(prev.last?.datetime) : undefined,
    statusKey: latestStatusRaw,
  };
}

async function fetchTimeline(parcelId: number): Promise<TimelineRow[]> {
  const path = `/api/cust_app/parcels/get_timeline?id=${encodeURIComponent(
    String(parcelId)
  )}`;

  // try GET then fallback POST (some backends only accept POST)
  let res = await authedFetch(path, { method: "GET" });
  if (!res.ok && (res.status === 405 || res.status === 404)) {
    res = await authedFetch(path, { method: "POST" });
  }

  const data: TimelineResponse | any = await readJson(res);
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return Array.isArray(data?.timeline) ? data.timeline : [];
}

export default function ShipmentScreen() {
  const { t } = useLanguage();
  const tr = (key: string, fallback: string) => {
    const v = (t as any)(key);
    return !v || v === key ? fallback : v;
  };

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parcels, setParcels] = useState<ParcelListItem[]>([]);
  const [timelineMap, setTimelineMap] = useState<Record<number, TimelineRow[]>>(
    {}
  );

  const inflightRef = useRef<Set<number>>(new Set());


  useEffect(() => {
    const loadUser = async () => {
      try {
        setAuthLoading(true);
        const json = await AsyncStorage.getItem("currentUser");
        setIsLoggedIn(!!json);
      } catch (e) {
        console.log("Failed to load currentUser:", e);
        setIsLoggedIn(false);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  // load parcel list
  useEffect(() => {
    let cancelled = false;

    const loadParcels = async () => {
      if (!isLoggedIn) return;

      try {
        setLoading(true);
        setError(null);

        const path = `/api/cust_app/parcels/get_customer_parcels_list`;

        let res = await authedFetch(path, { method: "POST" });
        if (!res.ok && (res.status === 405 || res.status === 404)) {
          res = await authedFetch(path, { method: "POST" });
        }

        const data = await readJson(res);
        if (!res.ok) {
          throw new Error(data?.message || `Request failed (${res.status})`);
        }

        const list: ParcelListItem[] = Array.isArray(data) ? data : [];

        if (cancelled) return;
        setParcels(list);
        setPage(1); // ✅ reset pagination on fresh load
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to load shipments.");
        setParcels([]);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    loadParcels();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // reset to first page when searching
  useEffect(() => {
    setPage(1);
  }, [query]);

  const filteredParcels = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return parcels;

    return parcels.filter((p) => {
      const tracking = (p.parcel_tracking || "").toLowerCase();
      const status = (p.status || "").toLowerCase();
      return tracking.includes(q) || status.includes(q);
    });
  }, [parcels, query]);

  const hasMore = filteredParcels.length > page * PAGE_SIZE;

  const visibleParcels = useMemo(() => {
    return filteredParcels.slice(0, page * PAGE_SIZE);
  }, [filteredParcels, page]);

  // fetch timelines ONLY for visible items
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isLoggedIn) return;
      if (!visibleParcels.length) return;

      const visibleIds = visibleParcels.map((p) => p.id);

      const missing = visibleIds.filter(
        (id) => !(id in timelineMap) && !inflightRef.current.has(id)
      );

      if (!missing.length) return;

      const concurrency = 4;
      let idx = 0;

      const worker = async () => {
        while (idx < missing.length && !cancelled) {
          const id = missing[idx++];
          inflightRef.current.add(id);

          try {
            const tl = await fetchTimeline(id);
            if (cancelled) return;

            setTimelineMap((prev) => ({
              ...prev,
              [id]: tl,
            }));
          } catch {
            // ignore (fallback to parcel.status)
          } finally {
            inflightRef.current.delete(id);
          }
        }
      };

      await Promise.all(Array.from({ length: concurrency }, () => worker()));
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, visibleParcels]);

  const cards: TrackingItem[] = useMemo(() => {
    return visibleParcels.map((p) => {
      const trackingNo = (p.parcel_tracking || "").toString().trim() || "-";
      const tl = timelineMap[p.id];
      return buildTrackingItemLatestFirst(p.id, trackingNo, tl, p.status);
    });
  }, [visibleParcels, timelineMap]);

  const handleGoLogin = () => router.push("/login");

  const goToDetail = (item: TrackingItem) => {
    if (!item?.parcelId) return;

    router.push({
      pathname: "/tracking/detail",
      params: {
        parcelId: String(item.parcelId),
        trackingId: item.trackingId,
        backTo: "/shipment",
      },
    });
  };

  const handleLoadMore = () => {
    if (!hasMore) return;
    setPage((p) => p + 1);
  };

  const subtitleText = useMemo(() => {
    if (authLoading || !isLoggedIn) return t("shipment_subtitle");
    return `TOTAL: ${parcels.length}`;
  }, [authLoading, isLoggedIn, parcels.length, t]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader titleKey="header_shipment" showBack />

      {/* FIXED HERO */}
      <ScreenHero
        backgroundColor={ORANGE}
        title={t("shipment_title")}
        subtitle={subtitleText}
        style={styles.hero}
        contentStyle={styles.heroContent}
      >
        <View style={styles.searchWrapper}>
          <SearchBar
            value={query}
            onChangeText={(v: string) => setQuery(v)}
            placeholder={t("shipment_search_placeholder")}
            leftIconName="search-outline"
            onSearch={() => { }}
          />


        </View>
      </ScreenHero>

      {/* ONLY THIS AREA SCROLLS */}
      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {authLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator />
              <Text style={styles.centerText}>{t("shipment_loading")}</Text>
            </View>
          ) : !isLoggedIn ? (
            <View style={styles.guestWrap}>
              <View style={styles.guestPill}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={ORANGE}
                />
                <Text
                  style={styles.guestPillText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {t("shipment_login_prompt")}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleGoLogin}
                style={styles.loginChip}
              >
                <Ionicons name="log-in-outline" size={16} color={LOGIN_TEXT} />
                <Text style={styles.loginChipText}>
                  {t("shipment_login_button")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator />
              <Text style={styles.centerText}>{t("shipment_loading")}</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
              <Text style={[styles.centerText, { color: "#dc2626" }]}>
                {error}
              </Text>
            </View>
          ) : cards.length === 0 ? (
            <View style={styles.guestWrap}>
              <View style={styles.guestPill}>
                <Ionicons name="cube-outline" size={18} color={ORANGE} />
                <Text
                  style={styles.emptyPillText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {t("shipment_no_parcels")}
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ marginBottom: 14 }}>
              {cards.map((c) => (
                <TouchableOpacity
                  key={`${c.parcelId}-${c.trackingId}`}
                  activeOpacity={0.9}
                  onPress={() => goToDetail(c)}
                  style={styles.trackingCard}
                >
                  <SectionCard>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.trackingId}>{c.trackingId}</Text>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: c.statusBg },
                        ]}
                      >
                        <Text
                          style={[styles.statusText, { color: c.statusColor }]}
                        >
                          {c.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardBodyRow}>
                      <View style={styles.locationsColumn}>
                        <View style={styles.locationRow}>
                          <Ionicons
                            name="location-sharp"
                            size={16}
                            color={ORANGE}
                            style={{ marginRight: 6 }}
                          />
                          <View style={styles.locationTextBlock}>
                            <Text style={styles.cityText}>{c.fromCity}</Text>
                            <Text style={styles.dateText}>{c.fromDate}</Text>
                          </View>
                        </View>

                        {c.toCity ? (
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
                                <Text style={styles.cityText}>{c.toCity}</Text>
                                <Text style={styles.dateText}>
                                  {c.toDate || "-"}
                                </Text>
                              </View>
                            </View>
                          </>
                        ) : null}
                      </View>

                      <View style={styles.illustration}>
                        <Ionicons
                          name={getStatusIcon(c.statusKey)}
                          size={34}
                          color={ORANGE}
                        />
                      </View>
                    </View>
                  </SectionCard>
                </TouchableOpacity>
              ))}

              {/* ✅ Pagination */}
              {hasMore ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleLoadMore}
                  style={styles.loadMoreBtn}
                >
                  <Text style={styles.loadMoreText}>
                    {tr("common_load_more", "Load More")}
                  </Text>
                  <Text style={styles.loadMoreSub}>
                    {`${cards.length} / ${filteredParcels.length}`}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
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
  },

  hero: {
    paddingBottom: 60,
  },
  heroContent: {},

  searchWrapper: {
    marginTop: 0,
  },

  countRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  countText: {
    fontSize: 11,
    fontFamily: "Karla-Medium",
    color: "#fff7ed",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // ✅ overlap like tracking page (behind hero)
  main: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
    zIndex: 1,
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
  trackingId: {
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: ORANGE,
    flex: 1,
    marginRight: 10,
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

  loadMoreBtn: {
    marginTop: 6,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 12,
    fontFamily: "Karla-ExtraBold",
    color: ORANGE,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  loadMoreSub: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: "Karla-Regular",
    color: MUTED,
  },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  centerText: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: MUTED,
    textAlign: "center",
  },

  guestWrap: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  guestPill: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  guestPillText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: "#111827",
  },
  emptyPillText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: "#111827",
  },

  loginChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: LOGIN_BTN_BG,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  loginChipText: {
    fontSize: 12,
    fontFamily: "Karla-ExtraBold",
    color: LOGIN_TEXT,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
