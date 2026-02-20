// app/(tabs)/payment/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "../../../components/AppHeader";
import SectionCard from "../../../components/card/SectionCard";
import ScreenHero from "../../../components/layout/ScreenHero";
import SearchBar from "../../../components/search/SearchBar";
import { useLanguage } from "../../../contexts/LanguageContext";
import { authedFetch } from "../../../config/mobileApiClient";

const ORANGE = "#f59e0b";
const APP_BG = "#f3f4f6";
const BORDER = "#e5e7eb";
const MUTED = "#2e2f31";

const PAGE_SIZE = 10;

type ApiPaymentRow = {
  id: number | string;
  payment_amount?: string | null; // "RM10.00"
  payment_date?: string | null;   // ISO
  status?: string | null;         // "VERIFIED" | "UNVERIFIED" | "VOID" (depends backend)
  payment_method?: string | null; // "CASH" | "TRANSFER" | ...
};

type PaymentStatus = "UNVERIFIED" | "VERIFIED" | "VOID";

export type PaymentRecord = {
  id: number;
  // paymentNo: string;
  amount: number;
  method: string;
  date: string; // YYYY-MM-DD
  status: PaymentStatus;
};

function toStatus(raw: any): PaymentStatus {
  const s = String(raw ?? "").trim().toUpperCase();
  if (s === "VERIFIED" || s === "UNVERIFIED" || s === "VOID") return s as PaymentStatus;
  // fallback: treat unknown as UNVERIFIED
  return "UNVERIFIED";
}

function statusColors(status: PaymentStatus) {
  if (status === "VERIFIED") return { bg: "#dcfce7", fg: "#16a34a" };
  if (status === "VOID") return { bg: "#fee2e2", fg: "#b91c1c" };
  return { bg: "#ffedd5", fg: "#f97316" }; // UNVERIFIED
}

