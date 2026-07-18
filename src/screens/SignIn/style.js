import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  heroImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safe: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomArea: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  glassWrap: {
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
    backgroundColor: "rgba(20,23,26,0.35)",
  },
  glassPanel: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },

  headline: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 35,
    marginBottom: 8,
  },
  subhead: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },

  phoneBtn: {
    height: 54,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(24,211,166,0.16)",
    borderWidth: 1,
    borderColor: "rgba(24,211,166,0.38)",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  phoneBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  dividerText: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "600",
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
  },
  dropBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderBottomRightRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },

  terms: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 18,
  },
});
