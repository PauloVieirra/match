import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  boxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  box: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  boxActive: {
    borderColor: colors.accent,
  },
  boxFilled: {
    backgroundColor: "rgba(24,211,166,0.10)",
    borderColor: "rgba(24,211,166,0.4)",
  },
  boxText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 1,
    width: 1,
  },
  mockHint: {
    color: colors.textDim,
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
  },
  resend: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
