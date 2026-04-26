import { STATUS_DIRECTION } from '@/utils/boco'
import type { BocoStatus } from '@/utils/boco'

interface Props {
  totalKcal: number
  targetKcal: number
  status: BocoStatus
  mini?: boolean
  onClick?: () => void
}

const STATUS_STYLE = {
  good:  { barColor: 'bg-lime',      numColor: 'text-lime',   pillBg: 'bg-lime',     pillText: 'text-dark' },
  over:  { barColor: 'bg-orange',    numColor: 'text-orange', pillBg: 'bg-orange',   pillText: 'text-white' },
  under: { barColor: 'bg-white/50',  numColor: 'text-white',  pillBg: 'bg-white/15', pillText: 'text-white/70' },
  empty: { barColor: 'bg-white/20',  numColor: 'text-white',  pillBg: 'bg-white/10', pillText: 'text-white/40' },
}

export default function BocoCard({ totalKcal, targetKcal, status, mini = false, onClick }: Props) {
  const style = STATUS_STYLE[status]
  const dir   = STATUS_DIRECTION[status]
  const pct   = targetKcal > 0 ? Math.min((totalKcal / targetKcal) * 100, 100) : 0
  const diff  = totalKcal - targetKcal

  /* ── mini (운동 탭 상단) ── */
  if (mini) {
    return (
      <div className="bg-dark rounded-[20px] p-4">
        <div className="flex items-center gap-3 mb-3">
          <CompassNeedle angle={dir.needleAngle} status={status} size={36} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase">TODAY'S BOCO</div>
            <div className="text-[16px] font-black text-white tracking-tight leading-tight">{dir.heading}</div>
          </div>
          <div className={`${style.pillBg} ${style.pillText} text-[11px] font-black px-3 py-1.5 rounded-full flex-shrink-0`}>
            {totalKcal > 0 ? `${totalKcal.toLocaleString()} kcal` : '기록 없음'}
          </div>
        </div>
        {status !== 'empty' && (
          <KcalBar pct={pct} diff={diff} status={status} style={style} targetKcal={targetKcal} />
        )}
      </div>
    )
  }

  /* ── full (홈 탭) ── */
  return (
    <div
      className="mx-4 mt-4 bg-dark rounded-[24px] p-5 relative overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* 배경 데코 */}
      <div className="absolute -right-6 -top-6 w-[140px] h-[140px] rounded-full border-[32px] border-white/[0.03]" />

      <div className="text-[10px] font-bold text-white/35 tracking-widest uppercase mb-4">TODAY'S BOCO</div>

      {/* 히어로: 나침반 + 방향 선언 */}
      <div className="flex items-center gap-4 mb-5">
        <CompassNeedle angle={dir.needleAngle} status={status} size={72} />
        <div className="flex-1 min-w-0">
          <div className={`text-[28px] font-black tracking-tight leading-tight ${style.numColor}`}>
            {dir.heading}
          </div>
          <div className="text-[13px] text-white/50 mt-1 leading-snug">{dir.sub}</div>
        </div>
      </div>

      {/* 보조: kcal 수치 + 게이지 */}
      {status === 'empty' ? (
        <div className="text-[12px] text-white/25 text-center py-1">식사를 기록하면 방향이 잡혀요</div>
      ) : (
        <>
          <div className="flex items-baseline gap-1 mb-2">
            <span className={`text-[22px] font-black tracking-tight ${style.numColor}`}>
              {totalKcal.toLocaleString()}
            </span>
            <span className="text-[13px] text-white/30">/ {targetKcal.toLocaleString()} kcal</span>
          </div>
          <KcalBar pct={pct} diff={diff} status={status} style={style} targetKcal={targetKcal} />
        </>
      )}

      {onClick && (
        <div className="mt-3 text-right">
          <span className="text-[11px] text-white/25">운동 옵션 보기 →</span>
        </div>
      )}
    </div>
  )
}

