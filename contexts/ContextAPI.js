import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_FILTERS, emptyProfile, filtersFromTolerance } from "../src/data/lifestyleOptions";
import {
  registerWithEmail as apiRegister,
  loginWithEmail as apiLogin,
  completeOnboardingOnApi,
  logoutSession,
} from "../src/services/api/auth";
import { fetchMyProfile, fetchPublicProfile, updateMyProfileOnApi } from "../src/services/api/profile";
import { getAccessToken } from "../src/services/session";
import { mapApiUserToLocal } from "../src/services/api/mappers";
import { ensureFreshSession, ApiError } from "../src/services/api/client";
import { fetchMyMatches, postSwipe } from "../src/services/api/match";
import { disconnectChatSocket } from "../src/services/api/chatSocket";

export const AppContext = createContext();

const USER_KEY = "@matchmaromba:user";
const FILTERS_KEY = "@matchmaromba:filters";
const CONNECTIONS_KEY = "@matchmaromba:connections";
// Contas conhecidas por telefone — permite voltar a logar sem refazer o cadastro.
const ACCOUNTS_KEY = "@matchmaromba:accounts";
const CHECKINS_KEY = "@matchmaromba:checkins";

const EMPTY_CONNECTIONS = {
  outgoing: [],
  incoming: [],
  matches: [],
  reciprocalCandidates: [],
  notification: null,
};

