// app/register-success.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncButton from "@/components/button/AsnycButton";
import { useLanguage } from "../contexts/LanguageContext";
import { Ionicons } from "@expo/vector-icons";

const ORANGE = "#f59e0b";
const WHITE = "#ffffffff";

export default function RegisterSuccessScreen() {
    const { t } = useLanguage();

    return (
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <View style={styles.container}>
                {/* Centered white card */}
                <View style={styles.panel}>
                    <View style={styles.panelContent}>
                        {/* Success icon */}
                        <View style={styles.iconWrapper}>
                            <Ionicons name="checkmark-circle" size={64} color={ORANGE} />
                        </View>

                        {/* Title */}
                        <Text style={styles.titleText}>
                            {t("register_success_title") || "Application Submitted"}
                        </Text>

                        {/* Message */}
                        <Text style={styles.messageText}>
                            {t("register_success_message") ||
                                "Your application has been sent. Please wait for Sien Shi side to review your application."}
                        </Text>
                        {/* Emergency note */}
                        <Text style={styles.emergencyText}>
                            {t("register_success_emergency") ||
                                "If this is urgent, please contact Sien Shi support."}
                        </Text>

                        {/* Button */}
                        <AsyncButton
                            onPress={() => router.replace("/login")}
                            variant="primary"
                            size="md"
                            fullWidth
                            style={styles.button}
                            textStyle={styles.buttonText}
                        >
                            {t("register_success_back_to_login") || "Return to login page"}
                        </AsyncButton>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f3f4f6", // light grey background
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    panel: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: WHITE,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    panelContent: {
        alignItems: "center",
    },
    iconWrapper: {
        marginBottom: 16,
    },
    titleText: {
        fontSize: 20,
        lineHeight: 26,
        fontWeight: "800",
        fontFamily: "Karla-ExtraBold",
        textAlign: "center",
        color: "#111827",
        marginBottom: 8,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        color: "#4b5563",
        textAlign: "center",
    },
    button: {
        marginTop: 24,
        backgroundColor: ORANGE,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 12,
        letterSpacing: 0.8,
    },
    emergencyText: {
        marginTop: 16,
        fontSize: 12,
        lineHeight: 18,
        color: "#9ca3af", // gray-400
        textAlign: "center",
    },

});
