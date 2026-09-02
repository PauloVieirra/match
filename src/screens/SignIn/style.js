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
    justifyContent: "space-between",
  },
  topBrand: {
    alignItems: "center",
    paddingTop: 16,
    gap: 6,
  },
  logo: {
    width: 190,
    height: 190,
  },
  brandName: {
    color: colors.title,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
    textShadowColor: "rgba(255,255,255,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  bottomArea: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  glassWrap: {
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 10,
    backgroundColor: "rgba(255,254,254,0.72)",
  },
  glassPanel: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headline: {
    color: colors.title,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
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
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  phoneBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    marginTop: 10,
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryBtnText: {
    color: colors.gray,
    fontWeight: "600",
  },
  terms: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 18,
  },
});
