// app/(tabs)/me/index.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../../../components/AppHeader";
import { useRouter } from "expo-router";
import { useLanguage } from "../../../contexts/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../../config/api";
import { authedFetch } from "../../../config/mobileApiClient";
import ScreenHero from "../../../components/layout/ScreenHero";
import SectionCard from "../../../components/card/SectionCard";
import * as Clipboard from "expo-clipboard";
import MobileAlertDialog, {
  BasicMobileDialogState,
} from "../../../components/modal/MobileAlertDialog";
import QRCode from "react-native-qrcode-svg";
import CustomButton from "../../../components/button/CustomButton";
import MobileFormModal from "@/components/modal/MobileFormModal";


const ORANGE = "#f59e0b";
const BORDER = "#e5e7eb";
const MUTED = "#6b7280";

// you set these in your latest code
const LOGIN_BTN_BG = "#f59e0b";
const LOGIN_TEXT = "#ffffffff";

const MOCK_USER = {
  name: "ADMIN",
  email: "admin@gmail.com",
  phone: "0123456789",
};

// ✅ hardcode for now (later load from API / AsyncStorage)
const MOCK_DELIVERY_ADDRESS =
  "No. 12, Jalan Green Heights, Taman Green, 93350 Kuching, Sarawak, Malaysia";

