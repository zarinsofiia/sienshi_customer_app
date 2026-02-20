// app/(tabs)/payment/add/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

import MobileAlertDialog, {
  BasicMobileDialogState,
} from "../../../components/modal/MobileAlertDialog";
import MobileSelectCenterModal, {
  SelectOption,
} from "../../../components/modal/MobileSelectModal";

import * as DocumentPicker from "expo-document-picker";
import { useLanguage } from "../../../contexts/LanguageContext";

import CustomButton from "../../../components/button/CustomButton";
import Input from "../../../components/input/Input";
import { authedFetch } from "../../../config/mobileApiClient";

const ORANGE = "#f59e0b";
const APP_BG = "#f3f4f6";
const BORDER = "#e5e7eb";
const MUTED = "#6b7280";

type ReceiptFile = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
};

type PaymentMethod = "CASH" | "TRANSFER" | "QR";

export default function AddPaymentScreen() {
  const { backTo } = useLocalSearchParams<{ backTo?: string }>();

  const { t } = useLanguage();
  const tr = (key: string, fallback: string) => {
    const v = (t as any)(key);
    return !v || v === key ? fallback : v;
  };

  const [dialog, setDialog] = useState<BasicMobileDialogState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // form fields (backend body)
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [refNo, setRefNo] = useState("");
  const [remark, setRemark] = useState("");
  const [attachment, setAttachment] = useState<ReceiptFile | null>(null);

  const [methodModalOpen, setMethodModalOpen] = useState(false);

  const handleBack = () => {
    if (submitting) return;
    if (backTo) router.replace(backTo as any);
    else router.back();
  };

  const closeDialog = () => {
    const wasSuccess = dialog?.type === "success";
    setDialog(null);
    if (wasSuccess) handleBack();
  };

  const methodOptions: SelectOption[] = [
    { label: tr("payment_method_cash", "Cash"), value: "CASH" },
    { label: tr("payment_method_transfer", "Transfer"), value: "TRANSFER" },
    { label: tr("payment_method_qr", "QR"), value: "QR" },
  ];

  const methodLabel = useMemo(() => {
    const found = methodOptions.find((o) => o.value === paymentMethod);
    return found?.label ?? paymentMethod;
  }, [paymentMethod]);

  const pickReceipt = async () => {
    if (submitting) return;

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
        name: asset.name ?? "attachment",
        mimeType: asset.mimeType ?? asset.type,
        size: asset.size,
      };

      setAttachment(next);
    } catch (e) {
      console.log("pickReceipt error:", e);
      setDialog({
        open: true,
        type: "error",
        title: tr("common_error", "Error"),
        message: tr("payment_receipt_pick_failed", "Failed to pick attachment."),
      });
    }
  };

  const removeReceipt = () => setAttachment(null);

  const validate = () => {
    const a = (paymentAmount || "").trim();
    const m = (paymentMethod || "").trim();

    if (!a || Number.isNaN(Number(a)) || Number(a) <= 0) {
      setDialog({
        open: true,
        type: "error",
        title: tr("common_error", "Error"),
        message: tr("payment_amount_required", "Please enter a valid amount."),
      });
      return false;
    }

    if (!m) {
      setDialog({
        open: true,
        type: "error",
        title: tr("common_error", "Error"),
        message: tr("payment_method_required", "Please select payment method."),
      });
      return false;
    }

    if (!attachment) {
      setDialog({
        open: true,
        type: "error",
        title: tr("common_error", "Error"),
        message: tr("payment_receipt_required", "Please upload attachment."),
      });
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("payment_amount", String(paymentAmount).trim());
      fd.append("ref_no", String(refNo || "").trim());
      fd.append("payment_method", String(paymentMethod).trim().toUpperCase());
      fd.append("remark", String(remark || "").trim());

      if (attachment) {
        fd.append(
          "attachment",
          {
            uri: attachment.uri,
            name: attachment.name || "attachment",
            type: attachment.mimeType || "application/octet-stream",
          } as any
        );
      }

      const res = await authedFetch("/api/cust_app/payment/insert_payment", {
        method: "POST",
        body: fd,
      });

      const text = await res.text().catch(() => "");
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          tr("common_submit_failed", "Failed to submit payment.");
        throw new Error(msg);
      }

      setDialog({
        open: true,
        type: "success",
        title: tr("payment_submitted", "Submitted"),
        message: tr("payment_submitted_msg", "Payment submitted successfully."),
      });
    } catch (e: any) {
      console.log("insert_payment error:", e);
      setDialog({
        open: true,
        type: "error",
        title: tr("common_error", "Error"),
        message: e?.message || tr("common_submit_failed", "Failed to submit."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader titleKey="payment_add_title" showBack onBack={handleBack} />

      {/* ✅ Like login: KAV wraps the whole page content (including the white card) */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // adjust if your AppHeader height differs
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHero backgroundColor={ORANGE} style={styles.hero} />

          <View style={styles.main}>
            <View style={styles.whiteCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>
                  {tr("payment_details", "Payment Details")}
                </Text>
              </View>

              <View style={styles.cardBody}>
                <SectionCard>
                  {/* Amount */}
                  <View style={styles.fieldBlock}>
                    <Input
                      label={`${tr("payment_amount", "Amount")}`}
                      value={paymentAmount}
                      onChangeText={setPaymentAmount}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#6b7280"
                      containerStyle={styles.inputWhiteWrap}
                      inputStyle={styles.inputWhiteText}
                      labelStyle={styles.labelDark}
                      validationRules={{ required: true }}
                    />
                  </View>

                  {/* Method */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      {tr("payment_method", "Payment Method")}{" "}
                      <Text style={styles.req}>*</Text>
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setMethodModalOpen(true)}
                      style={styles.selectBox}
                      disabled={submitting}
                    >
                      <Text style={styles.selectText} numberOfLines={1}>
                        {methodLabel}
                      </Text>
                      <Ionicons name="chevron-down" size={18} color={MUTED} />
                    </TouchableOpacity>
                  </View>

                  {/* Ref No */}
                  <View style={styles.fieldBlock}>
                    <Input
                      label={`${tr("payment_refno", "Ref No")}`}
                      value={refNo}
                      onChangeText={setRefNo}
                      placeholder={tr(
                        "payment_reference_placeholder",
                        "TXN / bank ref / receipt no"
                      )}
                      placeholderTextColor="#6b7280"
                      containerStyle={styles.inputWhiteWrap}
                      inputStyle={styles.inputWhiteText}
                      labelStyle={styles.labelDark}
                    />
                  </View>

                  {/* Upload attachment */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      {tr("payment_attachment", "Attachment")}{" "}
                      <Text style={styles.req}>*</Text>
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={pickReceipt}
                      style={styles.uploadBox}
                      disabled={submitting}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={18}
                        color={ORANGE}
                      />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.uploadTitle}>
                          {attachment
                            ? attachment.name
                            : tr("payment_tap_to_upload", "Tap to upload")}
                        </Text>
                        <Text style={styles.uploadHint}>
                          {attachment
                            ? `${attachment.mimeType || ""}${
                                attachment.size
                                  ? ` • ${(attachment.size / 1024).toFixed(0)} KB`
                                  : ""
                              }`
                            : tr("payment_upload_hint", "Supports JPG/PNG/PDF")}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>

                    {attachment ? (
                      <View style={styles.receiptActions}>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={pickReceipt}
                          style={styles.smallChip}
                          disabled={submitting}
                        >
                          <Text style={styles.smallChipText}>
                            {tr("common_change", "Change")}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={removeReceipt}
                          style={[styles.smallChip, styles.smallChipDanger]}
                          disabled={submitting}
                        >
                          <Text
                            style={[
                              styles.smallChipText,
                              { color: "#dc2626" },
                            ]}
                          >
                            {tr("common_remove", "Remove")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>

                  {/* Remark */}
                  <View style={styles.fieldBlock}>
                    <Input
                      label={`${tr("payment_remark", "Remark")}`}
                      value={remark}
                      onChangeText={setRemark}
                      placeholder={tr(
                        "payment_remark_placeholder",
                        "Optional remark"
                      )}
                      placeholderTextColor="#6b7280"
                      containerStyle={styles.inputWhiteWrap}
                      inputStyle={styles.inputWhiteText}
                      labelStyle={styles.labelDark}
                    />
                  </View>
                </SectionCard>

                {/* ✅ Submit button is inside the card now, so the whole card moves above keyboard */}
                <View style={styles.submitWrap}>
                  <CustomButton
                    preset="primary"
                    onPress={onSubmit}
                    style={styles.submitBtn}
                    textStyle={styles.submitBtnText}
                  >
                    {submitting ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text
                          style={{
                            color: "#ffffff",
                            fontFamily: "Karla-ExtraBold",
                          }}
                        >
                          {tr("common_processing", "Processing...")}
                        </Text>
                      </View>
                    ) : (
                      tr("payment_submit", "Submit Payment")
                    )}
                  </CustomButton>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <MobileSelectCenterModal
          open={methodModalOpen}
          title={tr("payment_method", "Payment Method")}
          options={methodOptions}
          value={paymentMethod}
          onClose={() => setMethodModalOpen(false)}
          onSelect={(v: string) => setPaymentMethod(v as PaymentMethod)}
        />

        <MobileAlertDialog dialog={dialog} onClose={closeDialog} okLabel="OK" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: APP_BG },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24, // breathing room
  },

  hero: { paddingBottom: 60 },

  main: {
    flex: 1,
    marginTop: -130, // keep your existing layout
    paddingHorizontal: 20,
    paddingBottom: 14,
  },

  whiteCard: {
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

  cardBody: {
    padding: 14,
    paddingBottom: 18,
  },

  fieldBlock: { marginBottom: 12 },

  label: {
    fontSize: 11,
    fontFamily: "Karla-Bold",
    color: "#4b5563",
    marginBottom: 4,
  },
  labelDark: {
    fontSize: 11,
    fontFamily: "Karla-Bold",
    color: "#4b5563",
  },
  req: { color: "#dc2626" },

  inputWhiteWrap: {
    borderColor: BORDER,
    backgroundColor: "#f9fafb",
  },
  inputWhiteText: { color: "#111827" },

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
    fontSize: 11,
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
    fontSize: 11,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  submitWrap: {
    marginTop: 10,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  submitBtnText: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
