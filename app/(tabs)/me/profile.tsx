// app/(tabs)/me/profile.tsx

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { AppHeader } from "../../../components/AppHeader";
import ScreenHero from "../../../components/layout/ScreenHero";
import CustomButton from "../../../components/button/CustomButton";

import MobileAlertDialog, {
  BasicMobileDialogState,
} from "../../../components/modal/MobileAlertDialog";
import MobileFormModal from "../../../components/modal/MobileFormModal";
import { useLanguage } from "@/contexts/LanguageContext";
const ORANGE = "#f59e0b";
const BORDER = "#e5e7eb";
const MUTED = "#6b7280";

type Addr = {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
  note?: string;
};

function formatAddr(a: Addr) {
  const parts = [
    a.name?.trim(),
    a.phone?.trim(),
    a.line1?.trim(),
    a.line2?.trim(),
    [a.postcode?.trim(), a.city?.trim()].filter(Boolean).join(" "),
    [a.state?.trim(), a.country?.trim()].filter(Boolean).join(", "),
    a.note?.trim(),
  ].filter(Boolean);

  return parts.join("\n");
}

export default function MeProfileScreen() {
  const router = useRouter();
  const { backTo } = useLocalSearchParams<{ backTo?: string }>();
  const { t } = useLanguage();
  // ✅ Dialog (no Alert)
  const [dialog, setDialog] = useState<BasicMobileDialogState | null>(null);
  const closeDialog = () => setDialog(null);

  // ✅ Hardcode profile (later hook API/storage)
  const [fullName, setFullName] = useState("ADMIN");
  const [email, setEmail] = useState("admin@gmail.com");
  const [phone, setPhone] = useState("0123456789");

  // ✅ Hardcode addresses
  const [shipping, setShipping] = useState<Addr>({
    name: "SOFIA (CUST123)",
    phone: "012-3456789",
    line1: "Softworld Logistics Warehouse",
    line2: "Lot 88, Jalan Pending, Pending Industrial Area",
    postcode: "93450",
    city: "Kuching",
    state: "Sarawak",
    country: "Malaysia",
    note: "Put your customer code in receiver name.",
  });

  const [delivery, setDelivery] = useState<Addr>({
    name: "Sofia",
    phone: "012-3456789",
    line1: "No. 12, Jalan Green Heights",
    line2: "Taman Green",
    postcode: "93350",
    city: "Kuching",
    state: "Sarawak",
    country: "Malaysia",
    note: "",
  });

  const shipText = useMemo(() => formatAddr(shipping), [shipping]);
  const deliveryText = useMemo(() => formatAddr(delivery), [delivery]);

  // ✅ Modal (reusable)
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrMode, setAddrMode] = useState<"shipping" | "delivery">("shipping");
  const [addrDraft, setAddrDraft] = useState<Addr>({});

  const handleBack = () => {
    if (backTo) router.replace(backTo as any);
    else router.back();
  };

  const copyAddress = async (text: string) => {
    const v = (text || "").trim();
    if (!v) {
      setDialog({
        open: true,
        type: "error",
        title: t("me_no_address_title"),
        message: t("me_delivery_address_empty"),
      });
      return;
    }

    try {
      await Clipboard.setStringAsync(v);
      setDialog({
        open: true,
        type: "success",
        title: t("me_copied"),
        message: t("me_copied_message"),
      });
    } catch (e) {
      console.log("Copy error:", e);
      setDialog({
        open: true,
        type: "error",
        title: "Error",
        message: t("me_error_message"),
      });
    }
  };

  // ✅ Only ONE save button (no confusion)
  const saveProfile = () => {
    setDialog({
      open: true,
      type: "success",
      title: t("me_saved"),
      message: t("me_profile_saved_message"),
    });
  };

  const openEditAddress = (mode: "shipping" | "delivery") => {
    setAddrMode(mode);
    setAddrDraft(mode === "shipping" ? { ...shipping } : { ...delivery });
    setAddrModalOpen(true);
  };

  const closeAddrModal = () => setAddrModalOpen(false);

  const saveAddressModal = () => {
    if (addrMode === "shipping") setShipping({ ...addrDraft });
    else setDelivery({ ...addrDraft });

    setAddrModalOpen(false);

    setDialog({
      open: true,
      type: "success",
      title: t("me_updated"),
      message: t("me_address_updated"),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader titleKey="me_profile" showBack onBack={handleBack} />

      {/* ✅ fixed hero (not scroll) */}
      <ScreenHero backgroundColor={ORANGE} />

      {/* ✅ fixed white section in safe area */}
      <View style={styles.main}>
        <View style={styles.whiteCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{t("me_profile_title")}</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={saveProfile}
              style={styles.headerIconBtn}
            >
              <Ionicons name="save-outline" size={18} />
            </TouchableOpacity>
          </View>

          {/* ✅ only this scrolls */}
          <ScrollView
            style={styles.cardScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Profile fields */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>{t("me_full_name")}</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t("me_full_name_placeholder")}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>{t("me_email")}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder={t("me_email_placeholder")}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>{t("me_phone")}</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder={t("me_phone_placeholder")}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={{ height: 8 }} />
            <Text style={styles.sectionMiniTitle}>{t("me_addresses")}</Text>

            {/* Shipping block (read-only text + copy + edit modal) */}
            <View style={styles.addrBox}>
              <View style={styles.addrTopRow}>
                <View style={styles.addrTitleWrap}>
                  <Ionicons name="cube-outline" size={16} color={ORANGE} />
                  <Text style={styles.addrTitle}>{t("me_shipping_address")}</Text>
                </View>

                <View style={styles.addrActions}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    activeOpacity={0.85}
                    onPress={() => copyAddress(shipText)}
                  >
                    <Ionicons name="copy-outline" size={16} color="#111827" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconBtn}
                    activeOpacity={0.85}
                    onPress={() => openEditAddress("shipping")}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.addrHint}>
                Use this address for seller shipping (Shopee/Lazada/Taobao).
              </Text>

              <View style={styles.addrTextBox}>
                <Text style={styles.addrText}>{shipText || "-"}</Text>
              </View>
            </View>

            {/* Delivery block */}
            <View style={styles.addrBox}>
              <View style={styles.addrTopRow}>
                <View style={styles.addrTitleWrap}>
                  <Ionicons name="home-outline" size={16} color={ORANGE} />
                  <Text style={styles.addrTitle}>{t("me_delivery_address_home")}</Text>
                </View>

                <View style={styles.addrActions}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    activeOpacity={0.85}
                    onPress={() => copyAddress(deliveryText)}
                  >
                    <Ionicons name="copy-outline" size={16} color="#111827" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconBtn}
                    activeOpacity={0.85}
                    onPress={() => openEditAddress("delivery")}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.addrHint}>
                We will deliver to this address (optional).
              </Text>

              <View style={styles.addrTextBox}>
                <Text style={styles.addrText}>{deliveryText || "-"}</Text>
              </View>
            </View>



            <View style={{ height: 8 }} />
          </ScrollView>
        </View>
      </View>

      {/* ✅ reusable edit modal */}
      <MobileFormModal
        open={addrModalOpen}
        title={addrMode === "shipping" ? t("me_edit_shipping_address") : t("me_edit_delivery_address")}
        onClose={closeAddrModal}
        onSubmit={saveAddressModal}
        submitLabel={t("me_save")}
        cancelLabel={t("me_cancel")}
      >
        <Text style={styles.modalLabel}>{t("me_receiver_name")}</Text>
        <TextInput
          style={styles.modalInput}
          value={addrDraft.name || ""}
          onChangeText={(v) => setAddrDraft((p) => ({ ...p, name: v }))}
          placeholder={t("me_receiver_name_placeholder")}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.modalLabel}>{t("me_phone")}</Text>
        <TextInput
          style={styles.modalInput}
          value={addrDraft.phone || ""}
          onChangeText={(v) => setAddrDraft((p) => ({ ...p, phone: v }))}
          placeholder={t("me_phone_placeholder")}
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
        />

        <Text style={styles.modalLabel}>{t('me_address_line_1')}</Text>
        <TextInput
          style={styles.modalInput}
          value={addrDraft.line1 || ""}
          onChangeText={(v) => setAddrDraft((p) => ({ ...p, line1: v }))}
          placeholder={t("me_address_line_1_placeholder")}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.modalLabel}>{t("me_address_line_2")}</Text>
        <TextInput
          style={styles.modalInput}
          value={addrDraft.line2 || ""}
          onChangeText={(v) => setAddrDraft((p) => ({ ...p, line2: v }))}
          placeholder={t("me_address_line_2_placeholder")}
          placeholderTextColor="#9ca3af"
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalLabel}>{t("me_postcode")}</Text>
            <TextInput
              style={styles.modalInput}
              value={addrDraft.postcode || ""}
              onChangeText={(v) => setAddrDraft((p) => ({ ...p, postcode: v }))}
              placeholder="e.g. 93200"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalLabel}>{t("me_city")}</Text>
            <TextInput
              style={styles.modalInput}
              value={addrDraft.city || ""}
              onChangeText={(v) => setAddrDraft((p) => ({ ...p, city: v }))}
              placeholder="me_city_placeholder"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalLabel}>{t("me_state")}</Text>
            <TextInput
              style={styles.modalInput}
              value={addrDraft.state || ""}
              onChangeText={(v) => setAddrDraft((p) => ({ ...p, state: v }))}
              placeholder={t("me_state_placeholder")}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalLabel}>{t("me_country")}</Text>
            <TextInput
              style={styles.modalInput}
              value={addrDraft.country || ""}
              onChangeText={(v) => setAddrDraft((p) => ({ ...p, country: v }))}
              placeholder={t("me_country_placeholder")}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <Text style={styles.modalLabel}>{t("me_note")}</Text>
        <TextInput
          style={styles.modalInput}
          value={addrDraft.note || ""}
          onChangeText={(v) => setAddrDraft((p) => ({ ...p, note: v }))}
          placeholder={t('me_note_placeholder')}
          placeholderTextColor="#9ca3af"
        />
      </MobileFormModal>

      <MobileAlertDialog dialog={dialog} onClose={closeDialog} okLabel="OK" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f4f6" },

  // ✅ fixed white area in safe area
  main: {
    flex: 1,
    marginTop: -130, // overlap hero
    paddingHorizontal: 20,
    paddingBottom: 14,
  },

  whiteCard: {
    flex: 1, // ✅ this makes it fixed and fill remaining space
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },

  // card header fixed (non-scroll)
  cardTitle: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 0,
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    textTransform: "uppercase"
  },

  // only inner scroll
  cardScroll: { flex: 1 },
  cardScrollContent: { padding: 14, paddingBottom: 16 },

  fieldBlock: { marginBottom: 12 },
  label: {
    fontSize: 11,
    fontFamily: "Karla-Bold",
    color: "#4b5563",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: "Karla-Regular",
    backgroundColor: "#f9fafb",
  },

  sectionMiniTitle: {
    marginTop: 2,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  addrBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    padding: 12,
  },
  addrTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addrTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    paddingRight: 10,
  },
  addrTitle: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: "#111827",
  },
  addrActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  addrHint: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: "Karla-Regular",
    color: MUTED,
  },
  addrTextBox: {
    marginTop: 10,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 10,
    padding: 10,
  },
  addrText: {
    fontSize: 12.5,
    fontFamily: "Karla-Regular",
    color: "#111827",
    lineHeight: 18,
  },

  // modal inputs
  modalLabel: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 11,
    fontFamily: "Karla-Bold",
    color: "#4b5563",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: "Karla-Regular",
    backgroundColor: "#f9fafb",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },


  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 15,
    marginTop: 10
  },


});
