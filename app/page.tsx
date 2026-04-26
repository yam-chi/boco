'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import BocoCard from '@/components/BocoCard'
import MealCardRow from '@/components/MealCardRow'
import FoodModal from '@/components/FoodModal'
import InfoNudgeSheet from '@/components/InfoNudgeSheet'
import { getProfile, getTodayMeals, upsertMeal, isSplashSeen, markSplashSeen, getTodayDate } from '@/utils/storage'
import type { Meal, MealItem } from '@/utils/storage'
import { calcBocoStatus, getGreeting, formatDate } from '@/utils/boco'

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const [meals, setMeals] = useState<Meal[]>([])
  const [profileDone, setProfileDone] = useState(false)
  const [targetKcal, setTargetKcal] = useState(0)
  const [modalType, setModalType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | null>(null)
  const [nudge, setNudge] = useState<{ name: string; kcal: number } | null>(null)

  useEffect(() => {
    setMounted(true)
    if (!isSplashSeen()) {
      setShowSplash(true)
      return
    }
    loadData()
  }, [])

  function loadData() {
    const profile = getProfile()
    setProfileDone(!!profile?.profileDone)
    setTargetKcal(profile?.targetKcal ?? 0)
    setMeals(getTodayMeals())
  }

  function handleSplashStart() {
    markSplashSeen()
    setShowSplash(false)
    loadData()
  }

  function handleSaveMeal(items: MealItem[]) {
    if (!modalType) return
    const meal: Meal = {
      id: `${modalType}_${getTodayDate()}`,
      date: getTodayDate(),
      mealType: modalType,
      items,
      totalKcal: items.reduce((s, i) => s + i.kcal, 0),
    }
    upsertMeal(meal)
    setMeals(getTodayMeals())
    setModalType(null)

    const profile = getProfile()
    if (!profile?.profileDone && items.length > 0) {
      setNudge({ name: items[0].name, kcal: meal.totalKcal })
    }
  }

  if (!mounted) return null

  if (showSplash) return <SplashScreen onStart={handleSplashStart} />

  const totalKcal = meals.reduce((s, m) => s + m.totalKcal, 0)
  const status = profileDone ? calcBocoStatus(totalKcal, targetKcal) : 'empty'
  const diff = totalKcal - targetKcal

  return (
    <div className="flex flex-col min-h-screen bg-app-bg pb-[72px]">
      {/* Header */}
      <div className="flex justify-between items-start px-5 pt-5 pb-0">
        <div>
          <div className="text-[12px] font-bold text-gray-mid mb-1">{formatDate()}</div>
          <div className="text-[22px] font-black text-dark tracking-tight">{getGreeting(status)}</div>
        </div>
        <button onClick={() => router.push('/profile')} className="w-10 h-10 rounded-[12px] bg-dark flex items-center justify-center flex-shrink-0 mt-1">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="8" r="4" fill="#C5E63A" />
            <path d="M3 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#C5E63A" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Boco Card */}
      <BocoCard
        totalKcal={totalKcal}
        targetKcal={targetKcal}
        status={status}
        onClick={profileDone ? () => router.push('/exercise') : () => router.push('/profile')}
      />

      {/* Food illustration — only when no profile */}
      {!profileDone && (
        <div className="mx-4 mt-4 bg-white rounded-[20px] p-5 flex items-center gap-4">
          <BowlIllustration />
          <div>
            <div className="text-[14px] font-black text-dark mb-1">첫 식사를 기록해보세요</div>
            <div className="text-[12px] text-gray-mid leading-relaxed">칼로리 목표를 설정하면<br />오늘의 BOCO가 켜져요</div>
            <button
              onClick={() => setModalType('breakfast')}
              className="mt-2.5 bg-lime text-dark font-black text-[12px] px-3.5 py-1.5 rounded-[10px]"
            >
              기록 시작하기
            </button>
          </div>
        </div>
      )}

      {/* Today tip */}
      {profileDone && status === 'good' && (
        <div className="mx-4 mt-3 bg-dark rounded-[16px] p-3.5 flex gap-3 items-center">
          <LightbulbIcon />
          <div>
            <div className="text-[12px] font-black text-lime mb-0.5">오늘의 팁</div>
            <div className="text-[11px] text-white/60 leading-relaxed">
              저녁까지 {Math.max(0, targetKcal - totalKcal).toLocaleString()}kcal 여유가 있어요. 가볍게 드세요!
            </div>
          </div>
        </div>
      )}

      {/* Meal cards */}
      <MealCardRow meals={meals} onAdd={setModalType} />

      {/* Food Modal */}
      {modalType && (
        <FoodModal
          mealType={modalType}
          existing={meals.find(m => m.mealType === modalType)?.items ?? []}
          onSave={handleSaveMeal}
          onClose={() => setModalType(null)}
        />
      )}

      {/* Info nudge */}
      {nudge && (
        <InfoNudgeSheet
          foodName={nudge.name}
          foodKcal={nudge.kcal}
          onClose={() => setNudge(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}

function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-lime flex flex-col items-center justify-between px-7 pt-16 pb-12">
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
        <div className="text-[64px] font-black text-dark tracking-[-4px] leading-none mt-5 mb-2.5">BOCO</div>
        <div className="text-[15px] text-dark/55 font-medium text-center leading-relaxed">오늘 하루,<br />당신의 몸이 향하는 방향</div>
      </div>
      <div className="w-full flex flex-col gap-3">
        <button onClick={onStart} className="w-full bg-dark text-white font-black text-[16px] py-[18px] rounded-[18px]">
          시작하기
        </button>
        <p className="text-[11px] text-dark/35 text-center">시작하면 이용약관 및 개인정보처리방침에 동의하게 됩니다</p>
      </div>
    </div>
  )
}

function BowlIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="flex-shrink-0">
      <ellipse cx="36" cy="62" rx="24" ry="4" fill="rgba(0,0,0,0.07)" />
      <path d="M12 38 Q12 60 36 60 Q60 60 60 38 Z" fill="#1A1A1A" />
      <ellipse cx="36" cy="38" rx="24" ry="8" fill="#2A2A2A" />
      <ellipse cx="36" cy="36" rx="18" ry="6" fill="#C5E63A" />
      <path d="M26 26 Q27 21 25 16" stroke="#CCC" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M36 24 Q38 19 36 14" stroke="#CCC" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M46 26 Q47 21 45 16" stroke="#CCC" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="52" y1="14" x2="44" y2="38" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="56" y1="14" x2="48" y2="38" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function LightbulbIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="flex-shrink-0">
      <circle cx="14" cy="14" r="14" fill="#C5E63A" fillOpacity="0.15" />
      <path d="M14 7a5 5 0 013.5 8.5c-.5.5-.9 1.1-.9 1.8v.7h-5.2v-.7c0-.7-.4-1.3-.9-1.8A5 5 0 0114 7z" fill="#C5E63A" />
      <rect x="11.4" y="18" width="5.2" height="1.5" rx=".75" fill="#C5E63A" />
      <rect x="12" y="20" width="4" height="1" rx=".5" fill="#C5E63A" />
    </svg>
  )
}
