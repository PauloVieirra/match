import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function Chip({ label, selected, onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.text, selected && styles.textSelected]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "rgba(24,211,166,0.18)",
    borderColor: colors.accent,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  textSelected: {
    color: colors.accent,
  },
});
