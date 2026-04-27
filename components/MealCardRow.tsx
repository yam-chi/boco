'use client'
import { useState, useEffect } from 'react'
import type { Meal } from '@/utils/storage'
import type { BocoStatus } from '@/utils/boco'

interface Props {
  meals: Meal[]
  status: BocoStatus
  onAdd: (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void
}

const MEAL_CONFIG = {
  breakfast: { label: '아침', cardStyle: 'bg-dark', textStyle: 'text-lime', subStyle: 'text-white/50', unitStyle: 'text-white/35', icon: <SunriseIcon /> },
  lunch:     { label: '점심', cardStyle: 'bg-lime', textStyle: 'text-dark', subStyle: 'text-dark/50',  unitStyle: 'text-dark/35',  icon: <SunIcon /> },
  dinner:    { label: '저녁', cardStyle: 'bg-dark', textStyle: 'text-lime', subStyle: 'text-white/50', unitStyle: 'text-white/35', icon: <MoonIcon /> },
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const

const SUGGESTIONS: Record<BocoStatus, Record<string, string[]>> = {
  over: {
    breakfast: ['그릭요거트', '삶은 계란', '오트밀'],
    lunch:     ['닭가슴살 샐러드', '미역국 + 밥', '두부조림'],
    dinner:    ['나물 비빔밥', '콩나물국', '된장찌개'],
    snack:     ['오이', '아메리카노'],
  },
  good: {
    breakfast: ['통밀빵 + 달걀', '바나나 + 요거트', '오트밀'],
    lunch:     ['비빔밥', '제육볶음', '김치찌개 + 밥'],
    dinner:    ['순두부찌개', '닭볶음탕', '생선구이'],
    snack:     ['견과류', '과일', '요거트'],
  },
  under: {
    breakfast: ['삼계탕', '닭갈비 + 밥', '된장찌개 + 밥'],
    lunch:     ['갈비탕', '삼겹살 구이', '닭볶음탕'],
    dinner:    ['파스타', '치킨', '고기국수'],
    snack:     ['바나나', '아몬드 한 줌', '단백질바'],
  },
  empty: {
    breakfast: ['아침 뭐 드셨어요?'],
    lunch:     ['점심 기록해보세요'],
    dinner:    ['저녁 계획 있으세요?'],
    snack:     ['간식 뭐 드셨어요?'],
  },
}

function RollingSuggestion({ mealType, status }: { mealType: string; status: BocoStatus }) {
  const list = SUGGESTIONS[status][mealType] ?? []
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (list.length <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % list.length), 2500)
    return () => clearInterval(t)
  }, [list.length])

  if (list.length === 0) return null

  const label = status === 'over' ? '라이트하게' : status === 'under' ? '더 드세요' : status === 'good' ? '오늘 추천' : ''

  return (
    <div className="flex flex-col items-center gap-0.5">
      {label && <span className="text-[9px] font-black tracking-widest text-white/30 uppercase">{label}</span>}
      <span key={idx} className="text-[10px] text-white/50 text-center animate-pulse leading-tight px-1">
        {list[idx]}
      </span>
    </div>
  )
}

function RollingSuggestionLight({ mealType, status }: { mealType: string; status: BocoStatus }) {
  const list = SUGGESTIONS[status][mealType] ?? []
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (list.length <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % list.length), 2500)
    return () => clearInterval(t)
  }, [list.length])

  if (list.length === 0) return null

  const label = status === 'over' ? '라이트하게' : status === 'under' ? '더 드세요' : status === 'good' ? '오늘 추천' : ''

  return (
    <div className="flex flex-col items-center gap-0.5">
      {label && <span className="text-[9px] font-black tracking-widest text-dark/30 uppercase">{label}</span>}
      <span key={idx} className="text-[10px] text-dark/50 text-center animate-pulse leading-tight px-1">
        {list[idx]}
      </span>
    </div>
  )
}

export default function MealCardRow({ meals, status, onAdd }: Props) {
  const snack = meals.find(m => m.mealType === 'snack')

  return (
    <div className="px-4 pt-4">
      <div className="text-[11px] font-black text-gray-mid tracking-widest uppercase mb-3">오늘의 식사</div>

      {/* 아침 점심 저녁 */}
      <div className="flex gap-2.5">
        {MEAL_TYPES.map((type) => {
          const meal = meals.find(m => m.mealType === type)
          const cfg = MEAL_CONFIG[type]
          const isLight = type === 'lunch'

          if (!meal) {
            return (
              <button
                key={type}
                onClick={() => onAdd(type)}
                className={`flex-1 rounded-[18px] flex flex-col items-center justify-center gap-2 cursor-pointer relative ${
                  isLight
                    ? 'border-2 border-dashed border-gray-light bg-white'
                    : 'bg-dark/80'
                }`}
                style={{ minHeight: 148 }}
              >
                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${isLight ? 'bg-lime' : 'bg-white/10'}`}>
                  <PlusIcon color={isLight ? '#1A1A1A' : '#C5E63A'} />
                </div>
                <span className={`text-[11px] font-bold ${isLight ? 'text-gray-mid' : 'text-white/40'}`}>{cfg.label}</span>
                {isLight
                  ? <RollingSuggestionLight mealType={type} status={status} />
                  : <RollingSuggestion mealType={type} status={status} />
                }
              </button>
            )
          }

          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className={`flex-1 rounded-[18px] p-3.5 flex flex-col gap-1.5 text-left relative ${cfg.cardStyle}`}
              style={{ minHeight: 148 }}
            >
              {/* 수정 뱃지 */}
              <div className={`absolute top-2.5 right-2.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${isLight ? 'bg-dark/10 text-dark/40' : 'bg-white/10 text-white/30'}`}>
                수정
              </div>
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

      {/* 간식 */}
      <button
        onClick={() => onAdd('snack')}
        className={`mt-2.5 w-full rounded-[16px] flex items-center gap-3.5 px-4 py-3.5 text-left ${snack ? 'bg-white border-2 border-gray-light' : 'border-2 border-dashed border-gray-light bg-white'}`}
      >
        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${snack ? 'bg-lime' : 'bg-gray-50'}`}>
          {snack ? <CookieIcon /> : <PlusIcon color="#1A1A1A" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-black text-dark">간식</div>
          {snack ? (
            <div className="text-[11px] text-gray-mid truncate mt-0.5">{snack.items.map(i => i.name).join(', ')}</div>
          ) : (
            <div className="text-[11px] text-gray-mid">
              {SUGGESTIONS[status]['snack']?.[0] ?? '간식을 기록해보세요'}
            </div>
          )}
        </div>
        {snack ? (
          <div className="flex-shrink-0 text-right">
            <div className="text-[16px] font-black text-dark">{snack.totalKcal.toLocaleString()}</div>
            <div className="text-[10px] text-gray-mid">kcal</div>
            <div className="text-[9px] text-gray-mid/60 mt-0.5">수정</div>
          </div>
        ) : (
          <div className="text-[11px] text-gray-mid flex-shrink-0">추가</div>
        )}
      </button>
    </div>
  )
}

function PlusIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 3v12M3 9h12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
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
