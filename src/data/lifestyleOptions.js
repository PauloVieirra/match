/** Opções focadas em qualidade de vida — estilo de vida vem primeiro no match. */

export const LIFESTYLE_TAGS = [
  "Acordo cedo",
  "Dormir cedo",
  "Sono prioridade",
  "Meal prep",
  "Alimentação limpa",
  "Flexível na dieta",
  "Zero álcool",
  "Álcool social",
  "Não fumo",
  "Hidratação alta",
  "Mindfulness",
  "Vida ao ar livre",
  "Treino em grupo",
  "Treino solo",
  "Rotina disciplinada",
  "Equilíbrio trabalho/treino",
  "Foco em bem-estar",
  "Recovery / descanso",
];

export const ACTIVITY_TYPES = [
  "Musculação",
  "Corrida",
  "Caminhada",
  "Crossfit",
  "Funcional",
  "Yoga",
  "Pilates",
  "Natação",
  "Ciclismo",
  "Pedal longas distâncias",
  "Calistenia",
  "Esportes coletivos",
  "Lutas",
  "Dança",
  "HIIT",
];

export const INTENSITY_LEVELS = [
  { id: "leve", label: "Leve", hint: "Movimento sem pressão" },
  { id: "moderada", label: "Moderada", hint: "Ritmo constante" },
  { id: "alta", label: "Alta", hint: "Suor garantido" },
  { id: "extrema", label: "Extrema", hint: "Performance máxima" },
];

export const FREQUENCY_OPTIONS = [
  { id: 1, label: "1x" },
  { id: 2, label: "2x" },
  { id: 3, label: "3x" },
  { id: 4, label: "4x" },
  { id: 5, label: "5x" },
  { id: 6, label: "6x+" },
];

export const SESSION_DURATION = [
  { id: "30", label: "Até 30 min" },
  { id: "45", label: "30–45 min" },
  { id: "60", label: "45–60 min" },
  { id: "90", label: "60–90 min" },
  { id: "90+", label: "90 min+" },
];

export const GOALS = [
  "Saúde",
  "Hipertrofia",
  "Emagrecimento",
  "Condicionamento",
  "Força",
  "Mobilidade",
  "Bem-estar",
  "Constância",
  "Performance",
  "Socializar no treino",
  "Qualidade de vida",
  "Reduzir estresse",
];

export const TRAINING_LEVELS = ["Iniciante", "Intermediário", "Avançado"];

export const PREFERRED_TIMES = [
  "Manhã cedo",
  "Manhã",
  "Almoço",
  "Tarde",
  "Noite",
  "Flexível",
];

/** Raio de busca (GPS na próxima etapa). */
export const DISTANCE_OPTIONS = [5, 10, 15, 20, 30, 40, 60, 80, 100];

export const SMOKING_OPTIONS = [
  { id: "never", label: "Não fumo" },
  { id: "sometimes", label: "Socialmente / às vezes" },
  { id: "yes", label: "Fumo" },
];

export const ALCOHOL_OPTIONS = [
  { id: "never", label: "Não bebo" },
  { id: "social", label: "Bebo socialmente" },
  { id: "often", label: "Bebo com frequência" },
];

/** Nível de abertura do sensor de tolerância. */
export const TOLERANCE_OPENNESS = [
  {
    id: "open",
    label: "Aberta",
    hint: "Ver qualquer tipo de perfil — sem restrições rígidas.",
  },
  {
    id: "selective",
    label: "Seletiva",
    hint: "Aplicar limites que você escolher (fumo, álcool, esportes…).",
  },
  {
    id: "strict",
    label: "Rígida",
    hint: "Só perfis que respeitam todos os seus limites e preferências.",
  },
];

export const DEALBREAKERS = [
  {
    id: "no_smokers",
    label: "Sem fumantes",
    hint: "Não mostrar quem fuma",
  },
  {
    id: "no_alcohol",
    label: "Sem álcool",
    hint: "Não mostrar quem bebe",
  },
  {
    id: "no_nightlife",
    label: "Sem balada",
    hint: "Evitar quem prioriza vida noturna",
  },
];

export const emptyHabits = () => ({
  smoking: "",
  alcohol: "",
});

export const emptyTolerance = () => ({
  openness: "selective",
  dealbreakers: [],
  sameSportOnly: false,
  requiredSports: [],
  maxDistanceKm: 20,
});

export const DEFAULT_FILTERS = {
  maxDistanceKm: 20,
  lifestyles: [],
  activityTypes: [],
  intensity: [],
  frequencyMin: 1,
  frequencyMax: 6,
  levels: [],
  goals: [],
  openness: "selective",
  dealbreakers: [],
  sameSportOnly: false,
  requiredSports: [],
};

export const emptyProfile = () => ({
  name: "",
  birthDate: "",
  phone: "",
  city: "",
  bio: "",
  lifestyles: [],
  activityTypes: [],
  intensity: "moderada",
  frequencyPerWeek: 3,
  sessionDuration: "60",
  trainingLevel: "Intermediário",
  goals: [],
  preferredTimes: [],
  photos: [],
  locationGranted: false,
  lookingFor: "",
  motto: "",
  profession: "",
  habits: emptyHabits(),
  tolerance: emptyTolerance(),
});

/** Junta filtros da tela com tolerância salva no perfil (perfil é fonte do sensor). */
export function mergeFiltersWithProfile(filters = {}, profile = {}) {
  const t = profile.tolerance || emptyTolerance();
  return {
    ...DEFAULT_FILTERS,
    ...t,
    ...filters,
    maxDistanceKm: filters.maxDistanceKm ?? t.maxDistanceKm ?? 20,
    openness: filters.openness ?? t.openness ?? "selective",
    dealbreakers: filters.dealbreakers ?? t.dealbreakers ?? [],
    sameSportOnly: filters.sameSportOnly ?? t.sameSportOnly ?? false,
    requiredSports:
      (filters.requiredSports && filters.requiredSports.length
        ? filters.requiredSports
        : null) ||
      t.requiredSports ||
      [],
  };
}

export function filtersFromTolerance(tolerance = {}, activityTypes = []) {
  const t = { ...emptyTolerance(), ...tolerance };
  return {
    ...DEFAULT_FILTERS,
    maxDistanceKm: t.maxDistanceKm,
    openness: t.openness,
    dealbreakers: t.dealbreakers || [],
    sameSportOnly: !!t.sameSportOnly,
    requiredSports: t.sameSportOnly
      ? t.requiredSports?.length
        ? t.requiredSports
        : activityTypes
      : t.requiredSports || [],
  };
}
