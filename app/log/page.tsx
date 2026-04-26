'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import { getMeals, getExerciseLogs } from '@/utils/storage'
import type { Meal, ExerciseLog } from '@/utils/storage'

const CARD_TYPE_LABEL: Record<string, string> = {
  rest: '휴식', preferred: '선호운동', recommended: '추천운동', custom: '커스텀',
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface DayData {
  date: string
  meals: Meal[]
  exercise: ExerciseLog | null
  totalKcal: number
}

function HeatmapCalendar({
  yearMonth,
  days,
  selectedDate,
  onSelect,
}: {
  yearMonth: string
  days: DayData[]
  selectedDate: string | null
  onSelect: (date: string) => void
}) {
  const [year, month] = yearMonth.split('-').map(Number)
  const today = new Date().toISOString().slice(0, 10)
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const totalDays = new Date(year, month, 0).getDate()
  const dayMap = new Map(days.map(d => [d.date, d]))

  function getLevel(date: string): 0 | 1 | 2 | 3 {
    const d = dayMap.get(date)
    if (!d) return 0
    const hasMeal = d.meals.length > 0
    const hasEx = !!d.exercise
    if (hasMeal && hasEx) return 3
    if (hasMeal) return 1
    if (hasEx) return 2
    return 0
  }

  const LEVEL_BG = ['bg-gray-100', 'bg-lime/30', 'bg-lime/55', 'bg-lime']

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="mx-4 mt-3 bg-white rounded-[20px] p-4 border border-gray-light/50">
      <div className="grid grid-cols-7 mb-1.5">
        {DAY_LABELS.map(d => (
          <div key={d} className={`text-center text-[10px] font-black ${d === '일' ? 'text-orange/70' : d === '토' ? 'text-blue-400/70' : 'text-gray-mid'}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const level = getLevel(dateStr)
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const isFuture = dateStr > today
          const hasData = level > 0
          return (
            <button
              key={dateStr}
              onClick={() => hasData && onSelect(dateStr)}
              disabled={!hasData}
              className={`aspect-square rounded-[8px] flex items-center justify-center relative transition-all ${isFuture ? 'opacity-30' : ''} ${LEVEL_BG[level]} ${isSelected ? 'ring-2 ring-dark ring-offset-1' : ''}`}
            >
              <span className={`text-[10px] font-black leading-none ${level === 3 ? 'text-dark' : level >= 1 ? 'text-dark/70' : 'text-gray-mid/60'}`}>
                {day}
              </span>
              {isToday && (
                <div className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full bg-dark" />
              )}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
        <span className="text-[10px] text-gray-mid">기록 강도</span>
        <div className="flex items-center gap-1">
          {LEVEL_BG.map((bg, lv) => (
            <div key={lv} className={`w-4 h-4 rounded-[4px] ${bg}`} />
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto text-[10px] text-gray-mid">
          <span>식사<span className="inline-block w-2 h-2 rounded-full bg-lime/30 ml-1 align-middle" /></span>
          <span>운동<span className="inline-block w-2 h-2 rounded-full bg-lime/55 ml-1 align-middle" /></span>
          <span>둘 다<span className="inline-block w-2 h-2 rounded-full bg-lime ml-1 align-middle" /></span>
        </div>
      </div>
    </div>
  )
}

function groupByMonth(days: DayData[]): Record<string, DayData[]> {
  return days.reduce((acc, d) => {
    const key = d.date.slice(0, 7)
    ;(acc[key] ??= []).push(d)
    return acc
  }, {} as Record<string, DayData[]>)
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-')
  return `${y}년 ${parseInt(m)}월`
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`
}

export default function LogPage() {
  const [mounted, setMounted] = useState(false)
  const [allDays, setAllDays] = useState<DayData[]>([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const meals = getMeals()
    const exLogs = getExerciseLogs()

    // 날짜별 그루핑
    const dateSet = new Set([
      ...meals.map(m => m.date),
      ...exLogs.map(e => e.date),
    ])

    const days: DayData[] = Array.from(dateSet).sort((a, b) => b.localeCompare(a)).map(date => {
      const dayMeals = meals.filter(m => m.date === date)
      return {
        date,
        meals: dayMeals,
        exercise: exLogs.find(e => e.date === date) ?? null,
        totalKcal: dayMeals.reduce((s, m) => s + m.totalKcal, 0),
      }
    })

    setAllDays(days)
    if (days.length > 0) setSelectedMonth(days[0].date.slice(0, 7))
  }, [])

  if (!mounted) return null

  const grouped = groupByMonth(allDays)
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
  const currentDays = grouped[selectedMonth] ?? []

  return (
    <div className="flex flex-col min-h-screen bg-app-bg pb-[72px]">
      <div className="px-5 pt-5 pb-2">
        <div className="text-[12px] font-bold text-gray-mid mb-1">기록</div>
        <div className="text-[22px] font-black text-dark tracking-tight">일지</div>
      </div>

      {allDays.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <EmptyIllustration />
          <div className="text-[16px] font-black text-dark">아직 기록이 없어요</div>
          <div className="text-[13px] text-gray-mid leading-relaxed">
            홈에서 식사를 기록하면<br />여기에 쌓여요
          </div>
        </div>
      ) : (
        <>
          {/* 월 탭 */}
          <div className="px-4 flex gap-2 overflow-x-auto pb-1 mt-1" style={{ scrollbarWidth: 'none' }}>
            {months.map(ym => (
              <button
                key={ym}
                onClick={() => setSelectedMonth(ym)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-black transition-colors ${
                  selectedMonth === ym ? 'bg-dark text-lime' : 'bg-white text-gray-mid border border-gray-light'
                }`}
              >
                {formatMonth(ym)}
              </button>
            ))}
          </div>

          {/* 월별 요약 */}
          <div className="mx-4 mt-3 bg-dark rounded-[20px] p-4 flex gap-4">
            <SummaryChip
              label="기록한 날"
              value={`${currentDays.length}일`}
              accent
            />
            <div className="w-px bg-white/10" />
            <SummaryChip
              label="평균 섭취"
              value={currentDays.length > 0
                ? `${Math.round(currentDays.reduce((s, d) => s + d.totalKcal, 0) / currentDays.length).toLocaleString()} kcal`
                : '—'}
            />
            <div className="w-px bg-white/10" />
            <SummaryChip
              label="운동한 날"
              value={`${currentDays.filter(d => d.exercise && d.exercise.cardType !== 'rest').length}일`}
            />
          </div>

          {/* 히트맵 캘린더 */}
          <HeatmapCalendar
            yearMonth={selectedMonth}
            days={currentDays}
            selectedDate={expandedDate}
            onSelect={(date) => setExpandedDate(expandedDate === date ? null : date)}
          />

          {/* 날짜별 카드 */}
          <div className="px-4 mt-3 flex flex-col gap-2">
            {currentDays.map(day => (
              <DayCard
                key={day.date}
                day={day}
                expanded={expandedDate === day.date}
                onToggle={() => setExpandedDate(expandedDate === day.date ? null : day.date)}
              />
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  )
}

function SummaryChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col flex-1 items-center">
      <span className="text-[10px] text-white/40">{label}</span>
      <span className={`text-[16px] font-black mt-0.5 ${accent ? 'text-lime' : 'text-white'}`}>{value}</span>
    </div>
  )
}

const MEAL_LABEL: Record<string, string> = { breakfast: '아침', lunch: '점심', dinner: '저녁', snack: '간식' }
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack']

function DayCard({ day, expanded, onToggle }: { day: DayData; expanded: boolean; onToggle: () => void }) {
  const hasMeals = day.meals.length > 0
  const hasExercise = !!day.exercise

  return (
    <div className="bg-white rounded-[18px] overflow-hidden border border-gray-light/50">
      {/* 헤더 행 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-10 h-10 rounded-[12px] bg-app-bg flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-black text-dark leading-none">{new Date(day.date).getDate()}</span>
          <span className="text-[9px] text-gray-mid">
            {['일','월','화','수','목','금','토'][new Date(day.date).getDay()]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-black text-dark">{formatDay(day.date)}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {hasMeals && (
              <span className="text-[10px] bg-lime/20 text-dark font-bold px-2 py-0.5 rounded-full">
                {day.totalKcal.toLocaleString()} kcal
              </span>
            )}
            {hasExercise && (
              <span className="text-[10px] bg-dark text-lime font-bold px-2 py-0.5 rounded-full">
                {CARD_TYPE_LABEL[day.exercise!.cardType]}
              </span>
            )}
            {!hasMeals && !hasExercise && (
              <span className="text-[10px] text-gray-mid">기록 없음</span>
            )}
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          className={`flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 확장 상세 */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-50">
          {/* 식사 */}
          {hasMeals && (
            <div className="mt-3">
              <div className="text-[10px] font-black text-gray-mid tracking-widest uppercase mb-2">식사 기록</div>
              <div className="flex flex-col gap-1.5">
                {MEAL_ORDER
                  .map(type => day.meals.find(m => m.mealType === type))
                  .filter(Boolean)
                  .map(meal => (
                    <div key={meal!.mealType} className="flex items-start gap-3 bg-app-bg rounded-[12px] px-3 py-2.5">
                      <span className="text-[11px] font-black text-gray-mid w-6 flex-shrink-0 pt-0.5">
                        {MEAL_LABEL[meal!.mealType]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-dark leading-relaxed">
                          {meal!.items.map(i => i.name).join(', ')}
                        </div>
                      </div>
                      <span className="text-[12px] font-black text-dark flex-shrink-0">
                        {meal!.totalKcal.toLocaleString()}
                        <span className="text-[10px] font-normal text-gray-mid"> kcal</span>
                      </span>
                    </div>
                  ))
                }
                <div className="flex justify-end mt-1 pr-1">
                  <span className="text-[11px] text-gray-mid">합계 </span>
                  <span className="text-[13px] font-black text-dark ml-1.5">{day.totalKcal.toLocaleString()} kcal</span>
                </div>
              </div>
            </div>
          )}

          {/* 운동 */}
          {hasExercise && (
            <div className={hasMeals ? 'border-t border-gray-100 pt-3' : 'mt-3'}>
              <div className="text-[10px] font-black text-gray-mid tracking-widest uppercase mb-2">운동 기록</div>
              <div className="bg-dark rounded-[12px] px-3 py-2.5">
                <span className="text-[11px] font-black text-lime">
                  {CARD_TYPE_LABEL[day.exercise!.cardType]}
                </span>
                {day.exercise!.exercises.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {day.exercise!.exercises.map(ex => (
                      <span key={ex} className="text-[11px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="10" y="8" width="60" height="64" rx="10" fill="#E8E8E4" />
      <rect x="20" y="22" width="40" height="4" rx="2" fill="#CCCCCC" />
      <rect x="20" y="32" width="30" height="4" rx="2" fill="#CCCCCC" />
      <rect x="20" y="42" width="35" height="4" rx="2" fill="#CCCCCC" />
      <rect x="20" y="52" width="20" height="4" rx="2" fill="#CCCCCC" />
      <circle cx="56" cy="56" r="16" fill="#C5E63A" />
      <path d="M49 56l4 4 8-8" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
