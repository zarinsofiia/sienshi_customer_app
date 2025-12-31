// components/modal/MobileAlertDialog.tsx
import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import CustomButton from "../button/CustomButton";

export type BasicDialogType = "success" | "error";

export type BasicMobileDialogState = {
  open: boolean;
  type: BasicDialogType;
  title: string;
  message: string;
};

type Props = {
  dialog: BasicMobileDialogState | null;
  onClose: () => void;
  okLabel?: string; // optional (for translation)
};

const MobileAlertDialog: React.FC<Props> = ({ dialog, onClose, okLabel }) => {
  if (!dialog?.open) return null;

  const isSuccess = dialog.type === "success";

  return (
    <Modal
      visible={dialog.open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isSuccess ? "#dcfce7" : "#fee2e2" },
            ]}
          >
            <Text style={[styles.iconText, !isSuccess && styles.iconTextError]}>
              {isSuccess ? "✓" : "!"}
            </Text>
          </View>

          <Text style={styles.title}>{dialog.title}</Text>
          <Text style={styles.message}>{dialog.message}</Text>

          <View style={styles.buttonRow}>
            <CustomButton preset={isSuccess ? "success" : "danger"} onPress={onClose}>
              {okLabel || "OK"}
            </CustomButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000066",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconText: {
    fontSize: 20,
    fontFamily: "Karla-Bold",
    color: "#166534",
  },
  iconTextError: {
    color: "#991b1b",
  },
  title: {
    fontSize: 16,
    fontFamily: "Karla-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: "Karla-Regular",
    color: "#4b5563",
    marginBottom: 16,
  },
  buttonRow: {
    alignItems: "flex-end",
  },
});

export default MobileAlertDialog;
