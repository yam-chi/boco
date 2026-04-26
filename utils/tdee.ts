import type { UserProfile } from './storage'

export function calcTargetKcal(profile: Pick<UserProfile, 'weight' | 'goal' | 'activityLevel'>): number {
  const bmr = profile.weight * 24
  const tdee = bmr * profile.activityLevel
  if (profile.goal === 'loss') return Math.round(tdee - 500)
  if (profile.goal === 'gain') return Math.round(tdee + 300)
  return Math.round(tdee)
}
