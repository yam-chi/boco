export interface ExerciseType {
  name: string
  met: number
  unit: 'time' | 'steps'
}

export const EXERCISE_TYPES: ExerciseType[] = [
  { name: '걷기',       met: 3.5,  unit: 'time'  },
  { name: '빠른 걷기',  met: 4.8,  unit: 'time'  },
  { name: '달리기',     met: 9.3,  unit: 'time'  },
  { name: '자전거',     met: 6.8,  unit: 'time'  },
  { name: '수영',       met: 8.0,  unit: 'time'  },
  { name: '헬스',       met: 5.0,  unit: 'time'  },
  { name: '요가',       met: 2.5,  unit: 'time'  },
  { name: 'HIIT',       met: 11.0, unit: 'time'  },
  { name: '걸음수',     met: 0,    unit: 'steps' },
]

export function calcBurnedKcal(typeName: string, weightKg: number, durationMin: number): number {
  const ex = EXERCISE_TYPES.find(e => e.name === typeName)
  if (!ex || ex.unit !== 'time') return 0
  return Math.round(ex.met * weightKg * (durationMin / 60))
}

export function stepsToKcal(steps: number, weightKg: number): number {
  return Math.round(steps * 0.045 * (weightKg / 70))
}
