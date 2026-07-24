import React, { useContext, useState } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "../../../contexts/ContextAPI";
import Chip from "../../Components/ui/Chip";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import ToleranceSensor from "../../Components/ToleranceSensor";
import {
  LIFESTYLE_TAGS,
  ACTIVITY_TYPES,
  INTENSITY_LEVELS,
  GOALS,
  TRAINING_LEVELS,
  DEFAULT_FILTERS,
  emptyTolerance,
  mergeFiltersWithProfile,
} from "../../data/lifestyleOptions";
import { formatApiError } from "../../utils/api/formatApiError";
import { colors } from "../../theme/colors";
import { styles } from "./style";

function toggle(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export default function FiltersScreen({ navigation }) {
  const { user, filters, setFilters } = useContext(AppContext);
  const merged = mergeFiltersWithProfile(filters, user?.profile);
  const [draft, setDraft] = useState({ ...DEFAULT_FILTERS, ...merged });
  const [saving, setSaving] = useState(false);

  const patch = (partial) => setDraft((d) => ({ ...d, ...partial }));

  const onToleranceChange = (tolerance) => {
    patch({
      openness: tolerance.openness,
      dealbreakers: tolerance.dealbreakers || [],
      sameSportOnly: !!tolerance.sameSportOnly,
      requiredSports: tolerance.requiredSports || [],
      maxDistanceKm: tolerance.maxDistanceKm,
    });
  };

  const apply = async () => {
    try {
      setSaving(true);
      await setFilters(draft);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro ao salvar", formatApiError(error, "Não foi possível salvar os filtros."));
    } finally {
      setSaving(false);
    }
  };

  const reset = () =>
    setDraft({
      ...DEFAULT_FILTERS,
      ...emptyTolerance(),
      openness: "open",
    });

  const toleranceValue = {
    openness: draft.openness,
    dealbreakers: draft.dealbreakers || [],
    sameSportOnly: !!draft.sameSportOnly,
    requiredSports: draft.requiredSports || [],
    maxDistanceKm: draft.maxDistanceKm,
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        title="Filtros"
        subtitle="Sensor de tolerância + preferências de descoberta."
        onBack={() => navigation.goBack()}
        large
      />

      <ScrollView contentContainerStyle={styles.content}>
        <ToleranceSensor
          value={toleranceValue}
          onChange={onToleranceChange}
          mySports={user?.profile?.activityTypes || []}
          showRadius
        />

        {draft.openness !== "open" ? (
          <>
            <Text style={styles.label}>Estilo de vida (opcional)</Text>
            <View style={styles.chips}>
              {LIFESTYLE_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={draft.lifestyles.includes(tag)}
                  onPress={() => patch({ lifestyles: toggle(draft.lifestyles, tag) })}
                />
              ))}
            </View>

            <Text style={styles.label}>Tipo de atividade (opcional)</Text>
            <View style={styles.chips}>
              {ACTIVITY_TYPES.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={draft.activityTypes.includes(tag)}
                  onPress={() => patch({ activityTypes: toggle(draft.activityTypes, tag) })}
                />
              ))}
            </View>

            <Text style={styles.label}>Intensidade</Text>
            <View style={styles.chips}>
              {INTENSITY_LEVELS.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  selected={draft.intensity.includes(item.id)}
                  onPress={() => patch({ intensity: toggle(draft.intensity, item.id) })}
                />
              ))}
            </View>

            <Text style={styles.label}>Nível</Text>
            <View style={styles.chips}>
              {TRAINING_LEVELS.map((level) => (
                <Chip
                  key={level}
                  label={level}
                  selected={draft.levels.includes(level)}
                  onPress={() => patch({ levels: toggle(draft.levels, level) })}
                />
              ))}
            </View>

            <Text style={styles.label}>Frequência (x/semana)</Text>
            <View style={styles.chips}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Chip
                  key={`min-${n}`}
                  label={`min ${n}x`}
                  selected={draft.frequencyMin === n}
                  onPress={() => patch({ frequencyMin: n })}
                />
              ))}
            </View>
            <View style={styles.chips}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Chip
                  key={`max-${n}`}
                  label={`máx ${n}x`}
                  selected={draft.frequencyMax === n}
                  onPress={() => patch({ frequencyMax: n })}
                />
              ))}
            </View>

            <Text style={styles.label}>Objetivos</Text>
            <View style={styles.chips}>
              {GOALS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={draft.goals.includes(tag)}
                  onPress={() => patch({ goals: toggle(draft.goals, tag) })}
                />
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.openHint}>
            Modo aberto: o grid mostra qualquer perfil dentro do raio de {draft.maxDistanceKm} km.
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {saving ? (
          <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
        ) : (
          <>
            <PrimaryButton title="Limpar" variant="ghost" onPress={reset} style={{ flex: 1 }} />
            <PrimaryButton title="Aplicar" onPress={apply} style={{ flex: 1.4 }} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
