import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  p: { color: colors.textMuted, fontSize: 15, lineHeight: 24, marginBottom: 16 },
  muted: { color: colors.textDim, fontSize: 12, marginTop: 8 },
});
