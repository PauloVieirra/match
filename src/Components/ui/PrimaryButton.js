import React from "react";
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";

export default function PrimaryButton({ title, onPress, disabled, loading, variant = "primary", style }) {
  const isGhost = variant === "ghost";
  const isCoral = variant === "coral";

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isGhost && styles.ghost,
        isCoral && styles.coral,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.accent : colors.accentDark} />
      ) : (
        <Text style={[styles.text, isGhost && styles.ghostText, isCoral && styles.coralText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  coral: {
    backgroundColor: colors.coral,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    color: colors.accentDark,
    fontSize: 16,
    fontWeight: "800",
  },
  ghostText: {
    color: colors.primary,
  },
  coralText: {
    color: colors.white,
  },
});
