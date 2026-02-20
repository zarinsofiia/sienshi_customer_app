// app/(tabs)/payment/detail.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

import { AppHeader } from "../../../components/AppHeader";
import CustomButton from "../../../components/button/CustomButton";
import SectionCard from "../../../components/card/SectionCard";
import ScreenHero from "../../../components/layout/ScreenHero";
import MobileAlertDialog, {
    BasicMobileDialogState,
} from "../../../components/modal/MobileAlertDialog";

import { useLanguage } from "../../../contexts/LanguageContext";
import { authedFetch } from "../../../config/mobileApiClient";
import { API_BASE_URL } from "../../../config/api";

const ORANGE = "#f59e0b";
const APP_BG = "#f3f4f6";
const BORDER = "#e5e7eb";
const MUTED = "#2e2f31";

type PaymentStatus = "UNVERIFIED" | "VERIFIED" | "VOID" | string;

type PaymentDetail = {
    id: number;
    payment_amount: string | null;
    payment_date: string | null;
    status: PaymentStatus | null;
    payment_method: string | null;

    ref_no?: string | null;
    remark?: string | null;
    attachment?: string | null;
};

function normalizeParam(v: unknown): string {
    if (Array.isArray(v)) return String(v[0] ?? "");
    return String(v ?? "");
}

function statusColors(status: PaymentStatus) {
    const s = (status || "").toUpperCase().trim();
    if (s === "VERIFIED") return { bg: "#dcfce7", fg: "#16a34a" };
    if (s === "UNVERIFIED") return { bg: "#ffedd5", fg: "#f97316" };
    if (s === "VOID") return { bg: "#fee2e2", fg: "#b91c1c" };
    return { bg: "#f3f4f6", fg: "#6b7280" };
}

function fmtDate(v?: string | null) {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(d);
}

function resolveAttachmentUrl(raw?: string | null) {
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    const p = raw.startsWith("/") ? raw : `/${raw}`;
    return `${API_BASE_URL}${p}`;
}

function filenameFromPath(p?: string | null) {
    if (!p) return "-";
    const cleaned = p.split("?")[0];
    const parts = cleaned.split("/");
    return parts[parts.length - 1] || p;
}

function attachmentKind(url: string): "image" | "pdf" | "other" {
    const clean = url.split("?")[0].toLowerCase();
    if (/\.(png|jpg|jpeg|webp|gif)$/i.test(clean)) return "image";
    if (/\.pdf$/i.test(clean)) return "pdf";
    return "other";
}

