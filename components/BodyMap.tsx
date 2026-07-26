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

function alpha(intensity: number): number {
  return [0, 0.38, 0.65, 0.88][Math.min(intensity, 3)]
}

interface Props { sessions: ExerciseSession[] }

// 이미지 좌표 (viewBox 0 0 100 100 기준, 이미지는 정사각형 1080x1080)
// 전면(front): x 8~43%, y 5~87%
// 후면(back):  x 55~92%, y 5~87%

export default function BodyMapOverlay({ sessions }: Props) {
  const f = (muscle: string) => {
    const a = alpha(getMuscleIntensity(sessions, muscle))
    return `rgba(197,230,58,${a})`
  }

  // Image is 1254×1254. Body figures occupy y=7%~70%; bottom 30% is labels/empty.
  // Crop to 72% height, then SVG viewBox "0 0 100 72" maps to cropped area.
  return (
    <div className="relative w-full rounded-[16px] overflow-hidden" style={{ paddingBottom: '72%' }}>
      <img
        src="/body-map.png"
        alt="body map"
        className="absolute top-0 left-0 w-full"
        style={{ filter: 'invert(1) brightness(0.82)' }}
        draggable={false}
      />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 72"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ─── 전면 (Front) ─── */}

        {/* 어깨 */}
        <ellipse cx="17" cy="22" rx="3.5" ry="4" fill={f('shoulders')} />
        <ellipse cx="31" cy="22" rx="3.5" ry="4" fill={f('shoulders')} />

        {/* 가슴 */}
        <ellipse cx="21" cy="27" rx="4" ry="4.5" fill={f('chest')} />
        <ellipse cx="28" cy="27" rx="4" ry="4.5" fill={f('chest')} />

        {/* 이두 */}
        <ellipse cx="14.5" cy="32" rx="3" ry="5.5" fill={f('biceps')} />
        <ellipse cx="33.5" cy="32" rx="3" ry="5.5" fill={f('biceps')} />

        {/* 전완 */}
        <ellipse cx="12.5" cy="40" rx="2.5" ry="3.5" fill={f('forearms')} />
        <ellipse cx="35" cy="40" rx="2.5" ry="3.5" fill={f('forearms')} />

        {/* 복근 */}
        <rect x="20.5" y="27" width="3.5" height="4" rx="1.5" fill={f('abs')} />
        <rect x="24.5" y="27" width="3.5" height="4" rx="1.5" fill={f('abs')} />
        <rect x="20.5" y="32" width="3.5" height="4" rx="1.5" fill={f('abs')} />
        <rect x="24.5" y="32" width="3.5" height="4" rx="1.5" fill={f('abs')} />
        <rect x="21" y="37" width="3" height="4" rx="1.5" fill={f('abs')} />
        <rect x="24.5" y="37" width="3" height="4" rx="1.5" fill={f('abs')} />

        {/* 대퇴사두 */}
        <ellipse cx="21" cy="49" rx="3.5" ry="5.5" fill={f('quads')} />
        <ellipse cx="27" cy="49" rx="3.5" ry="5.5" fill={f('quads')} />

        {/* 종아리 */}
        <ellipse cx="21" cy="62" rx="2.5" ry="4" fill={f('calves')} />
        <ellipse cx="27" cy="62" rx="2.5" ry="4" fill={f('calves')} />

        {/* ─── 후면 (Back) ─── */}

        {/* 승모근 / 상부등 */}
        <ellipse cx="72" cy="22" rx="7" ry="4.5" fill={f('upper_back')} />

        {/* 어깨 후면 */}
        <ellipse cx="64" cy="22" rx="3.5" ry="4" fill={f('shoulders')} />
        <ellipse cx="80" cy="22" rx="3.5" ry="4" fill={f('shoulders')} />

        {/* 삼두 */}
        <ellipse cx="61" cy="32" rx="3" ry="5.5" fill={f('triceps')} />
        <ellipse cx="83" cy="32" rx="3" ry="5.5" fill={f('triceps')} />

        {/* 전완 후면 */}
        <ellipse cx="59" cy="40" rx="2.5" ry="3.5" fill={f('forearms')} />
        <ellipse cx="85" cy="40" rx="2.5" ry="3.5" fill={f('forearms')} />

        {/* 광배근 */}
        <ellipse cx="65" cy="31" rx="3.5" ry="7" fill={f('lats')} />
        <ellipse cx="79" cy="31" rx="3.5" ry="7" fill={f('lats')} />

        {/* 허리 (척추기립근) */}
        <rect x="70" y="36" width="2.5" height="7" rx="1.5" fill={f('lower_back')} />
        <rect x="73.5" y="36" width="2.5" height="7" rx="1.5" fill={f('lower_back')} />

        {/* 둔근 */}
        <ellipse cx="67.5" cy="43" rx="5" ry="4.5" fill={f('glutes')} />
        <ellipse cx="77.5" cy="43" rx="5" ry="4.5" fill={f('glutes')} />

        {/* 햄스트링 */}
        <ellipse cx="68" cy="52" rx="3.5" ry="5.5" fill={f('hamstrings')} />
        <ellipse cx="77" cy="52" rx="3.5" ry="5.5" fill={f('hamstrings')} />

        {/* 종아리 후면 */}
        <ellipse cx="68" cy="62" rx="2.5" ry="4" fill={f('calves')} />
        <ellipse cx="77" cy="62" rx="2.5" ry="4" fill={f('calves')} />
      </svg>
    </div>
  )
}
