'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import BocoCard from '@/components/BocoCard'
import { getProfile, getTodayMeals, saveExerciseLog, getTodayDate } from '@/utils/storage'
import { calcBocoStatus, formatDate } from '@/utils/boco'
import type { BocoStatus } from '@/utils/boco'
import { getRecommended, getExerciseDetail, PREFERRED_EXERCISES } from '@/constants/exercises'
import type { ExerciseItem } from '@/constants/exercises'

type CardType = 'rest' | 'preferred' | 'recommended' | 'custom'

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke="#888" strokeWidth="1.4" />
      <path d="M10 10l2.5 2.5" stroke="#888" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export default function ExercisePage() {
  const [mounted, setMounted] = useState(false)
  const [totalKcal, setTotalKcal] = useState(0)
  const [targetKcal, setTargetKcal] = useState(0)
  const [status, setStatus] = useState<BocoStatus>('empty')
  const [preferred, setPreferred] = useState<string[]>([])
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [customExercise, setCustomExercise] = useState('')
  const [customList, setCustomList] = useState<string[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    setMounted(true)
    const profile = getProfile()
    const meals = getTodayMeals()
    const total = meals.reduce((s, m) => s + m.totalKcal, 0)
    setTotalKcal(total)
    setTargetKcal(profile?.targetKcal ?? 0)
    setPreferred(profile?.preferredExercises ?? [])
    if (profile?.profileDone) {
      setStatus(calcBocoStatus(total, profile.targetKcal))
    }
  }, [])

  if (!mounted) return null

  const CARDS = [
    {
      id: 'rest' as CardType,
      num: '01',
      label: '휴식',
      sub: '오늘은 쉬어도',
      bg: 'bg-dark',
      titleColor: 'text-white',
      subColor: 'text-white/50',
      numColor: 'text-white/30',
      icon: <MoonIcon />,
    },
    {
      id: 'preferred' as CardType,
      num: '02',
      label: '선호운동',
      sub: '좋아하는 것',
      bg: 'bg-lime',
      titleColor: 'text-dark',
      subColor: 'text-dark/50',
      numColor: 'text-dark/30',
      icon: <StarIcon />,
    },
    {
      id: 'recommended' as CardType,
      num: '03',
      label: '추천운동',
      sub: '상태 맞춤',
      bg: 'bg-white border border-gray-light',
      titleColor: 'text-dark',
      subColor: 'text-dark/50',
      numColor: 'text-dark/30',
      icon: <FlameIcon />,
    },
    {
      id: 'custom' as CardType,
      num: '04',
      label: '커스텀',
      sub: '직접 구성',
      bg: 'bg-dark',
      titleColor: 'text-white',
      subColor: 'text-white/50',
      numColor: 'text-white/30',
      icon: <PencilIcon />,
    },
  ]

  const recommendedSets = status !== 'empty' ? getRecommended(status, preferred) : getRecommended('good', preferred)

  return (
    <div className="flex flex-col min-h-screen bg-app-bg pb-[72px]">
      <div className="px-5 pt-5 pb-0">
        <div className="text-[12px] font-bold text-gray-mid mb-1">{formatDate()}</div>
        <div className="text-[22px] font-black text-dark tracking-tight mb-4">오늘 어떻게 할까요?</div>
        <BocoCard totalKcal={totalKcal} targetKcal={targetKcal} status={status} mini />
      </div>

      {/* 가로 1열 카드 — 4등분 */}
      <div className="px-4 mt-5 flex gap-2">
        {CARDS.map(card => (
          <button
            key={card.id}
            onClick={() => setActiveCard(activeCard === card.id ? null : card.id)}
            className={`${card.bg} rounded-[18px] p-3 flex flex-col flex-1 min-w-0 text-left transition-all ${
              activeCard === card.id ? 'ring-2 ring-lime ring-offset-2 ring-offset-app-bg' : ''
            }`}
            style={{ minHeight: 148 }}
          >
            <span className={`text-[9px] font-black tracking-widest ${card.numColor}`}>{card.num}</span>
            <div className="mt-2 mb-auto">{card.icon}</div>
            <div className={`text-[13px] font-black tracking-tight mt-2 ${card.titleColor}`}>{card.label}</div>
            <div className={`text-[9px] font-medium mt-0.5 ${card.subColor}`}>{card.sub}</div>
          </button>
        ))}
      </div>

      {/* 분석 카드 */}
      {activeCard === 'rest' && (
        <AnalysisPanel title="오늘의 BOCO 분석" accent="lime">
          <StatusRow label="섭취" value={`${totalKcal.toLocaleString()} kcal`} />
          <StatusRow label="목표" value={`${targetKcal.toLocaleString()} kcal`} />
          <StatusRow
            label="차이"
            value={totalKcal > targetKcal
              ? `+${(totalKcal - targetKcal).toLocaleString()} kcal`
              : `-${Math.abs(totalKcal - targetKcal).toLocaleString()} kcal`}
            highlight
          />
          <p className="text-[13px] text-gray-mid leading-relaxed mt-3 pb-1">
            {status === 'over' && '오늘 페이스라면 지방이 조금 쌓일 수 있어요. 괜찮아요, 내일 조절해요!'}
            {status === 'good' && '완벽해요! 이대로라면 목표에 착착 가까워지고 있어요.'}
            {(status === 'under' || status === 'empty') && '오늘 조금 부족했어요. 너무 적게 먹으면 오히려 역효과예요.'}
          </p>
          <DoneButton done={done} onDone={() => { setDone(true); saveExerciseLog({ date: getTodayDate(), cardType: 'rest', exercises: [] }) }} label="오늘은 이걸로" doneBg="bg-dark" />
        </AnalysisPanel>
      )}

      {activeCard === 'preferred' && (
        <AnalysisPanel title="선호 운동 세트">
          {preferred.length === 0 ? (
            <p className="text-[13px] text-gray-mid">내정보에서 선호 운동을 설정해보세요</p>
          ) : (
            <ExerciseTable exercises={preferred.map(name => getExerciseDetail(name))} />
          )}
          {preferred.length > 0 && (
            <DoneButton done={done} onDone={() => { setDone(true); saveExerciseLog({ date: getTodayDate(), cardType: 'preferred', exercises: preferred }) }} label="완료했어요!" doneBg="bg-lime" />
          )}
        </AnalysisPanel>
      )}

      {activeCard === 'recommended' && (
        <AnalysisPanel title="오늘의 추천 세트">
          <p className="text-[11px] text-gray-mid mb-3">
            {status === 'over' && '칼로리를 소모할 수 있는 고강도 세트예요'}
            {status === 'good' && '균형 잡힌 유지 운동 세트예요'}
            {status === 'under' && '가볍게 몸을 풀어주는 회복 세트예요'}
            {status === 'empty' && '균형 잡힌 운동 세트예요'}
          </p>
          {status === 'under' ? (
            <>
              <ExerciseTable exercises={recommendedSets} />
              <p className="text-[12px] text-gray-mid mt-3 leading-relaxed">오늘은 무리하지 말고 가볍게 몸을 풀어요.</p>
            </>
          ) : (
            <ExerciseTable exercises={recommendedSets} />
          )}
          <DoneButton done={done} onDone={() => { setDone(true); saveExerciseLog({ date: getTodayDate(), cardType: 'recommended', exercises: recommendedSets.map(e => e.name) }) }} label="완료했어요!" doneBg="bg-dark" />
        </AnalysisPanel>
      )}

      {activeCard === 'custom' && (
        <AnalysisPanel title="커스텀 운동 구성">
          {/* 검색 */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-[10px] px-3 py-2.5">
              <SearchIcon />
              <input
                value={customExercise}
                onChange={e => setCustomExercise(e.target.value)}
                placeholder="직접 입력도 가능해요"
                className="flex-1 bg-transparent text-[13px] text-dark outline-none font-sans"
                onKeyDown={e => {
                  if (e.key === 'Enter' && customExercise.trim()) {
                    if (!customList.includes(customExercise.trim())) {
                      setCustomList(prev => [...prev, customExercise.trim()])
                    }
                    setCustomExercise('')
                  }
                }}
              />
            </div>
            {customExercise.trim() && (
              <button
                onClick={() => {
                  if (!customList.includes(customExercise.trim())) {
                    setCustomList(prev => [...prev, customExercise.trim()])
                  }
                  setCustomExercise('')
                }}
                className="bg-dark text-lime font-black text-[12px] px-3 rounded-[10px]"
              >
                추가
              </button>
            )}
          </div>

          {/* 종목 칩 */}
          <div className="mb-3">
            <div className="text-[10px] font-black text-gray-mid tracking-widest uppercase mb-2">종목 선택</div>
            <div className="flex flex-wrap gap-1.5">
              {PREFERRED_EXERCISES.map(name => {
                const selected = customList.includes(name)
                return (
                  <button
                    key={name}
                    onClick={() => setCustomList(prev =>
                      selected ? prev.filter(e => e !== name) : [...prev, name]
                    )}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-black border transition-colors ${
                      selected
                        ? 'bg-dark text-lime border-dark'
                        : 'bg-gray-50 text-gray-mid border-gray-light'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 선택된 운동 세부 */}
          {customList.length > 0 && (
            <>
              <div className="border-t border-gray-100 pt-3 mb-1">
                <div className="text-[10px] font-black text-gray-mid tracking-widest uppercase mb-2">
                  오늘의 세트 ({customList.length}종목)
                </div>
                <ExerciseTable
                  exercises={customList.map(name => getExerciseDetail(name))}
                  onRemove={(i) => setCustomList(prev => prev.filter((_, j) => j !== i))}
                />
              </div>
              <DoneButton
                done={done}
                onDone={() => {
                  setDone(true)
                  saveExerciseLog({ date: getTodayDate(), cardType: 'custom', exercises: customList })
                }}
                label="완료했어요!"
                doneBg="bg-dark"
              />
            </>
          )}
        </AnalysisPanel>
      )}

      <BottomNav />
    </div>
  )
}

function AnalysisPanel({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="mx-4 mt-3 bg-white rounded-[20px] p-4 border border-gray-light/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full bg-lime" />
        <div className="text-[12px] font-black text-dark tracking-tight">{title}</div>
      </div>
      {children}
    </div>
  )
}

function StatusRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-[12px] text-gray-mid">{label}</span>
      <span className={`text-[13px] font-black ${highlight ? 'text-lime' : 'text-dark'}`}>{value}</span>
    </div>
  )
}

function ExerciseRow({ ex, onRemove }: { ex: ExerciseItem; onRemove?: () => void }) {
  const isCardio = ex.type === 'cardio'
  const isFlex = ex.type === 'flexibility'

  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            isCardio ? 'bg-orange' : isFlex ? 'bg-lime/60' : 'bg-lime'
          }`} />
          <span className="text-[13px] font-bold text-dark">{ex.name}</span>
          <span className="text-[10px] text-gray-mid bg-gray-50 px-1.5 py-0.5 rounded-full">
            {isCardio ? '유산소' : isFlex ? '유연성' : ex.type === 'core' ? 'HIIT' : '근력'}
          </span>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-gray-mid text-sm px-1 flex-shrink-0">✕</button>
        )}
      </div>

      {/* cardio */}
      {isCardio && (
        <div className="flex gap-3 mt-2 ml-3.5">
          <MetaChip label="목표거리" value={ex.distance ?? '—'} accent />
          <MetaChip label="페이스" value={ex.pace ?? '—'} />
          <MetaChip label="예상시간" value={ex.duration ?? '—'} />
        </div>
      )}

      {/* strength / core */}
      {(ex.type === 'strength' || ex.type === 'core') && (
        <div className="flex gap-3 mt-2 ml-3.5">
          <MetaChip label="세트" value={`${ex.sets ?? 3}세트`} accent />
          <MetaChip label="횟수" value={ex.reps ?? '10회'} />
          <MetaChip label="휴식" value={ex.rest ?? '45초'} />
        </div>
      )}

      {/* flexibility */}
      {isFlex && (
        <div className="flex gap-3 mt-2 ml-3.5">
          <MetaChip label="시간" value={ex.duration ?? '—'} accent />
          {ex.note && <MetaChip label="포인트" value={ex.note} />}
        </div>
      )}
    </div>
  )
}

function MetaChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-[8px] px-2.5 py-1.5 min-w-[56px]">
      <span className="text-[9px] text-gray-mid">{label}</span>
      <span className={`text-[12px] font-black mt-0.5 ${accent ? 'text-dark' : 'text-gray-mid'}`}>{value}</span>
    </div>
  )
}

function ExerciseTable({ exercises, onRemove }: { exercises: ExerciseItem[]; onRemove?: (i: number) => void }) {
  return (
    <div>
      {exercises.map((ex, i) => (
        <ExerciseRow key={i} ex={ex} onRemove={onRemove ? () => onRemove(i) : undefined} />
      ))}
    </div>
  )
}

function DoneButton({ done, onDone, label, doneBg }: { done: boolean; onDone: () => void; label: string; doneBg: string }) {
  if (done) return <div className="mt-4 text-center text-[14px] font-black text-lime">완료! 오늘도 고생했어요 💪</div>
  return (
    <button
      onClick={onDone}
      className={`mt-4 w-full ${doneBg} ${doneBg === 'bg-lime' ? 'text-dark' : 'text-white'} font-black text-[14px] py-3.5 rounded-[14px]`}
    >
      {label}
    </button>
  )
}

function MoonIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M26 19a11 11 0 01-11-11 11 11 0 000 22 11 11 0 0011-11z" fill="#C5E63A" />
      <circle cx="26" cy="9" r="2.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="30" cy="15" r="1.5" fill="rgba(255,255,255,0.15)" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 4l3.6 7.3 8 1.2-5.8 5.7 1.4 8-7.2-3.8-7.2 3.8 1.4-8L6.4 12.5l8-1.2L18 4z" fill="#1A1A1A" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 32c-6.2 0-11.3-4.2-11.3-9.4 0-3.3 1.7-6.1 4.2-8 0 1.9.9 3.3 2.4 4.3 0-4.3 2.3-8.5 6.6-11.3 0 4.7 2.8 6.6 3.8 8.5.9-1.4.9-3.3 0-5.2 3.3 1.9 5.7 5.7 5.7 9.4 0 6.6-5.1 11.7-11.4 11.7z" fill="#C5E63A" stroke="#1A1A1A" strokeWidth="1.5" />
      <path d="M18 28.5c-2.8 0-5.2-1.9-5.2-4.3 0-1.4.8-2.8 1.9-3.8 0 .9.5 1.9 1.4 2.4 0-1.9 1-3.3 2.8-3.8 0 1.9 1.4 2.8 1.9 3.8.5-.5.5-1.4 0-2.4 1.4.9 2.4 2.4 2.4 4.3 0 2.1-2.4 3.8-5.2 3.8z" fill="#1A1A1A" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="7" y="5" width="9" height="24" rx="3" transform="rotate(-45 18 18)" fill="#C5E63A" />
      <path d="M6 30l3.5-1.5-2-2z" fill="#C5E63A" />
      <rect x="9" y="7" width="5" height="20" rx="2" transform="rotate(-45 18 18)" fill="rgba(255,255,255,0.2)" />
    </svg>
  )
}
