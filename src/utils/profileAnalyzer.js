/**
 * Analisa a completude do perfil para feedback ao usuário.
 * Perfil ideal: dados precisos + 5–6 fotos + bio descritiva.
 */

const MIN_IDEAL_PHOTOS = 5;
const MIN_GOOD_PHOTOS = 3;
const MIN_BIO_IDEAL = 120;
const MIN_BIO_GOOD = 40;
const MIN_LIFESTYLE = 3;
const MIN_ACTIVITIES = 2;
const MIN_GOALS = 2;

function getPhotos(profile) {
  if (Array.isArray(profile.photos) && profile.photos.length) return profile.photos;
  if (profile.image) return [profile.image];
  return [];
}

function bioScore(bio = "") {
  const text = String(bio).trim();
  const len = text.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 8).length;
  let score = 0;
  const tips = [];

  if (!len) {
    tips.push("Escreva uma bio que diga quem você é e o que busca.");
    return { score: 0, max: 25, tips };
  }
  if (len < MIN_BIO_GOOD) {
    score += 6;
    tips.push("Amplie a bio (mín. ~40 caracteres para um bom nível).");
  } else if (len < MIN_BIO_IDEAL) {
    score += 14;
    tips.push("Bio ok — para o nível ideal, descreva hábitos e rotina (~120+ caracteres).");
  } else {
    score += 20;
  }
  if (sentences >= 2) score += 5;
  else tips.push("Use pelo menos 2 frases na bio para soar mais completo.");

  return { score: Math.min(score, 25), max: 25, tips };
}

