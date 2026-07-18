import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerText: { flex: 1 },
  headerName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.online,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  listContent: {
    padding: 16,
    paddingBottom: 18,
  },

  matchCard: {
    alignSelf: "center",
    width: "100%",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "rgba(24,211,166,0.08)",
    borderWidth: 1,
    borderColor: "rgba(24,211,166,0.18)",
    marginBottom: 16,
    alignItems: "center",
  },
  matchTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  matchSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  matchSubtitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },

  msgWrap: {
    marginBottom: 14,
    maxWidth: "82%",
  },
  msgWrapLeft: { alignSelf: "flex-start" },
  msgWrapRight: { alignSelf: "flex-end" },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
  },
  bubbleLeft: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 6,
  },
  bubbleRight: {
    backgroundColor: "rgba(24,211,166,0.22)",
    borderWidth: 1,
    borderColor: "rgba(24,211,166,0.35)",
    borderTopRightRadius: 6,
  },

  msgText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  msgTextLeft: { color: colors.text },
  msgTextRight: { color: "rgba(255,255,255,0.92)" },

  time: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textDim,
    fontWeight: "600",
  },
  timeLeft: { alignSelf: "flex-start" },
  timeRight: { alignSelf: "flex-end" },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  inputPill: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },

  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(24,211,166,0.28)",
    borderWidth: 1,
    borderColor: "rgba(24,211,166,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
});
