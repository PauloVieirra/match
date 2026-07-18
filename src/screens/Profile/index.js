import React, { useContext, useMemo } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "../../../contexts/ContextAPI";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import ProfileAnalyzerCard from "../../Components/ProfileAnalyzerCard";
import { analyzeProfile, mapOwnProfileForAnalysis } from "../../utils/profileAnalyzer";
import { parseBirthDate, ageFrom, zodiacOf } from "../../utils/birthday";
import {
  GENDER_OPTIONS,
  INTERESTED_IN_OPTIONS,
  RELATIONSHIP_INTENTS,
} from "../../data/lifestyleOptions";
import { styles } from "./style";

const labelOf = (options, id) => options.find((o) => o.id === id)?.label;

export default function ProfileScreen({ navigation }) {
  const { user, logout, filters } = useContext(AppContext);
  const profile = user?.profile || {};
  const photo = profile.photos?.[0];

  const analysis = useMemo(
    () => analyzeProfile(mapOwnProfileForAnalysis(user)),
    [user]
  );

  const birth = parseBirthDate(profile.birthDate);
  const age = birth ? ageFrom(birth) : null;
  const zodiac = birth && profile.showZodiac ? zodiacOf(birth) : null;
  const vis = profile.visibility || {};
  const isHidden = (key) => vis[key] === false;
  const heightLabel = profile.heightCm
    ? `${(profile.heightCm / 100).toFixed(2).replace(".", ",")} m`
    : null;
  const metaLine = [!isHidden("height") ? heightLabel : null, zodiac]
    .filter(Boolean)
    .join(" · ");
  const interestedIn = (profile.interestedIn || [])
    .map((id) => labelOf(INTERESTED_IN_OPTIONS, id))
    .filter(Boolean);
  const intents = (profile.relationshipIntents || [])
    .map((id) => labelOf(RELATIONSHIP_INTENTS, id))
    .filter(Boolean);
  const hiddenSuffix = (key) => (isHidden(key) ? " · oculto" : "");

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {photo ? (
            <Image source={photo} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarLetter}>{(profile.name || "?")[0]}</Text>
            </View>
          )}
          <Text style={styles.name}>
            {profile.name || "Seu perfil"}
            {age ? `, ${age}` : ""}
          </Text>
          <Text style={styles.city}>{profile.city || "Cidade não informada"}</Text>
          {metaLine ? <Text style={styles.metaLine}>{metaLine}</Text> : null}
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        </View>

        <ProfileAnalyzerCard analysis={analysis} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identidade e interesses</Text>
          <Text style={styles.line}>
            {labelOf(GENDER_OPTIONS, profile.gender) || "Como você se define: —"}
            {hiddenSuffix("gender")}
          </Text>
          <Text style={styles.lineMuted}>
            Deseja conhecer: {interestedIn.length ? interestedIn.join(" · ") : "todos"}
            {hiddenSuffix("interestedIn")}
          </Text>
          {heightLabel ? (
            <Text style={styles.lineMuted}>
              Altura: {heightLabel}
              {hiddenSuffix("height")}
            </Text>
          ) : null}
          {intents.length ? (
            <>
              <Text style={styles.lineMuted}>
                Procurando por{hiddenSuffix("relationshipIntents")}:
              </Text>
              <View style={[styles.chips, { marginTop: 8 }]}>
                {intents.map((t) => (
                  <View key={t} style={styles.chip}>
                    <Text style={styles.chipText}>{t}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.lineMuted}>Procurando por: —</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hábitos</Text>
          <Text style={styles.line}>
            Fumo: {profile.habits?.smoking === "never" ? "Não" : profile.habits?.smoking === "yes" ? "Sim" : profile.habits?.smoking === "sometimes" ? "Às vezes" : "—"}
            {" · "}
            Álcool:{" "}
            {profile.habits?.alcohol === "never"
              ? "Não bebo"
              : profile.habits?.alcohol === "often"
                ? "Frequente"
                : profile.habits?.alcohol === "social"
                  ? "Social"
                  : "—"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sensor de tolerância</Text>
          <Text style={styles.line}>
            {profile.tolerance?.openness === "open"
              ? "Aberta — qualquer perfil"
              : profile.tolerance?.openness === "strict"
                ? "Rígida — só combinações fortes"
                : "Seletiva — com limites"}
          </Text>
          <Text style={styles.lineMuted}>
            Raio {profile.tolerance?.maxDistanceKm || filters?.maxDistanceKm || 20} km
            {(profile.tolerance?.dealbreakers || []).includes("no_smokers") ? " · sem fumantes" : ""}
            {(profile.tolerance?.dealbreakers || []).includes("no_alcohol") ? " · sem álcool" : ""}
            {profile.tolerance?.sameSportOnly ? " · mesmo esporte" : ""}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estilo de vida</Text>
          <View style={styles.chips}>
            {(profile.lifestyles || []).map((t) => (
              <View key={t} style={styles.chip}>
                <Text style={styles.chipText}>{t}</Text>
              </View>
            ))}
            {!profile.lifestyles?.length ? (
              <Text style={styles.empty}>Nenhum hábito selecionado</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividades</Text>
          <Text style={styles.line}>
            {(profile.activityTypes || []).join(" · ") || "—"}
          </Text>
          <Text style={styles.lineMuted}>
            {profile.frequencyPerWeek}x/sem · {profile.trainingLevel} · intensidade {profile.intensity}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivos</Text>
          <Text style={styles.line}>{(profile.goals || []).join(" · ") || "—"}</Text>
        </View>

        <PrimaryButton title="Editar perfil" onPress={() => navigation.navigate("EditProfile")} />
        <PrimaryButton
          title="Fotos"
          variant="ghost"
          onPress={() => navigation.navigate("Photos")}
          style={{ marginTop: 10 }}
        />
        <PrimaryButton
          title="Filtros de busca"
          variant="ghost"
          onPress={() => navigation.navigate("Filters")}
          style={{ marginTop: 10 }}
        />
        <PrimaryButton
          title="Localização"
          variant="ghost"
          onPress={() => navigation.navigate("Location")}
          style={{ marginTop: 10 }}
        />

        <TouchableOpacity onPress={() => navigation.navigate("Terms")} style={styles.link}>
          <Text style={styles.linkText}>Termos de uso</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Privacy")} style={styles.link}>
          <Text style={styles.linkText}>Política de privacidade</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Report")} style={styles.link}>
          <Text style={styles.linkText}>Denunciar / bloquear</Text>
        </TouchableOpacity>

        <PrimaryButton
          title="Sair"
          variant="coral"
          onPress={() =>
            Alert.alert("Sair", "Deseja encerrar a sessão?", [
              { text: "Cancelar", style: "cancel" },
              { text: "Sair", style: "destructive", onPress: logout },
            ])
          }
          style={{ marginTop: 24, marginBottom: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
