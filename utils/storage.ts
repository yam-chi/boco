export interface UserProfile {
  weight: number
  height: number
  goal: 'loss' | 'maintain' | 'gain'
  activityLevel: 1.2 | 1.375 | 1.55 | 1.725
  targetKcal: number
  preferredExercises: string[]
  profileDone: boolean
}

export interface MealItem {
  name: string
  kcal: number
}

export interface Meal {
  id: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  items: MealItem[]
  totalKcal: number
}

export interface DailyLog {
  date: string
  totalKcal: number
  bocoStatus: 'good' | 'over' | 'under'
  optionSelected: 'nothing' | 'exercise' | null
}

export interface ExerciseLog {
  date: string
  cardType: 'rest' | 'preferred' | 'recommended' | 'custom'
  exercises: string[]
}

const KEYS = {
  profile: 'boco_profile',
  meals: 'boco_meals',
  logs: 'boco_logs',
  exerciseLogs: 'boco_exercise_logs',
  splash: 'boco_splash_seen',
}

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(KEYS.profile)
  return raw ? JSON.parse(raw) : null
}

export function saveProfile(p: UserProfile) {
  localStorage.setItem(KEYS.profile, JSON.stringify(p))
}

export function getMeals(): Meal[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(KEYS.meals)
  return raw ? JSON.parse(raw) : []
}

export function saveMeals(meals: Meal[]) {
  localStorage.setItem(KEYS.meals, JSON.stringify(meals))
}

export function getTodayMeals(): Meal[] {
  const today = new Date().toISOString().slice(0, 10)
  return getMeals().filter(m => m.date === today)
}

export function upsertMeal(meal: Meal) {
  const meals = getMeals().filter(m => !(m.date === meal.date && m.mealType === meal.mealType))
  saveMeals([...meals, meal])
}

export function getDailyLogs(): DailyLog[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(KEYS.logs)
  return raw ? JSON.parse(raw) : []
}

export function getExerciseLogs(): ExerciseLog[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(KEYS.exerciseLogs)
  return raw ? JSON.parse(raw) : []
}

export function saveExerciseLog(log: ExerciseLog) {
  const logs = getExerciseLogs().filter(l => l.date !== log.date)
  localStorage.setItem(KEYS.exerciseLogs, JSON.stringify([...logs, log]))
}

export function isSplashSeen(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(KEYS.splash)
}

export function markSplashSeen() {
  localStorage.setItem(KEYS.splash, '1')
}

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}
