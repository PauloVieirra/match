import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  phoneRow: {
    flexDirection: "row",
    gap: 10,
  },
  countryBtn: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  countryFlag: {
    fontSize: 18,
  },
  countryCode: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  codesList: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    overflow: "hidden",
  },
  codeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  codeItemActive: {
    backgroundColor: "rgba(24,211,166,0.10)",
  },
  codeItemLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  codeItemCode: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  hint: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
