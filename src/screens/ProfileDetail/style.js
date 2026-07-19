import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  missing: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 40,
  },
  backLink: {
    color: colors.accent,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "700",
  },

  scrollContent: {
    paddingBottom: 0,
  },

  hero: {
    width: "100%",
    justifyContent: "flex-end",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroInfo: {
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 38,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.online,
    marginRight: 6,
  },
  statusDotOff: {
    backgroundColor: colors.textDim,
  },
  statusText: {
    color: colors.online,
    fontSize: 14,
    fontWeight: "600",
  },
  statusTextOff: {
    color: colors.textDim,
  },
  bioPreview: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  topBar: {
    position: "absolute",
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  body: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  section: {
    marginBottom: 18,
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  tagText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  lookingTag: {
    backgroundColor: "rgba(24,211,166,0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  lookingTagText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  quoteCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  quoteMark: {
    fontSize: 28,
    color: colors.accent,
    marginBottom: 4,
    fontWeight: "700",
  },
  quoteText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "600",
  },
  photo: {
    width: "100%",
    height: 380,
    borderRadius: 22,
    marginBottom: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  photoImage: {
    borderRadius: 21,
  },
  bio: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 24,
  },
  reportLink: {
    alignItems: "center",
    paddingVertical: 16,
  },
  reportText: {
    color: colors.textDim,
    fontSize: 13,
  },

  connectBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  connectBtnDone: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  connectBtnText: {
    color: colors.accentDark,
    fontSize: 16,
    fontWeight: "800",
  },
  connectBtnDoneText: {
    color: colors.text,
  },
});
