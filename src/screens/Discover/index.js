import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./style";
import ProfileGrid from "../../Components/ProfileGrid";
import { AppContext } from "../../../contexts/ContextAPI";
import { filterCompatibleProfiles } from "../../utils/profileMatcher";
import { mergeFiltersWithProfile } from "../../data/lifestyleOptions";
import { fetchNearbyProfiles, updateMyLocationOnApi } from "../../services/api/location";
import { resolveDiscoverCoordinates, SEED_MAP_ORIGIN } from "../../services/location/resolveCoordinates";
import { ApiError } from "../../services/api/client";
import { colors } from "../../theme/colors";

export default function DiscoverScreen({ navigation }) {
  const { user, filters, registerReciprocalCandidates } = useContext(AppContext);
  const myLifestyles = user?.profile?.lifestyles || [];
  const resolvedFilters = useMemo(
    () => mergeFiltersWithProfile(filters, user?.profile),
    [filters, user?.profile]
  );

  const [remoteProfiles, setRemoteProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [needsLocation, setNeedsLocation] = useState(false);
  const [locationSource, setLocationSource] = useState(null);
  const [apiCount, setApiCount] = useState(0);

  const loadNearby = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);
    setNeedsLocation(false);

    try {
      const resolved = await resolveDiscoverCoordinates({ allowSeedFallback: __DEV__ });
      setLocationSource(resolved.source);

      if (!resolved.coords) {
        setNeedsLocation(true);
        setRemoteProfiles([]);
        setApiCount(0);
        setErrorMessage(
          "Ative a localização para ver pessoas próximas. Conceda a permissão e puxe para atualizar.",
        );
        return;
      }

      const { latitude, longitude } = resolved.coords;

      // Persiste no backend; se falhar, ainda buscamos com lat/lng na query.
      try {
        await updateMyLocationOnApi({
          longitude,
          latitude,
          locationGranted: resolved.permission === "granted",
        });
      } catch (putError) {
        console.log("PUT /location/me falhou (seguindo com query):", putError?.message);
      }

      const result = await fetchNearbyProfiles({
        maxDistanceKm: resolvedFilters.maxDistanceKm,
        longitude,
        latitude,
      });

      setRemoteProfiles(result.profiles);
      setApiCount(result.profiles.length);

      if (result.profiles.length === 0) {
        setErrorMessage(
          `Nenhuma pessoa em até ${resolvedFilters.maxDistanceKm} km` +
            (resolved.source === "seed_fallback"
              ? ` (origem de teste: ${SEED_MAP_ORIGIN.label}).`
              : ". Aumente a distância nos filtros ou volte mais tarde."),
        );
      }
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 412) {
        setNeedsLocation(true);
        setRemoteProfiles([]);
        setApiCount(0);
        setErrorMessage(
          "Localização ainda não registrada. Ative o GPS, conceda permissão e puxe para atualizar.",
        );
      } else if (error instanceof ApiError && (error.statusCode === 0 || error.statusCode === 408)) {
        setRemoteProfiles([]);
        setApiCount(0);
        setErrorMessage(
          "Não foi possível falar com a API. Confira EXPO_PUBLIC_API_URL (emulador Android: 10.0.2.2; celular físico: IP da sua máquina).",
        );
      } else {
        setRemoteProfiles([]);
        setApiCount(0);
        setErrorMessage(error?.message || "Não foi possível carregar perfis próximos.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [resolvedFilters.maxDistanceKm]);

  useEffect(() => {
    loadNearby(false);
  }, [loadNearby]);

  const profiles = useMemo(
    () =>
      filterCompatibleProfiles(remoteProfiles, {
        myLifestyles,
        filters: resolvedFilters,
      }),
    [remoteProfiles, myLifestyles, resolvedFilters]
  );

  useEffect(() => {
    registerReciprocalCandidates(profiles.map((profile) => profile.id));
  }, [profiles, registerReciprocalCandidates]);

  const opennessLabel =
    resolvedFilters.openness === "open"
      ? "aberta"
      : resolvedFilters.openness === "strict"
        ? "rígida"
        : "seletiva";

  const showEmptyAfterFilter =
    !loading && !errorMessage && apiCount > 0 && profiles.length === 0;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>Conectar pessoas</Text>
          <Text style={styles.hint}>
            Tolerância {opennessLabel} · até {resolvedFilters.maxDistanceKm} km
            {locationSource === "seed_fallback" ? " · origem teste SP" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Filters")}
        >
          <Text style={styles.filterText}>Filtros</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.85}>
          <Text style={styles.moreText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={[styles.hint, { marginTop: 12 }]}>Buscando por proximidade…</Text>
        </View>
      ) : errorMessage || showEmptyAfterFilter ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadNearby(true)} />
          }
        >
          <Text style={[styles.brand, { textAlign: "center", marginBottom: 8 }]}>
            {needsLocation
              ? "Localização necessária"
              : showEmptyAfterFilter
                ? "Filtros sem resultado"
                : "Nada por aqui"}
          </Text>
          <Text style={[styles.hint, { textAlign: "center" }]}>
            {showEmptyAfterFilter
              ? `A API retornou ${apiCount} perfil(is), mas nenhum passou nos seus filtros. Afrouxe tolerância/filtros ou aumente a distância.`
              : errorMessage}
          </Text>
          <TouchableOpacity
            style={[styles.filterBtn, { alignSelf: "center", marginTop: 20 }]}
            onPress={() => loadNearby(true)}
          >
            <Text style={styles.filterText}>Tentar de novo</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.gridWrap}>
          <ProfileGrid
            data={profiles}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => loadNearby(true)} />
            }
            emptyTitle="Nenhum perfil próximo"
            emptyText="Ajuste a distância nos filtros ou volte mais tarde. Puxe para atualizar."
            onPressProfile={(profile) =>
              navigation.navigate("ProfileDetail", { userId: profile.id, user: profile })
            }
          />
        </View>
      )}

      <View style={styles.bottomBar}>
        <View style={styles.foundPill}>
          <Text style={styles.foundText}>
            {profiles.length} encontrado{profiles.length === 1 ? "" : "s"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
