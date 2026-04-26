import type { Meal } from '@/utils/storage'

interface Props {
  meals: Meal[]
  onAdd: (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void
}

const MEAL_CONFIG = {
  breakfast: { label: '아침', cardStyle: 'bg-dark', textStyle: 'text-lime', subStyle: 'text-white/50', unitStyle: 'text-white/35', icon: <SunriseIcon /> },
  lunch:     { label: '점심', cardStyle: 'bg-lime', textStyle: 'text-dark', subStyle: 'text-dark/50',  unitStyle: 'text-dark/35',  icon: <SunIcon /> },
  dinner:    { label: '저녁', cardStyle: 'bg-dark', textStyle: 'text-lime', subStyle: 'text-white/50', unitStyle: 'text-white/35', icon: <MoonIcon /> },
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const

export default function MealCardRow({ meals, onAdd }: Props) {
  const snack = meals.find(m => m.mealType === 'snack')

  return (
    <div className="px-4 pt-4">
      <div className="text-[11px] font-black text-gray-mid tracking-widest uppercase mb-3">오늘의 식사</div>

      {/* 아침 점심 저녁 row */}
      <div className="flex gap-2.5">
        {MEAL_TYPES.map((type) => {
          const meal = meals.find(m => m.mealType === type)
          const cfg = MEAL_CONFIG[type]

          if (!meal) {
            return (
              <button
                key={type}
                onClick={() => onAdd(type)}
                className="flex-1 rounded-[18px] border-2 border-dashed border-gray-light bg-white flex flex-col items-center justify-center gap-2 cursor-pointer"
                style={{ minHeight: 148 }}
              >
                <div className="w-9 h-9 rounded-[10px] bg-lime flex items-center justify-center">
                  <PlusIcon />
                </div>
                <span className="text-[11px] font-bold text-gray-mid">{cfg.label}</span>
              </button>
            )
          }

          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className={`flex-1 rounded-[18px] p-3.5 flex flex-col gap-1.5 text-left ${cfg.cardStyle}`}
              style={{ minHeight: 148 }}
            >
              <span className={`text-[10px] font-black tracking-wide ${cfg.subStyle}`}>{cfg.label}</span>
              <div className="mt-1">{cfg.icon}</div>
              <div className="flex flex-col gap-0.5 mt-auto">
                {meal.items.slice(0, 3).map((item, i) => (
                  <span key={i} className={`text-[10px] truncate ${cfg.subStyle}`}>{item.name}</span>
                ))}
              </div>
              <span className={`text-[18px] font-black tracking-tight mt-auto ${cfg.textStyle}`}>
                {meal.totalKcal.toLocaleString()}
              </span>
              <span className={`text-[10px] font-bold -mt-1 ${cfg.unitStyle}`}>kcal</span>
            </button>
          )
        })}
      </div>

      {/* 간식 row */}
      <button
        onClick={() => onAdd('snack')}
        className={`mt-2.5 w-full rounded-[16px] flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors ${snack ? 'bg-white border-2 border-gray-light' : 'border-2 border-dashed border-gray-light bg-white'}`}
      >
        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${snack ? 'bg-lime' : 'bg-gray-50'}`}>
          {snack ? <CookieIcon /> : <PlusIcon />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-black text-dark">간식</div>
          {snack ? (
            <div className="text-[11px] text-gray-mid truncate mt-0.5">
              {snack.items.map(i => i.name).join(', ')}
            </div>
          ) : (
            <div className="text-[11px] text-gray-mid">간식을 기록해보세요</div>
          )}
        </div>
        {snack && (
          <div className="flex-shrink-0 text-right">
            <div className="text-[16px] font-black text-dark">{snack.totalKcal.toLocaleString()}</div>
            <div className="text-[10px] text-gray-mid">kcal</div>
          </div>
        )}
        {!snack && (
          <div className="text-[11px] text-gray-mid flex-shrink-0">추가</div>
        )}
      </button>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 3v12M3 9h12" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function CookieIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8.5" fill="#1A1A1A" />
      <circle cx="8" cy="9" r="1.2" fill="#C5E63A" />
      <circle cx="13" cy="8" r="1" fill="#C5E63A" />
      <circle cx="9" cy="13.5" r="1.2" fill="#C5E63A" />
      <circle cx="14" cy="13" r="1" fill="#C5E63A" />
    </svg>
  )
}

function SunriseIcon() {
  return (
    <svg width="32" height="26" viewBox="0 0 32 26" fill="none">
      <path d="M2 18h28" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 18A8 8 0 0 1 8 18" fill="none" stroke="#C5E63A" strokeWidth="2" />
      <path d="M16 18A8 8 0 0 0 24 18" fill="none" stroke="#C5E63A" strokeWidth="2" />
      <circle cx="16" cy="18" r="3.5" fill="#C5E63A" />
      <line x1="16" y1="4" x2="16" y2="8" stroke="#C5E63A" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="8" x2="9" y2="11" stroke="#C5E63A" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="8" x2="23" y2="11" stroke="#C5E63A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="6" fill="#1A1A1A" />
      <line x1="15" y1="1" x2="15" y2="5" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="25" x2="15" y2="29" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="1" y1="15" x2="5" y2="15" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="25" y1="15" x2="29" y2="15" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4.5" y1="4.5" x2="7.5" y2="7.5" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
      <line x1="22.5" y1="22.5" x2="25.5" y2="25.5" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
      <line x1="25.5" y1="4.5" x2="22.5" y2="7.5" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
      <line x1="7.5" y1="22.5" x2="4.5" y2="25.5" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M22 16a10 10 0 01-10-10 10 10 0 000 20 10 10 0 0010-10z" fill="#C5E63A" />
      <circle cx="22" cy="8" r="2" fill="rgba(255,255,255,0.25)" />
      <circle cx="26" cy="13" r="1.2" fill="rgba(255,255,255,0.18)" />
    </svg>
  )
}
