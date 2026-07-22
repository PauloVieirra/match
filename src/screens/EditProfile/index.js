import React, { useContext, useState } from "react";
import { View, Text, TextInput, ScrollView, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  GOALS,
  TRAINING_LEVELS,
  SMOKING_OPTIONS,
  ALCOHOL_OPTIONS,
  GENDER_OPTIONS,
  INTERESTED_IN_OPTIONS,
  RELATIONSHIP_INTENTS,
  emptyHabits,
  emptyTolerance,
  emptyVisibility,
} from "../../data/lifestyleOptions";
import { parseBirthDate } from "../../utils/birthday";
import { colors } from "../../theme/colors";
import { styles } from "./style";
import { formatApiError } from "../../utils/api/formatApiError";

function toggle(list, item, max = 8) {
  if (list.includes(item)) return list.filter((x) => x !== item);
  if (list.length >= max) return list;
  return [...list, item];
}

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useContext(AppContext);
  const p = user?.profile || {};
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    name: p.name || "",
    bio: p.bio || "",
    city: p.city || "",
    cityInfo: p.cityInfo || null,
    profession: p.profession || "",
    lookingFor: p.lookingFor || "",
    motto: p.motto || "",
    lifestyles: p.lifestyles || [],
    activityTypes: p.activityTypes || [],
    intensity: p.intensity || "moderada",
    frequencyPerWeek: p.frequencyPerWeek || 3,
    trainingLevel: p.trainingLevel || "Intermediário",
    goals: p.goals || [],
    habits: { ...emptyHabits(), ...(p.habits || {}) },
    tolerance: { ...emptyTolerance(), ...(p.tolerance || {}) },
    gender: p.gender || "",
    interestedIn: p.interestedIn || [],
    relationshipIntents: p.relationshipIntents || [],
    heightCm: p.heightCm || null,
    showZodiac: !!p.showZodiac,
    visibility: { ...emptyVisibility(), ...(p.visibility || {}) },
  });

  const hasBirthDate = !!parseBirthDate(p.birthDate);

  const patch = (partial) => setDraft((d) => ({ ...d, ...partial }));
  const patchHabits = (partial) =>
    setDraft((d) => ({ ...d, habits: { ...d.habits, ...partial } }));
  const patchVisibility = (key, value) =>
    setDraft((d) => ({ ...d, visibility: { ...d.visibility, [key]: value } }));

  const VisibilitySwitch = ({ field }) => (
    <View style={styles.visRow}>
      <Text style={styles.visText}>Mostrar</Text>
      <Switch
        value={!!draft.visibility[field]}
        onValueChange={(v) => patchVisibility(field, v)}
        trackColor={{ false: "rgba(255,255,255,0.15)", true: "rgba(24,211,166,0.5)" }}
        thumbColor={draft.visibility[field] ? colors.accent : "#888"}
      />
    </View>
  );

  const save = async () => {
    if (!draft.name.trim()) {
      Alert.alert("Atenção", "Nome é obrigatório.");
      return;
    }
    if (draft.tolerance.sameSportOnly && !(draft.tolerance.requiredSports || []).length) {
      Alert.alert("Atenção", "Selecione ao menos uma atividade no sensor de tolerância.");
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        ...draft,
        // não reenvia name para alteração — API bloqueia mudança
        name: p.name || draft.name,
        birthDate: p.birthDate,
      });
      Alert.alert("Salvo", "Perfil e sensor de tolerância atualizados.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro ao salvar", formatApiError(error, "Não foi possível atualizar o perfil."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader title="Editar perfil" onBack={() => navigation.goBack()} large />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.note}>O nome não pode ser alterado após o cadastro completo (regra MVP).</Text>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={draft.name}
          editable={false}
        />
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bio]}
          value={draft.bio}
          onChangeText={(bio) => patch({ bio })}
          multiline
          maxLength={400}
          placeholderTextColor="rgba(255,255,255,0.4)"
          placeholder="Conte sobre rotina, hábitos e o que busca (~120+ chars para nível ideal)"
        />
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
        <Text style={styles.label}>Ocupação</Text>
        <TextInput
          style={styles.input}
          value={draft.profession}
          onChangeText={(profession) => patch({ profession })}
          placeholderTextColor="rgba(255,255,255,0.4)"
          placeholder="Ex.: Personal, nutricionista..."
        />
        <Text style={styles.label}>Estou buscando</Text>
        <TextInput
          style={styles.input}
          value={draft.lookingFor}
          onChangeText={(lookingFor) => patch({ lookingFor })}
          placeholderTextColor="rgba(255,255,255,0.4)"
          placeholder="Ex.: Parceiro(a) de treino e conexão"
        />
        <Text style={styles.label}>Lema</Text>
        <TextInput
          style={styles.input}
          value={draft.motto}
          onChangeText={(motto) => patch({ motto })}
          placeholderTextColor="rgba(255,255,255,0.4)"
          placeholder="Uma frase que te define"
        />

        <Text style={styles.note}>
          Você pode ocultar as informações abaixo, mas isso reduz a qualidade do seu perfil.
        </Text>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Como você se define</Text>
          <VisibilitySwitch field="gender" />
        </View>
        <View style={styles.chips}>
          {GENDER_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={draft.gender === opt.id}
              onPress={() => patch({ gender: draft.gender === opt.id ? "" : opt.id })}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Tenho interesse em</Text>
          <VisibilitySwitch field="interestedIn" />
        </View>
        <View style={styles.chips}>
          {INTERESTED_IN_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={draft.interestedIn.includes(opt.id)}
              onPress={() => patch({ interestedIn: toggle(draft.interestedIn, opt.id, 4) })}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Procurando por</Text>
          <VisibilitySwitch field="relationshipIntents" />
        </View>
        <View style={styles.chips}>
          {RELATIONSHIP_INTENTS.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={draft.relationshipIntents.includes(opt.id)}
              onPress={() =>
                patch({ relationshipIntents: toggle(draft.relationshipIntents, opt.id, 5) })
              }
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Altura</Text>
          <VisibilitySwitch field="height" />
        </View>
        <HeightWheel value={draft.heightCm} onChange={(heightCm) => patch({ heightCm })} />

        {hasBirthDate ? (
          <View style={styles.labelRow}>
            <Text style={styles.label}>Exibir signo no perfil</Text>
            <View style={styles.visRow}>
              <Text style={styles.visText}>Mostrar</Text>
              <Switch
                value={draft.showZodiac}
                onValueChange={(showZodiac) => patch({ showZodiac })}
                trackColor={{ false: "rgba(255,255,255,0.15)", true: "rgba(24,211,166,0.5)" }}
                thumbColor={draft.showZodiac ? colors.accent : "#888"}
              />
            </View>
          </View>
        ) : null}

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

        <Text style={styles.label}>Estilo de vida</Text>
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

        <Text style={styles.label}>Atividades</Text>
        <View style={styles.chips}>
          {ACTIVITY_TYPES.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={draft.activityTypes.includes(tag)}
              onPress={() => patch({ activityTypes: toggle(draft.activityTypes, tag, 6) })}
            />
          ))}
        </View>

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

        <Text style={styles.label}>Frequência</Text>
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

        <Text style={styles.label}>Objetivos</Text>
        <View style={styles.chips}>
          {GOALS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={draft.goals.includes(tag)}
              onPress={() => patch({ goals: toggle(draft.goals, tag, 5) })}
            />
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <ToleranceSensor
            value={draft.tolerance}
            onChange={(tolerance) => patch({ tolerance })}
            mySports={draft.activityTypes}
            showRadius
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton title="Salvar" onPress={save} loading={saving} disabled={saving} />
      </View>
    </SafeAreaView>
  );
}
