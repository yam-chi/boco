import { getMeals, getExerciseSessions } from './storage'

// 날짜별 순 kcal (섭취 - 소모) 계산
export function getNetKcalByDate(): Record<string, number> {
  const meals = getMeals()
  const sessions = getExerciseSessions()

  const eaten: Record<string, number> = {}
  for (const m of meals) {
    eaten[m.date] = (eaten[m.date] ?? 0) + m.totalKcal
  }

  const burned: Record<string, number> = {}
  for (const s of sessions) {
    burned[s.date] = (burned[s.date] ?? 0) + s.burnedKcal
  }

  const allDates = new Set([...Object.keys(eaten), ...Object.keys(burned)])
  const result: Record<string, number> = {}
  for (const d of allDates) {
    result[d] = (eaten[d] ?? 0) - (burned[d] ?? 0)
  }
  return result
}

export interface Forecast {
  avgDailyNet: number      // 최근 N일 평균 순 섭취
  avgDailyDiff: number     // 목표 대비 평균 차이 (양수 = 초과)
  weightChange30: number   // 30일 후 예상 체중 변화 (kg)
  weightChange7: number    // 7일 후 예상 체중 변화 (kg)
  datadays: number         // 기준 데이터 일수
  direction: 'up' | 'down' | 'stable'
}

// 1kg = 7700 kcal
const KCAL_PER_KG = 7700

export function calcForecast(targetKcal: number, lookbackDays = 7): Forecast | null {
  if (typeof window === 'undefined') return null
  const netByDate = getNetKcalByDate()

  const today = new Date()
  const dates: string[] = []
  for (let i = 0; i < lookbackDays; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }

  const recorded = dates.filter(d => netByDate[d] !== undefined)
  if (recorded.length === 0) return null

  const avgDailyNet = recorded.reduce((s, d) => s + netByDate[d], 0) / recorded.length
  const avgDailyDiff = avgDailyNet - targetKcal

  const weightChange7  = (avgDailyDiff * 7)  / KCAL_PER_KG
  const weightChange30 = (avgDailyDiff * 30) / KCAL_PER_KG

  const direction = Math.abs(avgDailyDiff) < 50
    ? 'stable'
    : avgDailyDiff > 0 ? 'up' : 'down'

  return { avgDailyNet, avgDailyDiff, weightChange30, weightChange7, datadays: recorded.length, direction }
}
