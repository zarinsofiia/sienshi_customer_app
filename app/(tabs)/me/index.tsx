// app/(tabs)/me/index.tsx

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
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

const ORANGE = "#f59e0b";

const MOCK_USER = {
    name: "ADMIN",
    email: "admin@gmail.com",
    phone: "0123456789",
};

export default function MeScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loggingOut, setLoggingOut] = useState(false);

    const user = MOCK_USER; // later: replace with real API data

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);

        try {
            await authedFetch(`${API_BASE_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "admin",
                    password: "password123",
                }),
            });
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

    return (
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <AppHeader titleKey="header_me" showBack />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ORANGE HERO – using shared ScreenHero */}
                <ScreenHero backgroundColor={ORANGE} contentStyle={styles.heroContent}>
                    {/* Pill */}
                    <View style={styles.heroTopRow}>
                        <View style={styles.locationPill}>
                            <Ionicons
                                name="person-outline"
                                size={14}
                                color="#fef3c7"
                                style={{ marginRight: 4 }}
                            />
                            <Text style={styles.locationText}>
                                {t("me_header_pill") || "My Account"}
                            </Text>
                        </View>
                    </View>

                    {/* Avatar + name + meta */}
                    <View style={styles.profileBlock}>
                        {/* If you want avatar, just uncomment:
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={30} color={ORANGE} />
            </View>
            */}
                        <Text style={styles.profileName}>{user.name}</Text>
                        <Text style={styles.profileMeta}>
                            {user.email} · {user.phone}
                        </Text>
                    </View>
                </ScreenHero>

                {/* WHITE MAIN CONTENT */}
                <View style={styles.main}>
                    {/* floating card that overlaps hero a bit */}
                    <View style={styles.detailFloatingWrapper}>
                        <SectionCard containerStyle={styles.sectionCardOverride}>
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
                                            Name · Email · Phone and more
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.editPill}
                                    activeOpacity={0.8}
                                    onPress={goProfile}
                                >
                                    <Text style={styles.editPillText}>Edit</Text>
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
                                            Click to change password
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
                        </SectionCard>
                    </View>

                    {/* bottom logout button */}
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
                                <Ionicons
                                    name="power-outline"
                                    size={26}
                                    color={ORANGE}
                                    style={{ marginRight: 0 }}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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

    // HERO CONTENT
    heroContent: {
        alignItems: "center",
    },
    heroTopRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    locationPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    locationText: {
        fontSize: 11,
        color: "#fef3c7",
        fontFamily: "Karla-Medium",
    },

    profileBlock: {
        marginTop: 16,
        alignItems: "center",
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: ORANGE,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 6,
        backgroundColor: "#fff7ed",
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
    },

    // WHITE MAIN CONTENT
    main: {
        marginTop: 0,
        paddingHorizontal: 20,
    },

    // floating wrapper so card overlaps hero
    detailFloatingWrapper: {
        marginTop: -30,
        alignItems: "center",
        width: "100%",
        zIndex: 2,
    },

    sectionCardOverride: {
        width: "100%",
        paddingVertical: 8, // a bit tighter than form cards
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
        color: "#6b7280",
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
    logoutText: {
        fontSize: 13,
        fontFamily: "Karla-Bold",
        color: ORANGE,
    },
});
