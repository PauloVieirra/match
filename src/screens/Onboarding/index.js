import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
  FREQUENCY_OPTIONS,
  SESSION_DURATION,
  GOALS,
  TRAINING_LEVELS,
  PREFERRED_TIMES,
  SMOKING_OPTIONS,
  ALCOHOL_OPTIONS,
  emptyProfile,
  emptyHabits,
  emptyTolerance,
} from "../../data/lifestyleOptions";
import { styles } from "./style";

const STEPS = [
  { key: "basics", title: "Quem é você?", subtitle: "Nome e como quer ser chamado no app." },
  {
    key: "lifestyle",
    title: "Seu estilo de vida",
    subtitle: "A conexão começa aqui — hábitos e qualidade de vida em comum.",
  },
  {
    key: "habits",
    title: "Seus hábitos",
    subtitle: "Fumo e álcool — usados no sensor de tolerância de outras pessoas.",
  },
  {
    key: "activities",
    title: "Suas atividades",
    subtitle: "Quais práticas fazem parte da sua rotina?",
  },
  {
    key: "intensity",
    title: "Ritmo e volume",
    subtitle: "Intensidade, frequência e duração das sessões.",
  },
  {
    key: "goals",
    title: "Objetivos",
    subtitle: "O que você busca ao se conectar com alguém?",
  },
  {
    key: "tolerance",
    title: "Sensor de tolerância",
    subtitle: "Quem você quer ver: qualquer perfil, ou só quem combina com você.",
  },
  {
    key: "photos",
    title: "Fotos",
    subtitle: "Adicione ao menos uma foto (simulada no MVP).",
  },
  {
    key: "location",
    title: "Raio e cidade",
    subtitle: "Defina o raio de busca. GPS preciso vem na próxima etapa.",
  },
];

function toggleInList(list, item, max = 8) {
  if (list.includes(item)) return list.filter((x) => x !== item);
  if (list.length >= max) return list;
  return [...list, item];
}

