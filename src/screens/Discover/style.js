import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  hint: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: "rgba(24,211,166,0.12)",
  },
  filterText: {
    color: colors.accent,
    fontWeight: "700",
    fontSize: 13,
  },
  moreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: -4,
  },
  gridWrap: {
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  foundPill: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  foundText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
