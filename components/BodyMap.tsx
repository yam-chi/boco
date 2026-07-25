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

  return (
    <div className="relative w-full rounded-[16px] overflow-hidden">
      <img
        src="/body-map.png"
        alt="body map"
        className="w-full block"
        style={{ filter: 'invert(1) brightness(0.82)' }}
        draggable={false}
      />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ─── 전면 (Front) ─── */}

        {/* 어깨 */}
        <ellipse cx="14.5" cy="24" rx="4.5" ry="5" fill={f('shoulders')} />
        <ellipse cx="35.5" cy="24" rx="4.5" ry="5" fill={f('shoulders')} />

        {/* 가슴 */}
        <ellipse cx="22" cy="28" rx="5" ry="5.5" fill={f('chest')} />
        <ellipse cx="28" cy="28" rx="5" ry="5.5" fill={f('chest')} />

        {/* 이두 */}
        <ellipse cx="12.5" cy="34" rx="3.5" ry="7" fill={f('biceps')} />
        <ellipse cx="37.5" cy="34" rx="3.5" ry="7" fill={f('biceps')} />

        {/* 전완 */}
        <ellipse cx="11" cy="47" rx="3" ry="6.5" fill={f('forearms')} />
        <ellipse cx="39" cy="47" rx="3" ry="6.5" fill={f('forearms')} />

        {/* 복근 */}
        <rect x="21.5" y="35" width="4.5" height="5" rx="1.5" fill={f('abs')} />
        <rect x="27" y="35" width="4.5" height="5" rx="1.5" fill={f('abs')} />
        <rect x="21.5" y="41.5" width="4.5" height="5" rx="1.5" fill={f('abs')} />
        <rect x="27" y="41.5" width="4.5" height="5" rx="1.5" fill={f('abs')} />
        <rect x="22" y="48" width="4" height="4.5" rx="1.5" fill={f('abs')} />
        <rect x="27" y="48" width="4" height="4.5" rx="1.5" fill={f('abs')} />

        {/* 대퇴사두 */}
        <ellipse cx="22" cy="67" rx="4" ry="8" fill={f('quads')} />
        <ellipse cx="28" cy="67" rx="4" ry="8" fill={f('quads')} />

        {/* 종아리 */}
        <ellipse cx="22" cy="81" rx="3" ry="5" fill={f('calves')} />
        <ellipse cx="28" cy="81" rx="3" ry="5" fill={f('calves')} />

        {/* ─── 후면 (Back) ─── */}

        {/* 승모근 / 상부등 */}
        <ellipse cx="73.5" cy="22" rx="8" ry="5.5" fill={f('upper_back')} />

        {/* 어깨 후면 */}
        <ellipse cx="63" cy="24" rx="4.5" ry="5" fill={f('shoulders')} />
        <ellipse cx="84" cy="24" rx="4.5" ry="5" fill={f('shoulders')} />

        {/* 삼두 */}
        <ellipse cx="61.5" cy="34" rx="3.5" ry="7" fill={f('triceps')} />
        <ellipse cx="85.5" cy="34" rx="3.5" ry="7" fill={f('triceps')} />

        {/* 전완 후면 */}
        <ellipse cx="60" cy="47" rx="3" ry="6.5" fill={f('forearms')} />
        <ellipse cx="87" cy="47" rx="3" ry="6.5" fill={f('forearms')} />

        {/* 광배근 */}
        <ellipse cx="64" cy="38" rx="4" ry="9" fill={f('lats')} />
        <ellipse cx="83" cy="38" rx="4" ry="9" fill={f('lats')} />

        {/* 허리 (척추기립근) */}
        <rect x="70.5" y="42" width="3" height="9" rx="1.5" fill={f('lower_back')} />
        <rect x="74.5" y="42" width="3" height="9" rx="1.5" fill={f('lower_back')} />

        {/* 둔근 */}
        <ellipse cx="70.5" cy="58" rx="5.5" ry="5" fill={f('glutes')} />
        <ellipse cx="76.5" cy="58" rx="5.5" ry="5" fill={f('glutes')} />

        {/* 햄스트링 */}
        <ellipse cx="70" cy="68.5" rx="4" ry="8" fill={f('hamstrings')} />
        <ellipse cx="77" cy="68.5" rx="4" ry="8" fill={f('hamstrings')} />

        {/* 종아리 후면 */}
        <ellipse cx="70" cy="81" rx="3" ry="5" fill={f('calves')} />
        <ellipse cx="77" cy="81" rx="3" ry="5" fill={f('calves')} />
      </svg>
    </div>
  )
}
