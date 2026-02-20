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

type Parcel = {
  id: number;
  cust_code: string | null;
  parcel_no: string | null;
  box_amt: string | null;
  gross_weight: string | null;
  total_weight: string | null;
  box_height: string | null;
  box_width: string | null;
  box_length: string | null;
  parcel_tracking: string | null;
  display_status: string | null;
  manifest_id: number | null;
  status: string | null;
  delivery_type: string | null;
  box_m3: string | null;
  stockin_id: number | null;
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
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dd} ${mm} ${yyyy} ${hh}:${min}`;
}

function statusTitle(status: string) {
  const map: Record<string, string> = {
    cn_warehouse: "Parcel at China Warehouse",
    on_declaration: "Declaration in Progress",
    in_shipment: "Shipping in Progress",
    container_packed: "Container Packed",
    arrived_at_port: "Arrived at Port",
    my_customs_inspection_kch: "Inspection in Kuching",
    customs_clearance_in_progress: "Customs Clearance in Progress",
    kch_custom: "Kuching Customs",
    kch_warehouse: "Arrived at Kuching Warehouse",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cn_customs_clearance: "Customs Clearance (China)",
    cn_customs_inspection: "Inspection in China",
  };

  return map[status] || prettifyStatus(status);
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
  };

  return map[s] || "cube-outline";
}

export default function ShipmentDetailScreen() {
  const router = useRouter();
  const { parcelId, trackingId, backTo } = useLocalSearchParams<{
    parcelId?: string;
    trackingId?: string; // optional display
    backTo?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [timeline, setTimeline] = useState<TimelineRow[]>([]);

  const handleBack = () => {
    if (backTo) router.replace(backTo as any);
    else router.back();
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

        // ✅ ONLY: Get timeline by parcel id
        const res = await authedFetch(
          `/api/parcels/get_timeline?id=${encodeURIComponent(String(pid))}`,
          { method: "GET" }
        );

        const data = await safeJson(res);
        if (!res.ok) {
          throw new Error(data?.message || `Request failed (${res.status})`);
        }

        const p2: Parcel | null =
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

  // ✅ Keep duplicates; show remarks if exists; sort newest first
  const steps = useMemo(() => {
    const rows = Array.isArray(timeline) ? [...timeline] : [];

    rows.sort((a, b) => {
      const ta = new Date(a.datetime).getTime();
      const tb = new Date(b.datetime).getTime();
      return tb - ta; // newest first
    });

    return rows.map((r, index) => ({
      key: String(r.id),
      title: statusTitle(r.tracking_status),
      time: formatDateTime(r.datetime),
      remarks: (r.remarks || "").toString().trim(),
      active: index === 0,
      statusKey: (r.tracking_status || "").toString().trim().toLowerCase(),
    }));
  }, [timeline]);

  const currentStatusKey = useMemo(() => {
    if (steps.length > 0) return steps[0].statusKey;
    return (parcel?.status || "").toString().trim().toLowerCase() || null;
  }, [steps, parcel]);

  const currentStatus = useMemo(() => {
    if (steps.length > 0) return steps[0].title;
    return parcel?.status ? statusTitle(parcel.status) : "-";
  }, [steps, parcel]);

  const lastUpdate = useMemo(() => {
    if (steps.length > 0) return steps[0].time;
    return "-";
  }, [steps]);

  const trackingText = useMemo(() => {
    const t = (trackingId || "").toString().trim();
    if (t) return t;
    const p = (parcel?.parcel_tracking || "").toString().trim();
    return p || "-";
  }, [trackingId, parcel]);


  const { t } = useLanguage();
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader title={t("header_shipment")} showBack onBack={handleBack} />

      <ScreenHero
        backgroundColor={ORANGE}
        style={styles.hero}
        contentStyle={styles.heroContent}
      >
        <Text style={styles.heroLabel}>{t("sd_tracking_id")}</Text>
        <Text style={styles.heroTrackingId}>{trackingText}</Text>

        <Text style={[styles.heroLabel, { marginTop: 16 }]}>{t("sd_current_status")}</Text>
        <Text style={styles.heroDate}>{currentStatus}</Text>

        <Text style={[styles.heroSmall, { marginTop: 6 }]}>
          Last update: {lastUpdate}
        </Text>
      </ScreenHero>

      <View style={styles.main}>
        <SectionCard
          containerStyle={styles.timelineCard}
          title="TRACK PARCEL"
          titleStyle={styles.cardTitle}
        >
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator />
              <Text style={styles.centerText}>{t("sd_loading")}</Text>
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
                  <Text style={styles.centerText}>{t("sd_no_timeline")}</Text>
                </View>
              ) : (
                <ScrollView
                  style={{ maxHeight: 520 }}
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
                              {t("sd_remarks")}: {step.remarks}
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
    paddingTop: 2,
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

  main: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: -40,
  },

  timelineCard: {},

  cardTitle: {
    fontSize: 13,
    fontFamily: "Karla-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  centerBox: {
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
