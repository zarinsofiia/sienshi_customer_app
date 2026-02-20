// app/login.tsx
import AsyncButton from "@/components/button/AsnycButton";
import Input from "@/components/input/Input";
import MobileAlertDialog, {
  BasicMobileDialogState,
} from "@/components/modal/MobileAlertDialog";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../config/api";
import { useLanguage } from "../contexts/LanguageContext";
import { registerPushTokens } from "../hooks/registerPush";

const ORANGE = "#f59e0b";
const WHITE = "#ffffffff";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { t, lang, setLang } = useLanguage();

  const [dialog, setDialog] = useState<BasicMobileDialogState | null>(null);

  const closeDialog = () => setDialog(null);

  const showError = (message: string) => {
    setDialog({
      open: true,
      type: "error",
      title: t("settings_error_title") || "Error",
      message,
    });
  };

  const handleLogin = async () => {
    if (!username || !password) {
      showError(t("login_missing_fields") || "Please enter username and password.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/custLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          language: lang,
        }),
      });

      const data = await res.json().catch(() => null);

      console.log("login status:", res.status, "body:", data);

      if (!res.ok) {
        const msg =
          data?.message ||
          t("login_error") ||
          "Login failed. Please try again.";
        showError(msg);
        return;
      }

      // ✅ LOGIN SUCCESS — SAVE TOKEN(S)
      const accessToken = data?.token || data?.accessToken;
      const refreshTokenFromApi = data?.refreshToken;

      if (accessToken) {
        try {
          await AsyncStorage.setItem("authToken", accessToken);
        } catch (e) {
          console.log("Failed to save authToken:", e);
        }
      } else {
        console.log("[custLogin] No token/accessToken found in response:", data);
      }

      const tokenForRefresh = refreshTokenFromApi || accessToken;
      if (tokenForRefresh) {
        try {
          await AsyncStorage.setItem("refreshToken", tokenForRefresh);
        } catch (e) {
          console.log("Failed to save refreshToken:", e);
        }
      }

      try {
        await AsyncStorage.setItem(
          "currentUser",
          JSON.stringify({ username: username.trim() })
        );
      } catch (e) {
        console.log("Failed to save currentUser:", e);
      }

      try {
        const push = await registerPushTokens();
        console.log("PUSH TOKENS:", push);
      } catch (e) {
        console.log("Failed to get push tokens:", e);
      }

      // 🔹 Apply backend preferred language if provided (same behavior as desktop)
      const backendLangRaw =
        data?.lang ??
        data?.user?.pref_lang ??
        data?.user?.lang ??
        data?.users?.pref_lang; // keep fallback if your backend really returns `users`

      const backendLang = (backendLangRaw || "").toString().toLowerCase();

      if (backendLang === "en" || backendLang === "zh") {
        setLang(backendLang as "en" | "zh"); // this will persist to AsyncStorage via your LanguageContext.setLang
      }

      // ✅ No success dialog / toast — direct in
      router.replace("/dashboard");
    } catch (error) {
      console.log("Login request error:", error);
      showError(
        t("login_error") ||
        "Something went wrong while logging in. Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.container}>
            {/* Top orange greeting */}
            <View style={styles.header}>
              <Text style={styles.headerText}>{t("login_hello")}</Text>
              <Text style={styles.headerText}>{t("login_welcome_back")}</Text>
            </View>

            {/* White rounded panel */}
            <View style={styles.panel}>
              <View style={styles.panelContent}>
                {/* Logo area */}
                <View style={styles.logoWrapper}>
                  <Image
                    source={require("../assets/images/sienshi_logo.jpg")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>

                {/* USERNAME */}
                <View style={styles.fieldGroup}>
                  <Input
                    label={t("login_username_label")}
                    labelStyle={styles.label}
                    placeholder={t("login_username_placeholder")}
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                    returnKeyType="next"
                    uiSize="md"
                    leftIcon={
                      <Ionicons
                        name="person-outline"
                        size={16}
                        color="#9ca3af"
                      />
                    }
                    containerStyle={styles.inputWrapper}
                    inputStyle={styles.input}
                    trimEnd
                  />
                </View>

                {/* PASSWORD */}
                <View style={[styles.fieldGroup, { marginTop: 18 }]}>
                  <Input
                    label={t("login_password_label")}
                    labelStyle={styles.label}
                    placeholder={t("login_password_placeholder")}
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword} // ✅ toggle
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="done"
                    uiSize="md"
                    leftIcon={
                      <Ionicons name="lock-closed-outline" size={16} color="#9ca3af" />
                    }
                    rightIcon={ // ✅ add this (if supported)
                      <TouchableOpacity
                        onPress={() => setShowPassword((v) => !v)}
                        activeOpacity={0.7}
                        style={styles.eyeBtn}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={18}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>
                    }
                    containerStyle={styles.inputWrapper}
                    inputStyle={styles.input}
                  />
                </View>


                {/* Forgot password */}
                <TouchableOpacity
                  style={styles.forgotWrapper}
                  onPress={() => router.push("/forgot-password")}                >
                  <Text style={styles.forgotText}>{t("login_forgot")}</Text>
                </TouchableOpacity>

                {/* LOGIN BUTTON */}
                <AsyncButton
                  onPress={handleLogin}
                  style={styles.loginButton}
                  textStyle={styles.loginButtonText}
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  {t("login_button")}
                </AsyncButton>

                {/* Register link */}
                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>
                    {t("login_no_account")}{" "}
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/register")}>
                    <Text style={styles.registerLink}>{t("login_register")}</Text>
                  </TouchableOpacity>
                </View>

                {/* Language toggle */}
                <View style={styles.langRow}>
                  <TouchableOpacity onPress={() => setLang("en")}>
                    <Text
                      style={[
                        styles.langText,
                        lang === "en" && styles.langActive,
                      ]}
                    >
                      EN
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.langSeparator}> | </Text>

                  <TouchableOpacity onPress={() => setLang("zh")}>
                    <Text
                      style={[
                        styles.langText,
                        lang === "zh" && styles.langActive,
                      ]}
                    >
                      中
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ✅ Error dialog only */}
      <MobileAlertDialog
        dialog={dialog}
        onClose={closeDialog}
        okLabel={t("common_ok")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: ORANGE,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerText: {
    fontSize: 24,
    fontFamily: "Karla-ExtraBold",
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 4,
    marginTop: 15,
  },
  panel: {
    flex: 1,
    marginTop: 40,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden",
  },
  panelContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 0,
  },
  logoImage: {
    width: 250,
    height: 180,
  },
  fieldGroup: {
    marginTop: 0,
  },
  label: {
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    fontWeight: "800",
    color: "#f59e0b",
    letterSpacing: 0.8,
  },
  inputWrapper: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: "#111827",
    marginLeft: 8,
  },
  forgotWrapper: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Karla-Bold",
    fontWeight: "700",
    color: "#f59e0b",
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.8,
  },
  registerRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 13,
    color: "#6b7280",
  },
  registerLink: {
    fontSize: 13,
    color: ORANGE,
    fontWeight: "700",
  },
  langRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  langText: {
    fontSize: 13,
    color: "#9ca3af",
    fontFamily: "Karla-ExtraBold",
  },
  langActive: {
    color: ORANGE,
    fontFamily: "Karla-ExtraBold",
  },
  langSeparator: {
    fontSize: 13,
    color: "#9ca3af",
    marginHorizontal: 6,
  },
  eyeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },

});
