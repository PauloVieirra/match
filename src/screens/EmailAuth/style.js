import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modeBtnOn: {
    backgroundColor: "rgba(24,211,166,0.18)",
  },
  modeText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  modeTextOn: {
    color: colors.accent,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 12,
  },
  input: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  fieldError: {
    color: colors.coral,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  hint: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
  },
  error: {
    color: colors.coral,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
