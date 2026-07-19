import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";

/**
 * Fundo padrão do app: base escura com uma luz amarelo-ferrugem fosca
 * vinda do canto inferior direito, subindo na diagonal para a esquerda.
 */
export default function AppBackground({ children, style }) {
  return (
    <LinearGradient
      colors={["#33200C", "#1D1409", "#0E0E0E", colors.bg]}
      locations={[0, 0.28, 0.62, 1]}
      start={{ x: 1, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
}
