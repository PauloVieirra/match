import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { searchCities, cityLabel } from "../../utils/ibge";
import { colors } from "../../theme/colors";

/**
 * Campo de cidade com sugestões da API do IBGE.
 * `value` é o rótulo atual ("Brasília - DF"); ao selecionar, chama
 * onSelect({ id, name, uf, type, source, label }).
 */
export default function CityAutocomplete({ value, onSelect, placeholder = "Digite sua cidade" }) {
  const [text, setText] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState(!!value);
  const debounceRef = useRef(null);

  useEffect(() => {
    setText(value || "");
  }, [value]);

  const onChange = (next) => {
    setText(next);
    setPicked(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (next.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchCities(next);
        setSuggestions(results);
      } catch (e) {
        console.log("Erro na busca IBGE:", e);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const pick = (city) => {
    const label = cityLabel(city);
    setText(label);
    setPicked(true);
    setSuggestions([]);
    onSelect({ ...city, label });
  };

  return (
    <View>
      <View style={styles.inputRow}>
        <Feather name="map-pin" size={16} color={picked ? colors.accent : colors.textDim} />
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          autoCorrect={false}
        />
        {loading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
        {picked && !loading ? <Feather name="check" size={16} color={colors.accent} /> : null}
      </View>

      {suggestions.length > 0 ? (
        <View style={styles.list}>
          {suggestions.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={styles.item}
              activeOpacity={0.8}
              onPress={() => pick(city)}
            >
              <Text style={styles.itemName}>{city.name}</Text>
              <Text style={styles.itemUf}>
                {city.uf}
                {city.type === "administrative_region" ? " · RA" : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  list: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  itemUf: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
});
