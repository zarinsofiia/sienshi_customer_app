//components/modal/MobileFormModal

import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import CustomButton from "../button/CustomButton";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    open: boolean;
    title: string;
    children: React.ReactNode;

    onClose: () => void;
    onSubmit?: () => void;

    submitLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    hideFooter?: boolean;
    footer?: React.ReactNode;
};

export default function MobileFormModal({
    open,
    title,
    children,
    onClose,
    onSubmit,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    loading = false,
    hideFooter = false,
    footer
}: Props) {
    if (!open) return null;

    return (
        <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.kav}
                >
                    <View style={styles.card}>
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
                                <Ionicons name="close" size={18} color="#111827" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.body}
                            keyboardShouldPersistTaps="handled"
                        >
                            {children}
                        </ScrollView>
                        {!hideFooter ? (
                            footer ? (
                                <View style={styles.footerRow}>{footer}</View>
                            ) : (
                                <View style={styles.footerRow}>
                                    <View style={styles.footerBtnWrap}>
                                        <CustomButton preset="danger" onPress={onClose}>
                                            {cancelLabel}
                                        </CustomButton>
                                    </View>

                                    {onSubmit ? (
                                        <View style={styles.footerBtnWrap}>
                                            <CustomButton preset="print" onPress={onSubmit} disabled={loading}>
                                                {loading ? "Saving..." : submitLabel}
                                            </CustomButton>
                                        </View>
                                    ) : null}
                                </View>
                            )
                        ) : null}




                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "#00000066",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    kav: {
        width: "100%",
    },
    card: {
        width: "100%",
        maxWidth: 520,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        overflow: "hidden",
    },
    headerRow: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 14,
        fontFamily: "Karla-ExtraBold",
        color: "#111827",
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
    },
    body: {
        paddingLeft: 16,
        paddingRight: 16,

        paddingBottom: 14,
    },
    footerRow: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap:3,
    },

    footerBtnWrap: {
        marginLeft: 10,      // gap between buttons
        flexGrow: 0,
        flexShrink: 1,
        alignSelf: "flex-end",
        // This is the key: stop it from stretching full width
        // If your CustomButton stretches, this container constrains it
        maxWidth: "60%",     // prevents super long label from taking whole row
    },


});
