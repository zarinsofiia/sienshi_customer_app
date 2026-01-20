// app/(tabs)/announcement/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    ActivityIndicator,
    StatusBar,
    Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useLanguage } from "../../../contexts/LanguageContext";
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";
import { useWindowDimensions } from "react-native";
import { authedFetch } from "@/config/mobileApiClient";
import { API_BASE_URL } from "@/config/api";
const ORANGE = "#f59e0b";
const TITLE_ORANGE = "#E89923";

type Announcement = {
    id: string;
    title: string;
    content: string;
    date?: string;
    imageUrl?: string;
};

// ✅ SINGLE PLACE TO REPLACE (REAL API)
async function fetchAnnouncementDetail(
    announcementId?: string
): Promise<Announcement | null> {
    if (!announcementId) return null;

    try {
        const res = await authedFetch(
            `${API_BASE_URL}/api/cust_app/announcement/view_announcement`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: String(announcementId) }),
            }
        );

        const json = await res.json().catch(() => null);

        // API returns array: [ { title, content, image_url, publish_at } ]
        const row = Array.isArray(json) ? json[0] : null;
        if (!row) return null;

        return {
            id: String(announcementId),
            title: row.title ?? "",
            content: row.content ?? "",
            // map api fields -> your existing fields
            imageUrl: row.image_url
                ? row.image_url.startsWith("http")
                    ? row.image_url
                    : `${API_BASE_URL}${row.image_url.startsWith("/") ? "" : "/"}${row.image_url}`
                : undefined,
            date: row.publish_at ? String(row.publish_at) : undefined,
        };
    } catch (e) {
        console.log("fetchAnnouncementDetail error:", e);
        return null;
    }
}

