import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_FILTERS, emptyProfile, filtersFromTolerance } from "../src/data/lifestyleOptions";

export const AppContext = createContext();

const USER_KEY = "@matchmaromba:user";
const FILTERS_KEY = "@matchmaromba:filters";

// false = sempre passa por login/cadastro ao abrir sem sessão
const SIMULATE_LOGGED_USER = false;

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [userJson, filtersJson] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(FILTERS_KEY),
        ]);
        if (userJson) setUser(JSON.parse(userJson));
        if (filtersJson) setFiltersState({ ...DEFAULT_FILTERS, ...JSON.parse(filtersJson) });
      } catch (e) {
        console.log("Erro ao carregar sessão:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const persistUser = useCallback(async (next) => {
    setUser(next);
    try {
      if (next) await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
      else await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.log("Erro ao salvar usuário:", e);
    }
  }, []);

  const persistFilters = useCallback(async (merged) => {
    setFiltersState(merged);
    try {
      await AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(merged));
    } catch (e) {
      console.log("Erro ao salvar filtros:", e);
    }
  }, []);

  const login = async (userData) => {
    const next = {
      profile: emptyProfile(),
      onboardingCompleted: false,
      isAdmin: false,
      ...userData,
      profile: {
        ...emptyProfile(),
        ...(userData.profile || {}),
        phone: userData.phone || userData.profile?.phone || "",
        name: userData.name || userData.profile?.name || "",
      },
    };
    await persistUser(next);
  };

  const logout = async () => {
    await persistUser(null);
  };

  const updateProfile = async (partial) => {
    if (!user) return;
    const nextProfile = { ...user.profile, ...partial };
    if (partial.tolerance) {
      nextProfile.tolerance = { ...(user.profile?.tolerance || {}), ...partial.tolerance };
    }
    if (partial.habits) {
      nextProfile.habits = { ...(user.profile?.habits || {}), ...partial.habits };
    }
    const next = {
      ...user,
      profile: nextProfile,
      name: partial.name ?? user.name,
    };
    await persistUser(next);

    if (partial.tolerance) {
      const synced = {
        ...filters,
        ...filtersFromTolerance(nextProfile.tolerance, nextProfile.activityTypes || []),
      };
      await persistFilters(synced);
    }
  };

  const completeOnboarding = async (profileData) => {
    if (!user) return;
    const nextProfile = { ...user.profile, ...profileData };
    const next = {
      ...user,
      name: profileData.name || user.name,
      onboardingCompleted: true,
      profile: nextProfile,
    };
    await persistUser(next);

    const synced = {
      ...DEFAULT_FILTERS,
      ...filtersFromTolerance(nextProfile.tolerance || {}, nextProfile.activityTypes || []),
      activityTypes: nextProfile.tolerance?.sameSportOnly
        ? nextProfile.tolerance.requiredSports || nextProfile.activityTypes || []
        : [],
    };
    await persistFilters(synced);
  };

  const setFilters = async (nextFilters) => {
    const merged = { ...filters, ...nextFilters };
    await persistFilters(merged);

    // Espelha sensor de tolerância no perfil
    if (user) {
      const tolerance = {
        ...(user.profile?.tolerance || {}),
        openness: merged.openness,
        dealbreakers: merged.dealbreakers || [],
        sameSportOnly: !!merged.sameSportOnly,
        requiredSports: merged.requiredSports || [],
        maxDistanceKm: merged.maxDistanceKm,
      };
      await persistUser({
        ...user,
        profile: { ...user.profile, tolerance },
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser: persistUser,
        filters,
        setFilters,
        loading,
        setLoading,
        login,
        logout,
        updateProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
