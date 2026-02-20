// app/(tabs)/dashboard/notifications.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";

import { AppHeader } from "../../../components/AppHeader";
import SectionCard from "../../../components/card/SectionCard";
import ScreenHero from "../../../components/layout/ScreenHero";

const ORANGE = "#f59e0b";
const APP_BG = "#f3f4f6";
const BORDER = "#e5e7eb";
const MUTED = "#2e2f31";
const TITLE_ORANGE = "#E89923";

type NotiKind = "info" | "success" | "warning" | "error";

type NotiItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  kind: NotiKind;
};

const NOTI_STORAGE_KEY = "demo_notifications_v1";

const HARD_NOTIFICATIONS: NotiItem[] = [
  {
    id: "n1",
    title: "Stock In completed",
    message: "Stock-in SI-2026-00012 has been completed.",
    createdAt: "2026-02-05 09:12",
    read: false,
    kind: "success",
  },
  {
    id: "n2",
    title: "New parcels received",
    message: "8 new parcels were stocked in at Location A-12.",
    createdAt: "2026-02-05 08:40",
    read: false,
    kind: "info",
  },
  {
    id: "n3",
    title: "Pickup completed",
    message: "Pickup completed for customer K/0007 (3 parcels).",
    createdAt: "2026-02-04 18:05",
    read: true,
    kind: "success",
  },
  {
    id: "n4",
    title: "Action required",
    message: "Some parcels are still unassigned to location.",
    createdAt: "2026-02-04 16:22",
    read: true,
    kind: "warning",
  },
];

async function readNotiStore(): Promise<NotiItem[]> {
  const raw = await AsyncStorage.getItem(NOTI_STORAGE_KEY);
  if (!raw) {
    await AsyncStorage.setItem(
      NOTI_STORAGE_KEY,
      JSON.stringify(HARD_NOTIFICATIONS)
    );
    return HARD_NOTIFICATIONS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NotiItem[]) : HARD_NOTIFICATIONS;
  } catch {
    await AsyncStorage.setItem(
      NOTI_STORAGE_KEY,
      JSON.stringify(HARD_NOTIFICATIONS)
    );
    return HARD_NOTIFICATIONS;
  }
}