export default function MeScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [loggingOut, setLoggingOut] = useState(false);

  // ✅ restriction state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [dialog, setDialog] = useState<BasicMobileDialogState | null>(null);
  const closeDialog = () => setDialog(null);

  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const user = MOCK_USER; // later: replace with real API data

  const deliveryAddressText = useMemo(() => {
    return (MOCK_DELIVERY_ADDRESS || "").trim();
  }, []);

  const [qrOpen, setQrOpen] = useState(false);
  const [displayName, setDisplayName] = useState(""); // use username for now

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

        const u = JSON.parse(json);

        setIsLoggedIn(true);

        const name = (u?.username || "").toString().trim();
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



  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      // ✅ Call logout using Bearer token (authedFetch attaches it)
      const res = await authedFetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Optional: log/debug response
      const text = await res.text().catch(() => "");
      console.log("Logout status:", res.status, "body:", text);
    } catch (e) {
      console.log("Logout error:", e);
    } finally {
      try {
        await AsyncStorage.multiRemove([
          "authToken",
          "refreshToken",
          "currentUser",
        ]);
      } catch (e) {
        console.log("Failed clearing storage on logout:", e);
      }

      setLoggingOut(false);
      router.replace("/login" as any);
    }
  };

  const handleGoLogin = () => {
    router.push("/login" as any);
  };

  const goProfile = () => {
    router.replace({
      pathname: "/me/profile",
      params: { backTo: "/me" },
    } as any);
  };

  const goChangePassword = () => {
    router.replace({
      pathname: "/me/change-password",
      params: { backTo: "/me" },
    } as any);
  };

  const goSettings = () => {
    router.replace({
      pathname: "/me/settings",
      params: { backTo: "/me" },
    } as any);
  };

  const copyDeliveryAddress = async () => {
    const v = (deliveryAddressText || "").trim();
    if (!v) {
      setDialog({
        open: true,
        type: "error",
        title: t("me_no_address_title") as any,
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
        title: t("me_error"),
        message: t('me_error_message'),
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader
        titleKey="header_me"
        showBack
        rightAction={
          <TouchableOpacity
            style={{ padding: 4, opacity: isLoggedIn ? 1 : 0.6 }}
            activeOpacity={0.85}
            onPress={() => {
              if (!isLoggedIn) {
                setDialog({
                  open: true,
                  type: "error",
                  title: t("me_qr_login_required"),
                  message: t("me_qr_login_message"),
                });
                return;
              }
              setQrOpen(true);
            }}
          >
            <Ionicons name="qr-code-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        }
      />


      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ORANGE HERO – using shared ScreenHero */}
        <ScreenHero backgroundColor={ORANGE} contentStyle={styles.heroContentTight}>
          {/* ✅ USER (moved nearer to header) */}
          <View style={styles.profileBlock}>
            {authLoading ? (
              <>
                <ActivityIndicator color="#ffffff" />
                <Text style={styles.profileMeta}>
                  {t("loading") || "Loading..."}
                </Text>
              </>
            ) : !isLoggedIn ? (
              <>
                <Text style={styles.profileName}>
                  {t("dashboard_guest") || "Guest"}
                </Text>
                <Text style={styles.profileMeta}>
                  {t("me_login_required_sub") || "Login to manage your account"}
                </Text>
              </>
            ) : (
              <>

                <Text style={styles.profileName}>
                  {(displayName || (t("dashboard_guest") as any) || "Guest").toString().toUpperCase()}
                </Text>
                <Text style={styles.profileMeta}>
                  {user.email} · {user.phone}
                </Text>
              </>
            )}
          </View>
          {/* ✅ Delivery Address preview (always show) */}
          <TouchableOpacity
            activeOpacity={isLoggedIn ? 0.85 : 1}
            onPress={() => {
              if (!isLoggedIn) return; // guest: do nothing
              setAddressModalOpen(true);
            }}
            style={[styles.heroAddrTapRow, !isLoggedIn && { opacity: 0.75 }]}
          >
            <Ionicons name="location-outline" size={14} color="#fef3c7" />

            <View style={styles.heroAddrTextWrap}>
              <Text style={styles.heroAddrLabel}>
                {t("me_delivery_address" as any) || "Delivery Address"}
              </Text>

              <Text style={styles.heroAddrText} numberOfLines={1} ellipsizeMode="tail">
                {isLoggedIn ? (deliveryAddressText || "-") : "-"}
              </Text>
            </View>

            <View style={styles.heroAddrActions}>
              <TouchableOpacity
                activeOpacity={isLoggedIn ? 0.85 : 1}
                disabled={!isLoggedIn}
                onPress={(e) => {
                  // @ts-ignore
                  e?.stopPropagation?.();
                  copyDeliveryAddress();
                }}
                style={[
                  styles.heroCopyBtn,
                  !isLoggedIn && { opacity: 0.35 },
                ]}
              >
                <Ionicons name="copy-outline" size={14} color="#fef3c7" />
              </TouchableOpacity>

              <Ionicons
                name="chevron-forward"
                size={16}
                color={isLoggedIn ? "#fef3c7" : "rgba(254,243,199,0.35)"}
              />
            </View>
          </TouchableOpacity>

        </ScreenHero>

        {/* WHITE MAIN CONTENT */}
        <View style={styles.main}>
          {/* ✅ card sits BELOW hero (no overlap) */}
          <View style={styles.detailWrapper}>
            <SectionCard containerStyle={styles.sectionCardOverride}>
              {authLoading ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator />
                  <Text style={styles.centerText}>
                    {t("loading") || "Loading..."}
                  </Text>
                </View>
              ) : !isLoggedIn ? (
                // ✅ Restriction UI
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
                      {t("me_login_required") ||
                        "Login to access your account settings."}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleGoLogin}
                    style={styles.loginChip}
                  >
                    <Ionicons
                      name="log-in-outline"
                      size={16}
                      color={LOGIN_TEXT}
                    />
                    <Text style={styles.loginChipText}>
                      {t("login") || "Login"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* Edit profile */}
                  <TouchableOpacity
                    style={[styles.row, styles.rowWithBorder]}
                    activeOpacity={0.8}
                    onPress={goProfile}
                  >
                    <View style={styles.rowLeft}>
                      <View style={styles.rowIconCircle}>
                        <Ionicons name="pencil" size={16} color={ORANGE} />
                      </View>
                      <View style={styles.rowTextBlock}>
                        <Text style={styles.rowTitle}>
                          {t("me_profile") || "Edit Profile Information"}
                        </Text>
                        <Text style={styles.rowSubtitle}>
                          {t("me_profile_sub") || "Name · Email · Phone and more"}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.editPill}
                      activeOpacity={0.8}
                      onPress={goProfile}
                    >
                      <Text style={styles.editPillText}>
                        {t("edit") || "Edit"}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {/* Change password */}
                  <TouchableOpacity
                    style={[styles.row, styles.rowWithBorder]}
                    activeOpacity={0.8}
                    onPress={goChangePassword}
                  >
                    <View style={styles.rowLeft}>
                      <View style={styles.rowIconCircle}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={16}
                          color={ORANGE}
                        />
                      </View>
                      <View style={styles.rowTextBlock}>
                        <Text style={styles.rowTitle}>
                          {t("me_change_password") || "Change Password"}
                        </Text>
                        <Text style={styles.rowSubtitle}>
                          {t("me_change_password_sub") || "Click to change password"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Settings */}
                  <TouchableOpacity
                    style={styles.row}
                    activeOpacity={0.8}
                    onPress={goSettings}
                  >
                    <View style={styles.rowLeft}>
                      <View style={styles.rowIconCircle}>
                        <Ionicons
                          name="settings-outline"
                          size={16}
                          color={ORANGE}
                        />
                      </View>
                      <View style={styles.rowTextBlock}>
                        <Text style={styles.rowTitle}>
                          {t("me_settings") || "Settings"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </SectionCard>
          </View>

          {/* bottom logout button (only when logged in) */}
          {!authLoading && isLoggedIn ? (
            <View style={styles.bottomIconWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogout}
                disabled={loggingOut}
                style={styles.logoutButton}
              >
                {loggingOut ? (
                  <ActivityIndicator size="small" color={ORANGE} />
                ) : (
                  <Ionicons name="power-outline" size={26} color={ORANGE} />
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <MobileFormModal
        open={addressModalOpen}
        title={(t("me_delivery_address" as any) || "Delivery Address") as any}
        onClose={() => setAddressModalOpen(false)}
        hideFooter={false}
        footer={
          <>
            <CustomButton preset="print" onPress={copyDeliveryAddress}>
              {(t("copy" as any) || "Copy") as any}
            </CustomButton>

            <CustomButton preset="danger" onPress={() => setAddressModalOpen(false)}>
              {(t("ok" as any) || "OK") as any}
            </CustomButton>
          </>
        }
      >
        <ScrollView
          style={{ maxHeight: 240 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.addrModalText}>{(deliveryAddressText || "-").trim()}</Text>
        </ScrollView>
      </MobileFormModal>


      <MobileAlertDialog dialog={dialog} onClose={closeDialog} okLabel="OK" />


      <MobileFormModal
        open={qrOpen}
        title={(t("me_my_qr") as any) || "My QR"}
        onClose={() => setQrOpen(false)}
        cancelLabel={(t("me_qr_close") as any) || "Close"}
      >
        <Text style={styles.qrSub}>
          {displayName ? `Username: ${displayName}` : "No user found"}
        </Text>

        <View style={styles.qrBox}>
          <QRCode value={displayName || "GUEST"} size={220} />
        </View>
      </MobileFormModal>


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

  // ✅ Pull hero content up (override ScreenHero's childrenBlock marginTop)
  heroContentTight: {
    alignItems: "center",
    marginTop: 0,
  },

  profileBlock: {
    marginTop: 0,
    alignItems: "center",
    width: "100%",
  },

  profileName: {
    fontSize: 16,
    fontFamily: "Karla-ExtraBold",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  profileMeta: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: "Karla-Medium",
    color: "#fef3c7",
    textAlign: "center",
  },

  // ✅ Delivery address row (stays within hero, 1 line only)
  heroAddrTapRow: {
    marginTop: 8,
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  heroAddrTextWrap: {
    flex: 1,
    marginLeft: 8,
    marginRight: 10,
  },
  heroAddrLabel: {
    fontSize: 10.5,
    fontFamily: "Karla-ExtraBold",
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  heroAddrText: {
    fontSize: 11,
    fontFamily: "Karla-Medium",
    color: "#fef3c7",
    lineHeight: 16,
  },
  heroAddrActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroCopyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  // WHITE MAIN CONTENT
  main: {
    marginTop: -30,
    paddingHorizontal: 20,
  },

  // ✅ Card below hero (no overlap)
  detailWrapper: {
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },

  sectionCardOverride: {
    width: "100%",
    paddingVertical: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fee2b3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#fffbeb",
  },
  rowTextBlock: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13,
    fontFamily: "Karla-Bold",
    color: "#111827",
  },
  rowSubtitle: {
    fontSize: 11,
    fontFamily: "Karla-Regular",
    color: MUTED,
    marginTop: 2,
  },
  editPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: ORANGE,
  },
  editPillText: {
    fontSize: 11,
    fontFamily: "Karla-Bold",
    color: "#ffffff",
  },

  bottomIconWrapper: {
    marginTop: 32,
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  // center loader inside card
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  centerText: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: MUTED,
  },

  // guest restriction UI
  guestWrap: {
    width: "100%",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
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

  // ✅ Address Modal
  addrModalBackdrop: {
    flex: 1,
    backgroundColor: "#00000066",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  addrModalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  addrModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  addrModalTitle: {
    fontSize: 14,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
  },
  addrModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  addrModalText: {
    fontSize: 13,
    fontFamily: "Karla-Medium",
    color: "#111827",
    lineHeight: 18,
  },
  addrModalActions: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  addrModalCopyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: ORANGE,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  addrModalCopyText: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: "#ffffff",
  },
  addrModalOkBtn: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f3f4f6",
  },
  addrModalOkText: {
    fontSize: 12,
    fontFamily: "Karla-Bold",
    color: "#111827",
  }, qrBackdrop: {
    flex: 1,
    backgroundColor: "#00000066",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  qrCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  qrTitle: {
    fontSize: 16,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
    textAlign: "center",
  },
  qrSub: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Karla-Medium",
    color: "#6b7280",
    textAlign: "center",
  },
  qrBox: {
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#f9fafb",
  },
  qrBtnRow: {
    marginTop: 14,
  },
  modalFooterBtnWrap: {
    marginLeft: 10,
    flexGrow: 0,
    flexShrink: 1,
    alignSelf: "flex-end",
    maxWidth: "60%",
  },


});