export function analyzeProfile(raw = {}) {
  const profile = {
    name: raw.name || "",
    city: raw.city || "",
    bio: raw.bio || "",
    lifestyles: raw.lifestyles || raw.lifestyle || [],
    activityTypes: raw.activityTypes || [],
    goals: raw.goals || [],
    intensity: raw.intensity || "",
    frequencyPerWeek: raw.frequencyPerWeek || 0,
    trainingLevel: raw.trainingLevel || "",
    lookingFor: raw.lookingFor || "",
    motto: raw.motto || "",
    profession: raw.profession || "",
    photos: getPhotos(raw),
    gender: raw.gender || "",
    interestedIn: raw.interestedIn || [],
    relationshipIntents: raw.relationshipIntents || [],
    heightCm: raw.heightCm || null,
    birthDate: raw.birthDate || "",
    visibility: raw.visibility || {},
  };

  const tips = [];
  let score = 0;
  const max = 100;
  const checks = [];

  // Fotos (30)
  const photoCount = profile.photos.length;
  let photoPts = 0;
  if (photoCount >= MIN_IDEAL_PHOTOS) photoPts = 30;
  else if (photoCount >= MIN_GOOD_PHOTOS) photoPts = 20;
  else if (photoCount >= 1) photoPts = 10;
  score += photoPts;
  checks.push({
    key: "photos",
    label: "Fotos",
    ok: photoCount >= MIN_IDEAL_PHOTOS,
    detail: `${photoCount}/${MIN_IDEAL_PHOTOS} ideais`,
  });
  if (photoCount < MIN_IDEAL_PHOTOS) {
    tips.push(`Adicione mais fotos (ideal: ${MIN_IDEAL_PHOTOS}–6 imagens variadas).`);
  }

  // Bio (25)
  const bio = bioScore(profile.bio);
  score += bio.score;
  checks.push({
    key: "bio",
    label: "Bio",
    ok: bio.score >= 20,
    detail: `${String(profile.bio).trim().length} caracteres`,
  });
  tips.push(...bio.tips);

  // Dados básicos (15)
  let basic = 0;
  if (profile.name?.trim()) basic += 5;
  else tips.push("Informe seu nome.");
  if (profile.city?.trim()) basic += 5;
  else tips.push("Informe sua cidade.");
  if (profile.profession?.trim()) basic += 5;
  else tips.push("Adicione sua ocupação para enriquecer o perfil.");
  score += basic;
  checks.push({ key: "basics", label: "Dados básicos", ok: basic >= 10, detail: `${basic}/15` });

  // Estilo de vida (12)
  const lifeCount = profile.lifestyles.length;
  let lifePts = Math.min(12, lifeCount * 4);
  if (lifeCount < MIN_LIFESTYLE) tips.push(`Selecione pelo menos ${MIN_LIFESTYLE} tags de estilo de vida.`);
  score += lifePts;
  checks.push({
    key: "lifestyle",
    label: "Estilo de vida",
    ok: lifeCount >= MIN_LIFESTYLE,
    detail: `${lifeCount} tags`,
  });

  // Atividades + intensidade + frequência + nível (12)
  let train = 0;
  if (profile.activityTypes.length >= MIN_ACTIVITIES) train += 4;
  else if (profile.activityTypes.length >= 1) train += 2;
  else tips.push("Escolha ao menos 2 tipos de atividade.");
  if (profile.intensity) train += 3;
  else tips.push("Defina a intensidade dos treinos.");
  if (profile.frequencyPerWeek) train += 3;
  else tips.push("Informe a frequência semanal.");
  if (profile.trainingLevel) train += 2;
  else tips.push("Informe seu nível de treino.");
  score += train;
  checks.push({ key: "training", label: "Treino", ok: train >= 10, detail: `${train}/12` });

  // Objetivos (6)
  const goalCount = profile.goals.length;
  const goalPts = Math.min(6, goalCount * 3);
  if (goalCount < MIN_GOALS) tips.push(`Defina pelo menos ${MIN_GOALS} objetivos.`);
  score += goalPts;
  checks.push({ key: "goals", label: "Objetivos", ok: goalCount >= MIN_GOALS, detail: `${goalCount} objetivos` });

  // Identidade e interesses (10) — preencher e manter visível conta pontos
  const vis = profile.visibility;
  const visible = (key) => vis[key] !== false;
  let identity = 0;
  const identityItems = [
    { key: "gender", filled: !!profile.gender, pts: 3, label: "como você se define" },
    { key: "interestedIn", filled: profile.interestedIn.length > 0, pts: 2, label: "quem deseja conhecer" },
    { key: "relationshipIntents", filled: profile.relationshipIntents.length > 0, pts: 2, label: "o que está procurando" },
    { key: "height", filled: !!profile.heightCm, pts: 2, label: "sua altura" },
  ];
  for (const item of identityItems) {
    if (!item.filled) {
      tips.push(`Informe ${item.label} — quanto mais completo, melhor o match.`);
      continue;
    }
    if (visible(item.key)) {
      identity += item.pts;
    } else {
      identity += 1;
      tips.push(`Você está ocultando ${item.label} — mostrar melhora a qualidade do perfil.`);
    }
  }
  if (profile.birthDate) identity += 1;
  identity = Math.min(identity, 10);
  score += identity;
  checks.push({
    key: "identity",
    label: "Identidade e interesses",
    ok: identity >= 8,
    detail: `${identity}/10`,
  });

  // Extra (lookingFor + motto) (até 5, já dentro do teto)
  let extra = 0;
  if (profile.lookingFor) extra += 2;
  if (profile.motto) extra += 3;
  score += extra;
  if (!profile.lookingFor) tips.push("Diga o que você busca (conexão, treino parceiro, etc.).");
  if (!profile.motto) tips.push("Um lema curto deixa o perfil mais pessoal.");

  score = Math.min(max, Math.round(score));

  let level = "Iniciante";
  let levelHint = "Complete as informações essenciais para aparecer melhor.";
  if (score >= 90) {
    level = "Ideal";
    levelHint = "Perfil completo: fotos, bio rica e dados precisos.";
  } else if (score >= 75) {
    level = "Completo";
    levelHint = "Quase ideal — refine bio ou fotos restantes.";
  } else if (score >= 55) {
    level = "Bom";
    levelHint = "Bom começo. Faltam detalhes para o nível ideal.";
  } else if (score >= 35) {
    level = "Em construção";
    levelHint = "Continue preenchendo hábitos, treino e fotos.";
  }

  const uniqueTips = [...new Set(tips)].slice(0, 6);

  return {
    score,
    max,
    level,
    levelHint,
    checks,
    tips: uniqueTips,
    photoCount,
    isIdeal: score >= 90 && photoCount >= MIN_IDEAL_PHOTOS,
  };
}

export function mapOwnProfileForAnalysis(user) {
  const p = user?.profile || {};
  return {
    name: p.name || user?.name || "",
    city: p.city || "",
    bio: p.bio || "",
    lifestyles: p.lifestyles || [],
    activityTypes: p.activityTypes || [],
    goals: p.goals || [],
    intensity: p.intensity || "",
    frequencyPerWeek: p.frequencyPerWeek || 0,
    trainingLevel: p.trainingLevel || "",
    lookingFor: p.lookingFor || "",
    motto: p.motto || "",
    profession: p.profession || "",
    photos: p.photos || [],
    gender: p.gender || "",
    interestedIn: p.interestedIn || [],
    relationshipIntents: p.relationshipIntents || [],
    heightCm: p.heightCm || null,
    birthDate: p.birthDate || "",
    visibility: p.visibility || {},
  };
}
