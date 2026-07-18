import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  overlay: {
    position: "absolute",
    left: 14,
    right: 14,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(11,13,15,0.92)",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },

  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(11,13,15,0.92)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,77,109,0.4)",
    padding: 10,
    marginTop: 8,
  },
  permissionText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },

  venueList: {
    marginTop: 8,
    maxHeight: 320,
  },
  venueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11,13,15,0.92)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 8,
  },
  venueCardTest: {
    borderColor: colors.accent,
    backgroundColor: "rgba(24,211,166,0.12)",
  },
  venueIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(24,211,166,0.12)",
  },
  venueIconTest: {
    backgroundColor: "rgba(24,211,166,0.22)",
  },
  venueInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  venueName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  venueMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  checkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checkBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkBtnText: {
    color: colors.accentDark,
    fontSize: 12,
    fontWeight: "800",
  },
  checkBtnTextDisabled: {
    color: colors.textDim,
  },

  emptyCard: {
    backgroundColor: "rgba(11,13,15,0.92)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  todayChip: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(11,13,15,0.92)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  todayText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
});
