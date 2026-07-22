import { emptyProfile } from '../../data/lifestyleOptions';

/**
 * Mapeia o usuário público da API para o shape local do ContextAPI.
 */
export function mapApiUserToLocal(apiUser, extras = {}) {
  const profile = {
    ...emptyProfile(),
    ...(apiUser?.profile || {}),
    name: apiUser?.profile?.name || apiUser?.name || '',
    phone: apiUser?.profile?.phone || apiUser?.phone || '',
  };

  return {
    id: apiUser?.id,
    email: apiUser?.email,
    name: apiUser?.name || profile.name,
    phone: apiUser?.phone || profile.phone,
    provider: apiUser?.provider || 'email',
    onboardingCompleted: Boolean(apiUser?.onboardingCompleted),
    isAdmin: false,
    isEmailVerified: Boolean(apiUser?.isEmailVerified),
    isProfileComplete: Boolean(apiUser?.isProfileComplete),
    profile,
    ...extras,
  };
}

/**
 * Mapeia o card público de swipe da API para o shape usado em Discover/ProfileDetail.
 */
export function mapSwipeProfileToLocal(swipe) {
  if (!swipe) return null;

  const photos = (swipe.photos || []).map((uri) =>
    typeof uri === 'string' ? { uri } : uri,
  );

  return {
    id: swipe.id,
    name: swipe.name,
    age: swipe.age,
    city: swipe.city,
    bio: swipe.bio,
    photos,
    image: photos[0] || null,
    trainingLevel: swipe.trainingLevel,
    frequencyPerWeek: swipe.frequencyPerWeek,
    intensity: swipe.intensity,
    activityTypes: swipe.activityTypes || [],
    goals: swipe.goals || [],
    lifestyle: swipe.lifestyles || [],
    lookingFor: swipe.lookingFor,
    motto: swipe.motto,
    profession: swipe.profession,
    habits: swipe.habits || { smoking: '', alcohol: '' },
    gender: swipe.gender,
    interestedIn: swipe.interestedIn,
    relationshipIntents: swipe.relationshipIntents,
    heightCm: swipe.heightCm,
    showZodiac: Boolean(swipe.showZodiac),
    birthDate: swipe.birthDate,
    sportPreferred: (swipe.activityTypes && swipe.activityTypes[0]) || '',
  };
}
