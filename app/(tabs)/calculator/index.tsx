// app/(tabs)/calculator/index.tsx
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
import { useRouter } from "expo-router";

import { AppHeader } from "../../../components/AppHeader";
import ScreenHero from "../../../components/layout/ScreenHero";
import SectionCard from "../../../components/card/SectionCard";
import { useLanguage } from "../../../contexts/LanguageContext";

import Input from "../../../components/input/Input";
import MobileAlertDialog, {
  BasicMobileDialogState,
} from "../../../components/modal/MobileAlertDialog";
import { authedFetch } from "../../../config/mobileApiClient";

const ORANGE = "#f59e0b";

/**
 * Single-parcel calculator
 * - Fetch prices from backend:
 *    GET /api/cust_app/calculator/get_package_price
 *    -> { ok: true, package: { size_price, weight_price } }
 *
 * - Volume (m³) = (L*W*H) / 1,000,000  (cm³ -> m³)  -> rounded to 2dp
 * - Size charge  = volumeM3(2dp) * size_price
 * - Weight charge = weightKg * weight_price
 * - Final = max(Size charge, Weight charge)  -> rounded to 2dp
 *
 * - Missing inputs are treated as 0 (no validation popups).
 */

// allow only digits + ONE dot
const decimalOnly = (v: string) => {
  const cleaned = String(v || "").replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
};

