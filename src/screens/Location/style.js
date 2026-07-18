import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: 18 },
  label: { color: colors.text, fontSize: 14, fontWeight: "700", marginBottom: 8 },
  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.text,
  },
  hint: { color: colors.textDim, fontSize: 13, lineHeight: 18, marginTop: 16 },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
