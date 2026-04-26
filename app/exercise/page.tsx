'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import BocoCard from '@/components/BocoCard'
import { getProfile, getTodayMeals, saveExerciseLog, getTodayDate } from '@/utils/storage'
import { calcBocoStatus, formatDate, STATUS_DIRECTION } from '@/utils/boco'
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
  const [profileDone, setProfileDone] = useState(false)

  // 기본 추천 완료
  const [defaultDone, setDefaultDone] = useState(false)

  // 다른 방식 accordion
  const [showOtherOptions, setShowOtherOptions] = useState(false)
  const [activeCard, setActiveCard] = useState<CardType | null>(null)

  // 커스텀
  const [customExercise, setCustomExercise] = useState('')
  const [customList, setCustomList] = useState<string[]>([])
  const [otherDone, setOtherDone] = useState(false)

  useEffect(() => {
    setMounted(true)
    const profile = getProfile()
    const meals = getTodayMeals()
    const total = meals.reduce((s, m) => s + m.totalKcal, 0)
    setTotalKcal(total)
    setTargetKcal(profile?.targetKcal ?? 0)
    setPreferred(profile?.preferredExercises ?? [])
    setProfileDone(!!profile?.profileDone)
    if (profile?.profileDone) {
      setStatus(calcBocoStatus(total, profile.targetKcal))
    }
  }, [])

  if (!mounted) return null

  const recommendedSets = status !== 'empty'
    ? getRecommended(status, preferred)
    : getRecommended('good', preferred)

  const dir = STATUS_DIRECTION[status]

  const isRest = status === 'under'

  // 다른 방식 카드 정의
  const OTHER_CARDS = [
    { id: 'rest' as CardType,        label: '휴식',   icon: <MoonIcon />,   bg: 'bg-dark',  tc: 'text-white',  sc: 'text-white/50' },
    { id: 'preferred' as CardType,   label: '선호',   icon: <StarIcon />,   bg: 'bg-lime',  tc: 'text-dark',   sc: 'text-dark/50'  },
    { id: 'recommended' as CardType, label: '추천',   icon: <FlameIcon />,  bg: 'bg-white border border-gray-light', tc: 'text-dark', sc: 'text-dark/50' },
    { id: 'custom' as CardType,      label: '커스텀', icon: <PencilIcon />, bg: 'bg-dark',  tc: 'text-white',  sc: 'text-white/50' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-app-bg pb-[72px]">
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-0">
        <div className="text-[12px] font-bold text-gray-mid mb-1">{formatDate()}</div>
        <div className="text-[22px] font-black text-dark tracking-tight mb-4">오늘 어떻게 할까요?</div>
        <BocoCard totalKcal={totalKcal} targetKcal={targetKcal} status={status} mini />
      </div>

      {/* ── BOCO 기본 추천 (즉시 노출) ── */}
      {!profileDone ? (
        <div className="mx-4 mt-4 bg-white rounded-[20px] p-5 border border-gray-light/50 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-[14px] bg-lime flex items-center justify-center">
            <FlameIcon />
          </div>
          <div className="text-[15px] font-black text-dark">프로필을 먼저 설정해주세요</div>
          <div className="text-[13px] text-gray-mid leading-relaxed">
            몸무게·목표를 입력하면<br />BOCO가 딱 맞는 운동을 추천해요
          </div>
        </div>
      ) : (
        <div className="mx-4 mt-4 bg-dark rounded-[20px] p-4">
          {/* 타이틀 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 rounded-full bg-lime flex-shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase">BOCO 추천</div>
              <div className="text-[16px] font-black text-white leading-tight">
                {isRest ? '오늘은 가볍게 회복해요' : `${dir.heading} — 이 세트 어때요?`}
              </div>
            </div>
          </div>

          {/* 운동 세트 */}
          {isRest ? (
            <div className="bg-white/5 rounded-[14px] p-4">
              <p className="text-[13px] text-white/60 leading-relaxed">
                오늘 칼로리가 부족해요. 무리한 운동보다 가벼운 스트레칭으로 몸을 풀어주세요.
              </p>
              <ExerciseTable
                exercises={recommendedSets}
                dark
              />
            </div>
          ) : (
            <div className="bg-white/5 rounded-[14px] p-1">
              <ExerciseTable exercises={recommendedSets} dark />
            </div>
          )}

          {/* 완료 버튼 */}
          <div className="mt-3">
            {defaultDone ? (
              <div className="text-center text-[14px] font-black text-lime py-2">완료! 오늘도 고생했어요 🎯</div>
            ) : (
              <button
                onClick={() => {
                  setDefaultDone(true)
                  saveExerciseLog({
                    date: getTodayDate(),
                    cardType: 'recommended',
                    exercises: recommendedSets.map(e => e.name),
                  })
                }}
                className="w-full bg-lime text-dark font-black text-[15px] py-4 rounded-[14px]"
              >
                완료했어요!
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 다른 방식으로 (accordion) ── */}
      <div className="mx-4 mt-2">
        <button
          onClick={() => { setShowOtherOptions(v => !v); setActiveCard(null) }}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-[16px] border border-gray-light/50"
        >
          <span className="text-[13px] font-black text-gray-mid">다른 방식으로 할게요</span>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`transition-transform duration-200 ${showOtherOptions ? 'rotate-180' : ''}`}
          >
            <path d="M4 6l4 4 4-4" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {showOtherOptions && (
          <div className="mt-2">
            {/* 4카드 */}
            <div className="flex gap-2 mb-2">
              {OTHER_CARDS.map(card => (
                <button
                  key={card.id}
                  onClick={() => setActiveCard(activeCard === card.id ? null : card.id)}
                  className={`${card.bg} rounded-[16px] p-3 flex flex-col flex-1 min-w-0 text-left transition-all ${
                    activeCard === card.id ? 'ring-2 ring-lime ring-offset-1 ring-offset-app-bg' : ''
                  }`}
                  style={{ minHeight: 110 }}
                >
                  <div className="mb-auto">{card.icon}</div>
                  <div className={`text-[12px] font-black tracking-tight mt-2 ${card.tc}`}>{card.label}</div>
                </button>
              ))}
            </div>

            {/* 선택된 카드 패널 */}
            {activeCard === 'rest' && (
              <OtherPanel title="오늘의 BOCO 분석">
                <StatusRow label="섭취" value={`${totalKcal.toLocaleString()} kcal`} />
                <StatusRow label="목표" value={`${targetKcal.toLocaleString()} kcal`} />
                <StatusRow
                  label="차이"
                  value={totalKcal > targetKcal
                    ? `+${(totalKcal - targetKcal).toLocaleString()} kcal`
                    : `-${Math.abs(totalKcal - targetKcal).toLocaleString()} kcal`}
                  highlight
                />
                <p className="text-[13px] text-gray-mid leading-relaxed mt-3">
                  {status === 'over'  && '오늘 페이스라면 지방이 조금 쌓일 수 있어요. 내일 조절해요!'}
                  {status === 'good'  && '완벽해요! 이대로라면 목표에 가까워지고 있어요.'}
                  {(status === 'under' || status === 'empty') && '너무 적게 먹으면 오히려 역효과예요.'}
                </p>
                <OtherDoneButton done={otherDone} onDone={() => { setOtherDone(true); saveExerciseLog({ date: getTodayDate(), cardType: 'rest', exercises: [] }) }} label="오늘은 이걸로" bg="bg-dark" />
              </OtherPanel>
            )}

            {activeCard === 'preferred' && (
              <OtherPanel title="선호 운동 세트">
                {preferred.length === 0 ? (
                  <p className="text-[13px] text-gray-mid">내정보에서 선호 운동을 설정해보세요</p>
                ) : (
                  <ExerciseTable exercises={preferred.map(name => getExerciseDetail(name))} />
                )}
                {preferred.length > 0 && (
                  <OtherDoneButton done={otherDone} onDone={() => { setOtherDone(true); saveExerciseLog({ date: getTodayDate(), cardType: 'preferred', exercises: preferred }) }} label="완료했어요!" bg="bg-lime" />
                )}
              </OtherPanel>
            )}

            {activeCard === 'recommended' && (
              <OtherPanel title="오늘의 추천 세트">
                <p className="text-[11px] text-gray-mid mb-3">
                  {status === 'over'  && '칼로리를 소모할 수 있는 고강도 세트예요'}
                  {status === 'good'  && '균형 잡힌 유지 운동 세트예요'}
                  {(status === 'under' || status === 'empty') && '가볍게 몸을 풀어주는 회복 세트예요'}
                </p>
                <ExerciseTable exercises={recommendedSets} />
                <OtherDoneButton done={otherDone} onDone={() => { setOtherDone(true); saveExerciseLog({ date: getTodayDate(), cardType: 'recommended', exercises: recommendedSets.map(e => e.name) }) }} label="완료했어요!" bg="bg-dark" />
              </OtherPanel>
            )}

            {activeCard === 'custom' && (
              <OtherPanel title="커스텀 운동 구성">
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
                          if (!customList.includes(customExercise.trim())) setCustomList(prev => [...prev, customExercise.trim()])
                          setCustomExercise('')
                        }
                      }}
                    />
                  </div>
                  {customExercise.trim() && (
                    <button
                      onClick={() => {
                        if (!customList.includes(customExercise.trim())) setCustomList(prev => [...prev, customExercise.trim()])
                        setCustomExercise('')
                      }}
                      className="bg-dark text-lime font-black text-[12px] px-3 rounded-[10px]"
                    >추가</button>
                  )}
                </div>
                <div className="mb-3">
                  <div className="text-[10px] font-black text-gray-mid tracking-widest uppercase mb-2">종목 선택</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PREFERRED_EXERCISES.map(name => {
                      const selected = customList.includes(name)
                      return (
                        <button
                          key={name}
                          onClick={() => setCustomList(prev => selected ? prev.filter(e => e !== name) : [...prev, name])}
                          className={`px-3 py-1.5 rounded-full text-[12px] font-black border transition-colors ${selected ? 'bg-dark text-lime border-dark' : 'bg-gray-50 text-gray-mid border-gray-light'}`}
                        >{name}</button>
                      )
                    })}
                  </div>
                </div>
                {customList.length > 0 && (
                  <>
                    <div className="border-t border-gray-100 pt-3 mb-1">
                      <div className="text-[10px] font-black text-gray-mid tracking-widest uppercase mb-2">오늘의 세트 ({customList.length}종목)</div>
                      <ExerciseTable
                        exercises={customList.map(name => getExerciseDetail(name))}
                        onRemove={i => setCustomList(prev => prev.filter((_, j) => j !== i))}
                      />
                    </div>
                    <OtherDoneButton done={otherDone} onDone={() => { setOtherDone(true); saveExerciseLog({ date: getTodayDate(), cardType: 'custom', exercises: customList }) }} label="완료했어요!" bg="bg-dark" />
                  </>
                )}
              </OtherPanel>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

/* ── 서브 컴포넌트들 ── */

function OtherPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[16px] p-4 border border-gray-light/50 mt-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full bg-lime" />
        <div className="text-[12px] font-black text-dark">{title}</div>
      </div>
      {children}
    </div>
  )
}

function OtherDoneButton({ done, onDone, label, bg }: { done: boolean; onDone: () => void; label: string; bg: string }) {
  if (done) return <div className="mt-3 text-center text-[13px] font-black text-lime">완료! 오늘도 고생했어요 🎯</div>
  return (
    <button
      onClick={onDone}
      className={`mt-3 w-full ${bg} ${bg === 'bg-lime' ? 'text-dark' : 'text-white'} font-black text-[14px] py-3.5 rounded-[14px]`}
    >{label}</button>
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

function ExerciseRow({ ex, onRemove, dark }: { ex: ExerciseItem; onRemove?: () => void; dark?: boolean }) {
  const isCardio = ex.type === 'cardio'
  const isFlex   = ex.type === 'flexibility'
  const dotColor = isCardio ? 'bg-orange' : isFlex ? 'bg-lime/60' : 'bg-lime'
  const nameColor = dark ? 'text-white' : 'text-dark'
  const chipBg   = dark ? 'bg-white/10' : 'bg-gray-50'
  const chipText = dark ? 'text-white/50' : 'text-gray-mid'

  return (
    <div className={`py-3 border-b last:border-0 ${dark ? 'border-white/10' : 'border-gray-50'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
          <span className={`text-[13px] font-bold ${nameColor}`}>{ex.name}</span>
          <span className={`text-[10px] ${chipText} ${chipBg} px-1.5 py-0.5 rounded-full`}>
            {isCardio ? '유산소' : isFlex ? '유연성' : ex.type === 'core' ? 'HIIT' : '근력'}
          </span>
        </div>
        {onRemove && <button onClick={onRemove} className="text-gray-mid text-sm px-1">✕</button>}
      </div>

      {isCardio && (
        <div className="flex gap-2 mt-2 ml-3.5">
          <MetaChip label="목표거리" value={ex.distance ?? '—'} accent dark={dark} />
          <MetaChip label="페이스"   value={ex.pace ?? '—'}     dark={dark} />
          <MetaChip label="예상시간" value={ex.duration ?? '—'} dark={dark} />
        </div>
      )}
      {(ex.type === 'strength' || ex.type === 'core') && (
        <div className="flex gap-2 mt-2 ml-3.5">
          <MetaChip label="세트" value={`${ex.sets ?? 3}세트`} accent dark={dark} />
          <MetaChip label="횟수" value={ex.reps ?? '10회'}     dark={dark} />
          <MetaChip label="휴식" value={ex.rest ?? '45초'}     dark={dark} />
        </div>
      )}
      {isFlex && (
        <div className="flex gap-2 mt-2 ml-3.5">
          <MetaChip label="시간"   value={ex.duration ?? '—'} accent dark={dark} />
          {ex.note && <MetaChip label="포인트" value={ex.note} dark={dark} />}
        </div>
      )}
    </div>
  )
}

function MetaChip({ label, value, accent, dark }: { label: string; value: string; accent?: boolean; dark?: boolean }) {
  const bg   = dark ? 'bg-white/10' : 'bg-gray-50'
  const lc   = dark ? 'text-white/40' : 'text-gray-mid'
  const vc   = accent
    ? (dark ? 'text-lime' : 'text-dark')
    : (dark ? 'text-white/60' : 'text-gray-mid')
  return (
    <div className={`flex flex-col items-center ${bg} rounded-[8px] px-2.5 py-1.5 min-w-[52px]`}>
      <span className={`text-[9px] ${lc}`}>{label}</span>
      <span className={`text-[12px] font-black mt-0.5 ${vc}`}>{value}</span>
    </div>
  )
}

function ExerciseTable({ exercises, onRemove, dark }: { exercises: ExerciseItem[]; onRemove?: (i: number) => void; dark?: boolean }) {
  return (
    <div>
      {exercises.map((ex, i) => (
        <ExerciseRow key={i} ex={ex} dark={dark} onRemove={onRemove ? () => onRemove(i) : undefined} />
      ))}
    </div>
  )
}

function MoonIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M22 16a10 10 0 01-10-10 10 10 0 000 20 10 10 0 0010-10z" fill="#C5E63A" />
    </svg>
  )
}
function StarIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M15 3l3 6.5 7 1-5 4.9 1.2 7L15 19l-6.2 3.4L10 15.4 5 10.5l7-1L15 3z" fill="#1A1A1A" />
    </svg>
  )
}
function FlameIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M15 27c-5.2 0-9.5-3.5-9.5-7.8 0-2.8 1.5-5.2 3.6-6.7 0 1.6.8 2.8 2 3.6 0-3.6 2-7.1 5.5-9.4 0 3.9 2.4 5.5 3.2 7.1.8-1.2.8-2.8 0-4.4 2.8 1.6 4.8 4.8 4.8 7.8 0 5.5-4.3 9.8-9.6 9.8z" fill="#C5E63A" stroke="#1A1A1A" strokeWidth="1.2" />
    </svg>
  )
}
function PencilIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="6" y="4" width="7.5" height="20" rx="2.5" transform="rotate(-45 15 15)" fill="#C5E63A" />
      <path d="M5 25l3-1.2-1.8-1.8z" fill="#C5E63A" />
    </svg>
  )
}
