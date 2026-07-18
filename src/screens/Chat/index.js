import React from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { styles } from "./style";
import { mockChat } from "../../data/mockChat";
import { colors } from "../../theme/colors";

export default function ChatScreen({ navigation }) {
  const { participant, matchInfo, messages } = mockChat;

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

        <Image source={participant.avatar} style={styles.avatar} />

        <View style={styles.headerText}>
          <Text style={styles.headerName}>{participant.name}</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{participant.statusText}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isRight = item.side === "right";
          return (
            <View style={[styles.msgWrap, isRight ? styles.msgWrapRight : styles.msgWrapLeft]}>
              <View style={[styles.bubble, isRight ? styles.bubbleRight : styles.bubbleLeft]}>
                <Text style={[styles.msgText, isRight ? styles.msgTextRight : styles.msgTextLeft]}>
                  {item.text}
                </Text>
              </View>
              <Text style={[styles.time, isRight ? styles.timeRight : styles.timeLeft]}>{item.time}</Text>
            </View>
          );
        }}
        ListHeaderComponent={
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>{matchInfo.title}</Text>
            <View style={styles.matchSubtitleRow}>
              <Feather name="activity" size={18} color={colors.accent} />
              <Text style={styles.matchSubtitle}>{matchInfo.subtitle}</Text>
            </View>
          </View>
        }
      />

      <View style={styles.inputBar}>
        <View style={styles.inputPill}>
          <TextInput
            style={styles.input}
            placeholder="Mensagem..."
            placeholderTextColor={colors.textDim}
          />
        </View>
        <TouchableOpacity style={styles.sendBtn} activeOpacity={0.9}>
          <Feather name="send" size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
