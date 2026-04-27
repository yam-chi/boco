'use client'
import { useState, useEffect, useRef } from 'react'
import type { MealItem } from '@/utils/storage'

interface Props {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  existing: MealItem[]
  onSave: (items: MealItem[]) => void
  onClose: () => void
}

interface FoodResult {
  id: string
  name: string
  kcal: number
  serving: string
}

const LABELS = { breakfast: '아침', lunch: '점심', dinner: '저녁', snack: '간식' }

export default function FoodModal({ mealType, existing, onSave, onClose }: Props) {
  const [tab, setTab] = useState<'search' | 'manual'>('search')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<MealItem[]>(existing)
  const [manualName, setManualName] = useState('')
  const [manualKcal, setManualKcal] = useState('')
  const [results, setResults] = useState<FoodResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/foods?q=${encodeURIComponent(query.trim())}`)
        const data: FoodResult[] = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const totalKcal = selected.reduce((s, i) => s + i.kcal, 0)

  function addFood(food: FoodResult) {
    if (selected.find(s => s.name === food.name)) return
    setSelected(prev => [...prev, { name: food.name, kcal: food.kcal }])
  }

  function removeFood(name: string) {
    setSelected(prev => prev.filter(s => s.name !== name))
  }

  function addManual() {
    const k = parseInt(manualKcal)
    if (!manualName.trim() || isNaN(k) || k <= 0) return
    setSelected(prev => [...prev, { name: manualName.trim(), kcal: k }])
    setManualName('')
    setManualKcal('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[28px] flex flex-col max-h-[85vh]">
        <div className="w-10 h-1 bg-gray-light rounded-full mx-auto mt-3 mb-4 flex-shrink-0" />
        <div className="text-[16px] font-black text-dark px-5 pb-4 flex-shrink-0">
          {LABELS[mealType]} 기록
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 gap-5 flex-shrink-0">
          {(['search', 'manual'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[14px] font-bold pb-2.5 border-b-2 transition-colors ${tab === t ? 'text-dark border-dark' : 'text-gray-mid border-transparent'}`}
            >
              {t === 'search' ? '검색' : '직접 입력'}
            </button>
          ))}
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {tab === 'search' ? (
            <>
              {/* Search input */}
              <div className="mx-5 my-3 flex items-center gap-2 bg-gray-50 rounded-[12px] px-3.5 py-2.5 flex-shrink-0">
                <SearchIcon />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="음식 이름을 검색하세요"
                  className="flex-1 bg-transparent text-[14px] text-dark placeholder:text-gray-mid outline-none font-sans"
                />
                {loading && <LoadingSpinner />}
              </div>

              {/* Food list */}
              <div className="flex-1 overflow-y-auto px-5">
                {!query.trim() && (
                  <p className="text-[13px] text-gray-mid text-center py-8">
                    식품명을 입력하면<br />식약처 DB에서 검색해요
                  </p>
                )}
                {query.trim() && !loading && results.length === 0 && (
                  <p className="text-[13px] text-gray-mid text-center py-8">
                    검색 결과가 없어요<br />
                    <span className="text-[12px]">직접 입력 탭을 이용해보세요</span>
                  </p>
                )}
                {results.map(food => (
                  <button
                    key={food.id}
                    onClick={() => addFood(food)}
                    className="w-full flex justify-between items-center py-3 border-b border-gray-50 text-left"
                  >
                    <div>
                      <div className="text-[14px] font-bold text-dark">{food.name}</div>
                      <div className="text-[12px] text-gray-mid">{food.kcal} kcal · {food.serving}</div>
                    </div>
                    <span className={`text-[20px] font-black ${selected.find(s => s.name === food.name) ? 'text-lime' : 'text-gray-light'}`}>
                      {selected.find(s => s.name === food.name) ? '✓' : '+'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="px-5 py-4 flex flex-col gap-3 flex-shrink-0">
              <input
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="음식 이름"
                className="bg-gray-50 rounded-[12px] px-4 py-3 text-[14px] text-dark outline-none w-full font-sans"
              />
              <input
                value={manualKcal}
                onChange={e => setManualKcal(e.target.value)}
                placeholder="칼로리 (kcal)"
                type="number"
                className="bg-gray-50 rounded-[12px] px-4 py-3 text-[14px] text-dark outline-none w-full font-sans"
              />
              <button
                onClick={addManual}
                className="bg-lime text-dark font-black text-[14px] py-3 rounded-[14px]"
              >
                추가하기
              </button>
            </div>
          )}

          {/* Selected */}
          {selected.length > 0 && (
            <div className="flex-shrink-0 px-5 pt-3 pb-2 border-t border-gray-100">
              <div className="text-[11px] font-black text-gray-mid tracking-widest uppercase mb-2">선택한 음식</div>
              <div className="bg-lime/20 rounded-[12px] px-4 py-2 flex flex-col gap-1.5 max-h-28 overflow-y-auto">
                {selected.map(item => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div>
                      <span className="text-[13px] font-black text-dark">{item.name}</span>
                      <span className="text-[12px] text-dark/50 ml-2">{item.kcal} kcal</span>
                    </div>
                    <button onClick={() => removeFood(item.name)} className="text-gray-mid text-[16px] font-bold px-1">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="px-5 pb-8 pt-3 flex-shrink-0">
          <button
            onClick={() => onSave(selected)}
            disabled={selected.length === 0}
            className="w-full bg-dark text-white font-black text-[15px] py-4 rounded-[18px] disabled:opacity-40 transition-opacity"
          >
            저장하기 {totalKcal > 0 && `(${totalKcal.toLocaleString()} kcal)`}
          </button>
        </div>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="#888" strokeWidth="1.5" />
      <path d="M11 11l3 3" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="#DDD" strokeWidth="2" />
      <path d="M8 2a6 6 0 016 6" stroke="#888" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
