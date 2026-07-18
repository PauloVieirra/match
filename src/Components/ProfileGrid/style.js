import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 100,
    paddingTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  column: {
    gap: 10,
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.bgCard,
  },
  cardImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardImageRadius: {
    borderRadius: 22,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardMeta: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    zIndex: 1,
  },
  cardName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  cardSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
