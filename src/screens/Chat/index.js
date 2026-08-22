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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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

/** Padding mínimo da barra de input quando não há inset do sistema. */
const INPUT_BAR_PADDING_BOTTOM = 12;

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
  const insets = useSafeAreaInsets();
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
  const [peerOnline, setPeerOnline] = useState(false);
  const [errorText, setErrorText] = useState("");
  const listRef = useRef(null);
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const currentUserId = user?.id;

  const target = passed || matchFromContext?.person || remoteUser;
  const participant = useMemo(() => {
    if (!target) {
      return { name: "Conversa", avatar: null };
    }
    return {
      name: target.name || "Conexão",
      avatar: resolveAvatar(target),
    };
  }, [target]);

  const applyRemoteMessages = useCallback(
    (rawList) => {
      const mapped = (rawList || [])
        .map((msg) => mapChatMessageToLocal(msg, currentUserId))
        .filter(Boolean);
      setMessages((current) => {
        const merged = mergeMessages(current, mapped);
        const confirmedTexts = new Set(
          merged
            .filter((msg) => !String(msg.id).startsWith("pending-"))
            .map((msg) => msg.text),
        );
        return merged.filter((msg) => {
          if (!String(msg.id).startsWith("pending-")) return true;
          return !confirmedTexts.has(msg.text);
        });
      });
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
        setPeerOnline(false);
        setErrorText("Sala de chat não encontrada para este match.");
        setLoading(false);
        return;
      }

      setPeerOnline(false);

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
            if (activeRoom) {
              joinChatRoom(activeRoom);
              fetchRoomMessages(activeRoom, { limit: 50 })
                .then(({ messages: history }) => applyRemoteMessages(history))
                .catch(() => {});
            }
          }
          if (event === "peer_presence" && payload?.roomId === activeRoom) {
            if (payload.userId && payload.userId !== currentUserId) {
              setPeerOnline(Boolean(payload.online));
            }
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
        }
      } catch (e) {
        if (!cancelled) {
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
  }, [roomId, applyRemoteMessages, currentUserId]);

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

    const pendingId = `pending-${Date.now()}`;
    applyRemoteMessages([
      {
        id: pendingId,
        roomId,
        senderId: currentUserId,
        content,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const { message } = await sendRoomMessageHttp(roomId, content);
      if (message) {
        setMessages((current) =>
          mergeMessages(
            current.filter((item) => item.id !== pendingId),
            [mapChatMessageToLocal(message, currentUserId)].filter(Boolean),
          ),
        );
      }
    } catch (e) {
      sendChatMessage(roomId, content);
      setErrorText("Sem conexão. A mensagem será enviada ao reconectar.");
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
            {peerOnline ? (
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Online</Text>
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

        <View
          style={[
            styles.inputBar,
            // edgeToEdge no Android: sem inset a nav do sistema cobre o input
            // (mesmo problema da tab bar no 1º build).
            { paddingBottom: Math.max(insets.bottom, INPUT_BAR_PADDING_BOTTOM) },
          ]}
        >
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
