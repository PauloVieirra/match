import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  label: { color: colors.text, fontSize: 14, fontWeight: "700", marginBottom: 10, marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  input: {
    minHeight: 120,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.text,
    textAlignVertical: "top",
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
