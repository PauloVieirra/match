import React, { useContext, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./style";
import { mockUsers } from "../../data/mockUsers";
import ProfileGrid from "../../Components/ProfileGrid";
import { AppContext } from "../../../contexts/ContextAPI";
import { filterCompatibleProfiles } from "../../utils/profileMatcher";
import { mergeFiltersWithProfile } from "../../data/lifestyleOptions";

export default function DiscoverScreen({ navigation }) {
  const { user, filters, registerReciprocalCandidates } = useContext(AppContext);
  const myLifestyles = user?.profile?.lifestyles || [];
  const resolvedFilters = useMemo(
    () => mergeFiltersWithProfile(filters, user?.profile),
    [filters, user?.profile]
  );

  const profiles = useMemo(
    () => filterCompatibleProfiles(mockUsers, { myLifestyles, filters: resolvedFilters }),
    [myLifestyles, resolvedFilters]
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

      <View style={styles.gridWrap}>
        <ProfileGrid
          data={profiles}
          onPressProfile={(profile) =>
            navigation.navigate("ProfileDetail", { userId: profile.id, user: profile })
          }
        />
      </View>

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
