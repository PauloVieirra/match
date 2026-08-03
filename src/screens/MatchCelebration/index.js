import React, { useContext, useMemo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { AppContext } from "../../../contexts/ContextAPI";
import { colors } from "../../theme/colors";
import { styles } from "./style";

function resolvePhoto(person) {
  const photo = person?.image || person?.photos?.[0];
  if (!photo) return null;
  if (typeof photo === "string") return { uri: photo };
  return photo;
}

export default function MatchCelebrationScreen({ navigation, route }) {
  const { user } = useContext(AppContext);
  const target = useMemo(
    () => route?.params?.user || null,
    [route?.params?.user],
  );
  const ownPhoto = user?.profile?.photos?.[0];
  const targetPhoto = resolvePhoto(target);
  const ownInitial = (user?.profile?.name || user?.name || "V")[0];

  const startChat = () => {
    const roomId =
      route?.params?.roomId ||
      route?.params?.threadId ||
      route?.params?.conversationId ||
      null;
    navigation.replace("ChatThread", {
      userId: target?.id || route?.params?.userId,
      user: target,
      isNewMatch: true,
      roomId,
      threadId: roomId,
      conversationId: roomId,
    });
  };

  return (
    <LinearGradient
      colors={["#12231F", colors.bg, "#09100E"]}
      locations={[0, 0.55, 1]}
      style={styles.screen}
    >
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity
          style={styles.close}
          onPress={() => navigation.navigate("MainTabs", { screen: "MatchesTab" })}
        >
          <Feather name="x" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.sparkles}>
          <Feather name="zap" size={22} color={colors.accent} />
          <Feather name="activity" size={18} color="rgba(24,211,166,0.55)" />
          <Feather name="star" size={16} color={colors.textMuted} />
        </View>

        <View style={styles.center}>
          <View style={styles.photos}>
            <View style={[styles.photoRing, styles.ownRing]}>
              {ownPhoto ? (
                <Image source={ownPhoto} style={styles.photo} />
              ) : (
                <View style={[styles.photo, styles.placeholder]}>
                  <Text style={styles.initial}>{ownInitial}</Text>
                </View>
              )}
            </View>
            <View style={[styles.photoRing, styles.targetRing]}>
              {targetPhoto ? (
                <Image source={targetPhoto} style={styles.photo} />
              ) : (
                <View style={[styles.photo, styles.placeholder]}>
                  <Feather name="user" size={36} color={colors.accent} />
                </View>
              )}
            </View>
            <View style={styles.linkIcon}>
              <Feather name="link-2" size={18} color={colors.accentDark} />
            </View>
          </View>

          <Text style={styles.eyebrow}>CONEXÃO RECÍPROCA</Text>
          <Text style={styles.title}>Vocês deram match!</Text>
          <Text style={styles.copy}>
            Você e {target?.name || "essa pessoa"} querem se conectar. A conversa já está liberada.
          </Text>

          <View style={styles.sharedCard}>
            <Feather name="activity" size={19} color={colors.accent} />
            <View style={styles.sharedCopy}>
              <Text style={styles.sharedTitle}>Estilo de vida em comum</Text>
              <Text style={styles.sharedText}>
                {(target?.activityTypes || []).slice(0, 2).join(" · ") || "Treino e qualidade de vida"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.chatButton} onPress={startChat} activeOpacity={0.9}>
            <Feather name="message-circle" size={19} color={colors.accentDark} />
            <Text style={styles.chatButtonText}>Iniciar conversa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.laterButton}
            onPress={() => navigation.navigate("MainTabs", { screen: "MatchesTab" })}
          >
            <Text style={styles.laterText}>Agora não</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
