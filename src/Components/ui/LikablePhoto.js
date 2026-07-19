import React, { useRef } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const DOUBLE_TAP_MS = 300;
const HEART_RED = "#FF3B5C";

function formatCount(count) {
  if (count == null) return "";
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(".", ",")}k`;
  return String(count);
}

/**
 * Foto com curtida por duplo toque (estilo Instagram).
 *
 * - Chip com coração (vazado ou preenchido) + contagem de curtidas.
 * - Duplo toque alterna curtir/descurtir; ao curtir, um coração "explode"
 *   no centro da imagem.
 * - Componente controlado: recebe `liked`/`count` e emite `onToggle`,
 *   ficando agnóstico à origem dos dados (mock local ou backend).
 */
export default function LikablePhoto({
  source,
  liked = false,
  count = 0,
  onToggle,
  style,
  imageStyle,
  chipStyle,
  contentStyle,
  resizeMode = "cover",
  children,
}) {
  const lastTapRef = useRef(0);
  const burst = useRef(new Animated.Value(0)).current;

  const runBurst = () => {
    burst.setValue(0);
    Animated.sequence([
      Animated.spring(burst, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.delay(220),
      Animated.timing(burst, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      lastTapRef.current = 0;
      if (!liked) runBurst();
      onToggle?.();
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <Pressable onPress={handleTap} style={style}>
      <ImageBackground
        source={source}
        resizeMode={resizeMode}
        style={[styles.fill, contentStyle]}
        imageStyle={imageStyle}
      >
        {children}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.burstWrap,
            {
              opacity: burst,
              transform: [
                {
                  scale: burst.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1.15],
                  }),
                },
              ],
            },
          ]}
        >
          <FontAwesome name="heart" size={82} color={HEART_RED} />
        </Animated.View>

        <View style={[styles.chip, chipStyle]} pointerEvents="none">
          <FontAwesome
            name={liked ? "heart" : "heart-o"}
            size={14}
            color={liked ? HEART_RED : "#FFFFFF"}
          />
          <Text style={styles.chipText}>{formatCount(count)}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  burstWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(11,13,15,0.6)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
