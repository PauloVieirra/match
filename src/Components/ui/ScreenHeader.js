import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function ScreenHeader({ title, subtitle, onBack, right, large }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity style={styles.back} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        {!large ? <Text style={styles.titleCenter}>{title}</Text> : <View style={{ flex: 1 }} />}
        {right ? right : <View style={styles.spacer} />}
      </View>
      {large ? (
        <>
          <Text style={styles.titleLarge}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </>
      ) : subtitle ? (
        <Text style={[styles.subtitle, { marginTop: 4 }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  backText: {
    color: colors.text,
    fontSize: 26,
    marginTop: -2,
  },
  spacer: { width: 40, height: 40 },
  titleCenter: {
    color: colors.title,
    fontSize: 17,
    fontWeight: "700",
  },
  titleLarge: {
    color: colors.title,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
});