/* ── 나침반 바늘 SVG ── */
function CompassNeedle({ angle, status, size }: { angle: number; status: BocoStatus; size: number }) {
  const isEmpty = status === 'empty'
  // 바늘은 중심 기준 회전
  const r = size / 2
  const needleLen = r * 0.62
  const cx = r
  const cy = r

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
      style={{ opacity: isEmpty ? 0.4 : 1 }}
    >
      {/* 외부 링 */}
      <circle cx={cx} cy={cy} r={r - 1} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none" />
      {/* 내부 링 */}
      <circle cx={cx} cy={cy} r={r * 0.62} stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />

      {/* 방위 틱 (N/E/S/W) */}
      {[0, 90, 180, 270].map(deg => {
        const rad = (deg - 90) * (Math.PI / 180)
        const x1 = cx + (r - 3) * Math.cos(rad)
        const y1 = cy + (r - 3) * Math.sin(rad)
        const x2 = cx + (r - 8) * Math.cos(rad)
        const y2 = cy + (r - 8) * Math.sin(rad)
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      })}

      {/* N 마크 */}
      <text
        x={cx}
        y={cy - r + 16}
        textAnchor="middle"
        fontSize={size * 0.14}
        fontWeight="900"
        fill="rgba(255,255,255,0.3)"
        fontFamily="sans-serif"
      >N</text>

      {/* 목표 범위 호 (±15% = good zone) */}
      {!isEmpty && (
        <path
          d={describeArc(cx, cy, r * 0.62, -20, 20)}
          stroke="#C5E63A"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
      )}

      {/* 바늘 (status 각도로 회전) */}
      <g transform={`rotate(${angle}, ${cx}, ${cy})`}>
        {/* 북쪽 (라임/주황/흰) */}
        <polygon
          points={`${cx},${cy - needleLen} ${cx - size * 0.055},${cy + size * 0.08} ${cx + size * 0.055},${cy + size * 0.08}`}
          fill={status === 'over' ? '#FF6B35' : status === 'under' ? 'rgba(255,255,255,0.6)' : '#C5E63A'}
        />
        {/* 남쪽 (어두운) */}
        <polygon
          points={`${cx},${cy + needleLen * 0.55} ${cx - size * 0.04},${cy + size * 0.08} ${cx + size * 0.04},${cy + size * 0.08}`}
          fill="rgba(255,255,255,0.12)"
        />
        {/* 중심 점 */}
        <circle cx={cx} cy={cy} r={size * 0.055} fill="#1A1A1A" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      </g>
    </svg>
  )
}

/* SVG 호 경로 헬퍼 */
function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d - 90) * (Math.PI / 180)
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
}

/* ── 칼로리 게이지 바 ── */
function KcalBar({ pct, diff, status, style, targetKcal }: {
  pct: number
  diff: number
  status: BocoStatus
  style: typeof STATUS_STYLE[BocoStatus]
  targetKcal: number
}) {
  return (
    <div>
      <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.barColor}`}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute top-0 right-0 h-full w-[2px] bg-white/15" />
      </div>
      <div className="flex justify-between items-center mt-1.5">
        <div className="flex gap-2">
          {[0.25, 0.5, 0.75, 1.0].map(mark => (
            <span key={mark} className={`text-[9px] ${pct / 100 >= mark ? 'text-white/40' : 'text-white/15'}`}>
              {Math.round(targetKcal * mark).toLocaleString()}
            </span>
          ))}
        </div>
        <span className={`text-[11px] font-black ${
          status === 'over' ? 'text-orange' : status === 'good' ? 'text-lime' : 'text-white/40'
        }`}>
          {status === 'over'  ? `+${diff.toLocaleString()} kcal` :
           status === 'under' ? `-${Math.abs(diff).toLocaleString()} kcal` :
           `${Math.round(pct)}%`}
        </span>
      </div>
    </div>
  )
}
