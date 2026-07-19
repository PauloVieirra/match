import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  header: { alignItems: "center", marginTop: 12, marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#222" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(24,211,166,0.2)" },
  avatarLetter: { color: colors.accent, fontSize: 36, fontWeight: "800" },
  name: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: 12 },
  city: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  metaLine: { color: colors.accent, fontSize: 13, fontWeight: "700", marginTop: 6 },
  bio: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: 10, lineHeight: 20, paddingHorizontal: 12 },
  section: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(24,211,166,0.14)",
  },
  chipText: { color: colors.accent, fontSize: 12, fontWeight: "600" },
  empty: { color: colors.textDim, fontSize: 13 },
  line: { color: colors.text, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  lineMuted: { color: colors.textMuted, fontSize: 13, marginTop: 6 },
  link: { paddingVertical: 12 },
  linkText: { color: colors.textMuted, fontSize: 14, textAlign: "center" },
});
