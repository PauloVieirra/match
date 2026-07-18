import React, { useMemo } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./style";

const GAP = 10;

function cardHeight(index, colWidth) {
  const pattern = [1.35, 1.05, 1.2, 1.45, 1.1, 1.3];
  const ratio = pattern[index % pattern.length];
  return Math.round(colWidth * ratio);
}

function GridCard({ user, height, onPress }) {
  const cover = user.photos?.[0] || user.image;
  const affinity = user._score > 0 ? `${user._score} afinidade` : user.sportPreferred;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, { height }]}>
      <ImageBackground source={cover} style={styles.cardImage} imageStyle={styles.cardImageRadius}>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.88)"]}
          locations={[0.35, 0.7, 1]}
          style={styles.cardGradient}
        />
        <View style={styles.cardMeta}>
          <Text style={styles.cardName} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {user.distanceKm != null ? `${user.distanceKm} km · ` : ""}
            {affinity}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default function ProfileGrid({ data = [], onPressProfile }) {
  const { width } = useWindowDimensions();
  const pad = 16;
  const colWidth = (width - pad * 2 - GAP) / 2;

  const { left, right } = useMemo(() => {
    const L = [];
    const R = [];
    data.forEach((item, index) => {
      const h = cardHeight(index, colWidth);
      const entry = { user: item, height: h, index };
      if (index % 2 === 0) L.push(entry);
      else R.push(entry);
    });
    return { left: L, right: R };
  }, [data, colWidth]);

  if (!data.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>Nenhum perfil compatível</Text>
        <Text style={styles.emptyText}>Ajuste os filtros de estilo de vida e atividades.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingHorizontal: pad }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.row}>
        <View style={[styles.column, { width: colWidth, marginRight: GAP }]}>
          {left.map(({ user, height }) => (
            <GridCard
              key={user.id}
              user={user}
              height={height}
              onPress={() => onPressProfile?.(user)}
            />
          ))}
        </View>
        <View style={[styles.column, { width: colWidth }]}>
          {right.map(({ user, height }) => (
            <GridCard
              key={user.id}
              user={user}
              height={height}
              onPress={() => onPressProfile?.(user)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
