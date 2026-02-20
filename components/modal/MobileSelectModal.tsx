// components/modal/MobileSelectModal.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const BORDER = "#e5e7eb";
const MUTED = "#6b7280";
const ORANGE = "#f59e0b";

export type SelectOption = {
  label: string;
  value: string;
};

type Props = {
  open: boolean;
  title: string;
  options: SelectOption[];
  value?: string;

  onClose: () => void;
  onSelect: (value: string) => void;

  /** Optional search inside modal */
  searchable?: boolean;
  searchPlaceholder?: string;
};

export default function MobileSelectCenterModal({
  open,
  title,
  options,
  value,
  onClose,
  onSelect,
  searchable = false,
  searchPlaceholder = "Search...",
}: Props) {
  const [search, setSearch] = useState("");

  // Reset search when modal opens/closes (nice UX)
  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;

    const q = (search || "").trim().toLowerCase();
    if (!q) return options;

    return options.filter((o) =>
      String(o.label ?? "").toLowerCase().includes(q)
    );
  }, [options, searchable, search]);

  if (!open) return null;

  return (
    <View style={styles.overlay}>
      {/* ❌ do NOT close on overlay click */}
      <View style={styles.backdrop} pointerEvents="auto" />

      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        {searchable ? (
          <View style={styles.searchWrap}>
            <Ionicons
              name="search-outline"
              size={18}
              color={MUTED}
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={search}
              onChangeText={(v: string) => setSearch(v)}
              placeholder={searchPlaceholder}
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
            />
          </View>
        ) : null}

        {/* List */}
        <View style={styles.listWrap}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filteredOptions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={MUTED}
                />
                <Text style={styles.emptyText}>No results</Text>
              </View>
            ) : (
              filteredOptions.map((o) => {
                const active = o.value === value;

                return (
                  <TouchableOpacity
                    key={o.value}
                    activeOpacity={0.9}
                    onPress={() => {
                      onSelect(o.value);
                      onClose();
                    }}
                    style={[styles.item, active && styles.itemActive]}
                  >
                    <Text
                      style={[styles.itemText, active && styles.itemTextActive]}
                    >
                      {o.label}
                    </Text>

                    {active ? (
                      <Ionicons name="checkmark" size={18} color={ORANGE} />
                    ) : null}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        <Text style={styles.hint}>{/* optional hint */}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  card: {
    width: "88%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,

    // shadow
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },

  // ✅ Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
    marginTop: 4,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: "#111827",
  },

  // ✅ Scrollable list region
  listWrap: {
    maxHeight: 320, // keep modal height stable
  },
  listContent: {
    paddingBottom: 4,
  },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    backgroundColor: "#ffffff",
  },
  itemActive: {
    borderColor: ORANGE,
    backgroundColor: "#fff7ed",
  },
  itemText: {
    fontSize: 13,
    fontFamily: "Karla-Bold",
    color: "#111827",
  },
  itemTextActive: {
    color: ORANGE,
  },

  emptyBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Karla-Medium",
    color: MUTED,
  },

  hint: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: "Karla-Regular",
    color: MUTED,
    textAlign: "center",
  },
});
