import React, { useContext, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { styles } from "./style";
import { colors } from "../../theme/colors";
import { AppContext } from "../../../contexts/ContextAPI";

function resolveAvatar(person) {
  const photo = person?.image || person?.photos?.[0];
  if (!photo) return null;
  if (typeof photo === "string") return { uri: photo };
  return photo;
}

export default function ChatScreen({ navigation, route }) {
  const { getPublicProfile } = useContext(AppContext);
  const passed = route?.params?.user;
  const userId = route?.params?.userId;
  const [remoteUser, setRemoteUser] = useState(null);
  const [loading, setLoading] = useState(!passed && Boolean(userId));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (passed || !userId || !getPublicProfile) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const profile = await getPublicProfile(userId);
        if (!cancelled) setRemoteUser(profile);
      } catch {
        if (!cancelled) setRemoteUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [passed, userId, getPublicProfile]);

  const target = passed || remoteUser;
  const participant = useMemo(() => {
    if (!target) {
      return { name: "Conversa", avatar: null, statusText: "" };
    }
    return {
      name: target.name || "Conexão",
      avatar: resolveAvatar(target),
      statusText: "Conectado",
    };
  }, [target]);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => (navigation?.canGoBack?.() ? navigation.goBack() : null)}
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
        </TouchableOpacity>

        {participant.avatar ? (
          <Image source={participant.avatar} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { alignItems: "center", justifyContent: "center" }]}>
            <Text style={styles.headerName}>{(participant.name || "?")[0]}</Text>
          </View>
        )}

        <View style={styles.headerText}>
          <Text style={styles.headerName}>{participant.name}</Text>
          {participant.statusText ? (
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{participant.statusText}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.divider} />

      <FlatList
        data={[]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>Vocês se conectaram</Text>
            <View style={styles.matchSubtitleRow}>
              <Text style={styles.matchSubtitle}>
                {(target?.activityTypes || []).slice(0, 2).join(" · ") ||
                  "Estilo de vida em comum"}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 8, paddingTop: 8 }}>
            <Text style={styles.time}>
              Chat em breve. Por enquanto, combinem o treino fora do app.
            </Text>
          </View>
        }
        renderItem={() => null}
      />

      <View style={styles.inputBar}>
        <View style={styles.inputPill}>
          <TextInput
            style={styles.input}
            placeholder="Mensagem"
            placeholderTextColor={colors.textDim}
            editable={false}
          />
        </View>
        <TouchableOpacity style={styles.sendBtn} activeOpacity={0.85} disabled>
          <Feather name="send" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
