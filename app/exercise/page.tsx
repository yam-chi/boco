'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import { BodyMapFront, BodyMapBack, MUSCLE_LABELS } from '@/components/BodyMap'
import {
  getProfile, getTodayDate, getTodayExerciseSessions,
  addExerciseSession, removeExerciseSession,
} from '@/utils/storage'
import type { ExerciseSession } from '@/utils/storage'

function formatDateKo() {
  const d = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`
}

export default function ExercisePage() {
  const [mounted, setMounted] = useState(false)
  const [sessions, setSessions] = useState<ExerciseSession[]>([])
  const [preferred, setPreferred] = useState<string[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    setMounted(true)
    const profile = getProfile()
    setPreferred(profile?.preferredExercises ?? [])
    setSessions(getTodayExerciseSessions())
  }, [])

  if (!mounted) return null

  const totalBurned = sessions.reduce((s, e) => s + e.burnedKcal, 0)

  // all muscles worked today
  const allMuscles = Array.from(new Set(sessions.flatMap(s => s.muscles ?? [])))

  async function handleSubmit() {
    if (!inputText.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/analyze-exercise', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      })
      const items: Omit<ExerciseSession, 'id' | 'date'>[] = await res.json()
      for (const item of items) {
        const session: ExerciseSession = {
          ...item,
          id: `${Date.now()}_${Math.random()}`,
          date: getTodayDate(),
        }
        addExerciseSession(session)
      }
      setSessions(getTodayExerciseSessions())
      setInputText('')
      setShowInput(false)
    } finally {
      setLoading(false)
    }
  }

  function handleRemove(id: string) {
    removeExerciseSession(id)
    setSessions(getTodayExerciseSessions())
  }

  function handleChip(name: string) {
    setInputText(name + ' ')
    setShowInput(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#141412] pb-[72px]">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-6 pb-4">
        <div>
          <div className="text-[11px] font-medium text-white/30 mb-0.5">{formatDateKo()}</div>
          <div className="text-[20px] font-black text-white leading-tight">오늘의 운동</div>
        </div>
        {totalBurned > 0 && (
          <div className="bg-[#C5E63A]/15 rounded-[12px] px-3 py-1.5">
            <span className="text-[#C5E63A] font-black text-[14px]">-{totalBurned} kcal</span>
          </div>
        )}
      </div>

      {/* Body Map */}
      <div className="mx-4 bg-white/4 rounded-[24px] p-4">
        <div className="text-[11px] font-bold text-white/30 mb-3 tracking-wider uppercase">오늘 운동한 부위</div>
        <div className="flex gap-2 justify-center items-start">
          <BodyMapFront sessions={sessions} />
          <BodyMapBack sessions={sessions} />
        </div>
        {allMuscles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {allMuscles.map(m => (
              <span key={m} className="text-[11px] font-bold text-[#C5E63A] bg-[#C5E63A]/10 px-2 py-0.5 rounded-full">
                {MUSCLE_LABELS[m] ?? m}
              </span>
            ))}
          </div>
        )}
        {allMuscles.length === 0 && (
          <p className="text-[12px] text-white/20 text-center mt-1">운동을 기록하면 여기에 표시돼요</p>
        )}
      </div>

      {/* Quick chips */}
      {preferred.length > 0 && (
        <div className="mx-4 mt-3">
          <div className="text-[11px] font-bold text-white/30 mb-2 tracking-wider uppercase">내 운동</div>
          <div className="flex flex-wrap gap-2">
            {preferred.map(name => (
              <button
                key={name}
                onClick={() => handleChip(name)}
                className="px-3 py-1.5 rounded-full text-[12px] font-bold bg-white/6 text-white/60 border border-white/8 active:bg-white/12"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="mx-4 mt-3">
        {showInput ? (
          <div className="bg-white/5 rounded-[16px] border border-white/8 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3">
              <input
                autoFocus
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                placeholder="벤치프레스 3세트 10회 60kg"
                className="flex-1 text-[13px] text-white/80 placeholder:text-white/20 outline-none bg-transparent"
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !inputText.trim()}
                className="w-7 h-7 rounded-[8px] bg-[#C5E63A] flex items-center justify-center disabled:opacity-30"
              >
                {loading
                  ? <svg width="12" height="12" viewBox="0 0 12 12" className="animate-spin" fill="none"><circle cx="6" cy="6" r="4" stroke="rgba(0,0,0,0.2)" strokeWidth="2"/><path d="M6 2a4 4 0 014 4" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/></svg>
                  : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
              </button>
            </div>
            <div className="px-4 pb-2.5 text-[11px] text-white/20">
              예) 스쿼트 4세트 12회 / 달리기 30분 / 풀업 3세트
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="w-full flex items-center justify-between bg-white/5 rounded-[16px] border border-white/8 px-4 py-3.5"
          >
            <span className="text-[13px] text-white/30">운동 기록 추가</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="rgba(255,255,255,0.2)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Session list */}
      {sessions.length > 0 && (
        <div className="mx-4 mt-3">
          <div className="text-[11px] font-bold text-white/30 mb-2 tracking-wider uppercase">오늘 기록</div>
          <div className="flex flex-col gap-2">
            {sessions.map(s => (
              <div key={s.id} className="bg-white/5 rounded-[14px] px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-bold text-white">{s.type}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">
                    {s.sets && s.reps ? `${s.sets}세트 × ${s.reps}회` : ''}
                    {s.weight ? ` · ${s.weight}kg` : ''}
                    {s.durationMin ? `${s.durationMin}분` : ''}
                    {s.steps ? `${s.steps.toLocaleString()}보` : ''}
                    {s.muscles?.length ? ` · ${s.muscles.slice(0, 2).map(m => MUSCLE_LABELS[m] ?? m).join(', ')}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-black text-[#C5E63A]">-{s.burnedKcal}</span>
                  <button onClick={() => handleRemove(s.id)} className="text-white/20 hover:text-white/50">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

