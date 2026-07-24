import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Switch,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { AppContext } from "../../../contexts/ContextAPI";
import Chip from "../../Components/ui/Chip";
import CityAutocomplete from "../../Components/ui/CityAutocomplete";
import HeightWheel from "../../Components/ui/HeightWheel";
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
  GENDER_OPTIONS,
  INTERESTED_IN_OPTIONS,
  RELATIONSHIP_INTENTS,
  emptyProfile,
  emptyHabits,
  emptyTolerance,
} from "../../data/lifestyleOptions";
import { formatBirthInput, parseBirthDate, ageFrom, zodiacOf } from "../../utils/birthday";
import { formatApiError } from "../../utils/api/formatApiError";
import { validatePickedPhoto } from "../../utils/photos/photoLimits";
import { colors } from "../../theme/colors";
import { styles } from "./style";

const STEPS = [
  { key: "basics", title: "Quem é você?", subtitle: "Nome e como quer ser chamado no app." },
  {
    key: "birthdate",
    title: "Sua data de nascimento",
    subtitle: "Verifique se está correta — você não poderá modificá-la depois.",
  },
  {
    key: "identity",
    title: "Como você se define?",
    subtitle: "Você pode modificar essa informação mais tarde falando com o suporte.",
  },
  {
    key: "seeking",
    title: "Você deseja conhecer",
    subtitle: "Selecione um ou mais itens — ou deixe desmarcado para todos.",
    optional: true,
  },
  {
    key: "intent",
    title: "O que você está procurando?",
    subtitle: "Escolha a(s) opção(ões) que mais te atende(m).",
    optional: true,
  },
  {
    key: "height",
    title: "Qual é a sua altura?",
    subtitle: "Você pode modificar ou apagar a sua resposta quando quiser.",
    optional: true,
  },
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
    subtitle: "Adicione ao menos uma foto do seu dispositivo.",
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

  const [ageModalVisible, setAgeModalVisible] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const progress = useMemo(() => (step + 1) / STEPS.length, [step]);
  const current = STEPS[step];

  const birthParsed = parseBirthDate(draft.birthDate);
  const birthAge = birthParsed ? ageFrom(birthParsed) : null;
  const birthZodiac = birthParsed ? zodiacOf(birthParsed) : null;

  const patch = (partial) => setDraft((d) => ({ ...d, ...partial }));
  const patchHabits = (partial) =>
    setDraft((d) => ({ ...d, habits: { ...d.habits, ...partial } }));
  const patchTolerance = (tolerance) => setDraft((d) => ({ ...d, tolerance }));

  const canContinue = () => {
    switch (current.key) {
      case "basics":
        return draft.name.trim().length >= 2;
      case "birthdate":
        return !!birthParsed && birthAge >= 18 && birthAge <= 100;
      case "identity":
        return !!draft.gender;
      case "seeking":
      case "intent":
      case "height":
        return true;
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
        return !!draft.city;
      default:
        return true;
    }
  };

  const next = async () => {
    if (!canContinue()) {
      if (current.key === "birthdate" && birthParsed && birthAge < 18) {
        Alert.alert("Idade mínima", "Você precisa ter pelo menos 18 anos para usar o app.");
        return;
      }
      Alert.alert("Quase lá", "Preencha os campos obrigatórios deste passo.");
      return;
    }
    if (current.key === "birthdate" && !ageConfirmed) {
      setAgeModalVisible(true);
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    try {
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
    } catch (e) {
      Alert.alert("Cadastro", formatApiError(e, "Não foi possível salvar o perfil."));
    }
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const skip = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const confirmAge = () => {
    setAgeConfirmed(true);
    setAgeModalVisible(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const [pickingPhoto, setPickingPhoto] = useState(false);

  const addPhoto = async () => {
    if (draft.photos.length >= 5) {
      Alert.alert("Limite", "Máximo de 5 fotos.");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Autorize o acesso à galeria para adicionar fotos ao perfil.",
      );
      return;
    }

    try {
      setPickingPhoto(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.7,
        base64: true,
        exif: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const validation = validatePickedPhoto(asset);
      if (!validation.ok) {
        Alert.alert("Foto inválida", validation.message);
        return;
      }

      patch({
        photos: [
          ...draft.photos,
          {
            uri: asset.uri,
            base64: asset.base64,
            mimeType: asset.mimeType || "image/jpeg",
            order: draft.photos.length,
          },
        ],
      });
    } catch (error) {
      Alert.alert("Erro", error?.message || "Falha ao selecionar a foto.");
    } finally {
      setPickingPhoto(false);
    }
  };

  const removePhoto = (index) => {
    patch({
      photos: draft.photos
        .filter((_, i) => i !== index)
        .map((photo, order) => ({ ...photo, order })),
    });
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

        case "birthdate":
          return (
            <>
              <TextInput
                style={[styles.input, styles.birthInput]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={draft.birthDate}
                onChangeText={(text) => {
                  setAgeConfirmed(false);
                  patch({ birthDate: formatBirthInput(text) });
                }}
                keyboardType="number-pad"
                maxLength={10}
              />
              {birthParsed ? (
                <View style={styles.zodiacCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.zodiacText}>
                      Seu signo é: <Text style={styles.zodiacSign}>{birthZodiac}</Text>. Quer exibir no
                      seu perfil? Você pode modificar esse item mais tarde.
                    </Text>
                  </View>
                  <Switch
                    value={!!draft.showZodiac}
                    onValueChange={(showZodiac) => patch({ showZodiac })}
                    trackColor={{ false: "rgba(255,255,255,0.15)", true: "rgba(24,211,166,0.5)" }}
                    thumbColor={draft.showZodiac ? colors.accent : "#888"}
                  />
                </View>
              ) : null}
            </>
          );

        case "identity":
          return (
            <View style={styles.chips}>
              {GENDER_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={draft.gender === opt.id}
                  onPress={() => patch({ gender: opt.id })}
                />
              ))}
            </View>
          );

        case "seeking":
          return (
            <View style={styles.chips}>
              {INTERESTED_IN_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={(draft.interestedIn || []).includes(opt.id)}
                  onPress={() =>
                    patch({ interestedIn: toggleInList(draft.interestedIn || [], opt.id, 4) })
                  }
                />
              ))}
            </View>
          );

        case "intent":
          return (
            <View style={styles.chips}>
              {RELATIONSHIP_INTENTS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={(draft.relationshipIntents || []).includes(opt.id)}
                  onPress={() =>
                    patch({
                      relationshipIntents: toggleInList(draft.relationshipIntents || [], opt.id, 5),
                    })
                  }
                />
              ))}
            </View>
          );

        case "height":
          return <HeightWheel value={draft.heightCm} onChange={(heightCm) => patch({ heightCm })} />;

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
                {draft.photos.length}/5 fotos · toque para adicionar da galeria
              </Text>
              <View style={styles.photoGrid}>
                {draft.photos.map((p, i) => (
                  <View key={`${p.uri}-${i}`} style={styles.photoSlot}>
                    <Image source={{ uri: p.uri }} style={styles.photoThumb} />
                    <TouchableOpacity
                      style={styles.photoRemove}
                      onPress={() => removePhoto(i)}
                      hitSlop={8}
                    >
                      <Feather name="x" size={16} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.photoLabel}>Foto {i + 1}</Text>
                  </View>
                ))}
                {draft.photos.length < 5 ? (
                  pickingPhoto ? (
                    <View style={styles.photoSlot}>
                      <ActivityIndicator color={colors.accent} />
                    </View>
                  ) : (
                    <PrimaryButton title="+ Adicionar foto" variant="ghost" onPress={addPhoto} />
                  )
                ) : null}
              </View>
            </>
          );

        case "location":
          return (
            <>
              <Text style={styles.helper}>
                O raio já foi definido no sensor ({draft.tolerance.maxDistanceKm} km). Informe sua
                cidade ou região — obrigatório para mostrar pessoas perto de você.
              </Text>
              <Text style={styles.label}>Cidade</Text>
              <CityAutocomplete
                value={draft.city}
                onSelect={(c) =>
                  patch({
                    city: c.label,
                    cityInfo: {
                      id: c.id,
                      name: c.name,
                      uf: c.uf,
                      type: c.type,
                      source: c.source,
                    },
                  })
                }
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
        <View style={styles.stepRow}>
          <Text style={styles.stepCount}>
            {step + 1} de {STEPS.length}
          </Text>
          {current.optional ? (
            <TouchableOpacity onPress={skip} activeOpacity={0.8} hitSlop={8}>
              <Text style={styles.skipText}>Passar</Text>
            </TouchableOpacity>
          ) : null}
        </View>

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

        <Modal
          visible={ageModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAgeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalIcon}>
                <Feather name="gift" size={24} color={colors.accentDark} />
              </View>
              <Text style={styles.modalTitle}>Você tem {birthAge} anos?</Text>
              <Text style={styles.modalCopy}>
                Verifique se a sua idade está correta, você não poderá modificá-la depois.
              </Text>
              <PrimaryButton title="Confirmar" onPress={confirmAge} />
              <PrimaryButton
                title="Modificar"
                variant="ghost"
                onPress={() => setAgeModalVisible(false)}
                style={{ marginTop: 10 }}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
}
