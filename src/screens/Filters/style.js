import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 10,
  },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  openHint: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
