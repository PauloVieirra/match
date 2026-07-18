import React from "react";
import { View, Text } from "react-native";
import { styles } from "./style";

export default function ProfileAnalyzerCard({ analysis }) {
  if (!analysis) return null;
  const { score, max, level, levelHint, checks, tips, isIdeal } = analysis;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Analisador de perfil</Text>
          <Text style={styles.level}>{level}</Text>
        </View>
        <View style={[styles.scoreBadge, isIdeal && styles.scoreIdeal]}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreMax}>/{max}</Text>
        </View>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${(score / max) * 100}%` }]} />
      </View>
      <Text style={styles.hint}>{levelHint}</Text>

      <View style={styles.checks}>
        {checks.map((c) => (
          <View key={c.key} style={styles.checkRow}>
            <Text style={[styles.checkDot, c.ok ? styles.checkOk : styles.checkWarn]}>
              {c.ok ? "✓" : "!"}
            </Text>
            <Text style={styles.checkLabel}>{c.label}</Text>
            <Text style={styles.checkDetail}>{c.detail}</Text>
          </View>
        ))}
      </View>

      {tips.length ? (
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Para subir de nível</Text>
          {tips.map((t) => (
            <Text key={t} style={styles.tip}>
              · {t}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.idealNote}>Perfil ideal — informações, fotos e bio no ponto.</Text>
      )}
    </View>
  );
}
