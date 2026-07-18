import React, { useContext, useMemo } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./style";
import { mockMatches } from "../../data/mockMatches";
import { getMockUserById } from "../../data/mockUsers";
import { AppContext } from "../../../contexts/ContextAPI";

export default function MatchesScreen({ navigation }) {
  const { matches } = useContext(AppContext);
  const data = useMemo(() => {
    const live = matches
      .map((match) => {
        const person = getMockUserById(match.userId);
        if (!person) return null;
        return {
          id: match.id,
          userId: person.id,
          name: person.name,
          age: person.age,
          avatar: person.image,
          lastMessage: "Vocês se conectaram. Inicie uma conversa!",
          time: "Agora",
          unread: 0,
          sharedLifestyle: (person.lifestyle || []).slice(0, 2),
          activity: person.sportPreferred || person.activityTypes?.[0] || "Qualidade de vida",
        };
      })
      .filter(Boolean);
    const liveIds = new Set(live.map((item) => item.userId));
    return [...live, ...mockMatches.filter((item) => !liveIds.has(item.userId))];
  }, [matches]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <Text style={styles.title}>Matches</Text>
      <Text style={styles.subtitle}>Conexões pelo estilo de vida em comum</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              navigation.getParent()?.navigate("ChatThread", { userId: item.userId })
            }
          >
            <Image source={item.avatar} style={styles.avatar} />
            <View style={styles.body}>
              <View style={styles.row}>
                <Text style={styles.name}>
                  {item.name}, {item.age}
                </Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.activity}>{item.activity}</Text>
              <Text style={styles.message} numberOfLines={1}>
                {item.lastMessage}
              </Text>
              <View style={styles.tags}>
                {item.sharedLifestyle.slice(0, 2).map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
            {item.unread > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