function isoToYmd(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseMoneyToNumber(v?: string | null) {
  if (!v) return 0;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function money(v: number) {
  return `MYR ${v.toFixed(2)}`;
}

async function fetchPaymentListing(): Promise<ApiPaymentRow[]> {
  const res = await authedFetch("/api/cust_app/payment/get_payment_listing", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const text = await res.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (Array.isArray(data)) return data as ApiPaymentRow[];
  if (Array.isArray(data?.data)) return data.data as ApiPaymentRow[];
  return [];
}


export default function PaymentScreen() {
  const { t } = useLanguage();
  const tr = useCallback(
    (key: string, fallback: string) => {
      const v = (t as any)(key);
      return !v || v === key ? fallback : v;
    },
    [t]
  );

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [records, setRecords] = useState<PaymentRecord[]>([]);

  const load = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const apiRows = await fetchPaymentListing();

      const mapped: PaymentRecord[] = apiRows.map((r) => {
        const idNum = Number(r.id);
        return {
          id: Number.isFinite(idNum) ? idNum : 0,
          // paymentNo: `PMT-${String(idNum).padStart(6, "0")}`,
          amount: parseMoneyToNumber(r.payment_amount),
          method: String(r.payment_method ?? "-"),
          date: isoToYmd(r.payment_date),
          status: toStatus(r.status),
        };
      });

      // sort by id desc (latest first)
      mapped.sort((a, b) => (b.id || 0) - (a.id || 0));

      setRecords(mapped);
      setPage(1);
    } catch (e: any) {
      setRecords([]);
      setError(e?.message || tr("common_error", "Failed to load payments."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tr]);

  // ✅ fetch ONCE (no infinite loop)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await load("initial");
    })();
    return () => {
      mounted = false;
    };
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;

    return records.filter((p) => {
      const hay = [
        // p.paymentNo,
        p.method,
        p.status,
        p.date,
        String(p.amount),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [records, query]);

  const hasMore = filtered.length > page * PAGE_SIZE;
  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);

  const subtitleText = useMemo(() => `TOTAL: ${filtered.length}`, [filtered.length]);

  const goToDetail = (id: number) => {
    router.push({
      pathname: "/payment/detail",
      params: { id: String(id), backTo: "/payment" },
    });
  };

  const handleLoadMore = () => {
    if (!hasMore) return;
    setPage((p) => p + 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader titleKey="header_payment" showBack />

      <ScreenHero
        backgroundColor={ORANGE}
        title={tr("payment_title", "Payment")}
        subtitle={subtitleText}
        style={styles.hero}
        contentStyle={styles.heroContent}
      >
        <View style={styles.searchWrapper}>
          <SearchBar
            value={query}
            onChangeText={(v: string) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder={tr("payment_search_placeholder", "Search by amount / method / status...")}
            leftIconName="search-outline"
            onSearch={() => {}}
          />
        </View>

        {/* Refresh button (optional) */}
        {/* <View style={{ marginTop: 10, alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={() => load("refresh")}
            activeOpacity={0.85}
            style={styles.refreshBtn}
            disabled={refreshing || loading}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={ORANGE} />
            ) : (
              <>
                <Ionicons name="refresh" size={16} color={ORANGE} />
                <Text style={styles.refreshText}>{tr("common_refresh", "Refresh")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View> */}
      </ScreenHero>

      <View style={styles.main} pointerEvents="box-none">
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="small" color={ORANGE} />
              <Text style={styles.centerText}>{tr("common_loading", "Loading...")}</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
              <Text style={[styles.centerText, { color: "#ef4444" }]}>{error}</Text>

              <TouchableOpacity
                onPress={() => load("refresh")}
                activeOpacity={0.9}
                style={[styles.loadMoreBtn, { marginTop: 12 }]}
              >
                <Text style={styles.loadMoreText}>{tr("common_try_again", "Try Again")}</Text>
              </TouchableOpacity>
            </View>
          ) : visible.length === 0 ? (
            <View style={styles.centerBox}>
              <Ionicons name="information-circle-outline" size={20} color={ORANGE} />
              <Text style={styles.centerText}>{tr("payment_empty", "No payments")}</Text>
            </View>
          ) : (
            <View style={{ marginBottom: 14 }}>
              {visible.map((p) => {
                const c = statusColors(p.status);

                return (
                  <TouchableOpacity
                    key={String(p.id)}
                    activeOpacity={0.9}
                    onPress={() => goToDetail(p.id)}
                    style={styles.paymentCard}
                  >
                    <SectionCard>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.paymentNo}>{money(p.amount)}</Text>

                        <View style={[styles.statusPill, { backgroundColor: c.bg }]}>
                          <Text style={[styles.statusText, { color: c.fg }]}>{p.status}</Text>
                        </View>
                      </View>

                      <View style={styles.cardBodyRow}>
                        <View style={{ flex: 1 }}>
                          {/* <Text style={styles.amountText}>{money(p.amount)}</Text> */}

                          <Text style={styles.metaText}>
                            {tr("payment_method", "Method")}: {p.method}
                          </Text>

                          <Text style={styles.metaText}>
                            {tr("payment_date", "Date")}: {p.date}
                          </Text>
                        </View>

                        <View style={styles.rightIconWrap}>
                          <Ionicons name="receipt-outline" size={24} color={ORANGE} />
                        </View>
                      </View>
                    </SectionCard>
                  </TouchableOpacity>
                );
              })}

              {hasMore ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleLoadMore}
                  style={styles.loadMoreBtn}
                >
                  <Text style={styles.loadMoreText}>
                    {tr("common_load_more", "Load More")}
                  </Text>
                  <Text style={styles.loadMoreSub}>{`${visible.length} / ${filtered.length}`}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() =>
            router.push({
              pathname: "/payment/add",
              params: { backTo: "/payment" },
            })
          }
          style={styles.fab}
        >
          <Ionicons name="add" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: APP_BG },

  hero: { paddingBottom: 60 },
  heroContent: {},
  searchWrapper: { marginTop: 0 },

  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  refreshText: {
    fontSize: 13,
    fontFamily: "Karla-Bold",
    color: ORANGE,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  main: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 5,
    zIndex: 1,
  },

  listScroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  paymentCard: { marginBottom: 12 },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentNo: {
    fontSize: 14,
    fontFamily: "Karla-ExtraBold",
    color: "#000000",
    flex: 1,
    marginRight: 10,
  },

  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Karla-Bold",
    textTransform: "uppercase",
  },

  cardBodyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  amountText: {
    fontSize: 13,
    fontFamily: "Karla-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: MUTED,
    marginTop: 2,
  },
  rightIconWrap: {
    marginLeft: 10,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: ORANGE,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  loadMoreSub: {
    marginTop: 4,
    fontSize: 13,
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
    fontSize: 13,
    fontFamily: "Karla-Medium",
    color: MUTED,
    textAlign: "center",
  },

  fab: {
    position: "absolute",
    right: 14,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",

    zIndex: 9999,
    elevation: 10,

    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
});
