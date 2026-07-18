import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Chip from "../ui/Chip";
import {
  TOLERANCE_OPENNESS,
  DEALBREAKERS,
  ACTIVITY_TYPES,
  DISTANCE_OPTIONS,
} from "../../data/lifestyleOptions";
import { colors } from "../../theme/colors";

function toggle(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/**
 * Sensor de tolerância: abertura, dealbreakers, mesmo esporte e raio.
 */
export default function ToleranceSensor({
  value,
  onChange,
  mySports = [],
  showRadius = true,
  compact = false,
}) {
  const v = value || {};
  const patch = (partial) => onChange({ ...v, ...partial });
  const isOpen = v.openness === "open";
  const sportsPool = mySports.length ? mySports : ACTIVITY_TYPES;

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>Sensor de tolerância</Text>
      {!compact ? (
        <Text style={styles.helper}>
          Define o quanto você aceita perfis diferentes — e o que é inegociável.
        </Text>
      ) : null}

      <Text style={styles.label}>Abertura</Text>
      <View style={styles.chips}>
        {TOLERANCE_OPENNESS.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.label}
            selected={v.openness === opt.id}
            onPress={() =>
              patch({
                openness: opt.id,
                dealbreakers: opt.id === "open" ? [] : v.dealbreakers,
                sameSportOnly: opt.id === "open" ? false : v.sameSportOnly,
              })
            }
          />
        ))}
      </View>
      <Text style={styles.hint}>
        {TOLERANCE_OPENNESS.find((o) => o.id === v.openness)?.hint}
      </Text>

      {!isOpen ? (
        <>
          <Text style={styles.label}>Não desejo ver</Text>
          <View style={styles.chips}>
            {DEALBREAKERS.map((d) => (
              <Chip
                key={d.id}
                label={d.label}
                selected={(v.dealbreakers || []).includes(d.id)}
                onPress={() => patch({ dealbreakers: toggle(v.dealbreakers || [], d.id) })}
              />
            ))}
          </View>

          <Text style={styles.label}>Mesmo esporte / atividade</Text>
          <View style={styles.chips}>
            <Chip
              label="Qualquer atividade"
              selected={!v.sameSportOnly}
              onPress={() => patch({ sameSportOnly: false, requiredSports: [] })}
            />
            <Chip
              label="Só quem pratica o mesmo"
              selected={!!v.sameSportOnly}
              onPress={() =>
                patch({
                  sameSportOnly: true,
                  requiredSports:
                    v.requiredSports?.length > 0 ? v.requiredSports : sportsPool.slice(0, 3),
                })
              }
            />
          </View>

          {v.sameSportOnly ? (
            <>
              <Text style={styles.subLabel}>Atividades exigidas</Text>
              <View style={styles.chips}>
                {ACTIVITY_TYPES.map((sport) => (
                  <Chip
                    key={sport}
                    label={sport}
                    selected={(v.requiredSports || []).includes(sport)}
                    onPress={() =>
                      patch({ requiredSports: toggle(v.requiredSports || [], sport) })
                    }
                  />
                ))}
              </View>
            </>
          ) : null}
        </>
      ) : (
        <Text style={styles.openNote}>Modo aberto: dealbreakers e filtro de esporte desligados.</Text>
      )}

      {showRadius ? (
        <>
          <Text style={styles.label}>Raio de busca</Text>
          <Text style={styles.helper}>
            Limite de distância. A localização precisa será configurada na próxima etapa.
          </Text>
          <View style={styles.chips}>
            {DISTANCE_OPTIONS.map((km) => (
              <Chip
                key={km}
                label={`${km} km`}
                selected={v.maxDistanceKm === km}
                onPress={() => patch({ maxDistanceKm: km })}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  sectionLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 10,
  },
  subLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
  },
  helper: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  hint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -2,
    marginBottom: 4,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  openNote: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
});
