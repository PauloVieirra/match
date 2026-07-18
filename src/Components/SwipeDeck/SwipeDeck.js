import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ImageBackground, PanResponder, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./style";

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SwipeDeck({
  data,
  deckSize = 12,
  swipeThreshold = 120,
  onSwipeLeft,
  onSwipeRight,
}) {
  const base = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const effectiveDeckSize = Math.min(deckSize, Math.max(base.length, 1));

  const position = useRef(new Animated.ValueXY()).current;
  const cycleRef = useRef({ order: [], idx: 0 });
  const lastShownIdRef = useRef(null);
  const [deck, setDeck] = useState(() => []);

  const nextFromCycle = (exceptId) => {
    if (!base.length) return null;

    const mustReset = !cycleRef.current.order.length || cycleRef.current.idx >= cycleRef.current.order.length;
    if (mustReset) {
      cycleRef.current.order = shuffle(base);
      cycleRef.current.idx = 0;
      // Evita repetir imediatamente no começo de um novo ciclo.
      if (exceptId && cycleRef.current.order.length > 1 && cycleRef.current.order[0]?.id === exceptId) {
        [cycleRef.current.order[0], cycleRef.current.order[1]] = [cycleRef.current.order[1], cycleRef.current.order[0]];
      }
    }

    const next = cycleRef.current.order[cycleRef.current.idx];
    cycleRef.current.idx += 1;
    return next ?? null;
  };

  const buildInitialDeck = () => {
    const d = [];
    let last = lastShownIdRef.current;
    for (let i = 0; i < effectiveDeckSize; i += 1) {
      const next = nextFromCycle(last);
      if (!next) break;
      d.push(next);
      last = next.id;
    }
    if (d.length) lastShownIdRef.current = d[0].id;
    return d;
  };

  useEffect(() => {
    cycleRef.current = { order: [], idx: 0 };
    lastShownIdRef.current = null;
    setDeck(buildInitialDeck());
    position.setValue({ x: 0, y: 0 });
  }, [base, effectiveDeckSize, position]);

  const rotate = position.x.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: ["-12deg", "0deg", "12deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, 80, 140],
    outputRange: [0, 0.2, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-140, -80, 0],
    outputRange: [1, 0.2, 0],
    extrapolate: "clamp",
  });

  const forceSwipe = (direction) => {
    const x = direction === "right" ? 420 : -420;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      const swiped = deck[0];
      if (direction === "right") onSwipeRight?.(swiped);
      else onSwipeLeft?.(swiped);

      position.setValue({ x: 0, y: 0 });

      setDeck((prev) => {
        const rest = prev.slice(1);
        const last = rest[rest.length - 1]?.id ?? lastShownIdRef.current;
        const next = nextFromCycle(last);
        if (next) rest.push(next);

        // Mantém tamanho do deck (sem duplicar antes de esgotar o ciclo).
        while (rest.length < effectiveDeckSize && base.length) {
          const fallbackLast = rest[rest.length - 1]?.id ?? lastShownIdRef.current;
          const more = nextFromCycle(fallbackLast);
          if (!more) break;
          rest.push(more);
        }

        lastShownIdRef.current = rest[0]?.id ?? null;
        return rest.length ? rest : buildInitialDeck();
      });
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > swipeThreshold) forceSwipe("right");
          else if (gesture.dx < -swipeThreshold) forceSwipe("left");
          else resetPosition();
        },
      }),
    [position, swipeThreshold, base, deck]
  );

  const renderCardContent = (user) => {
    const lifestylePills = (Array.isArray(user.lifestyle) ? user.lifestyle : []).slice(0, 3);
    const activityPills = [
      user.sportPreferred,
      ...(Array.isArray(user.goals) ? user.goals.slice(0, 1) : []),
    ].filter(Boolean);

    return (
      <>
        <LinearGradient
          colors={["rgba(0,0,0,0.00)", "rgba(0,0,0,0.20)", "rgba(0,0,0,0.72)", "rgba(0,0,0,0.92)"]}
          locations={[0, 0.45, 0.75, 1]}
          style={styles.bottomGradient}
        />

        <View style={styles.infoArea}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {user.name}
              <Text style={styles.age}> {user.age}</Text>
              <Text style={styles.years}> anos</Text>
            </Text>
            <View style={styles.verifiedDot} />
          </View>

          <Text style={styles.meta}>
            {user.city} • {user.trainingLevel} • {user.frequencyPerWeek}x/sem
            {user.intensity ? ` • intensidade ${user.intensity}` : ""}
          </Text>

          {lifestylePills.length ? (
            <View style={styles.pillsRow}>
              {lifestylePills.map((p) => (
                <View key={`${user.id}-life-${p}`} style={styles.pill}>
                  <Text style={styles.pillText}>{p}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.pillsRow}>
            {activityPills.map((p) => (
              <View key={`${user.id}-act-${p}`} style={styles.pill}>
                <Text style={styles.pillText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionNope]} activeOpacity={0.85} onPress={() => forceSwipe("left")}>
            <Text style={[styles.actionIcon, styles.actionNopeIcon]}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.actionLike]} activeOpacity={0.85} onPress={() => forceSwipe("right")}>
            <Text style={[styles.actionIcon, styles.actionLikeIcon]}>❤</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderStack = () => {
    if (!deck.length) return null;

    return deck
      .slice(0, 3)
      .map((item, idx) => {
        const isTop = idx === 0;
        const scale = idx === 0 ? 1 : idx === 1 ? 0.98 : 0.96;
        const translateY = idx === 0 ? 0 : idx === 1 ? 10 : 18;

        if (!isTop) {
          return (
            <ImageBackground
              key={`${item.id}-${idx}`}
              source={item.image}
              resizeMode="cover"
              style={[styles.card, { transform: [{ scale }, { translateY }] }]}
              imageStyle={styles.cardImage}
            >
              {renderCardContent(item)}
            </ImageBackground>
          );
        }

        return (
          <AnimatedImageBackground
            key={`${item.id}-${idx}`}
            source={item.image}
            resizeMode="cover"
            imageStyle={styles.cardImage}
            style={[
              styles.card,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}>
              <Text style={[styles.stampText, styles.stampLikeText]}>CURTI</Text>
            </Animated.View>
            <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}>
              <Text style={[styles.stampText, styles.stampNopeText]}>NÃO</Text>
            </Animated.View>
            {renderCardContent(item)}
          </AnimatedImageBackground>
        );
      })
      .reverse();
  };

  return <View style={styles.container}>{renderStack()}</View>;
}

