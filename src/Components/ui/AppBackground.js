import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";

/** Fundo padrão: gradiente suave rosa-claro → branco. */
export default function AppBackground({ children, style }) {
  return (
    <LinearGradient
      colors={[colors.white, "#FFF3F6", colors.bg, "#FFF0F3"]}
      locations={[0, 0.35, 0.7, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
}
