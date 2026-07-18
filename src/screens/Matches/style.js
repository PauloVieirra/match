import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    paddingHorizontal: 18,
    marginTop: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#222",
  },
  body: {
    flex: 1,
    marginLeft: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  time: {
    color: colors.textDim,
    fontSize: 12,
  },
  activity: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(24,211,166,0.12)",
  },
  tagText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
});