async function writeNotiStore(items: NotiItem[]) {
  await AsyncStorage.setItem(NOTI_STORAGE_KEY, JSON.stringify(items));
}

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<NotiItem[]>([]);
  const [active, setActive] = useState<NotiItem | null>(null);
  const [open, setOpen] = useState(false);

  const openRowRef = useRef<Swipeable | null>(null);
  const closeOpenRow = () => {
    openRowRef.current?.close();
    openRowRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const list = await readNotiStore();
        if (!cancelled) setItems(list);
      } catch {
        if (!cancelled) setItems(HARD_NOTIFICATIONS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = useMemo(
    () => items.filter((x) => !x.read).length,
    [items]
  );

  const shown = useMemo(() => {
    if (filter === "unread") return items.filter((x) => !x.read);
    return items;
  }, [items, filter]);

  const getKindIcon = (kind: NotiKind) => {
    switch (kind) {
      case "success":
        return { name: "checkmark-circle-outline" as const, color: "#16a34a" };
      case "warning":
        return { name: "warning-outline" as const, color: "#d97706" };
      case "error":
        return { name: "close-circle-outline" as const, color: "#dc2626" };
      default:
        return { name: "information-circle-outline" as const, color: "#2563eb" };
    }
  };

  const persist = async (next: NotiItem[]) => {
    setItems(next);
    try {
      await writeNotiStore(next);
    } catch {}
  };

  // ✅ auto mark as read once clicked + open modal
  const openDetail = async (n: NotiItem) => {
    closeOpenRow();

    if (!n.read) {
      const next = items.map((x) => (x.id === n.id ? { ...x, read: true } : x));
      await persist(next);
      n = { ...n, read: true };
    }

    setActive(n);
    setOpen(true);
  };

  const markAllRead = async () => {
    closeOpenRow();
    const next = items.map((x) => ({ ...x, read: true }));
    await persist(next);
  };

  const deleteNoti = async (id: string) => {
    closeOpenRow();
    const next = items.filter((x) => x.id !== id);
    await persist(next);

    if (active?.id === id) {
      setOpen(false);
      setActive(null);
    }
  };

  const renderRightActions = (n: NotiItem) => {
    return (
      <View style={styles.rightActionWrap}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => deleteNoti(n.id)}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={18} color="#ffffff" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const subtitle = `${unreadCount} unread`;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader title="NOTIFICATIONS" showBack  />

      <ScreenHero
        backgroundColor={ORANGE}
        title="Notifications"
        subtitle={subtitle}
        style={styles.hero}
        contentStyle={styles.heroContent}
      >
        <View style={styles.heroActionsRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setFilter("all")}
            style={[
              styles.filterPill,
              filter === "all" && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setFilter("unread")}
            style={[
              styles.filterPill,
              filter === "unread" && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "unread" && styles.filterTextActive,
              ]}
            >
              Unread
            </Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={markAllRead}
            style={styles.markAllBtn}
          >
            <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
            <Text style={styles.markAllText}>Mark all</Text>
          </TouchableOpacity>
        </View>
      </ScreenHero>

      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator />
              <Text style={styles.centerText}>Loading...</Text>
            </View>
          ) : shown.length === 0 ? (
            <View style={styles.centerBox}>
              <Ionicons name="notifications-outline" size={20} color={ORANGE} />
              <Text style={styles.centerText}>No notifications</Text>
            </View>
          ) : (
            shown.map((n) => {
              const icon = getKindIcon(n.kind);

              return (
                <Swipeable
                  key={n.id}
                  renderRightActions={() => renderRightActions(n)}
                  rightThreshold={40}
                  overshootRight={false}
                  onSwipeableWillOpen={() => {
                    if (openRowRef.current) openRowRef.current.close();
                  }}
                  onSwipeableOpen={(direction, swipeable) => {
                    openRowRef.current = swipeable;
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openDetail(n)}
                    style={styles.rowTap}
                  >
                    <SectionCard>
                      <View style={styles.row}>
                        <View style={styles.iconBubble}>
                          <Ionicons name={icon.name} size={18} color={icon.color} />
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={styles.topRow}>
                            <Text
                              style={[
                                styles.title,
                                !n.read && styles.titleUnread,
                              ]}
                              numberOfLines={1}
                            >
                              {n.title}
                            </Text>

                            {!n.read ? <View style={styles.unreadDot} /> : null}
                          </View>

                          <Text style={styles.message} numberOfLines={2}>
                            {n.message}
                          </Text>

                          <Text style={styles.time}>{n.createdAt}</Text>
                        </View>

                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#9ca3af"
                          style={{ marginLeft: 10 }}
                        />
                      </View>
                    </SectionCard>
                  </TouchableOpacity>
                </Swipeable>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* ✅ detail modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setOpen(false);
          setActive(null);
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => {
            setOpen(false);
            setActive(null);
          }}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>Notification</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  setOpen(false);
                  setActive(null);
                }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={18} color="#111827" />
              </TouchableOpacity>
            </View>

            {active ? (
              <>
                <Text style={styles.modalTitle}>{active.title}</Text>
                <Text style={styles.modalTime}>{active.createdAt}</Text>
                <Text style={styles.modalMessage}>{active.message}</Text>

                <View style={styles.modalFooterRow}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      setOpen(false);
                      setActive(null);
                    }}
                    style={styles.modalOkBtn}
                  >
                    <Text style={styles.modalOkText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: APP_BG },

  hero: { paddingBottom: 20 },
  heroContent: {},

  heroActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },

  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  filterPillActive: {
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  filterText: {
    fontFamily: "Karla-ExtraBold",
    fontSize: 13,
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  filterTextActive: { color: "#fff" },

  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  markAllText: {
    fontFamily: "Karla-ExtraBold",
    fontSize: 13,
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  main: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
    zIndex: 1,
  },
  scrollContent: { paddingBottom: 32 },

  rowTap: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "flex-start" },

  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },

  topRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Karla-ExtraBold",
    color: TITLE_ORANGE,
  },
  titleUnread: { color: "#111827" },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: ORANGE,
  },
  message: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: "Karla-Regular",
    color: MUTED,
    lineHeight: 16,
  },
  time: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: "Karla-Regular",
    color: "#6b7280",
  },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  centerText: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: "Karla-Medium",
    color: MUTED,
    textAlign: "center",
  },

  // swipe delete action
  rightActionWrap: {
    width: 110,
    marginBottom: 12,
    marginLeft: 10,
    justifyContent: "center",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
  },
  deleteText: {
    fontFamily: "Karla-ExtraBold",
    fontSize: 12,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalHeaderTitle: {
    fontFamily: "Karla-ExtraBold",
    fontSize: 14,
    color: "#111827",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontFamily: "Karla-ExtraBold",
    fontSize: 16,
    color: "#111827",
  },
  modalTime: {
    marginTop: 6,
    fontFamily: "Karla-Regular",
    fontSize: 12,
    color: "#6b7280",
  },
  modalMessage: {
    marginTop: 12,
    fontFamily: "Karla-Regular",
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
  },
  modalFooterRow: { marginTop: 14, flexDirection: "row", justifyContent: "flex-end" },
  modalOkBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: ORANGE,
  },
  modalOkText: {
    fontFamily: "Karla-ExtraBold",
    color: "#fff",
    fontSize: 14,
  },
});