//format date and time
function formatDateTimeDDMMYYYY(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";

    const pad = (n: number) => String(n).padStart(2, "0");

    // If you want MALAYSIA time, use local getters:
    const dd = pad(d.getDate());
    const mm = pad(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());

    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default function AnnouncementIndex() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();

    const params = useLocalSearchParams<{
        backTo?: string;
        announcementId?: string;
    }>();

    const backTo = params.backTo ? String(params.backTo) : undefined;
    const announcementId = params.announcementId
        ? String(params.announcementId)
        : undefined;

    const [loading, setLoading] = useState(true);
    const [row, setRow] = useState<Announcement | null>(null);

    const { width } = useWindowDimensions();

    const html = row?.content ? String(row.content) : "";
    const contentWidth = width - 16 * 2 - 14 * 2; // screen padding + card padding (adjust if yours differs)

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchAnnouncementDetail(announcementId);
                if (!cancelled) setRow(data);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [announcementId]);

    const headerTitle = useMemo(() => {
        const title =
            row?.title || (t("header_announcement" as any) as any) || "Announcement";
        return String(title).toUpperCase();
    }, [row?.title, t]);

    const coverImage =
        row?.imageUrl ||
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80";

    const handleBack = () => {
        if (backTo) router.push(backTo as any);
        else router.back();
    };

    // nicer spacing for android statusbar
    const topPad = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

    return (
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
            {/* ✅ remove header for this page */}
            <Stack.Screen options={{ headerShown: false }} />

            {/* ✅ wrapper so absolute back button floats above scroll */}
            <View style={{ flex: 1 }}>
                {/* ✅ single ScrollView: image + content scroll together */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Hero */}
                    <View style={styles.heroWrap}>
                        <ImageBackground
                            source={{ uri: coverImage }}
                            style={styles.heroImg}
                            imageStyle={styles.heroImgStyle}
                        >
                            <View style={styles.heroOverlay} />

                            {/* <View
                                style={[
                                    styles.heroTitleWrap,
                                    { paddingTop: insets.top + topPad + 8 },
                                ]}
                            >
                                <Text style={styles.heroTitle} numberOfLines={2}>
                                    {headerTitle}
                                </Text>

                            </View> */}
                        </ImageBackground>
                    </View>

                    {/* Body */}
                    <View style={styles.content}>
                        {loading ? (
                            <View style={styles.centerBox}>
                                <ActivityIndicator />
                                <Text style={styles.centerText}>
                                    {t("announcement_loading" as any) || "Loading..."}
                                </Text>
                            </View>
                        ) : !row ? (
                            <View style={styles.card}>
                                <Text style={styles.notFoundTitle}>
                                    {(t("announcement_not_found" as any) as any) ||
                                        "Announcement not found"}
                                </Text>
                                <Text style={styles.notFoundSub}>
                                    {(t("announcement_try_again" as any) as any) ||
                                        "Please try again later."}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.card}>
                                {/* small orange tag */}
                                <View style={styles.tag}>
                                    <Ionicons
                                        name="megaphone-outline"
                                        size={14}
                                        color={TITLE_ORANGE}
                                    />
                                   {!!row?.date && (
                                    <Text style={styles.heroSub}>{formatDateTimeDDMMYYYY(row.date)}</Text>
                                )}
                                </View>

                                <Text style={styles.title}>{row.title}</Text>
                                <RenderHTML
                                    contentWidth={contentWidth}
                                    source={{ html }}
                                    systemFonts={[...defaultSystemFonts, "Karla-Medium", "Karla-ExtraBold"]}
                                    baseStyle={styles.htmlBase}
                                    tagsStyles={{
                                        p: styles.htmlP,
                                        h1: styles.htmlH1,
                                        h2: styles.htmlH2,
                                        h3: styles.htmlH3,
                                        strong: styles.htmlStrong,
                                        em: styles.htmlEm,
                                        u: styles.htmlU,
                                        s: styles.htmlS,
                                        a: styles.htmlLink,
                                        ul: styles.htmlUl,
                                        ol: styles.htmlOl,
                                        li: styles.htmlLi,
                                    }}
                                    // ✅ Important for Tiptap inline styles like text-align/color/background-color
                                    enableCSSInlineProcessing
                                    allowedStyles={[
                                        "textAlign",
                                        "color",
                                        "backgroundColor",
                                        "fontWeight",
                                        "fontStyle",
                                        "textDecorationLine",
                                    ]}
                                />
                            </View>
                        )}

                        {/* bottom spacer */}
                        <View style={{ height: 18 }} />
                    </View>
                </ScrollView>

                {/* ✅ Back button now STAYS even when user scroll */}
                <TouchableOpacity
                    onPress={handleBack}
                    style={[styles.backBtnFloating, { top: insets.top + topPad + 10 }]}
                    activeOpacity={0.85}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#f3f4f6" },

    // ✅ nicer hero (rounded bottom + shadow feel)
    heroWrap: {
        backgroundColor: ORANGE,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        overflow: "hidden",
    },
    heroImg: {
        height: 180,
        width: "100%",
        justifyContent: "flex-end",
    },
    heroImgStyle: { resizeMode: "cover" },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.20)",
    },

    // ✅ floating back button (doesn't scroll)
    backBtnFloating: {
        position: "absolute",
        left: 14,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0,0,0,0.28)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
    },

    heroTitleWrap: {
        paddingHorizontal: 16,
        paddingBottom: 14,
        alignItems: "center",
        justifyContent: "flex-end",
    },
    heroTitle: {
        fontSize: 15,
        fontFamily: "Karla-ExtraBold",
        color: "#fff",
        textAlign: "center",
        letterSpacing: 0.7,
        textTransform: "uppercase",
    },
    heroSub: {
        marginTop: 0,
        marginLeft:5,
        fontSize: 12,
        fontFamily: "Karla-Medium",
        color: "rgba(19, 12, 8, 0.92)",
    },

    content: {
        padding: 16,
        paddingTop: 12,
        paddingBottom: 28,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },

    tag: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#fff7ed",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "#fde68a",
        marginBottom: 10,
    },
    tagText: {
        marginLeft: 6,
        fontSize: 11,
        fontFamily: "Karla-ExtraBold",
        color: TITLE_ORANGE,
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },

    title: {
        fontSize: 20,
        fontFamily: "Karla-ExtraBold",
        color: "#111827",
        marginBottom: 10,
    },
    contentText: {
        fontSize: 12.5,
        fontFamily: "Karla-Medium",
        color: "#374151",
        lineHeight: 18,
    },

    centerBox: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
    },
    centerText: {
        marginTop: 10,
        fontSize: 12,
        fontFamily: "Karla-Medium",
        color: "#6b7280",
    },

    notFoundTitle: { fontSize: 13, fontFamily: "Karla-ExtraBold", color: "#111827" },
    notFoundSub: { marginTop: 6, fontSize: 12, fontFamily: "Karla-Medium", color: "#6b7280" },
    htmlBase: {
        fontSize: 13,
        fontFamily: "Karla-Medium",
        color: "#374151",
        lineHeight: 20,
    },

    htmlP: { marginTop: 0, marginBottom: 10 },

    htmlH1: {
        fontSize: 18,
        marginTop: 4,
        marginBottom: 10,
        fontFamily: "Karla-ExtraBold",
        color: "#111827",
    },
    htmlH2: {
        fontSize: 16,
        marginTop: 4,
        marginBottom: 10,
        fontFamily: "Karla-ExtraBold",
        color: "#111827",
    },
    htmlH3: {
        fontSize: 14,
        marginTop: 4,
        marginBottom: 10,
        fontFamily: "Karla-ExtraBold",
        color: "#111827",
    },

    htmlStrong: { fontFamily: "Karla-ExtraBold", color: "#111827" },
    htmlEm: { fontStyle: "italic" },
    htmlU: { textDecorationLine: "underline" },
    htmlS: { textDecorationLine: "line-through" },

    htmlLink: {
        textDecorationLine: "underline",
        color: "#2563eb",
    },

    htmlUl: { marginTop: 0, marginBottom: 10, paddingLeft: 18 },
    htmlOl: { marginTop: 0, marginBottom: 10, paddingLeft: 18 },
    htmlLi: { marginBottom: 6 },

});
