import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";

export default function ConnectionNotification({ visible, onPress, onClose }) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[styles.card, { top: insets.top + 8 }]}
      activeOpacity={0.92}
      onPress={onPress}
    >
      <View style={styles.icon}>
        <Feather name="users" size={20} color={colors.accentDark} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Você tem uma nova conexão</Text>
        <Text style={styles.subtitle}>Toque para ver seu novo match</Text>
      </View>
      <TouchableOpacity
        style={styles.close}
        onPress={(event) => {
          event.stopPropagation();
          onClose();
        }}
        hitSlop={10}
      >
        <Feather name="x" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: 14,
    right: 14,
    zIndex: 100,
    elevation: 20,
    minHeight: 70,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  copy: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  close: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});
