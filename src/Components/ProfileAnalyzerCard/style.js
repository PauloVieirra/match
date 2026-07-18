import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  level: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "rgba(24,211,166,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  scoreIdeal: {
    backgroundColor: "rgba(24,211,166,0.28)",
  },
  scoreValue: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: "800",
  },
  scoreMax: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 3,
    marginLeft: 1,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginTop: 14,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
  checks: {
    marginTop: 14,
    gap: 8,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkDot: {
    width: 20,
    fontSize: 13,
    fontWeight: "800",
  },
  checkOk: { color: colors.accent },
  checkWarn: { color: "#F5A524" },
  checkLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  checkDetail: {
    color: colors.textDim,
    fontSize: 12,
  },
  tipsBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tipsTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  tip: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
  idealNote: {
    marginTop: 12,
    color: colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
});