export default function PaymentDetailScreen() {
    const { t } = useLanguage();

    const params = useLocalSearchParams<{ id?: string; backTo?: string }>();
    const idParam = normalizeParam(params.id);
    const backTo = normalizeParam(params.backTo);

    const paymentId = useMemo(() => {
        const n = Number(idParam);
        return Number.isFinite(n) && n > 0 ? n : 0;
    }, [idParam]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dialog, setDialog] = useState<BasicMobileDialogState | null>(null);
    const [payment, setPayment] = useState<PaymentDetail | null>(null);

    // attachment preview (in-app modal for images)
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewHeaders, setPreviewHeaders] = useState<
        Record<string, string> | undefined
    >(undefined);

    const closeDialog = () => setDialog(null);

    const handleBack = () => {
        if (backTo) router.replace(backTo as any);
        else router.back();
    };

    const onEdit = () => {
        const detailBackTo = `/payment/detail?id=${encodeURIComponent(
            String(payment?.id ?? idParam)
        )}&backTo=${encodeURIComponent(backTo || "/payment")}`;

        router.push({
            pathname: "/payment/edit",
            params: {
                id: String(payment?.id ?? idParam),
                backTo: detailBackTo,
            },
        });
    };

    const fetchPayment = async (): Promise<PaymentDetail | null> => {
        if (!paymentId) {
            setDialog({
                open: true,
                type: "error",
                title: t("common_error"),
                message: t("common_not_found"),
            });
            return null;
        }

        const res = await authedFetch("/api/cust_app/payment/view_payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: String(paymentId) }),
        });

        const text = await res.text().catch(() => "");
        let data: any = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = null;
        }

        if (!res.ok) {
            throw new Error(data?.message || t("common_action_failed"));
        }

        const raw = Array.isArray(data) ? data?.[0] : data;
        if (!raw) return null;

        const mapped: PaymentDetail = {
            id: Number(raw.id),
            payment_amount: raw.payment_amount ?? null,
            payment_date: raw.payment_date ?? null,
            status: raw.status ?? null,
            payment_method: raw.payment_method ?? null,
            ref_no: raw.ref_no ?? null,
            remark: raw.remark ?? null,
            attachment: raw.attachment ?? null,
        };

        return mapped;
    };

    // fetch once per id (no nonstop loop)
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const next = await fetchPayment();
                if (!mounted) return;
                setPayment(next);
            } catch (e: any) {
                if (!mounted) return;
                setPayment(null);
                setDialog({
                    open: true,
                    type: "error",
                    title: t("common_error"),
                    message: e?.message || t("common_action_failed"),
                });
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentId]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const next = await fetchPayment();
            setPayment(next);
        } catch (e: any) {
            setDialog({
                open: true,
                type: "error",
                title: t("common_error"),
                message: e?.message || t("common_action_failed"),
            });
        } finally {
            setRefreshing(false);
        }
    };

    const closePreview = () => {
        setPreviewOpen(false);
        setPreviewUrl(null);
        setPreviewHeaders(undefined);
    };

    const onOpenAttachment = async () => {
        const url = resolveAttachmentUrl(payment?.attachment);
        if (!url) return;

        const kind = attachmentKind(url);

        // ✅ Image: open in modal inside app
        if (kind === "image") {
            const token = await AsyncStorage.getItem("authToken");
            setPreviewHeaders(token ? { Authorization: `Bearer ${token}` } : undefined);
            setPreviewUrl(url);
            setPreviewOpen(true);
            return;
        }

        // ✅ PDF/other: open in in-app browser (no WebView dependency)
        // Note: WebBrowser cannot attach Authorization headers.
        try {
            await WebBrowser.openBrowserAsync(url, {
                presentationStyle: "pageSheet" as any,
            });
        } catch {
            setDialog({
                open: true,
                type: "error",
                title: t("common_error"),
                message: t("common_action_failed"),
            });
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <AppHeader
                title={t("payment_detail")}
                showBack
                onBack={handleBack}
            />

            <ScreenHero backgroundColor={ORANGE} style={styles.hero} />

            <View style={styles.main}>
                <View style={styles.whiteCard}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>{t("payment_detail")}</Text>

                        {/* <CustomButton
                            preset="primary"
                            onPress={onEdit}
                            style={styles.headerEditBtn}
                            textStyle={styles.headerEditText}
                            disabled={!payment || loading}
                            >
                            {t("common_edit")}
                            </CustomButton> */}
                    </View>

                    <ScrollView
                        style={styles.cardScroll}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.cardScrollContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        {loading ? (
                            <View style={styles.centerBox}>
                                <ActivityIndicator size="small" color={ORANGE} />
                                <Text style={styles.centerText}>{t("common_processing")}</Text>
                            </View>
                        ) : !payment ? (
                            <View style={styles.centerBox}>
                                <Text style={[styles.centerText, { color: "#dc2626" }]}>
                                    {t("common_not_found")}
                                </Text>

                                <Text style={styles.debugText}>Debug id param: {idParam || "-"}</Text>

                                <CustomButton preset="primary" onPress={handleBack} style={{ marginTop: 10 }}>
                                    {t("common_back")}
                                </CustomButton>
                            </View>
                        ) : (
                            <SectionCard>
                                <View style={styles.rowTop}>
                                    <Text style={styles.paymentNo}></Text>

                                    <View
                                        style={[
                                            styles.statusPill,
                                            { backgroundColor: statusColors(payment.status || "").bg },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                { color: statusColors(payment.status || "").fg },
                                            ]}
                                        >
                                            {(payment.status || "-").toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.kv}>
                                    <Text style={styles.k}>{t("payment_amount")}</Text>
                                    <Text style={styles.v}>{payment.payment_amount || "-"}</Text>
                                </View>

                                <View style={styles.kv}>
                                    <Text style={styles.k}>{t("payment_method")}</Text>
                                    <Text style={styles.v}>{payment.payment_method || "-"}</Text>
                                </View>

                                <View style={styles.kv}>
                                    <Text style={styles.k}>{t("payment_refno")}</Text>
                                    <Text style={styles.v}>{payment.ref_no || "-"}</Text>
                                </View>

                                <View style={styles.kv}>
                                    <Text style={styles.k}>{t("payment_date")}</Text>
                                    <Text style={styles.v}>{fmtDate(payment.payment_date)}</Text>
                                </View>

                                <View style={styles.kv}>
                                    <Text style={styles.k}>{t("payment_attachment")}</Text>

                                    {payment.attachment ? (
                                        (() => {
                                            const fileName = filenameFromPath(payment.attachment);
                                            const ext = (fileName.split(".").pop() || "").toUpperCase();

                                            return (
                                                <View style={styles.attachRight}>
                                                    <View style={styles.attachTopRow}>
                                                        {/* {!!ext && (
                                                        <View style={styles.fileTypePill}>
                                                            <Text style={styles.fileTypeText}>{ext}</Text>
                                                        </View>
                                                        )} */}

                                                        <TouchableOpacity
                                                            activeOpacity={0.9}
                                                            onPress={onOpenAttachment}
                                                            style={styles.viewChip}
                                                        >
                                                            <Text style={styles.viewChipText}>{t("common_view")}</Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                    {/* filename (single line, neat) */}
                                                    <TouchableOpacity
                                                        activeOpacity={0.85}
                                                        onPress={onOpenAttachment}
                                                        style={styles.filenameWrap}
                                                    >
                                                        <Text
                                                            style={styles.filenameText}
                                                            numberOfLines={1}
                                                            ellipsizeMode="middle"
                                                        >
                                                            {fileName}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })()
                                    ) : (
                                        <Text style={styles.v}>-</Text>
                                    )}
                                </View>


                                {payment.remark ? (
                                    <View style={[styles.kv, { marginTop: 6 }]}>
                                        <Text style={styles.k}>{t("payment_remark")}</Text>
                                        <Text style={styles.v}>{payment.remark}</Text>
                                    </View>
                                ) : null}
                            </SectionCard>
                        )}

                        <View style={{ height: 10 }} />
                    </ScrollView>
                </View>
            </View>

            {/* Image preview modal (no WebView) */}
            <Modal
                visible={previewOpen}
                transparent
                animationType="fade"
                onRequestClose={closePreview}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("payment_attachment")}</Text>
                            <Pressable onPress={closePreview} style={styles.modalCloseBtn}>
                                <Text style={styles.modalCloseText}>×</Text>
                            </Pressable>
                        </View>

                        <View style={styles.modalBody}>
                            {previewUrl ? (
                                <Image
                                    source={
                                        previewHeaders
                                            ? ({ uri: previewUrl, headers: previewHeaders } as any)
                                            : ({ uri: previewUrl } as any)
                                    }
                                    style={styles.previewImage}
                                    resizeMode="contain"
                                />
                            ) : null}
                        </View>

                        <View style={styles.modalFooter}>
                            <CustomButton preset="primary" onPress={closePreview}>
                                {t("common_close")}
                            </CustomButton>
                        </View>
                    </View>
                </View>
            </Modal>

            <MobileAlertDialog
                dialog={dialog}
                onClose={closeDialog}
                okLabel={t("common_ok")}
            />
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
        fontSize: 15,
        fontFamily: "Karla-ExtraBold",
        color: "#111827",
        textTransform: "uppercase",
        flex: 1,
        marginRight: 10,
    },

    headerEditBtn: {
        minWidth: 84,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    headerEditText: { fontSize: 13 },

    cardScroll: { flex: 1 },
    cardScrollContent: { padding: 14, paddingBottom: 16 },

    rowTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    paymentNo: {
        fontSize: 13,
        fontFamily: "Karla-ExtraBold",
        color: ORANGE,
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

    kv: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
    },
    k: {
        fontSize: 14,
        fontFamily: "Karla-Bold",
        color: MUTED,
    },
    v: {
        fontSize: 14,
        fontFamily: "Karla-Bold",
        color: "#111827",
        maxWidth: "62%",
        textAlign: "right",
    },
    linkText: {
        textDecorationLine: "underline",
    },

    viewChip: {
        marginTop: 6,
        alignSelf: "flex-end",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: "#ffffff",
    },

    viewChipText: {
        fontSize: 12,
        fontFamily: "Karla-ExtraBold",
        color: ORANGE,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    attachRight: {
        maxWidth: "62%",
        alignItems: "flex-end",
    },

    attachTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    fileTypePill: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: "#f9fafb",
    },

    fileTypeText: {
        fontSize: 11,
        fontFamily: "Karla-ExtraBold",
        color: MUTED,
        letterSpacing: 0.4,
    },

    filenameWrap: {
        marginTop: 6,
        maxWidth: "100%",
    },

    filenameText: {
        fontSize: 12,
        fontFamily: "Karla-Regular",
        color: "#6b7280",
    },

    centerBox: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
        gap: 10,
    },
    centerText: {
        marginTop: 0,
        fontSize: 13,
        fontFamily: "Karla-Medium",
        color: MUTED,
        textAlign: "center",
    },
    debugText: {
        marginTop: 0,
        fontSize: 13,
        fontFamily: "Karla-Regular",
        color: "#9ca3af",
    },

    // modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        padding: 16,
        justifyContent: "center",
    },
    modalCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        overflow: "hidden",
    },
    modalHeader: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    modalTitle: {
        fontSize: 13,
        fontFamily: "Karla-ExtraBold",
        color: "#111827",
        textTransform: "uppercase",
        flex: 1,
        marginRight: 10,
    },
    modalCloseBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
    },
    modalCloseText: {
        fontSize: 22,
        lineHeight: 22,
        color: "#111827",
        fontFamily: "Karla-Bold",
        marginTop: -2,
    },
    modalBody: {
        padding: 12,
        height: 420,
        backgroundColor: "#ffffff",
    },
    previewImage: {
        width: "100%",
        height: "100%",
    },
    modalFooter: {
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
    },
});
