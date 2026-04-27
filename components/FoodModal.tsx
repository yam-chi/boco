'use client'
import { useState, useRef } from 'react'
import type { MealItem } from '@/utils/storage'

interface Props {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  existing: MealItem[]
  onSave: (items: MealItem[]) => void
  onClose: () => void
}

const LABELS = { breakfast: '아침', lunch: '점심', dinner: '저녁', snack: '간식' }

export default function FoodModal({ mealType, existing, onSave, onClose }: Props) {
  const [tab, setTab] = useState<'ai' | 'photo' | 'manual'>('ai')
  const [selected, setSelected] = useState<MealItem[]>(existing)

  // AI 텍스트
  const [aiText, setAiText] = useState('')
  const [loading, setLoading] = useState(false)

  // 사진
  const [preview, setPreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<{ base64: string; mediaType: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // 직접 입력
  const [manualName, setManualName] = useState('')
  const [manualKcal, setManualKcal] = useState('')

  const totalKcal = selected.reduce((s, i) => s + i.kcal, 0)

  async function analyzeText() {
    if (!aiText.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: aiText }),
      })
      const items: MealItem[] = await res.json()
      mergeItems(items)
      setAiText('')
    } finally {
      setLoading(false)
    }
  }

  async function analyzePhoto() {
    if (!imageData) return
    setLoading(true)
    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image: imageData.base64, mediaType: imageData.mediaType }),
      })
      const items: MealItem[] = await res.json()
      mergeItems(items)
      setPreview(null)
      setImageData(null)
    } finally {
      setLoading(false)
    }
  }

  function mergeItems(items: MealItem[]) {
    setSelected(prev => {
      const next = [...prev]
      for (const item of items) {
        if (!next.find(e => e.name === item.name)) next.push(item)
      }
      return next
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)
      const base64 = dataUrl.split(',')[1]
      setImageData({ base64, mediaType: file.type })
    }
    reader.readAsDataURL(file)
  }

  function addManual() {
    const k = parseInt(manualKcal)
    if (!manualName.trim() || isNaN(k) || k <= 0) return
    mergeItems([{ name: manualName.trim(), kcal: k }])
    setManualName('')
    setManualKcal('')
  }

  function removeItem(name: string) {
    setSelected(prev => prev.filter(s => s.name !== name))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[28px] flex flex-col max-h-[90vh]">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4 flex-shrink-0" />
        <div className="text-[16px] font-black text-dark px-5 pb-3 flex-shrink-0">
          {LABELS[mealType]} 기록
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 gap-4 flex-shrink-0">
          {([
            { id: 'ai',     label: '✍️ 텍스트' },
            { id: 'photo',  label: '📷 사진'   },
            { id: 'manual', label: '직접 입력' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-[13px] font-bold pb-2.5 border-b-2 transition-colors ${tab === t.id ? 'text-dark border-dark' : 'text-gray-400 border-transparent'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">

          {/* ── 텍스트 AI 탭 ── */}
          {tab === 'ai' && (
            <div className="px-5 py-4 flex flex-col gap-3 flex-shrink-0">
              <div className="text-[12px] text-gray-400 leading-relaxed">
                먹은 음식을 자유롭게 써주세요.<br />
                <span className="text-dark font-bold">예) 계란 2개, 두부 반 모, 아메리카노 한 잔</span>
              </div>
              <textarea
                autoFocus
                value={aiText}
                onChange={e => setAiText(e.target.value)}
                placeholder="오늘 먹은 것을 입력하세요..."
                rows={3}
                className="bg-gray-50 rounded-[14px] px-4 py-3 text-[14px] text-dark outline-none w-full font-sans resize-none"
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) analyzeText() }}
              />
              <button
                onClick={analyzeText}
                disabled={loading || !aiText.trim()}
                className="w-full bg-dark text-lime font-black text-[14px] py-3.5 rounded-[14px] disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner /> : null}
                {loading ? 'AI 계산 중...' : '칼로리 계산하기'}
              </button>
            </div>
          )}

          {/* ── 사진 탭 ── */}
          {tab === 'photo' && (
            <div className="px-5 py-4 flex flex-col gap-3 flex-shrink-0">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              {!preview ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-200 rounded-[16px] flex flex-col items-center justify-center gap-2 text-gray-400"
                >
                  <span className="text-4xl">📷</span>
                  <span className="text-[13px] font-bold">사진 찍기 또는 앨범에서 선택</span>
                  <span className="text-[11px]">음식 사진을 올리면 AI가 칼로리를 계산해요</span>
                </button>
              ) : (
                <div className="relative">
                  <img src={preview} alt="food" className="w-full h-44 object-cover rounded-[16px]" />
                  <button
                    onClick={() => { setPreview(null); setImageData(null) }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full text-white text-sm flex items-center justify-center"
                  >✕</button>
                </div>
              )}
              {preview && (
                <button
                  onClick={analyzePhoto}
                  disabled={loading}
                  className="w-full bg-dark text-lime font-black text-[14px] py-3.5 rounded-[14px] disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? <LoadingSpinner /> : null}
                  {loading ? 'AI 분석 중...' : '이 음식 분석하기'}
                </button>
              )}
            </div>
          )}

          {/* ── 직접 입력 탭 ── */}
          {tab === 'manual' && (
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
              >추가하기</button>
            </div>
          )}

          {/* ── 선택된 음식 목록 ── */}
          {selected.length > 0 && (
            <div className="flex-shrink-0 px-5 pt-3 pb-2 border-t border-gray-100 overflow-y-auto max-h-44">
              <div className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2">
                기록 목록 · {totalKcal.toLocaleString()} kcal
              </div>
              <div className="flex flex-col gap-1.5">
                {selected.map(item => (
                  <div key={item.name} className="flex justify-between items-center bg-lime/15 rounded-[10px] px-3 py-2">
                    <div>
                      <span className="text-[13px] font-black text-dark">{item.name}</span>
                      <span className="text-[12px] text-dark/50 ml-2">{item.kcal} kcal</span>
                    </div>
                    <button onClick={() => removeItem(item.name)} className="text-gray-400 text-[14px] px-1">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 저장 버튼 */}
        <div className="px-5 pb-8 pt-3 flex-shrink-0">
          <button
            onClick={() => onSave(selected)}
            disabled={selected.length === 0}
            className="w-full bg-dark text-white font-black text-[15px] py-4 rounded-[18px] disabled:opacity-40"
          >
            저장하기 {totalKcal > 0 && `(${totalKcal.toLocaleString()} kcal)`}
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M8 2a6 6 0 016 6" stroke="#C5E63A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
