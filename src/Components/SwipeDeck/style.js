import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0D0F" },

  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#0B0D0F",
  },

  cardImage: { transform: [{ scale: 1.02 }] },

  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "42%",
  },

  infoArea: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 120,
  },

  nameRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10 },
  name: { color: "#fff", fontSize: 44, fontWeight: "900", letterSpacing: 0.2 },
  age: { fontSize: 28, fontWeight: "800" },
  years: { fontSize: 18, fontWeight: "700", color: "rgba(255,255,255,0.75)" },
  verifiedDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#18D3A6",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
  },

  meta: { color: "rgba(255,255,255,0.78)", fontSize: 14, marginTop: 8 },

  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.22)",
  },
  pillText: { color: "rgba(255,255,255,0.92)", fontSize: 15, fontWeight: "800" },

  stamp: {
    position: "absolute",
    top: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
  },
  stampLike: { left: 18, borderColor: "rgba(24,211,166,0.9)" },
  stampNope: { right: 18, borderColor: "rgba(255, 77, 109, 0.95)" },
  stampText: { fontSize: 18, fontWeight: "900" },
  stampLikeText: { color: "#18D3A6" },
  stampNopeText: { color: "#FF4D6D" },

  actionsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 28,
    paddingHorizontal: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 2,
  },
  actionNope: { borderColor: "rgba(255, 77, 109, 0.9)" },
  actionLike: { borderColor: "rgba(24,211,166,0.9)" },
  actionIcon: { fontSize: 34, fontWeight: "900" },
  actionNopeIcon: { color: "#FF4D6D" },
  actionLikeIcon: { color: "#18D3A6" },
});

