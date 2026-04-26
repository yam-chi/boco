'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { getProfile, saveProfile } from '@/utils/storage'
import type { UserProfile } from '@/utils/storage'
import { calcTargetKcal } from '@/utils/tdee'
import { PREFERRED_EXERCISES } from '@/constants/exercises'

const GOALS = [
  { value: 'loss', label: '살 빼기', icon: '🔥', desc: '칼로리 적자로 체중 감량' },
  { value: 'maintain', label: '유지하기', icon: '⚖️', desc: '현재 체중 그대로 유지' },
  { value: 'gain', label: '근육 키우기', icon: '💪', desc: '칼로리 잉여로 근육 증가' },
] as const

const ACTIVITIES = [
  { value: 1.2, label: '거의 안 함', desc: '주로 앉아서 생활해요' },
  { value: 1.375, label: '가끔 운동', desc: '주 1~3회 가볍게 운동해요' },
  { value: 1.55, label: '자주 운동', desc: '주 3~5회 꾸준히 운동해요' },
  { value: 1.725, label: '매일 운동', desc: '거의 매일 강도 높게 운동해요' },
] as const

export default function ProfilePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [profileDone, setProfileDone] = useState(false)
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [goal, setGoal] = useState<UserProfile['goal']>('loss')
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(1.375)
  const [preferredExercises, setPreferredExercises] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMounted(true)
    const p = getProfile()
    if (p?.profileDone) {
      setProfileDone(true)
      setWeight(String(p.weight))
      setHeight(String(p.height ?? ''))
      setGoal(p.goal)
      setActivityLevel(p.activityLevel)
      setPreferredExercises(p.preferredExercises)
    }
  }, [])

  if (!mounted) return null

  const weightNum = parseFloat(weight)
  const heightNum = parseFloat(height)
  const isValid = weightNum >= 30 && weightNum <= 200 && heightNum >= 100 && heightNum <= 250 && !!goal && !!activityLevel
  const previewKcal = isValid ? calcTargetKcal({ weight: weightNum, goal, activityLevel }) : 0

  function toggleExercise(ex: string) {
    setPreferredExercises(prev =>
      prev.includes(ex) ? prev.filter(e => e !== ex) : prev.length < 3 ? [...prev, ex] : prev
    )
  }

  function handleSave() {
    if (!isValid) return
    const targetKcal = calcTargetKcal({ weight: weightNum, goal, activityLevel })
    saveProfile({ weight: weightNum, height: heightNum, goal, activityLevel, targetKcal, preferredExercises, profileDone: true })
    setSaved(true)
    setTimeout(() => {
      router.push('/')
    }, 800)
  }

  return (
    <div className="flex flex-col min-h-screen bg-app-bg pb-[72px]">
      <div className="px-5 pt-5 pb-2">
        <div className="text-[12px] font-bold text-gray-mid mb-1">내 정보</div>
        <div className="text-[22px] font-black text-dark tracking-tight">프로필</div>
      </div>

      {/* Profile top card */}
      {profileDone && (
        <div className="mx-4 mt-3 bg-dark rounded-[24px] p-5 flex items-center gap-3.5 mb-2">
          <div className="w-14 h-14 rounded-[16px] bg-lime flex items-center justify-center flex-shrink-0">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="11" r="6" fill="#1A1A1A" />
              <path d="M4 30c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-[18px] font-black text-white">BOCO 유저</div>
            <div className="text-[13px] text-lime font-bold mt-0.5">하루 목표 {previewKcal > 0 ? previewKcal.toLocaleString() : '—'} kcal</div>
            <div className="text-[11px] text-white/40 mt-1">
              {weight && height ? `${weight}kg · ${height}cm` : ''}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 flex flex-col gap-4 mt-2">
        {/* 기본 정보 label */}
        <div className="text-[11px] font-black text-gray-mid tracking-widest uppercase">기본 정보</div>

        {/* Weight + Height */}
        <div className="bg-white rounded-[16px] p-4">
          <div className="text-[12px] font-bold text-gray-mid mb-2">신체 정보</div>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="text-[11px] text-gray-mid mb-1.5">몸무게</div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-[12px] px-3 py-3">
                <input
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  type="number"
                  placeholder="68"
                  min={30}
                  max={200}
                  className="flex-1 bg-transparent text-[24px] font-black text-dark outline-none w-full font-sans"
                />
                <span className="text-[14px] font-bold text-gray-mid">kg</span>
              </div>
              {weight && (parseFloat(weight) < 30 || parseFloat(weight) > 200) && (
                <p className="text-[11px] text-orange mt-1">30~200kg</p>
              )}
            </div>
            <div className="flex-1">
              <div className="text-[11px] text-gray-mid mb-1.5">키</div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-[12px] px-3 py-3">
                <input
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  type="number"
                  placeholder="170"
                  min={100}
                  max={250}
                  className="flex-1 bg-transparent text-[24px] font-black text-dark outline-none w-full font-sans"
                />
                <span className="text-[14px] font-bold text-gray-mid">cm</span>
              </div>
              {height && (parseFloat(height) < 100 || parseFloat(height) > 250) && (
                <p className="text-[11px] text-orange mt-1">100~250cm</p>
              )}
            </div>
          </div>
        </div>

        {/* Goal */}
        <div className="bg-white rounded-[16px] p-4">
          <div className="text-[12px] font-bold text-gray-mid mb-3">목표</div>
          <div className="flex flex-col gap-2">
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`flex items-center gap-4 p-3.5 rounded-[12px] border-2 text-left transition-colors ${goal === g.value ? 'border-dark bg-lime/20' : 'border-gray-light bg-gray-50'}`}
              >
                <span className="text-[24px]">{g.icon}</span>
                <div>
                  <div className="text-[14px] font-black text-dark">{g.label}</div>
                  <div className="text-[12px] text-gray-mid mt-0.5">{g.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-[16px] p-4">
          <div className="text-[12px] font-bold text-gray-mid mb-3">활동 수준</div>
          <div className="flex flex-col gap-2">
            {ACTIVITIES.map(a => (
              <button
                key={a.value}
                onClick={() => setActivityLevel(a.value)}
                className={`flex items-center justify-between p-3.5 rounded-[12px] border-2 text-left transition-colors ${activityLevel === a.value ? 'border-dark bg-lime/20' : 'border-gray-light bg-gray-50'}`}
              >
                <div>
                  <div className="text-[14px] font-black text-dark">{a.label}</div>
                  <div className="text-[12px] text-gray-mid mt-0.5">{a.desc}</div>
                </div>
                {activityLevel === a.value && (
                  <div className="w-5 h-5 rounded-full bg-dark flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#C5E63A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div className="bg-white rounded-[16px] p-4">
          <div className="text-[12px] font-bold text-gray-mid mb-1">선호 운동</div>
          <div className="text-[11px] text-gray-mid mb-3">최대 3개 선택</div>
          <div className="flex flex-wrap gap-2">
            {PREFERRED_EXERCISES.map(ex => {
              const selected = preferredExercises.includes(ex)
              return (
                <button
                  key={ex}
                  onClick={() => toggleExercise(ex)}
                  className={`px-4 py-2 rounded-[999px] text-[13px] font-black border-2 transition-colors ${selected ? 'bg-dark text-lime border-dark' : 'bg-gray-50 text-gray-mid border-gray-light'}`}
                >
                  {ex}
                </button>
              )
            })}
          </div>
        </div>

        {/* Target kcal preview */}
        {isValid && (
          <div className="bg-dark rounded-[16px] p-4 flex justify-between items-center">
            <div className="text-[13px] text-white/60">하루 목표 칼로리</div>
            <div className="text-[24px] font-black text-lime tracking-tight">{previewKcal.toLocaleString()} kcal</div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!isValid || saved}
          className={`w-full font-black text-[16px] py-[18px] rounded-[18px] transition-all ${saved ? 'bg-lime text-dark' : 'bg-dark text-white disabled:opacity-40'}`}
        >
          {saved ? '저장됐어요!' : '저장하기'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
