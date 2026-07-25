'use client'
import type { ExerciseSession } from '@/utils/storage'

export const MUSCLE_LABELS: Record<string, string> = {
  chest: '가슴', shoulders: '어깨', biceps: '이두', triceps: '삼두',
  abs: '복근', quads: '대퇴사두', calves: '종아리', upper_back: '승모근',
  lats: '광배근', lower_back: '허리', glutes: '둔근', hamstrings: '햄스트링',
  forearms: '전완',
}

export function getMuscleIntensity(sessions: ExerciseSession[], muscle: string): number {
  let count = 0
  sessions.forEach(s => { if (s.muscles?.includes(muscle)) count += (s.sets ?? 1) })
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 6) return 2
  return 3
}

function mColor(intensity: number): string {
  const colors = [
    'rgba(255,255,255,0.07)',
    'rgba(197,230,58,0.30)',
    'rgba(197,230,58,0.60)',
    'rgba(197,230,58,0.88)',
  ]
  return colors[Math.min(intensity, 3)]
}

function mStroke(intensity: number): string {
  return intensity > 0 ? 'rgba(197,230,58,0.4)' : 'rgba(255,255,255,0.1)'
}

interface Props { sessions: ExerciseSession[] }

export function BodyMapFront({ sessions }: Props) {
  const c = (muscle: string) => mColor(getMuscleIntensity(sessions, muscle))
  const s = (muscle: string) => mStroke(getMuscleIntensity(sessions, muscle))

  return (
    <svg viewBox="0 0 100 252" width="100" height="252" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ── Head ── */}
      <ellipse cx="50" cy="14" rx="12" ry="13" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>

      {/* ── Neck ── */}
      <path d="M44 26 Q44 37 44 38 L56 38 Q56 37 56 26 Z" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7"/>

      {/* ── Left Shoulder (deltoid) ── */}
      <path d="M30 42 Q18 42 12 52 Q9 60 13 68 Q20 64 28 66 L32 54 Z"
        fill={c('shoulders')} stroke={s('shoulders')} strokeWidth="0.8"/>
      {/* ── Right Shoulder ── */}
      <path d="M70 42 Q82 42 88 52 Q91 60 87 68 Q80 64 72 66 L68 54 Z"
        fill={c('shoulders')} stroke={s('shoulders')} strokeWidth="0.8"/>

      {/* ── Chest left pec ── */}
      <path d="M32 44 Q42 40 50 41 L50 66 Q42 70 34 68 Q29 62 32 54 Z"
        fill={c('chest')} stroke={s('chest')} strokeWidth="0.8"/>
      {/* ── Chest right pec ── */}
      <path d="M68 44 Q58 40 50 41 L50 66 Q58 70 66 68 Q71 62 68 54 Z"
        fill={c('chest')} stroke={s('chest')} strokeWidth="0.8"/>

      {/* ── Left Bicep ── */}
      <path d="M10 54 Q5 64 7 80 Q11 86 21 84 Q26 74 24 58 Q18 50 10 54 Z"
        fill={c('biceps')} stroke={s('biceps')} strokeWidth="0.8"/>
      {/* ── Right Bicep ── */}
      <path d="M90 54 Q95 64 93 80 Q89 86 79 84 Q74 74 76 58 Q82 50 90 54 Z"
        fill={c('biceps')} stroke={s('biceps')} strokeWidth="0.8"/>

      {/* ── Left Forearm ── */}
      <path d="M8 84 Q4 96 6 116 Q10 122 20 120 Q24 110 22 84 Q15 80 8 84 Z"
        fill={c('forearms')} stroke={s('forearms')} strokeWidth="0.8"/>
      {/* ── Right Forearm ── */}
      <path d="M92 84 Q96 96 94 116 Q90 122 80 120 Q76 110 78 84 Q85 80 92 84 Z"
        fill={c('forearms')} stroke={s('forearms')} strokeWidth="0.8"/>

      {/* ── Abs (6-pack) ── */}
      {/* top row */}
      <rect x="35" y="68" width="13" height="11" rx="3"
        fill={c('abs')} stroke={s('abs')} strokeWidth="0.8"/>
      <rect x="52" y="68" width="13" height="11" rx="3"
        fill={c('abs')} stroke={s('abs')} strokeWidth="0.8"/>
      {/* mid row */}
      <rect x="35" y="81" width="13" height="11" rx="3"
        fill={c('abs')} stroke={s('abs')} strokeWidth="0.8"/>
      <rect x="52" y="81" width="13" height="11" rx="3"
        fill={c('abs')} stroke={s('abs')} strokeWidth="0.8"/>
      {/* lower row */}
      <rect x="36" y="94" width="12" height="10" rx="3"
        fill={c('abs')} stroke={s('abs')} strokeWidth="0.8"/>
      <rect x="52" y="94" width="12" height="10" rx="3"
        fill={c('abs')} stroke={s('abs')} strokeWidth="0.8"/>

      {/* ── Hips ── */}
      <path d="M30 110 Q24 118 26 128 L74 128 Q76 118 70 110 Z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>

      {/* ── Left Quad ── */}
      <path d="M26 128 Q20 148 22 174 Q28 180 46 178 Q52 160 50 128 Z"
        fill={c('quads')} stroke={s('quads')} strokeWidth="0.8"/>
      {/* ── Right Quad ── */}
      <path d="M74 128 Q80 148 78 174 Q72 180 54 178 Q48 160 50 128 Z"
        fill={c('quads')} stroke={s('quads')} strokeWidth="0.8"/>

      {/* ── Knees ── */}
      <path d="M22 174 Q20 184 23 192 Q30 196 46 194 Q50 186 50 178 Z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>
      <path d="M78 174 Q80 184 77 192 Q70 196 54 194 Q50 186 50 178 Z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>

      {/* ── Left Calf ── */}
      <path d="M23 192 Q18 206 22 224 Q28 230 44 228 Q48 218 48 194 Z"
        fill={c('calves')} stroke={s('calves')} strokeWidth="0.8"/>
      {/* ── Right Calf ── */}
      <path d="M77 192 Q82 206 78 224 Q72 230 56 228 Q52 218 52 194 Z"
        fill={c('calves')} stroke={s('calves')} strokeWidth="0.8"/>

      {/* ── Feet ── */}
      <path d="M20 224 Q16 232 20 238 L46 238 Q50 234 48 228 Z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>
      <path d="M80 224 Q84 232 80 238 L54 238 Q50 234 52 228 Z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>

      {/* Label */}
      <text x="50" y="250" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="sans-serif">전면</text>
    </svg>
  )
}

