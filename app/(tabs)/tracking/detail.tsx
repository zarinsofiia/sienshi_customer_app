// app/(tabs)/tracking/detail.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../../components/AppHeader";
import SectionCard from "../../../components/card/SectionCard";
import ScreenHero from "../../../components/layout/ScreenHero";
import { authedFetch } from "../../../config/mobileApiClient";
import { useLanguage } from "../../../contexts/LanguageContext";

const ORANGE = "#f59e0b";

type ParcelLite = {
  id: number;
  parcel_tracking: string | null;
  status?: string | null; // optional (fallback only)
};

type TimelineRow = {
  id: number;
  parcel_id: number;
  tracking_status: string;
  datetime: string; // ISO
  date_created?: string | null;
  date_updated?: string | null;
  remarks?: string | null;
};

function prettifyStatus(s: string | null) {
  const raw = (s || "").toString().trim();
  if (!raw) return "-";
  return raw.replace(/_/g, " ").toUpperCase();
}

function formatDateTime(iso: string | null | undefined) {
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
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dd} ${mm} ${yyyy} ${hh}:${min}`;
}

async function safeJson(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/** ✅ icon mapping */
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

    arranging: "time-outline",
    ready_to_pickup: "storefront-outline",
    estimated_arrival: "calendar-outline",
  };

  return map[s] || "cube-outline";
}

export default function TrackingDetailScreen() {
  const { t } = useLanguage();
  const tAny = t as unknown as (k: string) => string;

  const router = useRouter();
  const { parcelId, trackingId, backTo } = useLocalSearchParams<{
    parcelId?: string;
    trackingId?: string;
    backTo?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [parcel, setParcel] = useState<ParcelLite | null>(null);
  const [timeline, setTimeline] = useState<TimelineRow[]>([]);

  const handleBack = () => {
    if (backTo) router.replace(backTo as any);
    else router.back();
  };

  // ✅ translate by key: tracking_status_<status>
  // ✅ always UPPERCASE display
  const statusTitle = (statusRaw: string) => {
    const status = (statusRaw || "").toString().trim().toLowerCase();
    if (!status) return "-";

    const key = `tracking_status_${status}`;
    const translated = tAny(key);

    const finalText =
      !translated || translated === key ? prettifyStatus(status) : translated;

    return (finalText || "-").toUpperCase();
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const pidStr = (parcelId || "").toString().trim();
      const pid = Number(pidStr);

      if (!pidStr || Number.isNaN(pid) || pid <= 0) {
        setError("Missing parcel id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setParcel(null);
        setTimeline([]);

        // ✅ UPDATED ROUTE
        const res = await authedFetch(
          `/api/cust_app/parcels/get_timeline?id=${encodeURIComponent(
            String(pid)
          )}`,
          { method: "GET" }
        );

        const data = await safeJson(res);
        if (!res.ok) {
          throw new Error(data?.message || `Request failed (${res.status})`);
        }

        const p2: ParcelLite | null =
          Array.isArray(data?.parcel) && data.parcel.length
            ? data.parcel[0]
            : null;

        const t2: TimelineRow[] = Array.isArray(data?.timeline)
          ? data.timeline
          : [];

        if (cancelled) return;

        setParcel(p2);
        setTimeline(t2);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to load tracking details.");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [parcelId]);

  // ✅ latest on top
  const steps = useMemo(() => {
    const rows = Array.isArray(timeline) ? [...timeline] : [];
    rows.sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );

    return rows.map((r, index) => ({
      key: String(r.id),
      title: statusTitle(r.tracking_status),
      time: formatDateTime(r.datetime),
      remarks: (r.remarks || "").toString().trim(),
      active: index === 0,
      statusKey: (r.tracking_status || "").toString().trim().toLowerCase(),
    }));
  }, [timeline, t]);

  const currentStatusKey = useMemo(() => {
    if (steps.length > 0) return steps[0].statusKey;
    return (parcel?.status || "").toString().trim().toLowerCase() || null;
  }, [steps, parcel]);

  const currentStatus = useMemo(() => {
    if (steps.length > 0) return steps[0].title;
    return parcel?.status ? statusTitle(parcel.status) : "-";
  }, [steps, parcel?.status, t]);

  const lastUpdate = useMemo(() => {
    if (steps.length > 0) return steps[0].time;
    return "-";
  }, [steps]);

  const trackingText = useMemo(() => {
    const tid = (trackingId || "").toString().trim();
    if (tid) return tid;

    const p = (parcel?.parcel_tracking || "").toString().trim();
    return p || "-";
  }, [trackingId, parcel]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader
        title={t("header_tracking_detail")}
        showBack
        onBack={handleBack}
      />

      {/* ✅ FIXED HERO (no page scroll) */}
      <ScreenHero
        backgroundColor={ORANGE}
        style={styles.hero}
        contentStyle={styles.heroContent}
      >
        <Text style={styles.heroLabel}>{t("td_tracking_id")}</Text>
        <Text style={styles.heroTrackingId}>{trackingText}</Text>

        <Text style={[styles.heroLabel, { marginTop: 16 }]}>
          {t("td_current_status")}
        </Text>
        <Text style={styles.heroDate}>{currentStatus}</Text>

        <Text style={[styles.heroSmall, { marginTop: 6 }]}>
          {t("td_last_update")}: {lastUpdate}
        </Text>
      </ScreenHero>

      {/* ✅ MAIN AREA IS FIXED; CARD FILLS SCREEN */}
      <View style={styles.main}>
        <SectionCard
          containerStyle={styles.timelineCard}
          title={t("td_title")}
          titleStyle={styles.cardTitle}
        >
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator />
              <Text style={styles.centerText}>{t("td_loading")}</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Ionicons name="alert-circle-outline" size={22} color="#dc2626" />
              <Text style={[styles.centerText, { color: "#dc2626" }]}>
                {error}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.illustrationWrapper}>
                <Ionicons
                  name={getStatusIcon(currentStatusKey)}
                  size={40}
                  color={ORANGE}
                />
              </View>

              {steps.length === 0 ? (
                <View style={styles.centerBox}>
                  <Text style={styles.centerText}>{t("td_no_timeline")}</Text>
                </View>
              ) : (
                // ✅ ONLY TIMELINE SCROLLS
                <ScrollView
                  style={styles.timelineScroll}
                  contentContainerStyle={styles.timelineScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.stepsWrapper}>
                    {steps.map((step, index) => (
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

                          {index < steps.length - 1 && (
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

                          {step.remarks ? (
                            <Text style={styles.stepRemarks}>
                              {t("td_remarks")} : {step.remarks}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </>
          )}
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
    paddingTop: 1,
    paddingBottom: 60,
  },
  heroContent: {
    alignItems: "center",
  },
  heroLabel: {
    fontSize: 13,
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
    fontSize: 14,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
    textAlign: "center",
  },
  heroSmall: {
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: "#fff7ed",
  },

  // ✅ fixed main area; card fills the remaining screen height
  main: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 14,
    marginTop: -10, // keep your overlap look
  },

  timelineCard: {
    flex: 1, // ✅ makes the white card fit the screen area
  },

  cardTitle: {
    fontSize: 13,
    fontFamily: "Karla-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  centerText: {
    fontSize: 13,
    fontFamily: "Karla-Medium",
    color: "#6b7280",
    textAlign: "center",
  },

  illustrationWrapper: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },

  // ✅ scroll only this area
  timelineScroll: {
    flex: 1,
  },
  timelineScrollContent: {
    paddingBottom: 12,
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
    textTransform: "uppercase",
  },
  stepTitleActive: {
    fontFamily: "Karla-Bold",
    color: "#111827",
    textTransform: "uppercase",
  },
  stepTime: {
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: "#9ca3af",
    marginTop: 2,
  },
  stepRemarks: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: "#111827",
  },
});
