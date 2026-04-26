import type { BocoStatus } from '@/utils/boco'

interface Props {
  totalKcal: number
  targetKcal: number
  status: BocoStatus
  mini?: boolean
  onClick?: () => void
}

const STATUS_CONFIG = {
  good:  { kcalColor: 'text-lime',   pillBg: 'bg-lime',      pillText: 'text-dark',     label: '잘하고 있어요!',           barColor: 'bg-lime' },
  over:  { kcalColor: 'text-orange', pillBg: 'bg-orange',    pillText: 'text-white',    label: '조금 많아요',              barColor: 'bg-orange' },
  under: { kcalColor: 'text-white',  pillBg: 'bg-white/15',  pillText: 'text-white/70', label: '조금 부족해요',            barColor: 'bg-white/50' },
  empty: { kcalColor: 'text-white',  pillBg: 'bg-white/10',  pillText: 'text-white/50', label: '식사를 기록하면 BOCO가 켜져요', barColor: 'bg-white/20' },
}

export default function BocoCard({ totalKcal, targetKcal, status, mini = false, onClick }: Props) {
  const cfg = STATUS_CONFIG[status]
  const pct = targetKcal > 0 ? Math.min((totalKcal / targetKcal) * 100, 100) : 0
  const diff = totalKcal - targetKcal

  if (mini) {
    return (
      <div className="bg-dark rounded-[20px] p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1">TODAY'S BOCO</div>
            <div className={`text-[22px] font-black tracking-tight ${cfg.kcalColor}`}>
              {totalKcal.toLocaleString()} <span className="text-[14px] text-white/30">/ {targetKcal.toLocaleString()} kcal</span>
            </div>
          </div>
          <div className={`${cfg.pillBg} ${cfg.pillText} text-[11px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
            {status === 'good' && <CheckIcon />}
            {cfg.label}
          </div>
        </div>
        {status !== 'empty' && (
          <KcalBar pct={pct} diff={diff} status={status} cfg={cfg} targetKcal={targetKcal} />
        )}
      </div>
    )
  }

  return (
    <div
      className="mx-4 mt-4 bg-dark rounded-[24px] p-5 relative overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* deco circle */}
      <div className="absolute -right-5 -top-5 w-[120px] h-[120px] rounded-full border-[28px] border-white/5" />

      <div className="text-[11px] font-bold text-white/40 tracking-widest uppercase mb-2.5">TODAY'S BOCO</div>

      <div className="flex items-baseline gap-1.5 mb-4">
        <span className={`text-[40px] font-black tracking-tight leading-none ${cfg.kcalColor}`}>
          {status === 'empty' ? '—' : totalKcal.toLocaleString()}
        </span>
        <span className="text-[20px] text-white/30">/</span>
        <span className="text-[20px] font-bold text-white/40">
          {status === 'empty' ? '—' : targetKcal.toLocaleString()}
        </span>
        <span className="text-[13px] text-white/30 ml-0.5">kcal</span>
      </div>

      {status !== 'empty' && (
        <KcalBar pct={pct} diff={diff} status={status} cfg={cfg} targetKcal={targetKcal} />
      )}

      <div className="mt-3 flex justify-between items-center">
        <span className={`inline-flex items-center gap-1.5 ${cfg.pillBg} ${cfg.pillText} text-[12px] font-bold px-3 py-1.5 rounded-full`}>
          {status === 'good' && <CheckIcon />}
          {status === 'empty' && <CompassMiniIcon />}
          {cfg.label}
        </span>
        {onClick && <span className="text-[11px] text-white/30">옵션 보기 →</span>}
      </div>
    </div>
  )
}

function KcalBar({ pct, diff, status, cfg, targetKcal }: {
  pct: number
  diff: number
  status: BocoStatus
  cfg: typeof STATUS_CONFIG[BocoStatus]
  targetKcal: number
}) {
  return (
    <div>
      {/* bar track */}
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${cfg.barColor}`}
          style={{ width: `${pct}%` }}
        />
        {/* target marker */}
        <div className="absolute top-0 right-0 h-full w-[2px] bg-white/20 rounded-full" />
      </div>

      {/* labels below bar */}
      <div className="flex justify-between items-center mt-1.5">
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${cfg.barColor}`} />
          <span className="text-[10px] text-white/40">섭취</span>
        </div>
        <span className={`text-[11px] font-black ${
          status === 'over' ? 'text-orange' :
          status === 'good' ? 'text-lime' : 'text-white/50'
        }`}>
          {status === 'over'
            ? `+${diff.toLocaleString()} kcal 초과`
            : status === 'under'
            ? `-${Math.abs(diff).toLocaleString()} kcal 부족`
            : `목표 달성 ${Math.round(pct)}%`}
        </span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="text-[10px] text-white/40">목표</span>
        </div>
      </div>

      {/* segment breakdown */}
      <div className="flex gap-1 mt-2">
        {[0.25, 0.5, 0.75, 1.0].map((mark) => {
          const filled = pct / 100 >= mark
          const label = Math.round(targetKcal * mark)
          return (
            <div key={mark} className="flex-1 flex flex-col items-center gap-0.5">
              <div className={`w-full h-[3px] rounded-full ${filled ? cfg.barColor : 'bg-white/10'}`} />
              <span className="text-[9px] text-white/25">{label.toLocaleString()}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="6.5" fill="#1A1A1A" />
      <path d="M3.5 6.5l2 2 4-4" stroke="#C5E63A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CompassMiniIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      <path d="M6 2 L5 6.5 L6 6 L7 6.5 Z" fill="rgba(255,255,255,0.5)" />
      <path d="M6 10 L5 5.5 L6 6 L7 5.5 Z" fill="rgba(255,255,255,0.2)" />
    </svg>
  )
}
