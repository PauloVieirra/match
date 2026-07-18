import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  progressTrack: {
    height: 3,
    marginHorizontal: 18,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
  },
  stepCount: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "600",
    marginHorizontal: 18,
    marginTop: 10,
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
    marginTop: 8,
  },
  helper: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.text,
    fontSize: 16,
    marginBottom: 12,
  },
  bio: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  photoGrid: {
    gap: 12,
  },
  photoSlot: {
    height: 88,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(24,211,166,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoLabel: {
    color: colors.accent,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