export function BodyMapBack({ sessions }: Props) {
  const c = (muscle: string) => mColor(getMuscleIntensity(sessions, muscle))
  const s = (muscle: string) => mStroke(getMuscleIntensity(sessions, muscle))

  return (
    <svg viewBox="0 0 100 252" width="100" height="252" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ── Head ── */}
      <ellipse cx="50" cy="14" rx="12" ry="13" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>

      {/* ── Neck ── */}
      <path d="M44 26 Q44 37 44 38 L56 38 Q56 37 56 26 Z" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7"/>

      {/* ── Trapezius ── */}
      <path d="M44 28 Q50 24 56 28 L68 44 Q58 48 50 46 Q42 48 32 44 Z"
        fill={c('upper_back')} stroke={s('upper_back')} strokeWidth="0.8"/>

      {/* ── Left Rear Delt ── */}
      <path d="M30 42 Q18 42 12 52 Q9 60 13 68 Q20 64 28 66 L32 54 Z"
        fill={c('shoulders')} stroke={s('shoulders')} strokeWidth="0.8"/>
      {/* ── Right Rear Delt ── */}
      <path d="M70 42 Q82 42 88 52 Q91 60 87 68 Q80 64 72 66 L68 54 Z"
        fill={c('shoulders')} stroke={s('shoulders')} strokeWidth="0.8"/>

      {/* ── Left Lat ── */}
      <path d="M32 52 Q22 66 24 90 Q28 100 36 102 L38 70 Z"
        fill={c('lats')} stroke={s('lats')} strokeWidth="0.8"/>
      {/* ── Right Lat ── */}
      <path d="M68 52 Q78 66 76 90 Q72 100 64 102 L62 70 Z"
        fill={c('lats')} stroke={s('lats')} strokeWidth="0.8"/>

      {/* ── Upper back (rhomboids) ── */}
      <path d="M34 48 Q42 44 50 44 Q58 44 66 48 L64 74 Q58 78 50 78 Q42 78 36 74 Z"
        fill={c('upper_back')} stroke={s('upper_back')} strokeWidth="0.8"/>

      {/* ── Left Tricep ── */}
      <path d="M10 54 Q5 64 7 80 Q11 86 21 84 Q26 74 24 58 Q18 50 10 54 Z"
        fill={c('triceps')} stroke={s('triceps')} strokeWidth="0.8"/>
      {/* ── Right Tricep ── */}
      <path d="M90 54 Q95 64 93 80 Q89 86 79 84 Q74 74 76 58 Q82 50 90 54 Z"
        fill={c('triceps')} stroke={s('triceps')} strokeWidth="0.8"/>

      {/* ── Left Forearm ── */}
      <path d="M8 84 Q4 96 6 116 Q10 122 20 120 Q24 110 22 84 Q15 80 8 84 Z"
        fill={c('forearms')} stroke={s('forearms')} strokeWidth="0.8"/>
      {/* ── Right Forearm ── */}
      <path d="M92 84 Q96 96 94 116 Q90 122 80 120 Q76 110 78 84 Q85 80 92 84 Z"
        fill={c('forearms')} stroke={s('forearms')} strokeWidth="0.8"/>

      {/* ── Lower back (erectors) ── */}
      <rect x="37" y="80" width="10" height="26" rx="4"
        fill={c('lower_back')} stroke={s('lower_back')} strokeWidth="0.8"/>
      <rect x="53" y="80" width="10" height="26" rx="4"
        fill={c('lower_back')} stroke={s('lower_back')} strokeWidth="0.8"/>

      {/* ── Glutes ── */}
      <path d="M28 110 Q22 120 24 134 Q34 140 50 138 Q66 140 76 134 Q78 120 72 110 Z"
        fill={c('glutes')} stroke={s('glutes')} strokeWidth="0.8"/>

      {/* ── Left Hamstring ── */}
      <path d="M26 136 Q18 156 20 176 Q26 182 46 180 Q52 162 50 136 Z"
        fill={c('hamstrings')} stroke={s('hamstrings')} strokeWidth="0.8"/>
      {/* ── Right Hamstring ── */}
      <path d="M74 136 Q82 156 80 176 Q74 182 54 180 Q48 162 50 136 Z"
        fill={c('hamstrings')} stroke={s('hamstrings')} strokeWidth="0.8"/>

      {/* ── Knees ── */}
      <path d="M20 176 Q18 186 21 194 Q28 198 46 196 Q50 188 50 180 Z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>
      <path d="M80 176 Q82 186 79 194 Q72 198 54 196 Q50 188 50 180 Z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>

      {/* ── Left Calf ── */}
      <path d="M21 194 Q16 210 20 226 Q27 232 44 230 Q48 220 48 196 Z"
        fill={c('calves')} stroke={s('calves')} strokeWidth="0.8"/>
      {/* ── Right Calf ── */}
      <path d="M79 194 Q84 210 80 226 Q73 232 56 230 Q52 220 52 196 Z"
        fill={c('calves')} stroke={s('calves')} strokeWidth="0.8"/>

      {/* ── Feet ── */}
      <path d="M18 226 Q14 234 18 240 L46 240 Q50 236 48 230 Z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>
      <path d="M82 226 Q86 234 82 240 L54 240 Q50 236 52 230 Z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>

      {/* Label */}
      <text x="50" y="250" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="sans-serif">후면</text>
    </svg>
  )
}