// false = sempre passa por login/cadastro ao abrir sem sessão
const SIMULATE_LOGGED_USER = false;

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);
  const [connectionState, setConnectionState] = useState(EMPTY_CONNECTIONS);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  // true entre o fim do cadastro e o conteúdo inicial pronto (tela "preparando tudo")
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [userJson, filtersJson, connectionsJson, checkInsJson, token] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(FILTERS_KEY),
          AsyncStorage.getItem(CONNECTIONS_KEY),
          AsyncStorage.getItem(CHECKINS_KEY),
          getAccessToken(),
        ]);

        let localUser = null;
        if (userJson) {
          localUser = JSON.parse(userJson);
          setUser(localUser);
        }

        if (token) {
          try {
            await ensureFreshSession();
            const { user: apiUser } = await fetchMyProfile();
            localUser = apiUser;
            setUser(apiUser);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(apiUser));
            if (apiUser?.profile?.filters) {
              const fromApi = {
                ...DEFAULT_FILTERS,
                ...apiUser.profile.filters,
              };
              setFiltersState(fromApi);
              await AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(fromApi));
            }
          } catch (apiError) {
            console.log("Perfil remoto indisponível, usando cache local:", apiError?.message);
          }
        }

        if (!token || !localUser?.profile?.filters) {
          if (filtersJson) setFiltersState({ ...DEFAULT_FILTERS, ...JSON.parse(filtersJson) });
        }

        let nextConnections = { ...EMPTY_CONNECTIONS };
        if (connectionsJson) {
          nextConnections = { ...EMPTY_CONNECTIONS, ...JSON.parse(connectionsJson) };
        }

        if (token) {
          try {
            const { matches: remoteMatches } = await fetchMyMatches();
            nextConnections = {
              ...nextConnections,
              matches: remoteMatches,
              outgoing: (nextConnections.outgoing || []).filter(
                (id) => !remoteMatches.some((m) => m.userId === id),
              ),
              incoming: (nextConnections.incoming || []).filter(
                (id) => !remoteMatches.some((m) => m.userId === id),
              ),
            };
          } catch (matchError) {
            console.log("Matches remotos indisponíveis:", matchError?.message);
          }
        }

        setConnectionState(nextConnections);
        AsyncStorage.setItem(CONNECTIONS_KEY, JSON.stringify(nextConnections)).catch(() => {});

        if (checkInsJson) setCheckIns(JSON.parse(checkInsJson));
      } catch (e) {
        console.log("Erro ao carregar sessão:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /** Registra um treino no local. A localização exata do usuário não é armazenada. */
  const addCheckIn = useCallback((venue) => {
    const entry = {
      id: `checkin-${Date.now()}`,
      venueId: venue.id,
      venueName: venue.name,
      venueType: venue.type,
      at: new Date().toISOString(),
    };
    setCheckIns((current) => {
      const next = [entry, ...current];
      AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(next)).catch((e) =>
        console.log("Erro ao salvar check-ins:", e)
      );
      return next;
    });
    return entry;
  }, []);

  const saveAccount = useCallback(async (account) => {
    const phone = account?.phone || account?.profile?.phone;
    if (!phone) return;
    try {
      const json = await AsyncStorage.getItem(ACCOUNTS_KEY);
      const accounts = json ? JSON.parse(json) : {};
      accounts[phone] = account;
      await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.log("Erro ao salvar conta:", e);
    }
  }, []);

  const persistUser = useCallback(
    async (next) => {
      setUser(next);
      try {
        if (next) {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
          await saveAccount(next);
        } else {
          await AsyncStorage.removeItem(USER_KEY);
        }
      } catch (e) {
        console.log("Erro ao salvar usuário:", e);
      }
    },
    [saveAccount]
  );

  const persistFilters = useCallback(async (merged) => {
    setFiltersState(merged);
    try {
      await AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(merged));
    } catch (e) {
      console.log("Erro ao salvar filtros:", e);
    }
  }, []);

  const updateConnections = useCallback((updater) => {
    setConnectionState((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      AsyncStorage.setItem(CONNECTIONS_KEY, JSON.stringify(next)).catch((e) =>
        console.log("Erro ao salvar conexões:", e)
      );
      return next;
    });
  }, []);

  const createMatch = useCallback(
    (targetUserId, showNotification = false, person = null, extras = {}) => {
      let createdMatch = null;
      updateConnections((current) => {
        const existing = current.matches.find((item) => item.userId === targetUserId);
        if (existing) {
          if (person && !existing.person) {
            createdMatch = {
              ...existing,
              person,
              ...extras,
              threadId: extras.threadId || existing.threadId,
              roomId: extras.roomId || extras.threadId || existing.roomId,
            };
            return {
              ...current,
              matches: current.matches.map((item) =>
                item.userId === targetUserId ? createdMatch : item,
              ),
            };
          }
          createdMatch = existing;
          return current;
        }

        createdMatch = {
          id: extras.id || `match-${targetUserId}-${Date.now()}`,
          userId: targetUserId,
          threadId: extras.threadId || extras.roomId || `thread-${targetUserId}`,
          roomId: extras.roomId || extras.threadId || null,
          conversationId: extras.conversationId || extras.threadId || extras.roomId || null,
          createdAt: extras.createdAt || new Date().toISOString(),
          person: person || null,
        };

        return {
          ...current,
          incoming: current.incoming.filter((id) => id !== targetUserId),
          outgoing: current.outgoing.filter((id) => id !== targetUserId),
          matches: [createdMatch, ...current.matches],
          notification: showNotification
            ? {
                id: `notification-${Date.now()}`,
                type: "new_match",
                userId: targetUserId,
                title: "Você tem uma nova conexão",
                createdAt: new Date().toISOString(),
              }
            : current.notification,
        };
      });
      return createdMatch;
    },
    [updateConnections]
  );

  const syncMatchesFromApi = useCallback(async () => {
    try {
      const { matches: remoteMatches } = await fetchMyMatches();
      updateConnections((current) => ({
        ...current,
        matches: remoteMatches,
        outgoing: current.outgoing.filter(
          (id) => !remoteMatches.some((m) => m.userId === id),
        ),
        incoming: current.incoming.filter(
          (id) => !remoteMatches.some((m) => m.userId === id),
        ),
      }));
      return remoteMatches;
    } catch (e) {
      console.log("Matches remotos indisponíveis:", e?.message);
      return null;
    }
  }, [updateConnections]);

  /**
   * Conexão via API (`POST /swipes`). Mantém o contrato das telas:
   * `{ status: 'matched'|'pending', match? }`.
   */
  const sendConnectionRequest = useCallback(
    async (targetUserId, person = null) => {
      const existingMatch = connectionState.matches.find((item) => item.userId === targetUserId);
      if (existingMatch) return { status: "matched", match: existingMatch };

      try {
        const result = await postSwipe(targetUserId, "LIKE");

        if (result.match) {
          const match = createMatch(targetUserId, true, person, {
            id: result.match.id,
            threadId: result.match.conversationId || result.match.roomId,
            roomId: result.match.roomId || result.match.conversationId,
            conversationId: result.match.conversationId || result.match.roomId,
          });
          return { status: "matched", match };
        }

        if (!connectionState.outgoing.includes(targetUserId)) {
          updateConnections((current) => ({
            ...current,
            outgoing: [...current.outgoing, targetUserId],
          }));
        }

        return { status: "pending" };
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 409) {
          const alreadyMatched = connectionState.matches.find(
            (item) => item.userId === targetUserId,
          );
          if (alreadyMatched) return { status: "matched", match: alreadyMatched };

          if (!connectionState.outgoing.includes(targetUserId)) {
            updateConnections((current) => ({
              ...current,
              outgoing: [...current.outgoing, targetUserId],
            }));
          }
          return { status: "pending" };
        }
        throw error;
      }
    },
    [connectionState, createMatch, updateConnections]
  );

  const dismissConnectionNotification = useCallback(() => {
    updateConnections((current) => ({ ...current, notification: null }));
  }, [updateConnections]);

  /**
   * Registra o vínculo bilateral de descoberta. No backend, cada ID seria
   * gravado como uma aresta de candidatos para as duas contas.
   */
  const registerReciprocalCandidates = useCallback(
    (candidateIds) => {
      updateConnections((current) => ({
        ...current,
        reciprocalCandidates: [...new Set([...current.reciprocalCandidates, ...candidateIds])],
      }));
    },
    [updateConnections]
  );

  const connectionStatus = useCallback(
    (targetUserId) => {
      if (connectionState.matches.some((item) => item.userId === targetUserId)) return "matched";
      if (connectionState.outgoing.includes(targetUserId)) return "pending";
      return "none";
    },
    [connectionState]
  );

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

  const registerWithEmail = async ({ email, password, name, phone, termsAccepted = true }) => {
    const { user } = await apiRegister({ email, password, name, phone, termsAccepted });
    await persistUser(user);
    return user;
  };

  const loginWithEmail = async ({ email, password }) => {
    const { user } = await apiLogin({ email, password });
    await persistUser(user);
    await syncMatchesFromApi();
    return user;
  };

  const logout = async () => {
    try {
      disconnectChatSocket();
      await logoutSession();
    } catch (e) {
      console.log("Erro ao limpar tokens:", e);
    }
    await persistUser(null);
    updateConnections(EMPTY_CONNECTIONS);
  };

  /**
   * Entra com telefone diferenciando login de cadastro:
   * se o número já tem conta salva, restaura o perfil (login);
   * caso contrário cria uma conta nova e segue para o onboarding.
   */
  const loginWithPhone = async (phone) => {
    try {
      const json = await AsyncStorage.getItem(ACCOUNTS_KEY);
      const accounts = json ? JSON.parse(json) : {};
      const existing = accounts[phone];
      if (existing) {
        await persistUser(existing);
        return { isNewAccount: false, name: existing.name || existing.profile?.name };
      }
    } catch (e) {
      console.log("Erro ao buscar conta:", e);
    }
    await login({ provider: "phone", phone, onboardingCompleted: false });
    return { isNewAccount: true };
  };

  const updateProfile = async (partial) => {
    if (!user) return null;

    const nextProfile = { ...user.profile, ...partial };
    if (partial.tolerance) {
      nextProfile.tolerance = { ...(user.profile?.tolerance || {}), ...partial.tolerance };
    }
    if (partial.filters) {
      nextProfile.filters = { ...(user.profile?.filters || DEFAULT_FILTERS), ...partial.filters };
    }
    if (partial.habits) {
      nextProfile.habits = { ...(user.profile?.habits || {}), ...partial.habits };
    }
    if (partial.visibility) {
      nextProfile.visibility = { ...(user.profile?.visibility || {}), ...partial.visibility };
    }

    // Nome/data de nascimento são imutáveis após onboarding
    nextProfile.name = user.profile?.name || user.name || nextProfile.name;
    nextProfile.birthDate = user.profile?.birthDate || nextProfile.birthDate;

    let next = {
      ...user,
      profile: nextProfile,
      name: nextProfile.name,
      phone: nextProfile.phone || user.phone,
    };

    try {
      const token = await getAccessToken();
      if (token && (user.provider === "email" || user.provider === "google")) {
        const { user: apiUser } = await updateMyProfileOnApi({
          ...partial,
          name: nextProfile.name,
          birthDate: nextProfile.birthDate,
          tolerance: nextProfile.tolerance,
          filters: nextProfile.filters,
          habits: nextProfile.habits,
          visibility: nextProfile.visibility,
          ...(partial.photos ? { photos: nextProfile.photos } : {}),
        });
        next = mapApiUserToLocal(apiUser, { isAdmin: user.isAdmin });
      }
    } catch (e) {
      console.log("Erro ao atualizar perfil na API:", e);
      throw e;
    }

    await persistUser(next);

    if (partial.filters || next.profile?.filters) {
      await persistFilters({
        ...DEFAULT_FILTERS,
        ...(next.profile.filters || {}),
      });
    } else if (partial.tolerance || next.profile?.tolerance) {
      const synced = {
        ...filters,
        ...filtersFromTolerance(next.profile.tolerance || {}, next.profile.activityTypes || []),
      };
      await persistFilters(synced);
    }

    return next;
  };

  const completeOnboarding = async (profileData) => {
    if (!user) return;
    setPreparing(true);

    let nextProfile = { ...user.profile, ...profileData };
    let next = {
      ...user,
      name: profileData.name || user.name,
      onboardingCompleted: true,
      profile: nextProfile,
    };

    try {
      const token = await getAccessToken();
      if (token && user.provider === "email") {
        const { user: apiUser } = await completeOnboardingOnApi({
          ...nextProfile,
          name: nextProfile.name?.trim?.() || nextProfile.name,
          tolerance: {
            ...nextProfile.tolerance,
            requiredSports: nextProfile.tolerance?.sameSportOnly
              ? nextProfile.tolerance.requiredSports?.length
                ? nextProfile.tolerance.requiredSports
                : nextProfile.activityTypes
              : nextProfile.tolerance?.requiredSports || [],
          },
          filters: {
            ...DEFAULT_FILTERS,
            ...filtersFromTolerance(
              nextProfile.tolerance || {},
              nextProfile.activityTypes || [],
            ),
            ...(nextProfile.filters || {}),
          },
        });
        next = mapApiUserToLocal(apiUser, { isAdmin: user.isAdmin });
        nextProfile = next.profile;
      }
    } catch (e) {
      console.log("Erro ao enviar onboarding para API:", e);
      setPreparing(false);
      throw e;
    }

    await persistUser(next);

    const synced = {
      ...DEFAULT_FILTERS,
      ...(nextProfile.filters || {}),
      ...filtersFromTolerance(nextProfile.tolerance || {}, nextProfile.activityTypes || []),
      activityTypes: nextProfile.filters?.activityTypes?.length
        ? nextProfile.filters.activityTypes
        : nextProfile.tolerance?.sameSportOnly
          ? nextProfile.tolerance.requiredSports || nextProfile.activityTypes || []
          : nextProfile.filters?.activityTypes || [],
    };
    await persistFilters(synced);

    // Pré-carrega preferências; o Discover busca perfis reais por proximidade.
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setPreparing(false);
    }
  };

  const setFilters = async (nextFilters) => {
    const merged = { ...DEFAULT_FILTERS, ...filters, ...nextFilters };

    if (user) {
      const tolerance = {
        ...(user.profile?.tolerance || {}),
        openness: merged.openness,
        dealbreakers: merged.dealbreakers || [],
        sameSportOnly: !!merged.sameSportOnly,
        requiredSports: merged.requiredSports || [],
        maxDistanceKm: merged.maxDistanceKm,
      };

      try {
        const token = await getAccessToken();
        if (token && (user.provider === "email" || user.provider === "google")) {
          const { user: apiUser } = await updateMyProfileOnApi({ filters: merged });
          await persistUser(mapApiUserToLocal(apiUser, { isAdmin: user.isAdmin }));
          const fromApi = {
            ...DEFAULT_FILTERS,
            ...(apiUser.profile?.filters || merged),
          };
          await persistFilters(fromApi);
          return fromApi;
        }
      } catch (e) {
        console.log("Erro ao salvar filtros na API:", e);
        throw e;
      }

      await persistUser({
        ...user,
        profile: { ...user.profile, tolerance, filters: merged },
      });
    }

    await persistFilters(merged);
    return merged;
  };

  const refreshMyProfile = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return null;
    const { user: apiUser } = await fetchMyProfile();
    await persistUser(apiUser);
    return apiUser;
  }, [persistUser]);

  const getPublicProfile = useCallback(async (userId) => {
    const { profile } = await fetchPublicProfile(userId);
    return profile;
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser: persistUser,
        filters,
        setFilters,
        loading,
        setLoading,
        preparing,
        login,
        loginWithPhone,
        registerWithEmail,
        loginWithEmail,
        logout,
        updateProfile,
        completeOnboarding,
        refreshMyProfile,
        getPublicProfile,
        matches: connectionState.matches,
        connectionNotification: connectionState.notification,
        sendConnectionRequest,
        connectionStatus,
        dismissConnectionNotification,
        registerReciprocalCandidates,
        syncMatchesFromApi,
        checkIns,
        addCheckIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
