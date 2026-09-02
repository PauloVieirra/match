import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { styles } from "./style";
import ProfileGrid from "../../Components/ProfileGrid";
import { AppContext } from "../../../contexts/ContextAPI";
import { filterCompatibleProfiles } from "../../utils/profileMatcher";
import { mergeFiltersWithProfile } from "../../data/lifestyleOptions";
import { fetchNearbyProfiles, updateMyLocationOnApi } from "../../services/api/location";
import { searchProfilesByName } from "../../services/api/profile";
import { formatApiError } from "../../utils/api/formatApiError";
import {
  coordsFromProfile,
  isEmulatorMockLocation,
  resolveDiscoverCoordinates,
  SEED_MAP_ORIGIN,
} from "../../services/location/resolveCoordinates";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchDebounceRef = useRef(null);

  const trimmedSearch = searchQuery.trim();
  const isSearchActive = trimmedSearch.length >= 2;

  const loadNearby = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);
    setNeedsLocation(false);

    try {
      const resolved = await resolveDiscoverCoordinates({
        allowSeedFallback: __DEV__,
        storedProfileCoords: coordsFromProfile(user?.profile),
      });
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

      // Só persiste GPS real — evita sobrescrever o perfil com coords fake do emulador.
      const shouldPersistLocation =
        (resolved.source === "gps" || resolved.source === "last_known")
        && !isEmulatorMockLocation(latitude, longitude);

      if (shouldPersistLocation) {
        try {
          await updateMyLocationOnApi({
            longitude,
            latitude,
            locationGranted: resolved.permission === "granted",
          });
        } catch (putError) {
          console.log("PUT /location/me falhou (seguindo com query):", putError?.message);
        }
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
  }, [resolvedFilters.maxDistanceKm, user?.profile]);

  useEffect(() => {
    loadNearby(false);
  }, [loadNearby]);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    if (trimmedSearch.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return undefined;
    }

    setSearchLoading(true);
    setSearchError(null);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const result = await searchProfilesByName(trimmedSearch, { limit: 20 });
        setSearchResults(result.profiles);
        if (result.profiles.length === 0) {
          setSearchError(`Nenhum perfil encontrado para "${trimmedSearch}".`);
        } else {
          setSearchError(null);
        }
      } catch (error) {
        setSearchResults([]);
        setSearchError(formatApiError(error, "Não foi possível buscar por nome."));
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, [trimmedSearch]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    setSearchLoading(false);
  };

  const profiles = useMemo(
    () =>
      filterCompatibleProfiles(remoteProfiles, {
        myLifestyles,
        filters: resolvedFilters,
      }),
    [remoteProfiles, myLifestyles, resolvedFilters]
  );

  const displayProfiles = isSearchActive ? searchResults : profiles;
  const displayCount = displayProfiles.length;

  useEffect(() => {
    if (isSearchActive) return;
    registerReciprocalCandidates(profiles.map((profile) => profile.id));
  }, [profiles, registerReciprocalCandidates, isSearchActive]);

  const opennessLabel =
    resolvedFilters.openness === "open"
      ? "aberta"
      : resolvedFilters.openness === "strict"
        ? "rígida"
        : "seletiva";

  const showEmptyAfterFilter =
    !isSearchActive && !loading && !errorMessage && apiCount > 0 && profiles.length === 0;

  const showNearbyContent = !isSearchActive;
  const showSearchEmpty =
    isSearchActive && !searchLoading && trimmedSearch.length >= 2 && displayCount === 0;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>Conectar pessoas</Text>
          <Text style={styles.hint}>
            {isSearchActive
              ? `Busca por "${trimmedSearch}"`
              : `Tolerância ${opennessLabel} · até ${resolvedFilters.maxDistanceKm} km${
                  locationSource === "seed_fallback" ? ` · ${SEED_MAP_ORIGIN.label}` : ""
                }${locationSource === "profile" ? " · localização do perfil" : ""}`}
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

      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nome"
          placeholderTextColor={colors.gray}
          selectionColor={colors.primary}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="search"
          maxLength={60}
        />
        {searchLoading ? (
          <ActivityIndicator size="small" color={colors.accent} style={styles.searchAction} />
        ) : searchQuery.length > 0 ? (
          <TouchableOpacity onPress={clearSearch} style={styles.searchAction} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {isSearchActive ? (
        searchLoading && displayCount === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[styles.hint, { marginTop: 12 }]}>Buscando por nome…</Text>
          </View>
        ) : showSearchEmpty ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.brand, { textAlign: "center", marginBottom: 8 }]}>
              Nenhum resultado
            </Text>
            <Text style={[styles.hint, { textAlign: "center" }]}>
              {searchError || `Nenhum perfil encontrado para "${trimmedSearch}".`}
            </Text>
          </ScrollView>
        ) : (
          <View style={styles.gridWrap}>
            <ProfileGrid
              data={displayProfiles}
              emptyTitle="Nenhum perfil encontrado"
              emptyText={searchError || "Tente outro nome com pelo menos 2 caracteres."}
              onPressProfile={(profile) =>
                navigation.navigate("ProfileDetail", { userId: profile.id, user: profile })
              }
            />
          </View>
        )
      ) : loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={[styles.hint, { marginTop: 12 }]}>Buscando por proximidade…</Text>
        </View>
      ) : showNearbyContent && (errorMessage || showEmptyAfterFilter) ? (
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
      ) : showNearbyContent ? (
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
      ) : null}

      <View style={styles.bottomBar}>
        <View style={styles.foundPill}>
          <Text style={styles.foundText}>
            {displayCount} {isSearchActive ? "resultado" : "encontrado"}
            {displayCount === 1 ? "" : "s"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
