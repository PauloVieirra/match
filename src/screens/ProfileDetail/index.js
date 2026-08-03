import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { AppContext } from "../../../contexts/ContextAPI";
import { buildPhotoId } from "../../services/photoLikesService";
import { usePhotoLikes } from "../../hooks/usePhotoLikes";
import LikablePhoto from "../../Components/ui/LikablePhoto";
import { colors } from "../../theme/colors";
import { styles } from "./style";

function Tag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export default function ProfileDetailScreen({ navigation, route }) {
  const { user: viewer, sendConnectionRequest, connectionStatus, getPublicProfile, matches } =
    useContext(AppContext);
  const userId = route?.params?.userId;
  const passed = route?.params?.user;
  const [remoteUser, setRemoteUser] = useState(null);
  const [loadingRemote, setLoadingRemote] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (passed || !userId || !getPublicProfile) return;
      setLoadingRemote(true);
      try {
        const profile = await getPublicProfile(userId);
        if (!cancelled) setRemoteUser(profile);
      } catch (error) {
        console.log("Falha ao carregar perfil público:", error?.message);
        if (!cancelled) setRemoteUser(null);
      } finally {
        if (!cancelled) setLoadingRemote(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [passed, userId, getPublicProfile]);

  const user = useMemo(
    () => passed || remoteUser || null,
    [passed, remoteUser],
  );
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const photos = useMemo(
    () => (user?.photos?.length ? user.photos : user?.image ? [user.image] : []),
    [user]
  );
  const photoIds = useMemo(
    () => photos.map((p, i) => buildPhotoId(user?.id || "unknown", p, i)),
    [photos, user?.id]
  );
  const viewerId = viewer?.phone || viewer?.id || "viewer-local";
  const { likes, toggleLike } = usePhotoLikes(photoIds, viewerId);

  const likeProps = (index) => {
    const photoId = photoIds[index];
    const snapshot = likes[photoId] || { count: 0, likedByMe: false };
    return {
      liked: snapshot.likedByMe,
      count: snapshot.count,
      onToggle: () => toggleLike(photoId),
    };
  };

  if (loadingRemote && !user) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.missing}>Perfil não encontrado</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const [hero, ...rest] = photos;
  const mid = Math.ceil(rest.length / 2);
  const photosMid = rest.slice(0, mid);
  const photosEnd = rest.slice(mid);

  const subtitleParts = [user.profession, user.sportPreferred].filter(Boolean);

  const status = connectionStatus(user.id);

  const onConnect = async () => {
    if (status === "matched") {
      const existing = matches?.find?.(
        (m) => m.userId === user.id || m.person?.id === user.id,
      );
      navigation.navigate("ChatThread", {
        userId: user.id,
        user,
        roomId: existing?.threadId || existing?.roomId || existing?.conversationId,
        threadId: existing?.threadId || existing?.roomId,
        conversationId: existing?.conversationId || existing?.roomId,
      });
      return;
    }

    const result = await sendConnectionRequest(user.id, user);
    if (result.status === "matched") {
      navigation.replace("MatchCelebration", {
        userId: user.id,
        user,
        roomId: result.match?.threadId || result.match?.roomId || result.match?.conversationId,
        matchId: result.match?.id,
      });
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LikablePhoto
          source={hero}
          style={[styles.hero, { height: windowHeight }]}
          contentStyle={{ justifyContent: "flex-end" }}
          chipStyle={{ bottom: 30, right: 14 }}
          {...likeProps(0)}
        >
          <LinearGradient
            colors={[
              "rgba(11,13,15,0.35)",
              "rgba(11,13,15,0.00)",
              "rgba(11,13,15,0.35)",
              "rgba(11,13,15,0.88)",
              colors.bg,
            ]}
            locations={[0, 0.25, 0.55, 0.82, 1]}
            style={styles.heroGradient}
          />

          {/* paddingRight evita que o texto passe por baixo do chip de curtidas */}
          <View style={[styles.heroInfo, { paddingBottom: 28, paddingRight: 92 }]}>
            <Text style={styles.name}>
              {user.name}, {user.age}
            </Text>

            {subtitleParts.length ? (
              <Text style={styles.subtitle}>{subtitleParts.join(" · ")}</Text>
            ) : null}

            <View style={styles.statusRow}>
              <View style={[styles.statusDot, !user.activeToday && styles.statusDotOff]} />
              <Text style={[styles.statusText, !user.activeToday && styles.statusTextOff]}>
                {user.activeToday ? "Ativa hoje" : "Visto recentemente"}
                {user.distanceKm != null ? ` · ${user.distanceKm} km` : ""}
              </Text>
            </View>

            {user.bio ? (
              <Text style={styles.bioPreview} numberOfLines={2}>
                {user.bio}
              </Text>
            ) : null}
          </View>
        </LikablePhoto>

        <View style={styles.body}>
          {user.lookingFor ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estou buscando</Text>
              <View style={styles.tagsWrap}>
                <View style={styles.lookingTag}>
                  <Text style={styles.lookingTagText}>{user.lookingFor}</Text>
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mim</Text>
            <View style={styles.tagsWrap}>
              {user.city ? <Tag label={user.city} /> : null}
              {user.distanceKm != null ? <Tag label={`${user.distanceKm} km`} /> : null}
              {user.profession ? <Tag label={user.profession} /> : null}
              {user.trainingLevel ? <Tag label={user.trainingLevel} /> : null}
              {user.frequencyPerWeek ? <Tag label={`${user.frequencyPerWeek}x/sem`} /> : null}
              {user.intensity ? <Tag label={`Intensidade ${user.intensity}`} /> : null}
              {(user.lifestyle || []).map((t) => (
                <Tag key={t} label={t} />
              ))}
              {(user.activityTypes || []).map((t) => (
                <Tag key={`a-${t}`} label={t} />
              ))}
            </View>
          </View>

          {photosMid.map((p, i) => (
            <LikablePhoto
              key={`mid-${i}`}
              source={p}
              style={styles.photo}
              imageStyle={styles.photoImage}
              {...likeProps(i + 1)}
            />
          ))}

          {user.motto ? (
            <View style={styles.quoteCard}>
              <Text style={styles.quoteMark}>“</Text>
              <Text style={styles.quoteText}>{user.motto}</Text>
            </View>
          ) : null}

          {(user.hobbies || []).length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hobbies</Text>
              <View style={styles.tagsWrap}>
                {user.hobbies.map((h) => (
                  <Tag key={h} label={h} />
                ))}
              </View>
            </View>
          ) : null}

          {(user.goals || []).length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Objetivos</Text>
              <View style={styles.tagsWrap}>
                {user.goals.map((g) => (
                  <Tag key={g} label={g} />
                ))}
              </View>
            </View>
          ) : null}

          {photosEnd.map((p, i) => (
            <LikablePhoto
              key={`end-${i}`}
              source={p}
              style={styles.photo}
              imageStyle={styles.photoImage}
              {...likeProps(i + 1 + photosMid.length)}
            />
          ))}

          {user.bio ? (
            <View style={styles.section}>
              <Text style={styles.bio}>{user.bio}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.connectBtn, status !== "none" && styles.connectBtnDone]}
            onPress={onConnect}
            activeOpacity={0.9}
            disabled={status === "pending"}
          >
            <Text style={[styles.connectBtnText, status !== "none" && styles.connectBtnDoneText]}>
              {status === "matched"
                ? "Iniciar conversa"
                : status === "pending"
                  ? "Pedido enviado"
                  : "Conectar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Report", { targetName: user.name })}
            style={styles.reportLink}
          >
            <Text style={styles.reportText}>Denunciar {user.name}</Text>
          </TouchableOpacity>

          <View style={{ height: Math.max(insets.bottom, 12) + 8 }} />
        </View>
      </ScrollView>

      <View style={[styles.topBar, { top: insets.top + 6 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="chevron-left" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("Report", { targetName: user.name })}
          activeOpacity={0.85}
        >
          <Feather name="more-horizontal" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
