import { emptyTolerance } from "../data/lifestyleOptions";

function candidateHabits(user) {
  if (user.habits) return user.habits;
  const life = user.lifestyle || user.lifestyles || [];
  return {
    smoking: life.includes("Não fumo") ? "never" : life.some((t) => /fum/i.test(t)) ? "yes" : "sometimes",
    alcohol: life.includes("Zero álcool")
      ? "never"
      : life.includes("Álcool social")
        ? "social"
        : "social",
  };
}

function passesDealbreakers(candidate, dealbreakers = []) {
  if (!dealbreakers.length) return true;
  const habits = candidateHabits(candidate);
  const life = candidate.lifestyle || candidate.lifestyles || [];

  if (dealbreakers.includes("no_smokers")) {
    if (habits.smoking === "yes" || habits.smoking === "sometimes") return false;
  }
  if (dealbreakers.includes("no_alcohol")) {
    if (habits.alcohol === "social" || habits.alcohol === "often") return false;
  }
  if (dealbreakers.includes("no_nightlife")) {
    if (life.some((t) => /balada|noite|festa/i.test(t))) return false;
  }
  return true;
}

function passesSameSport(candidate, { sameSportOnly, requiredSports = [] }) {
  if (!sameSportOnly) return true;
  const sports = requiredSports.length ? requiredSports : [];
  if (!sports.length) return true;
  const theirs = [
    candidate.sportPreferred,
    ...(candidate.activityTypes || []),
  ].filter(Boolean);
  return sports.some((s) => theirs.includes(s));
}

/** Filtra e ordena perfis potencialmente compatíveis com base nos filtros + lifestyle + tolerância. */

export function scoreCompatibility(candidate, myLifestyles = [], filters = {}) {
  let score = 0;
  const theirLife = candidate.lifestyle || candidate.lifestyles || [];
  const theirActivities = candidate.activityTypes || [];
  const theirGoals = candidate.goals || [];

  myLifestyles.forEach((t) => {
    if (theirLife.includes(t)) score += 4;
  });

  (filters.lifestyles || []).forEach((t) => {
    if (theirLife.includes(t)) score += 3;
  });

  (filters.activityTypes || []).forEach((t) => {
    if (candidate.sportPreferred === t || theirActivities.includes(t)) score += 3;
  });

  (filters.requiredSports || []).forEach((t) => {
    if (candidate.sportPreferred === t || theirActivities.includes(t)) score += 4;
  });

  (filters.intensity || []).forEach((t) => {
    if (candidate.intensity === t) score += 2;
  });

  (filters.levels || []).forEach((t) => {
    if (candidate.trainingLevel === t) score += 2;
  });

  (filters.goals || []).forEach((t) => {
    if (theirGoals.includes(t)) score += 2;
  });

  const freq = candidate.frequencyPerWeek || 0;
  const minF = filters.frequencyMin ?? 1;
  const maxF = filters.frequencyMax ?? 6;
  if (freq >= minF && freq <= maxF) score += 2;
  else score -= 5;

  if (filters.maxDistanceKm && candidate.distanceKm != null) {
    if (candidate.distanceKm <= filters.maxDistanceKm) score += 1;
    else score -= 8;
  }

  return score;
}

export function filterCompatibleProfiles(users, { myLifestyles = [], filters = {} } = {}) {
  const resolved = { ...emptyTolerance(), ...filters };
  const openness = resolved.openness || "selective";
  const isOpen = openness === "open";
  const isStrict = openness === "strict";

  const hasSoftFilters =
    (filters.lifestyles || []).length > 0 ||
    (filters.activityTypes || []).length > 0 ||
    (filters.intensity || []).length > 0 ||
    (filters.levels || []).length > 0 ||
    (filters.goals || []).length > 0;

  return [...users]
    .map((u) => ({
      ...u,
      _score: scoreCompatibility(u, myLifestyles, resolved),
    }))
    .filter((u) => {
      // Raio sempre aplica (exceto se quiser liberar tudo — ainda limitamos distância)
      if (resolved.maxDistanceKm && u.distanceKm != null && u.distanceKm > resolved.maxDistanceKm) {
        return false;
      }

      if (isOpen) {
        // Modo aberto: só raio (e opcionalmente frequência ampla)
        return true;
      }

      if (!passesDealbreakers(u, resolved.dealbreakers || [])) return false;

      if (!passesSameSport(u, resolved)) return false;

      const freq = u.frequencyPerWeek || 0;
      if (freq < (filters.frequencyMin ?? 1) || freq > (filters.frequencyMax ?? 6)) {
        if (isStrict || hasSoftFilters) return false;
      }

      if (hasSoftFilters || isStrict) {
        const lifeOk =
          !(filters.lifestyles || []).length ||
          (filters.lifestyles || []).some((t) => (u.lifestyle || u.lifestyles || []).includes(t));
        const actOk =
          !(filters.activityTypes || []).length ||
          (filters.activityTypes || []).some(
            (t) => u.sportPreferred === t || (u.activityTypes || []).includes(t)
          );
        const intOk =
          !(filters.intensity || []).length || (filters.intensity || []).includes(u.intensity);
        const lvlOk =
          !(filters.levels || []).length || (filters.levels || []).includes(u.trainingLevel);
        const goalOk =
          !(filters.goals || []).length ||
          (filters.goals || []).some((t) => (u.goals || []).includes(t));

        if (isStrict) {
          return lifeOk && actOk && intOk && lvlOk && goalOk;
        }
        // selective: soft filters only if set
        return lifeOk && actOk && intOk && lvlOk && goalOk;
      }

      return true;
    })
    .sort((a, b) => b._score - a._score);
}
