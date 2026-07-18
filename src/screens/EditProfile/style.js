import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  note: { color: colors.textDim, fontSize: 12, marginBottom: 12, lineHeight: 18 },
  label: { color: colors.text, fontSize: 14, fontWeight: "700", marginTop: 10, marginBottom: 8 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.text,
    marginBottom: 8,
  },
  inputDisabled: { opacity: 0.6 },
  bio: { height: 120, paddingTop: 12, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
