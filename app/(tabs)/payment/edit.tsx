import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "../../../components/AppHeader";
import CustomButton from "../../../components/button/CustomButton";
import SectionCard from "../../../components/card/SectionCard";
import Input from "../../../components/input/Input";
import ScreenHero from "../../../components/layout/ScreenHero";

import MobileAlertDialog, { BasicMobileDialogState } from "../../../components/modal/MobileAlertDialog";
import MobileSelectCenterModal, { SelectOption } from "../../../components/modal/MobileSelectModal";

import * as DocumentPicker from "expo-document-picker";
import { useLanguage } from "../../../contexts/LanguageContext";

const ORANGE = "#f59e0b";
const APP_BG = "#f3f4f6";
const BORDER = "#e5e7eb";
const MUTED = "#2e2f31";

type PaymentStatus = "PAID" | "PENDING" | "REJECTED";

type PaymentItem = {
  id: number;
  paymentNo: string;
  amount: number;
  method: string;
  referenceNo: string;
  date: string; // YYYY-MM-DD
  status: PaymentStatus;
  receiptName?: string | null;
  remarks?: string;
};

type ReceiptFile = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
};

const MOCK_PAYMENTS: PaymentItem[] = [
  { id: 1, paymentNo: "PMT-000123", amount: 150, method: "Online Banking", referenceNo: "ABC123XYZ", date: "2026-01-20", status: "PAID", receiptName: "receipt_0123.jpg" },
  { id: 2, paymentNo: "PMT-000124", amount: 75, method: "Cash Deposit", referenceNo: "CD-889900", date: "2026-01-19", status: "PENDING", receiptName: "receipt_0124.pdf" },
  { id: 3, paymentNo: "PMT-000125", amount: 240, method: "E-Wallet", referenceNo: "TNG-778812", date: "2026-01-18", status: "PAID", receiptName: "receipt_0125.jpg" },
  { id: 4, paymentNo: "PMT-000126", amount: 99.9, method: "Credit/Debit Card", referenceNo: "VISA-332211", date: "2026-01-17", status: "REJECTED", receiptName: null, remarks: "Blurry receipt" },
];

function normalizeParam(v: unknown): string {
  if (Array.isArray(v)) return String(v[0] ?? "");
  return String(v ?? "");
}

