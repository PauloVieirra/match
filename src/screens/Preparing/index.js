import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

const PHRASES = [
  "Estamos preparando tudo…",
  "Aplicando suas preferências…",
  "Buscando pessoas compatíveis…",
  "Já está quase pronto…",
];

export default function PreparingScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    Animated.timing(progress, {
      toValue: 1,
      duration: 4200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setPhraseIndex((i) => (i + 1) % PHRASES.length);
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      });
    }, 1400);

    return () => {
      loop.stop();
      clearInterval(interval);
    };
  }, [fade, pulse, progress]);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulse }] }]}>
        <Feather name="zap" size={34} color={colors.accentDark} />
      </Animated.View>

      <Animated.Text style={[styles.phrase, { opacity: fade }]}>
        {PHRASES[phraseIndex]}
      </Animated.Text>
      <Text style={styles.hint}>Montando seu grid com base no seu estilo de vida</Text>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["8%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconWrap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 34,
  },
  phrase: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  track: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginTop: 36,
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