export default function OnboardingScreen() {
  const { user, completeOnboarding } = useContext(AppContext);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => {
    const base = {
      ...emptyProfile(),
      ...(user?.profile || {}),
      phone: user?.phone || user?.profile?.phone || "",
      name: user?.name || user?.profile?.name || "",
    };
    return {
      ...base,
      habits: { ...emptyHabits(), ...(base.habits || {}) },
      tolerance: { ...emptyTolerance(), ...(base.tolerance || {}) },
    };
  });

  const progress = useMemo(() => (step + 1) / STEPS.length, [step]);
  const current = STEPS[step];

  const patch = (partial) => setDraft((d) => ({ ...d, ...partial }));
  const patchHabits = (partial) =>
    setDraft((d) => ({ ...d, habits: { ...d.habits, ...partial } }));
  const patchTolerance = (tolerance) => setDraft((d) => ({ ...d, tolerance }));

  const canContinue = () => {
    switch (current.key) {
      case "basics":
        return draft.name.trim().length >= 2;
      case "lifestyle":
        return draft.lifestyles.length >= 2;
      case "habits":
        return !!draft.habits?.smoking && !!draft.habits?.alcohol;
      case "activities":
        return draft.activityTypes.length >= 1;
      case "intensity":
        return !!draft.intensity && !!draft.frequencyPerWeek;
      case "goals":
        return draft.goals.length >= 1;
      case "tolerance":
        if (!draft.tolerance?.openness) return false;
        if (draft.tolerance.sameSportOnly && !(draft.tolerance.requiredSports || []).length) {
          return false;
        }
        return !!draft.tolerance.maxDistanceKm;
      case "photos":
        return draft.photos.length >= 1;
      case "location":
        return !!draft.city || draft.locationGranted;
      default:
        return true;
    }
  };

  const next = async () => {
    if (!canContinue()) {
      Alert.alert("Quase lá", "Preencha os campos obrigatórios deste passo.");
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    await completeOnboarding({
      ...draft,
      name: draft.name.trim(),
      tolerance: {
        ...draft.tolerance,
        requiredSports: draft.tolerance.sameSportOnly
          ? draft.tolerance.requiredSports?.length
            ? draft.tolerance.requiredSports
            : draft.activityTypes
          : draft.tolerance.requiredSports || [],
      },
    });
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const addMockPhoto = () => {
    const uris = [
      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=800",
    ];
    if (draft.photos.length >= 5) {
      Alert.alert("Limite", "Máximo de 5 fotos.");
      return;
    }
    patch({ photos: [...draft.photos, { uri: uris[draft.photos.length % uris.length] }] });
  };

  const grantLocation = () => {
    patch({ locationGranted: true, city: draft.city || "Brasília - DF" });
  };

  const renderStep = () => {
    switch (current.key) {
      case "basics":
        return (
          <>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Como você se chama?"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={draft.name}
              onChangeText={(name) => patch({ name })}
              autoCapitalize="words"
            />
            <Text style={styles.label}>Bio curta (opcional)</Text>
            <TextInput
              style={[styles.input, styles.bio]}
              placeholder="Ex.: Busco constância e bons hábitos..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={draft.bio}
              onChangeText={(bio) => patch({ bio })}
              multiline
              maxLength={400}
            />
          </>
        );

      case "lifestyle":
        return (
          <>
            <Text style={styles.helper}>Escolha pelo menos 2 — isso pesa mais no match.</Text>
            <View style={styles.chips}>
              {LIFESTYLE_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={draft.lifestyles.includes(tag)}
                  onPress={() => patch({ lifestyles: toggleInList(draft.lifestyles, tag, 8) })}
                />
              ))}
            </View>
          </>
        );

      case "habits":
        return (
          <>
            <Text style={styles.label}>Fumo</Text>
            <View style={styles.chips}>
              {SMOKING_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={draft.habits.smoking === opt.id}
                  onPress={() => patchHabits({ smoking: opt.id })}
                />
              ))}
            </View>
            <Text style={styles.label}>Álcool</Text>
            <View style={styles.chips}>
              {ALCOHOL_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={draft.habits.alcohol === opt.id}
                  onPress={() => patchHabits({ alcohol: opt.id })}
                />
              ))}
            </View>
          </>
        );

      case "activities":
        return (
          <View style={styles.chips}>
            {ACTIVITY_TYPES.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={draft.activityTypes.includes(tag)}
                onPress={() => patch({ activityTypes: toggleInList(draft.activityTypes, tag, 6) })}
              />
            ))}
          </View>
        );

      case "intensity":
        return (
          <>
            <Text style={styles.label}>Intensidade</Text>
            <View style={styles.chips}>
              {INTENSITY_LEVELS.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  selected={draft.intensity === item.id}
                  onPress={() => patch({ intensity: item.id })}
                />
              ))}
            </View>
            <Text style={styles.label}>Frequência por semana</Text>
            <View style={styles.chips}>
              {FREQUENCY_OPTIONS.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  selected={draft.frequencyPerWeek === item.id}
                  onPress={() => patch({ frequencyPerWeek: item.id })}
                />
              ))}
            </View>
            <Text style={styles.label}>Duração da sessão</Text>
            <View style={styles.chips}>
              {SESSION_DURATION.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  selected={draft.sessionDuration === item.id}
                  onPress={() => patch({ sessionDuration: item.id })}
                />
              ))}
            </View>
            <Text style={styles.label}>Nível</Text>
            <View style={styles.chips}>
              {TRAINING_LEVELS.map((level) => (
                <Chip
                  key={level}
                  label={level}
                  selected={draft.trainingLevel === level}
                  onPress={() => patch({ trainingLevel: level })}
                />
              ))}
            </View>
            <Text style={styles.label}>Horários preferidos</Text>
            <View style={styles.chips}>
              {PREFERRED_TIMES.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected={draft.preferredTimes.includes(t)}
                  onPress={() => patch({ preferredTimes: toggleInList(draft.preferredTimes, t, 3) })}
                />
              ))}
            </View>
          </>
        );

      case "goals":
        return (
          <View style={styles.chips}>
            {GOALS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={draft.goals.includes(tag)}
                onPress={() => patch({ goals: toggleInList(draft.goals, tag, 5) })}
              />
            ))}
          </View>
        );

      case "tolerance":
        return (
          <ToleranceSensor
            value={draft.tolerance}
            onChange={patchTolerance}
            mySports={draft.activityTypes}
            showRadius
          />
        );

      case "photos":
        return (
          <>
            <Text style={styles.helper}>
              {draft.photos.length}/5 fotos · toque para adicionar (mock)
            </Text>
            <View style={styles.photoGrid}>
              {draft.photos.map((p, i) => (
                <View key={`${p.uri}-${i}`} style={styles.photoSlot}>
                  <Text style={styles.photoLabel}>Foto {i + 1}</Text>
                </View>
              ))}
              {draft.photos.length < 5 ? (
                <PrimaryButton title="+ Adicionar foto" variant="ghost" onPress={addMockPhoto} />
              ) : null}
            </View>
          </>
        );

      case "location":
        return (
          <>
            <Text style={styles.helper}>
              O raio já foi definido no sensor ({draft.tolerance.maxDistanceKm} km). Informe a cidade
              por enquanto — o GPS chega na próxima etapa.
            </Text>
            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Brasília - DF"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={draft.city}
              onChangeText={(city) => patch({ city })}
            />
            <PrimaryButton
              title={draft.locationGranted ? "Localização liberada ✓" : "Permitir localização (depois)"}
              variant={draft.locationGranted ? "primary" : "ghost"}
              onPress={grantLocation}
              style={{ marginTop: 16 }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.stepCount}>
        {step + 1} de {STEPS.length}
      </Text>

      <ScreenHeader
        title={current.title}
        subtitle={current.subtitle}
        onBack={step > 0 ? back : undefined}
        large
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton
          title={step === STEPS.length - 1 ? "Começar a descobrir" : "Continuar"}
          onPress={next}
          disabled={!canContinue()}
        />
      </View>
    </SafeAreaView>
  );
}
