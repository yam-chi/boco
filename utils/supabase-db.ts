import type { Meal, ExerciseSession, UserProfile } from './storage'
import { createClient } from './supabase'

// ─── Meals ───────────────────────────────────────────────

export async function syncMealsToCloud(meals: Meal[]) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return

  for (const meal of meals) {
    await sb.from('meals').upsert({
      id: meal.id,
      user_id: user.id,
      date: meal.date,
      meal_type: meal.mealType,
      items: meal.items,
      total_kcal: meal.totalKcal,
    }, { onConflict: 'id' })
  }
}

export async function fetchMealsFromCloud(date: string): Promise<Meal[]> {
  const sb = createClient()
  const { data } = await sb
    .from('meals')
    .select('*')
    .eq('date', date)
    .order('created_at')

  return (data ?? []).map(r => ({
    id: r.id,
    date: r.date,
    mealType: r.meal_type,
    items: r.items,
    totalKcal: r.total_kcal,
  }))
}

export async function upsertMealCloud(meal: Meal) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return

  await sb.from('meals').upsert({
    id: meal.id,
    user_id: user.id,
    date: meal.date,
    meal_type: meal.mealType,
    items: meal.items,
    total_kcal: meal.totalKcal,
  }, { onConflict: 'id' })
}

export async function deleteMealCloud(id: string) {
  const sb = createClient()
  await sb.from('meals').delete().eq('id', id)
}

// ─── Exercise Sessions ────────────────────────────────────

export async function upsertExerciseCloud(session: ExerciseSession) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return

  await sb.from('exercise_sessions').upsert({
    id: session.id,
    user_id: user.id,
    date: session.date,
    type: session.type,
    duration_min: session.durationMin,
    steps: session.steps,
    burned_kcal: session.burnedKcal,
  }, { onConflict: 'id' })
}

export async function fetchExercisesFromCloud(date: string): Promise<ExerciseSession[]> {
  const sb = createClient()
  const { data } = await sb
    .from('exercise_sessions')
    .select('*')
    .eq('date', date)

  return (data ?? []).map(r => ({
    id: r.id,
    date: r.date,
    type: r.type,
    durationMin: r.duration_min,
    steps: r.steps,
    burnedKcal: r.burned_kcal,
  }))
}

// ─── Profile ──────────────────────────────────────────────

export async function upsertProfileCloud(profile: UserProfile) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return

  await sb.from('profiles').upsert({
    id: user.id,
    height_cm: profile.height,
    weight_kg: profile.weight,
    target_kcal: profile.targetKcal,
    goal: profile.goal,
    activity_level: profile.activityLevel,
    preferred_exercises: profile.preferredExercises,
  }, { onConflict: 'id' })
}

export async function fetchProfileFromCloud(): Promise<Partial<UserProfile> | null> {
  const sb = createClient()
  const { data } = await sb.from('profiles').select('*').single()
  if (!data) return null

  return {
    height: data.height_cm,
    weight: data.weight_kg,
    targetKcal: data.target_kcal,
    goal: data.goal,
    activityLevel: data.activity_level,
    preferredExercises: data.preferred_exercises ?? [],
    profileDone: true,
  }
}