export default function EditPaymentScreen() {
  const { t } = useLanguage();
  const tr = (key: string, fallback: string) => {
    const v = (t as any)(key);
    return !v || v === key ? fallback : v;
  };

  const params = useLocalSearchParams<{ id?: string; editId?: string; backTo?: string }>();
  const idParam = normalizeParam(params.id || params.editId);
  const backTo = normalizeParam(params.backTo);

  const payment = useMemo<PaymentItem | null>(() => {
    if (!idParam) return null;

    const num = Number(idParam);
    if (!Number.isNaN(num)) {
      const byId = MOCK_PAYMENTS.find((p) => p.id === num);
      if (byId) return byId;
    }

    return MOCK_PAYMENTS.find((p) => p.paymentNo === idParam) ?? null;
  }, [idParam]);

  // dialog
  const [dialog, setDialog] = useState<BasicMobileDialogState | null>(null);
  const closeDialog = () => setDialog(null);

  // form state (prefill once via init)
  const [amount, setAmount] = useState<string>(() => (payment ? String(payment.amount) : ""));
  const [method, setMethod] = useState<string>(() => (payment ? payment.method : "Online Banking"));
  const [refNo, setRefNo] = useState<string>(() => (payment ? payment.referenceNo : ""));
  const [date, setDate] = useState<string>(() => (payment ? payment.date : new Date().toISOString().slice(0, 10)));
  const [remarks, setRemarks] = useState<string>(() => (payment?.remarks ?? ""));

  const [receipt, setReceipt] = useState<ReceiptFile | null>(() => {
    if (!payment?.receiptName) return null;
    return {
      uri: "",
      name: payment.receiptName,
      mimeType: "",
      size: undefined,
    };
  });

  // method modal
  const [methodModalOpen, setMethodModalOpen] = useState(false);

  const methodOptions: SelectOption[] = [
    { label: tr("payment_method_online_banking", "Online Banking"), value: "Online Banking" },
    { label: tr("payment_method_cash_deposit", "Cash Deposit"), value: "Cash Deposit" },
    { label: tr("payment_method_card", "Credit/Debit Card"), value: "Credit/Debit Card" },
    { label: tr("payment_method_ewallet", "E-Wallet"), value: "E-Wallet" },
    { label: tr("payment_method_other", "Other"), value: "Other" },

    { label: "FPX Transfer", value: "FPX Transfer" },
    { label: "Bank Cheque", value: "Bank Cheque" },
    { label: "Payment Gateway (Stripe)", value: "Payment Gateway (Stripe)" },
    { label: "PayLater / Instalment", value: "PayLater / Instalment" },
    { label: "Counter Service", value: "Counter Service" },
  ];

  const handleBack = () => {
    if (backTo) router.replace(backTo as any);
    else router.back();
  };

  const pickReceipt = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      const canceled =
        (result as any).canceled === true || (result as any).type === "cancel";
      if (canceled) return;

      const asset = (result as any).assets?.[0] ?? (result as any);

      const next: ReceiptFile = {
        uri: asset.uri,
        name: asset.name ?? "receipt",
        mimeType: asset.mimeType ?? asset.type,
        size: asset.size,
      };

      setReceipt(next);
    } catch (e) {
      console.log("pickReceipt error:", e);
      setDialog({
        open: true,
        type: "error",
        title: tr("common_error", "Error"),
        message: tr("common_try_again", "Something went wrong. Please try again."),
      });
    }
  };

  const removeReceipt = () => setReceipt(null);

  const onSave = () => {
    setDialog({
      open: true,
      type: "success",
      title: tr("common_saved", "Saved"),
      message: tr("payment_updated_mock", "Payment updated (mock UI only)."),
    });
  };

  if (!payment) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <AppHeader
          title={idParam ? `Payment ${idParam}` : tr("payment_details", "Payment Details")}
          showBack
          onBack={handleBack}
        />
        <ScreenHero backgroundColor={ORANGE} style={styles.hero} />
        <View style={styles.main}>
          <View style={styles.whiteCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{tr("payment_details", "Payment Details")}</Text>
            </View>

            <View style={styles.centerBox}>
              <Text style={[styles.centerText, { color: "#dc2626" }]}>
                {tr("payment_not_found", "Payment not found")}
              </Text>
              <Text style={styles.debugText}>Debug id param: {idParam || "-"}</Text>

              <CustomButton preset="primary" onPress={handleBack} style={{ marginTop: 10 }}>
                {tr("common_back", "Back")}
              </CustomButton>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader title={payment.paymentNo} showBack onBack={handleBack} />

      <ScreenHero backgroundColor={ORANGE} style={styles.hero} />

      <View style={styles.main}>
        <View style={styles.whiteCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{tr("payment_details", "Payment Details")}</Text>

            {/* ❌ Removed header save icon (moved to bottom button) */}
          </View>

          <ScrollView
            style={styles.cardScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <SectionCard>
              {/* Amount */}
              <View style={styles.fieldBlock}>
                <Input
                  label={tr("payment_amount", "Amount (MYR)")}
                  value={amount}
                  onChangeText={(v: string) => setAmount(v)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  uiSize="md"
                  labelStyle={styles.inputLabel}
                  containerStyle={styles.inputWrap}
                  inputStyle={styles.inputText}
                  placeholderTextColor="#9ca3af"
                  validationRules={{ required: true }}
                />
              </View>

              {/* Method */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  {tr("payment_method", "Payment Method")}
                  {/* <Text style={styles.req}>*</Text> */}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setMethodModalOpen(true)}
                  style={styles.selectBox}
                >
                  <Text style={styles.selectText} numberOfLines={1}>
                    {method || "-"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={MUTED} />
                </TouchableOpacity>
              </View>

              {/* Reference No */}
              <View style={styles.fieldBlock}>
                <Input
                  label={tr("payment_reference_no", "Reference No")}
                  value={refNo}
                  onChangeText={(v: string) => setRefNo(v)}
                  placeholder={tr("payment_reference_placeholder", "TXN / bank ref / receipt no")}
                  uiSize="md"
                  labelStyle={styles.inputLabel}
                  containerStyle={styles.inputWrap}
                  inputStyle={styles.inputText}
                  placeholderTextColor="#9ca3af"
                  validationRules={{ required: false }}
                />
              </View>

              {/* Date */}
              <View style={styles.fieldBlock}>
                <Input
                  label={tr("payment_date", "Date")}
                  value={date}
                  onChangeText={(v: string) => setDate(v)}
                  placeholder="YYYY-MM-DD"
                  uiSize="md"
                  labelStyle={styles.inputLabel}
                  containerStyle={styles.inputWrap}
                  inputStyle={styles.inputText}
                  placeholderTextColor="#9ca3af"
                  validationRules={{ required: false }}
                />
                <Text style={styles.hint}>
                  {tr("payment_date_hint", "Use format YYYY-MM-DD (date picker later).")}
                </Text>
              </View>

              {/* Upload Receipt */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>{tr("payment_upload_receipt", "Upload Receipt")}</Text>

                <TouchableOpacity activeOpacity={0.9} onPress={pickReceipt} style={styles.uploadBox}>
                  <Ionicons name="cloud-upload-outline" size={18} color={ORANGE} />

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.uploadTitle}>
                      {receipt ? receipt.name : tr("payment_tap_to_upload", "Tap to choose receipt file")}
                    </Text>
                    <Text style={styles.uploadHint}>
                      {receipt
                        ? `${receipt.mimeType || ""}${receipt.size ? ` • ${(receipt.size / 1024).toFixed(0)} KB` : ""}`
                        : tr("payment_upload_hint", "Supports JPG/PNG/PDF")}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </TouchableOpacity>

                {receipt ? (
                  <View style={styles.receiptActions}>
                    <TouchableOpacity activeOpacity={0.85} onPress={pickReceipt} style={styles.smallChip}>
                      <Text style={styles.smallChipText}>{tr("common_change", "Change")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={removeReceipt}
                      style={[styles.smallChip, styles.smallChipDanger]}
                    >
                      <Text style={[styles.smallChipText, { color: "#dc2626" }]}>
                        {tr("common_remove", "Remove")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Remarks */}
                <View style={{ height: 6 }} />
                <Input
                  label={tr("payment_remarks", "Remarks (optional)")}
                  value={remarks}
                  onChangeText={(v: string) => setRemarks(v)}
                  placeholder={tr("payment_remarks_placeholder", "Notes...")}
                  uiSize="md"
                  multiline
                  numberOfLines={3}
                  labelStyle={styles.inputLabel}
                  containerStyle={[styles.inputWrap, { minHeight: 92, alignItems: "flex-start" }]}
                  inputStyle={[styles.inputText, { paddingTop: 10 }]}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </SectionCard>

            <View style={{ height: 10 }} />
          </ScrollView>
        </View>
      </View>

      {/* ✅ Bottom Save button (fixed) */}
      <View style={styles.bottomBar}>
        <CustomButton
          preset="primary"
          onPress={onSave}
          style={styles.saveBtn}
          textStyle={styles.saveBtnText}
        >
          {tr("common_save", "Save")}
        </CustomButton>
      </View>

      <MobileSelectCenterModal
        open={methodModalOpen}
        title={tr("payment_method", "Payment Method")}
        options={methodOptions}
        value={method}
        onClose={() => setMethodModalOpen(false)}
        onSelect={(v: string) => setMethod(v)}
        searchable
        searchPlaceholder={tr("common_search", "Search...")}
      />

      <MobileAlertDialog dialog={dialog} onClose={closeDialog} okLabel="OK" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: APP_BG },
  hero: { paddingBottom: 60 },

  main: {
    flex: 1,
    marginTop: -130,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },

  whiteCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  cardTitle: {
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
    textTransform: "uppercase",
    flex: 1,
    marginRight: 10,
  },

  cardScroll: { flex: 1 },

  // ✅ IMPORTANT: leave room for bottom fixed button
  cardScrollContent: { padding: 14, paddingBottom: 110 },

  fieldBlock: { marginBottom: 12 },

  label: {
    fontSize: 13,
    fontFamily: "Karla-Bold",
    color: "#4b5563",
    marginBottom: 4,
  },
  hint: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: MUTED,
  },

  inputLabel: {
    fontSize: 13,
    fontFamily: "Karla-Bold",
    color: "#4b5563",
    marginBottom: 4,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputText: {
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: "#111827",
  },

  selectBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },

  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  uploadTitle: {
    fontSize: 13.5,
    fontFamily: "Karla-Bold",
    color: "#111827",
  },
  uploadHint: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: MUTED,
  },

  receiptActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  smallChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#ffffff",
  },
  smallChipDanger: {
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
  },
  smallChipText: {
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  centerBox: { alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  centerText: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: "Karla-Medium",
    color: MUTED,
    textAlign: "center",
  },
  debugText: { marginTop: 8, fontSize: 13, fontFamily: "Karla-Regular", color: "#9ca3af" },
  req: { color: "#dc2626" },

  /* ✅ Bottom bar save */
  bottomBar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 12,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  saveBtnText: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
