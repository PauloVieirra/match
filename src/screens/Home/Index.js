import React, { useContext } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AppContext } from "../../../contexts/ContextAPI";
import { RANKING, MY_RANKING, ACHIEVEMENT_BADGES } from "../../data/mockRanking";
import { colors } from "../../theme/colors";
import { styles } from "./style";

const badgeById = (id) => ACHIEVEMENT_BADGES.find((b) => b.id === id);

function Trend({ trend }) {
  if (trend === "up") return <Feather name="chevron-up" size={14} color={colors.online} />;
  if (trend === "down") return <Feather name="chevron-down" size={14} color={colors.coral} />;
  return <Feather name="minus" size={14} color={colors.textDim} />;
}

function PodiumSlot({ entry, position, big }) {
  const ringColors = { 1: colors.accent, 2: "#C8D1D9", 3: "#D89B6A" };
  return (
    <View style={styles.podiumSlot}>
      <View style={styles.podiumRankRow}>
        <Trend trend={entry.trend} />
        <Text style={styles.podiumRank}>{position}º</Text>
      </View>
      <View
        style={[
          big ? styles.podiumAvatarRingBig : styles.podiumAvatarRing,
          { borderColor: ringColors[position] },
        ]}
      >
        <Image
          source={{ uri: entry.avatar }}
          style={big ? styles.podiumAvatarBig : styles.podiumAvatar}
        />
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>
        {entry.name}
      </Text>
      <Text style={styles.podiumTitle} numberOfLines={1}>
        {entry.title}
      </Text>
      <Text style={styles.podiumXp}>{entry.xp.toLocaleString("pt-BR")} XP</Text>
    </View>
  );
}

function RankRow({ entry, position }) {
  const badges = (entry.badges || []).map(badgeById).filter(Boolean);
  return (
    <View style={styles.rankRow}>
      <View style={styles.rankPosBox}>
        <Text style={styles.rankPos}>{position}</Text>
        <Trend trend={entry.trend} />
      </View>
      <Image source={{ uri: entry.avatar }} style={styles.rankAvatar} />
      <View style={styles.rankInfo}>
        <Text style={styles.rankName} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={styles.rankTitle} numberOfLines={1}>
          {entry.title}
        </Text>
      </View>
      <View style={styles.rankRight}>
        <Text style={styles.rankXp}>{entry.xp.toLocaleString("pt-BR")} XP</Text>
        <View style={styles.rankBadges}>
          {badges.slice(0, 3).map((b) => (
            <View key={b.id} style={[styles.miniBadge, { backgroundColor: `${b.color}22` }]}>
              <Feather name={b.icon} size={10} color={b.color} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useContext(AppContext);
  const profile = user?.profile || {};
  const name = (profile.name || user?.name || "Atleta").split(" ")[0];

  const [second, first, third] = [RANKING[1], RANKING[0], RANKING[2]];
  const rest = RANKING.slice(3);
  const myBadges = MY_RANKING.badges.map(badgeById).filter(Boolean);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Olá, {name}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headline}>Ranking da{"\n"}comunidade</Text>
          <View style={styles.infoBtn}>
            <Feather name="info" size={16} color={colors.accent} />
          </View>
        </View>
        <Text style={styles.copy}>
          Ganhe XP mantendo constância nos treinos, batendo metas e treinando acompanhado.
        </Text>

        <View style={styles.podium}>
          <PodiumSlot entry={second} position={2} />
          <PodiumSlot entry={first} position={1} big />
          <PodiumSlot entry={third} position={3} />
        </View>

        <View style={styles.listCard}>
          {rest.map((entry, i) => (
            <View key={entry.id}>
              {i > 0 ? <View style={styles.rowDivider} /> : null}
              <RankRow entry={entry} position={i + 4} />
            </View>
          ))}
        </View>

        <View style={styles.myCard}>
          <View style={styles.myHeader}>
            <Text style={styles.sectionLabel}>Minha posição</Text>
            <View style={styles.topChip}>
              <Feather name="trending-up" size={12} color={colors.accent} />
              <Text style={styles.topChipText}>TOP {MY_RANKING.topPercent}%</Text>
            </View>
          </View>

          <View style={styles.myRow}>
            <View style={styles.rankPosBox}>
              <Text style={styles.rankPos}>{MY_RANKING.position}</Text>
              <Trend trend={MY_RANKING.trend} />
            </View>
            <View style={[styles.rankAvatar, styles.myAvatarFallback]}>
              <Feather name="user" size={20} color={colors.accent} />
            </View>
            <View style={styles.rankInfo}>
              <Text style={styles.rankName}>Você</Text>
              <Text style={styles.rankTitle}>Continue treinando para subir</Text>
            </View>
            <Text style={styles.rankXp}>{MY_RANKING.xp.toLocaleString("pt-BR")} XP</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "38%" }]} />
          </View>
          <Text style={styles.progressHint}>Faltam 620 XP para entrar no TOP 20</Text>
        </View>

        <View style={styles.achievementsHeader}>
          <Text style={styles.sectionLabel}>Minhas conquistas</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.badgesRow}>
          {ACHIEVEMENT_BADGES.map((b) => {
            const unlocked = myBadges.some((mb) => mb.id === b.id);
            return (
              <View key={b.id} style={styles.badgeItem}>
                <View
                  style={[
                    styles.badgeCircle,
                    unlocked
                      ? { backgroundColor: `${b.color}22`, borderColor: b.color }
                      : styles.badgeLocked,
                  ]}
                >
                  <Feather
                    name={unlocked ? b.icon : "lock"}
                    size={18}
                    color={unlocked ? b.color : colors.textDim}
                  />
                </View>
                <Text style={[styles.badgeLabel, !unlocked && styles.badgeLabelLocked]} numberOfLines={1}>
                  {b.label}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.demoNote}>
          Demonstração — a pontuação e as conquistas serão liberadas em breve.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
