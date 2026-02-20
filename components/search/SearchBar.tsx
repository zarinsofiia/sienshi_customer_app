// components/search/SearchBar.tsx
import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ORANGE = "#f59e0b";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;

  placeholder?: string;

  /** Called when the search button on the right is pressed */
  onSearch?: () => void;

  /** Left icon inside the input, e.g. "cube-outline" */
  leftIconName?: string;

  /** Right icon (inside the yellow circle) */
  rightIconName?: string;
  rightIconColor?: string;

  onClear?: () => void;
  /** Optional overrides for layout */
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
  onSearch,
  leftIconName = "search",
  rightIconName = "search",
  rightIconColor = ORANGE,
  onClear,
  containerStyle,
  inputStyle,
  buttonStyle,
}: SearchBarProps) {

  const showClear = !!value?.trim();
  const handleClear = () => {
    if (onClear) onClear();
    else onChangeText("");
  };
  return (
    <View style={[styles.searchBar, containerStyle]}>
      <View style={styles.searchLeft}>
        {leftIconName ? (
          <Ionicons
            name={leftIconName as any}
            size={18}
            color="#d1d5db"
            style={{ marginRight: 6 }}
          />
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#d1d5db"
          style={[styles.searchInput, inputStyle]}
          returnKeyType={onSearch ? "search" : "done"}
          onSubmitEditing={onSearch}
        />

        {/* ✅ Clear (x) button */}
        {showClear ? (
          <TouchableOpacity
            onPress={handleClear}
            activeOpacity={0.8}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={25} color="#f59e0b" />
          </TouchableOpacity>
        ) : null}


      </View>

      <TouchableOpacity
        style={[styles.searchButton, buttonStyle]}
        onPress={onSearch}
        activeOpacity={onSearch ? 0.8 : 1}
        disabled={!onSearch}
      >
        <Ionicons name={rightIconName as any} size={20} color={rightIconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  searchLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Karla-Medium",
    color: "#111827",
    paddingVertical: 4,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },

});
