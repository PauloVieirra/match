import React, { useContext, useState } from "react";
import { View, Text, TextInput, ScrollView, Alert } from "react-native";
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
  GOALS,
  TRAINING_LEVELS,
  SMOKING_OPTIONS,
  ALCOHOL_OPTIONS,
  emptyHabits,
  emptyTolerance,
} from "../../data/lifestyleOptions";
import { styles } from "./style";

function toggle(list, item, max = 8) {
  if (list.includes(item)) return list.filter((x) => x !== item);
  if (list.length >= max) return list;
  return [...list, item];
}

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useContext(AppContext);
  const p = user?.profile || {};
  const [draft, setDraft] = useState({
    name: p.name || "",
    bio: p.bio || "",
    city: p.city || "",
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
  });

  const patch = (partial) => setDraft((d) => ({ ...d, ...partial }));
  const patchHabits = (partial) =>
    setDraft((d) => ({ ...d, habits: { ...d.habits, ...partial } }));

  const save = async () => {
    if (!draft.name.trim()) {
      Alert.alert("Atenção", "Nome é obrigatório.");
      return;
    }
    if (draft.tolerance.sameSportOnly && !(draft.tolerance.requiredSports || []).length) {
      Alert.alert("Atenção", "Selecione ao menos uma atividade no sensor de tolerância.");
      return;
    }
    await updateProfile(draft);
    Alert.alert("Salvo", "Perfil e sensor de tolerância atualizados.");
    navigation.goBack();
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
        <TextInput
          style={styles.input}
          value={draft.city}
          onChangeText={(city) => patch({ city })}
          placeholderTextColor="rgba(255,255,255,0.4)"
          placeholder="Brasília - DF"
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
        <PrimaryButton title="Salvar" onPress={save} />
      </View>
    </SafeAreaView>
  );
}
