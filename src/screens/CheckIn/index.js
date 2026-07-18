import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, UrlTile } from "react-native-maps";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { AppContext } from "../../../contexts/ContextAPI";
import { mockVenues, VENUE_TYPES, distanceMeters } from "../../data/mockVenues";
import { colors } from "../../theme/colors";
import { styles } from "./style";

// Região padrão (Brasília) usada quando o GPS não está disponível.
const FALLBACK_REGION = {
  latitude: -15.7942,
  longitude: -47.8822,
  latitudeDelta: 0.09,
  longitudeDelta: 0.09,
};

function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDistance(meters) {
  if (meters == null) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

export default function CheckInScreen() {
  const { checkIns, addCheckIn } = useContext(AppContext);
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  // Posição fica apenas em memória — não é compartilhada nem persistida.
  const [coords, setCoords] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [query, setQuery] = useState("");

  const testVenue = useMemo(
    () =>
      coords
        ? {
            id: "test-nearby",
            name: "Academia Teste — perto de você",
            type: "gym",
            // Pequeno deslocamento (~20 m) para não marcar a posição exata.
            latitude: coords.latitude + 0.00015,
            longitude: coords.longitude + 0.00015,
            address: "Local temporário para testar o check-in",
            checkInRadiusM: 150,
            isTest: true,
          }
        : null,
    [coords]
  );

  const applyCoords = (next) => {
    setCoords(next);
    mapRef.current?.animateToRegion(
      { ...next, latitudeDelta: 0.008, longitudeDelta: 0.008 },
      600
    );
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted) return;
      if (status !== "granted") {
        setPermissionDenied(true);
        // Mesmo sem permissão, cria o local de teste na região padrão para demo.
        applyCoords({
          latitude: FALLBACK_REGION.latitude,
          longitude: FALLBACK_REGION.longitude,
        });
        return;
      }
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;
        applyCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (e) {
        console.log("Erro ao obter localização:", e);
        if (!mounted) return;
        applyCoords({
          latitude: FALLBACK_REGION.latitude,
          longitude: FALLBACK_REGION.longitude,
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const venues = useMemo(() => {
    const term = normalize(query.trim());
    const others = mockVenues
      .map((venue) => ({
        ...venue,
        distance: coords ? distanceMeters(coords, venue) : null,
      }))
      .filter((venue) => !term || normalize(venue.name).includes(term))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

    if (!testVenue) return others;
    const withDistance = {
      ...testVenue,
      distance: coords ? distanceMeters(coords, testVenue) : null,
    };
    if (term && !normalize(testVenue.name).includes(term)) return others;
    // Local de teste sempre no topo para facilitar a validação.
    return [withDistance, ...others];
  }, [coords, query, testVenue]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return checkIns.filter((c) => new Date(c.at).toDateString() === today).length;
  }, [checkIns]);

  const focusVenue = (venue) => {
    mapRef.current?.animateToRegion(
      {
        latitude: venue.latitude,
        longitude: venue.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      500
    );
  };

  const doCheckIn = (venue) => {
    if (venue.distance == null) {
      Alert.alert(
        "Localização necessária",
        "Permita o acesso à localização para fazer check-in."
      );
      return;
    }
    if (venue.distance > venue.checkInRadiusM) {
      Alert.alert(
        "Muito longe",
        `Você precisa estar a até ${formatDistance(venue.checkInRadiusM)} de ${venue.name} para registrar o treino.`
      );
      return;
    }
    addCheckIn(venue);
    Alert.alert("Check-in feito", `Treino registrado em ${venue.name}. Bom treino!`);
  };

  const renderVenue = ({ item }) => {
    const type = VENUE_TYPES[item.type] || { label: "Atividade", icon: "map-pin" };
    const inRange = item.distance != null && item.distance <= item.checkInRadiusM;
    return (
      <TouchableOpacity
        style={[styles.venueCard, item.isTest && styles.venueCardTest]}
        activeOpacity={0.85}
        onPress={() => focusVenue(item)}
      >
        <View style={[styles.venueIcon, item.isTest && styles.venueIconTest]}>
          <Feather name={item.isTest ? "zap" : type.icon} size={17} color={colors.accent} />
        </View>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.venueMeta} numberOfLines={1}>
            {item.isTest ? "Local de teste" : type.label}
            {item.distance != null ? ` · ${formatDistance(item.distance)}` : ""}
            {inRange ? " · no raio" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.checkBtn, !inRange && styles.checkBtnDisabled]}
          activeOpacity={0.9}
          onPress={() => doCheckIn(item)}
        >
          <Feather name="check-circle" size={14} color={inRange ? colors.accentDark : colors.textDim} />
          <Text style={[styles.checkBtnText, !inRange && styles.checkBtnTextDisabled]}>Check-in</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={FALLBACK_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
            title={venue.name}
            description={venue.isTest ? "Local de teste para check-in" : VENUE_TYPES[venue.type]?.label}
            pinColor={venue.isTest ? "#F5B841" : colors.accent}
          />
        ))}
      </MapView>

      <View style={[styles.overlay, { top: insets.top + 10 }]}>
        <View style={styles.searchRow}>
          <Feather name="search" size={17} color={colors.textDim} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar academia, parque, evento..."
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Feather name="x" size={16} color={colors.textDim} />
            </TouchableOpacity>
          ) : null}
        </View>

        {permissionDenied ? (
          <View style={styles.permissionCard}>
            <Feather name="alert-circle" size={15} color={colors.coral} />
            <Text style={styles.permissionText}>
              Sem localização não é possível fazer check-in. Ative a permissão nas configurações.
            </Text>
          </View>
        ) : null}

        <FlatList
          data={venues.slice(0, 6)}
          keyExtractor={(item) => item.id}
          style={styles.venueList}
          keyboardShouldPersistTaps="handled"
          renderItem={renderVenue}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Nenhum local encontrado. Os cadastros de locais e eventos chegam em breve.
              </Text>
            </View>
          }
        />
      </View>

      <View style={[styles.todayChip, { bottom: insets.bottom + 14 }]}>
        <Feather name="zap" size={13} color={colors.accent} />
        <Text style={styles.todayText}>
          {todayCount} check-in{todayCount === 1 ? "" : "s"} hoje · {checkIns.length} no total
        </Text>
      </View>
    </View>
  );
}