function toNum(v: string) {
  const n = Number(String(v || "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

async function safeJson(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export default function CalculatorScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  // fetched prices
  const [sizePrice, setSizePrice] = useState<number>(0); // per m³
  const [weightPrice, setWeightPrice] = useState<number>(0); // per kg
  const [pkgLoading, setPkgLoading] = useState(true);

  const [dialog, setDialog] = useState<BasicMobileDialogState | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPrice = async () => {
      try {
        setPkgLoading(true);

        const res = await authedFetch(
          "/api/cust_app/calculator/get_package_price",
          { method: "GET" }
        );

        const data = await safeJson(res);

        if (!res.ok || !data?.ok) {
          throw new Error(data?.message || `Failed to load price (${res.status})`);
        }

        const sp = Number(data?.package?.size_price ?? 0);
        const wp = Number(data?.package?.weight_price ?? 0);

        if (cancelled) return;

        setSizePrice(Number.isFinite(sp) ? sp : 0);
        setWeightPrice(Number.isFinite(wp) ? wp : 0);
      } catch (e: any) {
        if (cancelled) return;

        // keep prices at 0 if fail
        setSizePrice(0);
        setWeightPrice(0);

        setDialog({
          open: true,
          type: "error",
          title: "Price unavailable",
          message:
            e?.message ||
            "Unable to load package price. Calculation will use 0 price.",
        });
      } finally {
        if (!cancelled) setPkgLoading(false);
      }
    };

    loadPrice();
    return () => {
      cancelled = true;
    };
  }, []);

  const volumeM3 = useMemo(() => {
    const l = Math.max(0, toNum(lengthCm));
    const w = Math.max(0, toNum(widthCm));
    const h = Math.max(0, toNum(heightCm));
    const vol = (l * w * h) / 1_000_000;
    return round2(vol); // ✅ 2dp volume used everywhere
  }, [lengthCm, widthCm, heightCm]);

  const volumeText = useMemo(() => volumeM3.toFixed(2), [volumeM3]);

  const [result, setResult] = useState<{
    volumeM3: number;
    finalCharge: number;
  }>({ volumeM3: 0, finalCharge: 0 });

  const calc = () => {
    // missing = 0
    const kg = Math.max(0, toNum(weightKg));

    const sizeCharge = round2(volumeM3 * Math.max(0, sizePrice));
    const weightCharge = round2(kg * Math.max(0, weightPrice));
    const finalCharge = round2(Math.max(sizeCharge, weightCharge));

    setResult({
      volumeM3,
      finalCharge,
    });
  };

  const reset = () => {
    setLengthCm("");
    setWidthCm("");
    setHeightCm("");
    setWeightKg("");
    setResult({ volumeM3: 0, finalCharge: 0 });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader
        title={t("dashboard_calculator") || "Calculator"}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHero
          backgroundColor={ORANGE}
          style={styles.hero}
          contentStyle={styles.heroContent}
        >
          <Text style={styles.heroTitle}>{t("calc_title")}</Text>


        </ScreenHero>

        <View style={styles.main}>
          <SectionCard title="Calculator" titleStyle={styles.cardTitle}>
            <View style={styles.grid}>
              <View style={styles.field}>
                <Input
                  label={t("calc_length")}
                  value={lengthCm}
                  onChangeText={(v: string) => setLengthCm(decimalOnly(v))}
                  keyboardType="numeric"
                  inputMode="decimal"
                  uiSize="md"
                  showValidation={false}
                  containerStyle={styles.inputShell}
                  inputStyle={styles.inputText}
                  labelStyle={styles.inputLabel}
                  placeholder="0"
                />
              </View>

              <View style={styles.field}>
                <Input
                  label={t("calc_width")}
                  value={widthCm}
                  onChangeText={(v: string) => setWidthCm(decimalOnly(v))}
                  keyboardType="numeric"
                  inputMode="decimal"
                  uiSize="md"
                  showValidation={false}
                  containerStyle={styles.inputShell}
                  inputStyle={styles.inputText}
                  labelStyle={styles.inputLabel}
                  placeholder="0"
                />
              </View>

              <View style={styles.field}>
                <Input
                  label={t("calc_height")}
                  value={heightCm}
                  onChangeText={(v: string) => setHeightCm(decimalOnly(v))}
                  keyboardType="numeric"
                  inputMode="decimal"
                  uiSize="md"
                  showValidation={false}
                  containerStyle={styles.inputShell}
                  inputStyle={styles.inputText}
                  labelStyle={styles.inputLabel}
                  placeholder="0"
                />
              </View>

              <View style={styles.field}>
                <Input
                  label={t("calc_volume")}
                  value={volumeText}
                  editable={false}
                  uiSize="md"
                  showValidation={false}
                  containerStyle={styles.inputShellReadonly}
                  inputStyle={styles.inputTextReadonly}
                  labelStyle={styles.inputLabel}
                  placeholder="0.00"
                />
              </View>

              <View style={styles.field}>
                <Input
                  label={t("calc_weight")}
                  value={weightKg}
                  onChangeText={(v: string) => setWeightKg(decimalOnly(v))}
                  keyboardType="numeric"
                  inputMode="decimal"
                  uiSize="md"
                  showValidation={false}
                  containerStyle={styles.inputShell}
                  inputStyle={styles.inputText}
                  labelStyle={styles.inputLabel}
                  placeholder="0"
                />
              </View>

              {/* keep grid symmetry */}
              <View style={styles.field} />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={calc}
                activeOpacity={0.9}
              >
                <Ionicons name="calculator-outline" size={16} color="#ffffff" />
                <Text style={styles.btnPrimaryText}>{t("calc_calculate_button")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnGhost}
                onPress={reset}
                activeOpacity={0.85}
              >
                <Text style={styles.btnGhostText}>{t("calc_reset_button")}</Text>
              </TouchableOpacity>
            </View>
          </SectionCard>

          <View style={{ height: 12 }} />

          <SectionCard title={t("calc_result_section")} titleStyle={styles.cardTitle}>
            <View style={styles.resultBox}>

              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, styles.resultLabelStrong]}>
                  {t("calc_total_price")}
                </Text>
                <Text style={[styles.resultValue, styles.resultValueStrong]}>
                  {result.finalCharge.toFixed(2)}
                </Text>
              </View>
            </View>
          </SectionCard>
        </View>
      </ScrollView>

      <MobileAlertDialog
        dialog={dialog}
        onClose={() => setDialog(null)}
        okLabel={t("calc_ok_label")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContent: { paddingBottom: 24 },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 18
  },
  heroContent: { alignItems: "center" },
  heroTitle: {
    fontSize: 18,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
    letterSpacing: 1,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: "#fff7ed",
    textAlign: "center",
    lineHeight: 16,
    opacity: 0.95,
  },
  priceRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  main: {
    marginTop: -90,
    paddingHorizontal: 20
  },

  cardTitle: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  field: { width: "48%" },

  // Input component default is dark; override to match white SectionCard
  inputShell: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 12,
    borderWidth: 1,
  },
  inputShellReadonly: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderRadius: 12,
    borderWidth: 1,
  },
  inputText: {
    color: "#111827",
    fontFamily: "Karla-Medium",
    fontSize: 13,
  },
  inputTextReadonly: {
    color: "#6b7280",
    fontFamily: "Karla-Medium",
    fontSize: 13,
  },
  inputLabel: {
    color: "#6b7280",
    fontFamily: "Karla-Bold",
    fontSize: 11,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  btnPrimary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnPrimaryText: {
    fontSize: 12,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  btnGhost: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostText: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  resultBox: { gap: 10, paddingBottom: 4 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultLabel: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: "#6b7280",
  },
  resultLabelStrong: { color: "#111827" },
  resultValue: {
    fontSize: 12,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
  },
  resultValueStrong: { color: "#111827" },

  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 6 },

  note: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: "Karla-Medium",
    color: "#9ca3af",
    lineHeight: 16,
  },
});
