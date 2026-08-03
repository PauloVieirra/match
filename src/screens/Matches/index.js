import React, { useContext, useMemo } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./style";
import { AppContext } from "../../../contexts/ContextAPI";

function resolveAvatar(person) {
  const photo = person?.image || person?.photos?.[0];
  if (!photo) return null;
  if (typeof photo === "string") return { uri: photo };
  return photo;
}

export default function MatchesScreen({ navigation }) {
  const { matches } = useContext(AppContext);
  const data = useMemo(
    () =>
      matches
        .map((match) => {
          const person = match.person;
          if (!person) return null;
          return {
            id: match.id,
            userId: person.id || match.userId,
            roomId: match.threadId || match.roomId || match.conversationId || null,
            name: person.name,
            age: person.age,
            avatar: resolveAvatar(person),
            lastMessage: "Vocês se conectaram. Inicie uma conversa!",
            time: "Agora",
            unread: 0,
            sharedLifestyle: (person.lifestyle || person.lifestyles || []).slice(0, 2),
            activity: person.sportPreferred || person.activityTypes?.[0] || "Estilo de vida",
            person,
          };
        })
        .filter(Boolean),
    [matches],
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <Text style={styles.title}>Matches</Text>
      <Text style={styles.subtitle}>Conexões pelo estilo de vida em comum</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={{ paddingVertical: 40, paddingHorizontal: 16 }}>
            <Text style={styles.subtitle}>
              Sem matches ainda. Explore o Discover e peça conexão.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              navigation.getParent()?.navigate("ChatThread", {
                userId: item.userId,
                user: item.person,
                roomId: item.roomId,
                threadId: item.roomId,
                conversationId: item.roomId,
              })
            }
          >
            {item.avatar ? (
              <Image source={item.avatar} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { alignItems: "center", justifyContent: "center" }]}>
                <Text style={styles.name}>{(item.name || "?")[0]}</Text>
              </View>
            )}
            <View style={styles.body}>
              <View style={styles.row}>
                <Text style={styles.name}>
                  {item.name}
                  {item.age != null ? `, ${item.age}` : ""}
                </Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.activity}>{item.activity}</Text>
              <Text style={styles.message} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
