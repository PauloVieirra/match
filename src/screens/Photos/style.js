import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { paddingHorizontal: 18, paddingBottom: 24, gap: 12 },
  helper: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  slot: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgCard,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "stretch",
  },
  thumb: {
    width: 88,
    height: 88,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  slotInfo: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  slotText: { color: colors.text, fontWeight: "700", fontSize: 15 },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  removeText: {
    color: colors.coral,
    fontWeight: "600",
    fontSize: 14,
  },
  pickerLoading: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
