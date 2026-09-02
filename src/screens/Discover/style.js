import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 0,
  },
  searchAction: {
    marginLeft: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.primarySoft,
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
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: {
    color: colors.textMuted,
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
    backgroundColor: colors.bgElevated,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  foundText: {
    color: colors.title,
    fontSize: 13,
    fontWeight: "700",
  },
});
