'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import FoodModal from '@/components/FoodModal'
import ShareCard from '@/components/ShareCard'
import Celebration from '@/components/Celebration'
import { getProfile, getTodayMeals, upsertMeal, isSplashSeen, markSplashSeen, getTodayDate, getTodayBurnedKcal, getStreak, updateStreak } from '@/utils/storage'
import type { Meal, MealItem } from '@/utils/storage'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
}

function detectMealByTime(): MealType {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'breakfast'
  if (h >= 11 && h < 15) return 'lunch'
  if (h >= 15 && h < 21) return 'dinner'
  return 'snack'
}

function formatDateKo() {
  const d = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`
}

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const [meals, setMeals] = useState<Meal[]>([])
  const [targetKcal, setTargetKcal] = useState(2000)
  const [modalType, setModalType] = useState<MealType | null>(null)
  const [activePanel, setActivePanel] = useState<MealType | null>(null)
  const [inlineText, setInlineText] = useState('')
  const [inlineMeal, setInlineMeal] = useState<MealType>(detectMealByTime())
  const [inlineLoading, setInlineLoading] = useState(false)
  const [showSnackInput, setShowSnackInput] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [celebration, setCelebration] = useState<{ message: string; sub?: string } | null>(null)
  const [streak, setStreak] = useState(0)
  const cameraRefs = useRef<Record<MealType, HTMLInputElement | null>>({
    breakfast: null, lunch: null, dinner: null, snack: null,
  })

  useEffect(() => {
    setMounted(true)
    if (!isSplashSeen()) { setShowSplash(true); return }
    loadData()
  }, [])

  function loadData() {
    const profile = getProfile()
    setTargetKcal(profile?.targetKcal ?? 2000)
    setMeals(getTodayMeals())
    setStreak(getStreak())
  }

  function handleSplashStart() {
    markSplashSeen()
    setShowSplash(false)
    loadData()
  }

  function getMeal(type: MealType) {
    return meals.find(m => m.mealType === type)
  }

  async function handleCameraCapture(file: File, mealType: MealType) {
    const reader = new FileReader()
    reader.onload = async ev => {
      const dataUrl = ev.target?.result as string
      const base64 = dataUrl.split(',')[1]

      // save photo immediately
      const existing = getMeal(mealType)
      const meal: Meal = {
        id: `${mealType}_${getTodayDate()}`,
        date: getTodayDate(),
        mealType,
        items: existing?.items ?? [],
        totalKcal: existing?.totalKcal ?? 0,
        photoUrl: dataUrl,
      }
      upsertMeal(meal)
      const updated = getTodayMeals()
      setMeals(updated)
      updateStreak()
      setStreak(getStreak())
      triggerCelebration(updated)

      // analyze food in background
      try {
        const res = await fetch('/api/analyze-food', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ image: base64, mediaType: file.type }),
        })
        const newItems: MealItem[] = await res.json()
        if (newItems.length) {
          const merged = [...(existing?.items ?? []), ...newItems.filter(n => !(existing?.items ?? []).find(e => e.name === n.name))]
          upsertMeal({
            ...meal,
            items: merged,
            totalKcal: merged.reduce((s, i) => s + i.kcal, 0),
          })
          setMeals(getTodayMeals())
        }
      } catch {}
    }
    reader.readAsDataURL(file)
  }

  async function handleInlineSubmit() {
    if (!inlineText.trim()) return
    setInlineLoading(true)
    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: inlineText }),
      })
      const newItems: MealItem[] = await res.json()
      if (!newItems.length) return
      const existing = getMeal(inlineMeal)
      const merged = [...(existing?.items ?? []), ...newItems.filter(n => !(existing?.items ?? []).find(e => e.name === n.name))]
      upsertMeal({
        id: `${inlineMeal}_${getTodayDate()}`,
        date: getTodayDate(),
        mealType: inlineMeal,
        items: merged,
        totalKcal: merged.reduce((s, i) => s + i.kcal, 0),
        photoUrl: existing?.photoUrl,
      })
      const updated = getTodayMeals()
      setMeals(updated)
      setInlineText('')
      updateStreak()
      setStreak(getStreak())
      triggerCelebration(updated)
    } finally {
      setInlineLoading(false)
    }
  }

  function triggerCelebration(updatedMeals: typeof meals) {
    const recorded = updatedMeals.filter(m => m.mealType !== 'snack').length
    const s = getStreak()
    if (s >= 7 && recorded === 1) {
      setCelebration({ message: `${s}일 연속 기록 중!`, sub: '대단해요, 포기하지 마세요 💪' })
    } else if (recorded === 3) {
      setCelebration({ message: '오늘 식단 완성!', sub: '아침 점심 저녁 모두 기록했어요' })
    } else if (recorded === 1) {
      const labels: Record<string, string> = { breakfast: '아침', lunch: '점심', dinner: '저녁' }
      const last = updatedMeals.filter(m => m.mealType !== 'snack').slice(-1)[0]
      setCelebration({ message: `${labels[last?.mealType] ?? '식사'} 기록 완료!` })
    }
  }

  function handleSaveMeal(items: MealItem[]) {
    if (!modalType) return
    const existing = getMeal(modalType)
    upsertMeal({
      id: `${modalType}_${getTodayDate()}`,
      date: getTodayDate(),
      mealType: modalType,
      items,
      totalKcal: items.reduce((s, i) => s + i.kcal, 0),
      photoUrl: existing?.photoUrl,
    })
    setMeals(getTodayMeals())
    setModalType(null)
  }

  if (!mounted) return null
  if (showSplash) return <SplashScreen onStart={handleSplashStart} />

  const totalKcal = meals.reduce((s, m) => s + m.totalKcal, 0)
  const burnedKcal = getTodayBurnedKcal()
  const netKcal = totalKcal - burnedKcal
  const pct = targetKcal > 0 ? Math.round((netKcal / targetKcal) * 100) : 0

  const mainMeals: MealType[] = ['breakfast', 'lunch', 'dinner']

  return (
    <div className="flex flex-col min-h-screen bg-[#141412] pb-[72px]">
      {/* Hidden file inputs */}
      {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(type => (
        <input
          key={type}
          ref={el => { cameraRefs.current[type] = el }}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleCameraCapture(file, type)
            e.target.value = ''
          }}
        />
      ))}

      {/* Celebration */}
      {celebration && (
        <Celebration
          message={celebration.message}
          sub={celebration.sub}
          onDone={() => setCelebration(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-6 pb-4">
        <div>
          <div className="text-[11px] font-medium text-white/30 mb-0.5">{formatDateKo()}</div>
          <div className="flex items-center gap-2">
            <div className="text-[20px] font-black text-white leading-tight">오늘의 식사</div>
            {streak >= 2 && (
              <div className="flex items-center gap-1 bg-[#C5E63A]/15 rounded-full px-2 py-0.5">
                <span className="text-[12px]">🔥</span>
                <span className="text-[11px] font-black text-[#C5E63A]">{streak}일</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push('/profile')}
          className="w-9 h-9 rounded-[10px] bg-white/10 flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6.5" r="3" fill="#C5E63A" />
            <path d="M2 17c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="#C5E63A" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 3-Panel Photo Grid */}
      <div className="mx-4 rounded-[24px] overflow-hidden" style={{ aspectRatio: '1/1' }}>
        <div className="flex h-full gap-[3px]">
          {mainMeals.map((type, i) => {
            const meal = getMeal(type)
            const hasPhoto = !!meal?.photoUrl
            const hasItems = (meal?.items?.length ?? 0) > 0

            return (
              <div
                key={type}
                className="relative flex-1 flex flex-col items-center justify-center cursor-pointer group"
                style={{ background: hasPhoto ? 'transparent' : i === 0 ? '#1E1E1B' : i === 1 ? '#1A1A18' : '#181816' }}
                onClick={() => setActivePanel(type)}
              >
                {hasPhoto ? (
                  <img
                    src={meal!.photoUrl}
                    alt={MEAL_LABELS[type]}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3v10M3 8h10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium text-white/25">{MEAL_LABELS[type]}</span>
                  </div>
                )}

                {/* meal label + kcal */}
                {(hasPhoto || hasItems) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-2 px-2">
                    <div className="text-[10px] font-bold text-white/50">{MEAL_LABELS[type]}</div>
                    {hasItems && (
                      <div className="text-[13px] font-black text-white">{meal!.totalKcal}<span className="text-[9px] font-medium text-white/50 ml-0.5">kcal</span></div>
                    )}
                  </div>
                )}

                {/* empty label */}
                {!hasPhoto && !hasItems && (
                  <div />
                )}
              </div>
            )
          })}
        </div>

        {/* Stats overlay at bottom */}
        <div className="absolute left-4 right-4 bottom-[calc(72px+16px)] pointer-events-none">
          {/* this is outside the grid, handled below */}
        </div>
      </div>

      {/* Calorie bar */}
      <div className="mx-4 mt-3 bg-white/5 rounded-[16px] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-medium text-white/40">오늘 섭취</span>
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-black text-white">{netKcal.toLocaleString()}</span>
              <span className="text-[11px] text-white/30">/ {targetKcal.toLocaleString()} kcal</span>
            </div>
            <button
              onClick={() => setShowShare(true)}
              className="w-7 h-7 rounded-[8px] bg-white/8 flex items-center justify-center"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M9 4.5l2-2-2-2M11 2.5H6.5a4 4 0 000 8H7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: pct > 110 ? '#FF6B4A' : '#C5E63A',
            }}
          />
        </div>
        {burnedKcal > 0 && (
          <div className="mt-1.5 text-[11px] text-white/30">운동 -{burnedKcal}kcal 반영됨</div>
        )}
      </div>

      {/* 간식 quick row */}
      <div className="mx-4 mt-3">
        <button
          onClick={() => setShowSnackInput(v => !v)}
          className="w-full flex items-center justify-between bg-white/5 rounded-[14px] px-4 py-3"
        >
          <div className="flex items-center gap-2">
            {getMeal('snack') ? (
              <span className="text-[13px] font-medium text-white/70">간식 · {getMeal('snack')!.totalKcal}kcal</span>
            ) : (
              <span className="text-[13px] font-medium text-white/30">간식 추가</span>
            )}
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="rgba(255,255,255,0.2)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Quick text input */}
      <div className="mx-4 mt-3">
        <div className="bg-white/5 rounded-[16px] border border-white/8 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              value={inlineText}
              onChange={e => setInlineText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleInlineSubmit() }}
              placeholder="뭐 드셨어요? 텍스트로 바로 입력"
              className="flex-1 text-[13px] text-white/80 placeholder:text-white/20 outline-none bg-transparent"
            />
            <button
              onClick={handleInlineSubmit}
              disabled={inlineLoading || !inlineText.trim()}
              className="w-7 h-7 rounded-[8px] bg-[#C5E63A] flex items-center justify-center flex-shrink-0 disabled:opacity-30"
            >
              {inlineLoading
                ? <svg width="12" height="12" viewBox="0 0 12 12" className="animate-spin" fill="none"><circle cx="6" cy="6" r="4" stroke="rgba(0,0,0,0.2)" strokeWidth="2"/><path d="M6 2a4 4 0 014 4" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/></svg>
                : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
            </button>
          </div>
          <div className="flex border-t border-white/5">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m, i) => (
              <button
                key={m}
                onClick={() => setInlineMeal(m)}
                className={`flex-1 py-2 text-[11px] font-black transition-colors ${inlineMeal === m ? 'text-[#C5E63A]' : 'text-white/20'} ${i > 0 ? 'border-l border-white/5' : ''}`}
              >
                {MEAL_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel action sheet */}
      {activePanel && (
        <PanelSheet
          type={activePanel}
          meal={getMeal(activePanel)}
          onClose={() => setActivePanel(null)}
          onCamera={() => { cameraRefs.current[activePanel]?.click(); setActivePanel(null) }}
          onEdit={() => { setModalType(activePanel); setActivePanel(null) }}
        />
      )}

      {/* Snack input sheet */}
      {showSnackInput && (
        <PanelSheet
          type="snack"
          meal={getMeal('snack')}
          onClose={() => setShowSnackInput(false)}
          onCamera={() => { cameraRefs.current.snack?.click(); setShowSnackInput(false) }}
          onEdit={() => { setModalType('snack'); setShowSnackInput(false) }}
        />
      )}

      {/* Share Card */}
      {showShare && (
        <ShareCard
          meals={meals}
          totalKcal={totalKcal}
          targetKcal={targetKcal}
          burnedKcal={burnedKcal}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Food Modal */}
      {modalType && (
        <FoodModal
          mealType={modalType}
          existing={getMeal(modalType)?.items ?? []}
          onSave={handleSaveMeal}
          onClose={() => setModalType(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}

function PanelSheet({ type, meal, onClose, onCamera, onEdit }: {
  type: MealType
  meal: Meal | undefined
  onClose: () => void
  onCamera: () => void
  onEdit: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="w-full max-w-[430px] mx-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-[#1E1E1C] rounded-t-[28px] px-5 pt-2 pb-8">
          <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-5" />
          <div className="text-[16px] font-black text-white mb-1">{MEAL_LABELS[type]}</div>
          {meal?.items?.length ? (
            <div className="text-[12px] text-white/40 mb-5">
              {meal.items.map(i => i.name).join(' · ')} · {meal.totalKcal}kcal
            </div>
          ) : (
            <div className="text-[12px] text-white/30 mb-5">아직 기록이 없어요</div>
          )}
          <div className="flex flex-col gap-2">
            <button
              onClick={onCamera}
              className="w-full flex items-center gap-3 bg-white/8 rounded-[14px] px-4 py-3.5"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="1" y="5" width="18" height="13" rx="3" stroke="#C5E63A" strokeWidth="1.6"/>
                <circle cx="10" cy="11.5" r="3.5" stroke="#C5E63A" strokeWidth="1.6"/>
                <path d="M6.5 5L8 2.5h4L13.5 5" stroke="#C5E63A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[14px] font-bold text-white">사진으로 기록</span>
            </button>
            <button
              onClick={onEdit}
              className="w-full flex items-center gap-3 bg-white/8 rounded-[14px] px-4 py-3.5"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 17h14M13 3l4 4-9 9H4v-4L13 3z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[14px] font-bold text-white/70">직접 입력</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#C5E63A] flex flex-col items-center justify-between px-7 pt-16 pb-12">
      <div className="flex flex-col items-center flex-1 justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="72" fill="#1A1A1A" />
          <circle cx="80" cy="80" r="58" fill="#1A1A1A" stroke="#C5E63A" strokeWidth="3" />
          <line x1="80" y1="16" x2="80" y2="26" stroke="#C5E63A" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="134" x2="80" y2="144" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="80" x2="26" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round" />
          <line x1="134" y1="80" x2="144" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round" />
          <text x="80" y="38" textAnchor="middle" fill="#C5E63A" fontSize="10" fontWeight="900" fontFamily="sans-serif">N</text>
          <path d="M80 30 L74 82 L80 76 L86 82 Z" fill="#C5E63A" />
          <path d="M80 130 L74 78 L80 84 L86 78 Z" fill="rgba(255,255,255,0.2)" />
          <circle cx="80" cy="80" r="7" fill="#1A1A1A" stroke="#C5E63A" strokeWidth="2.5" />
        </svg>
        <div className="text-[64px] font-black text-[#1A1A1A] tracking-[-4px] leading-none mt-5 mb-2.5">BOCO</div>
        <div className="text-[15px] text-[#1A1A1A]/55 font-medium text-center leading-relaxed">오늘 하루,<br />당신의 몸이 향하는 방향</div>
      </div>
      <div className="w-full flex flex-col gap-3">
        <button onClick={onStart} className="w-full bg-[#1A1A1A] text-white font-black text-[16px] py-[18px] rounded-[18px]">
          시작하기
        </button>
        <p className="text-[11px] text-[#1A1A1A]/35 text-center">시작하면 이용약관 및 개인정보처리방침에 동의하게 됩니다</p>
      </div>
    </div>
  )
}
