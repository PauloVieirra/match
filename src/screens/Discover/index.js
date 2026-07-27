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
import * as Location from "expo-location";
import { styles } from "./style";
import ProfileGrid from "../../Components/ProfileGrid";
import { AppContext } from "../../../contexts/ContextAPI";
import { filterCompatibleProfiles } from "../../utils/profileMatcher";
import { mergeFiltersWithProfile } from "../../data/lifestyleOptions";
import { fetchNearbyProfiles, updateMyLocationOnApi } from "../../services/api/location";
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

  const loadNearby = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);
    setNeedsLocation(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        await updateMyLocationOnApi({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          locationGranted: true,
        });
      }

      const result = await fetchNearbyProfiles({
        maxDistanceKm: resolvedFilters.maxDistanceKm,
      });
      setRemoteProfiles(result.profiles);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 412) {
        setNeedsLocation(true);
        setRemoteProfiles([]);
        setErrorMessage(
          "Ative a localização para ver pessoas próximas. Você pode conceder permissão e puxar para atualizar."
        );
      } else {
        setRemoteProfiles([]);
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

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>Conectar pessoas</Text>
          <Text style={styles.hint}>
            Tolerância {opennessLabel} · até {resolvedFilters.maxDistanceKm} km
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
      ) : errorMessage ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadNearby(true)} />
          }
        >
          <Text style={[styles.brand, { textAlign: "center", marginBottom: 8 }]}>
            {needsLocation ? "Localização necessária" : "Nada por aqui"}
          </Text>
          <Text style={[styles.hint, { textAlign: "center" }]}>{errorMessage}</Text>
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
