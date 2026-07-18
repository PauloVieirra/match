import React, { useRef } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { HEIGHT_RANGE } from "../../data/lifestyleOptions";
import { colors } from "../../theme/colors";

const ITEM_HEIGHT = 52;
const VALUES = Array.from(
  { length: HEIGHT_RANGE.max - HEIGHT_RANGE.min + 1 },
  (_, i) => HEIGHT_RANGE.min + i
);

function cmToFeet(cm) {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}

/** Roda de seleção de altura (cm) com o valor central destacado. */
export default function HeightWheel({ value, onChange }) {
  const listRef = useRef(null);
  const selected = value || HEIGHT_RANGE.initial;
  const initialIndex = VALUES.indexOf(selected);

  const onEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const cm = VALUES[Math.min(Math.max(index, 0), VALUES.length - 1)];
    onChange(cm);
  };

  return (
    <View style={styles.card}>
      <View style={styles.centerLines} pointerEvents="none" />
      <FlatList
        ref={listRef}
        data={VALUES}
        keyExtractor={(cm) => String(cm)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onMomentumScrollEnd={onEnd}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        style={{ height: ITEM_HEIGHT * 5 }}
        renderItem={({ item: cm }) => (
          <View style={styles.item}>
            <Text style={[styles.text, cm === selected && styles.textActive]}>
              {cm} cm ({cmToFeet(cm)})
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginTop: 6,
  },
  centerLines: {
    position: "absolute",
    left: 24,
    right: 24,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.accent,
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.textDim,
    fontSize: 17,
    fontWeight: "600",
  },
  textActive: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
});
