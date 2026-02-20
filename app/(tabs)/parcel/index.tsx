// app/(tabs)/parcel/index.tsx

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import SearchBar from "../../../components/search/SearchBar";

const ORANGE = "#f59e0b";

type ParcelItem = {
    id: string;
    trackingId: string;
    customerName: string;
    status: string;
    statusColor: string;
    statusBg: string;
    fromCity: string;
    toCity: string;
};

const MOCK_PARCELS: ParcelItem[] = [
    {
        id: "1",
        trackingId: "TRK123887349AS83",
        customerName: "Mei Tan",
        status: "IN TRANSIT",
        statusColor: "#0284c7",
        statusBg: "#e0f2fe",
        fromCity: "Kuching, Sarawak",
        toCity: "Pulau Pinang, Malaysia",
    },
    {
        id: "2",
        trackingId: "TRK123889123WQ11",
        customerName: "Ali Bin Abu",
        status: "OUT FOR DELIVERY",
        statusColor: "#f97316",
        statusBg: "#ffedd5",
        fromCity: "Sabah, Malaysia",
        toCity: "Johor, Malaysia",
    },
    {
        id: "3",
        trackingId: "TRK123882098DS21",
        customerName: "Chen Wei",
        status: "DELIVERED",
        statusColor: "#16a34a",
        statusBg: "#dcfce7",
        fromCity: "Bau, Sarawak",
        toCity: "Negeri Sembilan, Malaysia",
    },
];

export default function CustomerParcelListScreen() {
    const [searchText, setSearchText] = useState("");

    const handleSearch = () => {
        console.log("Search parcel:", searchText);
    };

    const handleOpenDetail = (parcel: ParcelItem) => {
        router.push({
            pathname: "/parcel/detail",
            params: {
                id: parcel.id,
                backTo: "/parcel", // detail page will use this
            },
        } as any);
    };

    const filteredParcels = MOCK_PARCELS.filter((p) =>
        p.trackingId.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <AppHeader title="Customer Parcel List" showBack />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ORANGE HERO */}
                <ScreenHero
                    backgroundColor={ORANGE}
                    title="Customer Parcel List"
                    subtitle="View all parcels"
                    style={styles.hero}
                    contentStyle={styles.heroContent}
                >
                    <View style={styles.searchWrapper}>
                        <SearchBar
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Search by Tracking ID"
                            leftIconName="search-outline"
                            onSearch={handleSearch}
                        />
                    </View>
                </ScreenHero>

                {/* MAIN CONTENT */}
                <View style={styles.main}>
                    {filteredParcels.map((parcel) => (
                        <TouchableOpacity
                            key={parcel.id}
                            activeOpacity={0.9}
                            onPress={() => handleOpenDetail(parcel)}
                            style={styles.parcelWrapper}
                        >
                            <SectionCard containerStyle={styles.parcelCard}>
                                {/* header row: tracking + status */}
                                <View style={styles.headerRow}>
                                    <View>
                                        <Text style={styles.trackingLabel}>Tracking ID</Text>
                                        <Text style={styles.trackingId}>{parcel.trackingId}</Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.statusPill,
                                            { backgroundColor: parcel.statusBg },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                { color: parcel.statusColor },
                                            ]}
                                        >
                                            {parcel.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* customer + route */}
                                <View style={styles.bodyRow}>
                                    <View style={styles.leftColumn}>
                                        <Text style={styles.customerLabel}>Customer</Text>
                                        <Text style={styles.customerName}>
                                            {parcel.customerName}
                                        </Text>

                                        <View style={styles.routeRow}>
                                            <Ionicons
                                                name="location-sharp"
                                                size={14}
                                                color={ORANGE}
                                                style={{ marginRight: 4 }}
                                            />
                                            <Text style={styles.cityText}>{parcel.fromCity}</Text>
                                        </View>

                                        <View style={styles.routeRow}>
                                            <Ionicons
                                                name="flag-outline"
                                                size={14}
                                                color={ORANGE}
                                                style={{ marginRight: 4 }}
                                            />
                                            <Text style={styles.cityText}>{parcel.toCity}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.rightColumn}>
                                        <Ionicons name="cube-outline" size={32} color={ORANGE} />
                                    </View>
                                </View>
                            </SectionCard>
                        </TouchableOpacity>
                    ))}

                    {filteredParcels.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No parcels found.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    scrollContent: {
        paddingBottom: 32,
    },

    hero: {
        paddingBottom: 60,
    },
    heroContent: {},
    searchWrapper: {
        marginTop: 0,
    },

    main: {
        marginTop: -30,
        paddingHorizontal: 20,
        paddingBottom: 24,
        zIndex: 1,
    },

    parcelWrapper: {
        marginBottom: 12,
    },
    parcelCard: {
        // any extra overrides
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    trackingLabel: {
        fontSize: 10,
        fontFamily: "Karla-Regular",
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    trackingId: {
        marginTop: 4,
        fontSize: 13,
        fontFamily: "Karla-ExtraBold",
        color: "#111827",
    },
    statusPill: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 10,
        fontFamily: "Karla-Bold",
        textTransform: "uppercase",
    },

    bodyRow: {
        flexDirection: "row",
        marginTop: 8,
    },
    leftColumn: {
        flex: 1,
    },
    rightColumn: {
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
    },

    customerLabel: {
        fontSize: 11,
        fontFamily: "Karla-Regular",
        color: "#6b7280",
    },
    customerName: {
        fontSize: 13,
        fontFamily: "Karla-Bold",
        color: "#111827",
        marginBottom: 8,
    },

    routeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    cityText: {
        fontSize: 11,
        fontFamily: "Karla-Regular",
        color: "#374151",
    },

    emptyState: {
        marginTop: 24,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 13,
        fontFamily: "Karla-Regular",
        color: "#9ca3af",
    },
});
