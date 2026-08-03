import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { styles } from "./style";
import { colors } from "../../theme/colors";
import { AppContext } from "../../../contexts/ContextAPI";
import { mapChatMessageToLocal } from "../../services/api/mappers";
import {
  fetchRoomMessages,
  sendRoomMessageHttp,
} from "../../services/api/match";
import {
  connectChatSocket,
  joinChatRoom,
  leaveChatRoom,
  sendChatMessage,
  subscribeChatSocket,
  isChatSocketOpen,
} from "../../services/api/chatSocket";

function resolveAvatar(person) {
  const photo = person?.image || person?.photos?.[0];
  if (!photo) return null;
  if (typeof photo === "string") return { uri: photo };
  return photo;
}

function mergeMessages(current, incoming) {
  const map = new Map();
  for (const msg of current) map.set(msg.id, msg);
  for (const msg of incoming) {
    if (msg?.id) map.set(msg.id, msg);
  }
  return [...map.values()].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
  });
}

export default function ChatScreen({ navigation, route }) {
  const { user, getPublicProfile, matches } = useContext(AppContext);
  const passed = route?.params?.user;
  const userId = route?.params?.userId;
  const paramRoomId =
    route?.params?.roomId ||
    route?.params?.threadId ||
    route?.params?.conversationId ||
    null;

  const matchFromContext = useMemo(() => {
    if (!userId && !paramRoomId) return null;
    return (
      matches.find(
        (m) =>
          (userId && (m.userId === userId || m.person?.id === userId)) ||
          (paramRoomId &&
            (m.threadId === paramRoomId ||
              m.roomId === paramRoomId ||
              m.conversationId === paramRoomId)),
      ) || null
    );
  }, [matches, userId, paramRoomId]);

  const roomId =
    paramRoomId ||
    matchFromContext?.threadId ||
    matchFromContext?.roomId ||
    matchFromContext?.conversationId ||
    null;

  const [remoteUser, setRemoteUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connectionLabel, setConnectionLabel] = useState("Conectando…");
  const [errorText, setErrorText] = useState("");
  const listRef = useRef(null);
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const currentUserId = user?.id;

  const target = passed || matchFromContext?.person || remoteUser;
  const participant = useMemo(() => {
    if (!target) {
      return { name: "Conversa", avatar: null, statusText: connectionLabel };
    }
    return {
      name: target.name || "Conexão",
      avatar: resolveAvatar(target),
      statusText: connectionLabel,
    };
  }, [target, connectionLabel]);

  const applyRemoteMessages = useCallback(
    (rawList) => {
      const mapped = (rawList || [])
        .map((msg) => mapChatMessageToLocal(msg, currentUserId))
        .filter(Boolean);
      setMessages((current) => mergeMessages(current, mapped));
    },
    [currentUserId],
  );

  // Carrega perfil remoto se necessário
  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      if (passed || matchFromContext?.person || !userId || !getPublicProfile) return;
      try {
        const profile = await getPublicProfile(userId);
        if (!cancelled) setRemoteUser(profile);
      } catch {
        if (!cancelled) setRemoteUser(null);
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [passed, matchFromContext?.person, userId, getPublicProfile]);

  // Histórico REST + WebSocket
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};

    const boot = async () => {
      setLoading(true);
      setErrorText("");

      if (!roomId) {
        setConnectionLabel("Sem sala");
        setErrorText("Sala de chat não encontrada para este match.");
        setLoading(false);
        return;
      }

      try {
        const { messages: history } = await fetchRoomMessages(roomId, { limit: 50 });
        if (!cancelled) applyRemoteMessages(history);
      } catch (e) {
        if (!cancelled) {
          setErrorText(e?.message || "Falha ao carregar mensagens");
        }
      }

      try {
        await connectChatSocket();
        if (cancelled) return;

        unsubscribe = subscribeChatSocket((event, payload) => {
          const activeRoom = roomIdRef.current;
          if (event === "open" || event === "connected") {
            setConnectionLabel("Online");
          }
          if (event === "close") {
            setConnectionLabel("Reconectando…");
          }
          if (event === "joined_room" && payload?.roomId === activeRoom) {
            setConnectionLabel("Online");
          }
          if (event === "messages_history" && payload?.roomId === activeRoom) {
            applyRemoteMessages(payload.messages || []);
          }
          if (event === "message_received" && payload?.roomId === activeRoom) {
            applyRemoteMessages([payload.message]);
          }
          if (event === "error") {
            setErrorText(payload?.message || "Erro no chat");
          }
        });

        if (isChatSocketOpen()) {
          joinChatRoom(roomId);
          setConnectionLabel("Online");
        } else {
          setConnectionLabel("Conectando…");
        }
      } catch (e) {
        if (!cancelled) {
          setConnectionLabel("Offline");
          setErrorText(e?.message || "WebSocket indisponível — usando REST");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    boot();

    return () => {
      cancelled = true;
      unsubscribe();
      if (roomId) {
        try {
          leaveChatRoom(roomId);
        } catch {
          // ignore
        }
      }
    };
  }, [roomId, applyRemoteMessages]);

  useEffect(() => {
    if (!messages.length) return;
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd?.({ animated: true });
    }, 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  const onSend = async () => {
    const content = draft.trim();
    if (!content || !roomId || sending) return;

    setSending(true);
    setDraft("");
    setErrorText("");

    try {
      if (isChatSocketOpen()) {
        sendChatMessage(roomId, content);
      } else {
        const { message } = await sendRoomMessageHttp(roomId, content);
        if (message) applyRemoteMessages([message]);
      }
    } catch (e) {
      try {
        const { message } = await sendRoomMessageHttp(roomId, content);
        if (message) applyRemoteMessages([message]);
      } catch (restError) {
        setDraft(content);
        setErrorText(restError?.message || e?.message || "Falha ao enviar");
      }
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isRight = item.side === "right";
    return (
      <View style={[styles.msgWrap, isRight ? styles.msgWrapRight : styles.msgWrapLeft]}>
        <View style={[styles.bubble, isRight ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={[styles.msgText, isRight ? styles.msgTextRight : styles.msgTextLeft]}>
            {item.text}
          </Text>
        </View>
        {item.time ? (
          <Text style={[styles.time, isRight ? styles.timeRight : styles.timeLeft]}>
            {item.time}
          </Text>
        ) : null}
      </View>
    );
  };

  if (loading && !messages.length) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
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
                <View
                  style={[
                    styles.statusDot,
                    connectionLabel !== "Online" && { backgroundColor: colors.textDim },
                  ]}
                />
                <Text style={styles.statusText}>{participant.statusText}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <FlatList
          ref={listRef}
          data={messages}
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
                {errorText || "Nenhuma mensagem ainda. Digite abaixo para começar."}
              </Text>
            </View>
          }
          renderItem={renderMessage}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: false })}
        />

        {errorText && messages.length > 0 ? (
          <Text style={[styles.time, { paddingHorizontal: 16, paddingBottom: 4 }]}>
            {errorText}
          </Text>
        ) : null}

        <View style={styles.inputBar}>
          <View style={styles.inputPill}>
            <TextInput
              style={styles.input}
              placeholder={roomId ? "Mensagem" : "Sala indisponível"}
              placeholderTextColor={colors.textDim}
              value={draft}
              onChangeText={setDraft}
              editable={Boolean(roomId) && !sending}
              onSubmitEditing={onSend}
              returnKeyType="send"
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (!draft.trim() || !roomId || sending) && { opacity: 0.5 }]}
            activeOpacity={0.85}
            disabled={!draft.trim() || !roomId || sending}
            onPress={onSend}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Feather name="send" size={18} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
