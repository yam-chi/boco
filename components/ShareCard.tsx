'use client'
import { useRef, useEffect, useState } from 'react'
import type { Meal } from '@/utils/storage'

interface Props {
  meals: Meal[]
  totalKcal: number
  targetKcal: number
  burnedKcal: number
  onClose: () => void
}

function calcRanking(totalKcal: number, targetKcal: number, burnedKcal: number): number {
  if (targetKcal === 0) return 50
  const net = totalKcal - burnedKcal
  const ratio = net / targetKcal
  // closer to 1.0 = better rank
  const diff = Math.abs(ratio - 1.0)
  if (diff < 0.05) return 5
  if (diff < 0.10) return 12
  if (diff < 0.15) return 20
  if (diff < 0.25) return 35
  return 55
}

export default function ShareCard({ meals, totalKcal, targetKcal, burnedKcal, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(true)

  const ranking = calcRanking(totalKcal, targetKcal, burnedKcal)
  const mainMeals = ['breakfast', 'lunch', 'dinner'] as const
  const LABELS: Record<string, string> = { breakfast: '아침', lunch: '점심', dinner: '저녁' }

  useEffect(() => {
    generate()
  }, [])

  async function generate() {
    const canvas = canvasRef.current
    if (!canvas) return
    const SIZE = 1080
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = '#141412'
    ctx.fillRect(0, 0, SIZE, SIZE)

    // Load meal photos
    const panelW = SIZE / 3
    const photoH = SIZE * 0.72

    const photoMeals = mainMeals.map(type => meals.find(m => m.mealType === type))

    await Promise.all(
      photoMeals.map((meal, i) => new Promise<void>(resolve => {
        if (!meal?.photoUrl) {
          // empty panel
          ctx.fillStyle = i === 0 ? '#1E1E1B' : i === 1 ? '#1A1A18' : '#181816'
          ctx.fillRect(i * panelW, 0, panelW - 2, photoH)

          // + icon
          ctx.strokeStyle = 'rgba(255,255,255,0.12)'
          ctx.lineWidth = 3
          const cx = i * panelW + panelW / 2
          const cy = photoH / 2
          ctx.beginPath()
          ctx.moveTo(cx - 18, cy)
          ctx.lineTo(cx + 18, cy)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(cx, cy - 18)
          ctx.lineTo(cx, cy + 18)
          ctx.stroke()

          // label
          ctx.fillStyle = 'rgba(255,255,255,0.2)'
          ctx.font = 'bold 24px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(LABELS[mainMeals[i]], cx, cy + 52)
          resolve()
          return
        }

        const img = new Image()
        img.onload = () => {
          const x = i * panelW + (i > 0 ? 2 : 0)
          const w = panelW - (i > 0 ? 2 : 0)
          // cover crop
          const scale = Math.max(w / img.width, photoH / img.height)
          const sw = w / scale
          const sh = photoH / scale
          const sx = (img.width - sw) / 2
          const sy = (img.height - sh) / 2
          ctx.drawImage(img, sx, sy, sw, sh, x, 0, w, photoH)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = meal.photoUrl!
      }))
    )

    // Bottom gradient overlay
    const grad = ctx.createLinearGradient(0, photoH * 0.55, 0, photoH)
    grad.addColorStop(0, 'rgba(20,20,18,0)')
    grad.addColorStop(1, 'rgba(20,20,18,0.92)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, SIZE, photoH)

    // Stats section below photos
    ctx.fillStyle = '#141412'
    ctx.fillRect(0, photoH, SIZE, SIZE - photoH)

    // Divider line
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(0, photoH, SIZE, 1)

    // --- Ranking badge ---
    const badgeY = photoH + 52
    ctx.textAlign = 'center'

    ctx.fillStyle = 'rgba(197,230,58,0.12)'
    roundRect(ctx, SIZE / 2 - 120, photoH + 20, 240, 64, 20)
    ctx.fill()

    ctx.fillStyle = '#C5E63A'
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText(`상위 ${ranking}%`, SIZE / 2, badgeY + 4)

    // subtitle
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '26px sans-serif'
    ctx.fillText('오늘의 식단 점수', SIZE / 2, badgeY + 40)

    // --- Kcal row ---
    const statsY = photoH + 150

    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    roundRect(ctx, 60, statsY, SIZE - 120, 90, 20)
    ctx.fill()

    const cols = [
      { label: '섭취', value: `${totalKcal.toLocaleString()}`, unit: 'kcal' },
      { label: '목표', value: `${targetKcal.toLocaleString()}`, unit: 'kcal' },
      { label: '운동', value: burnedKcal > 0 ? `-${burnedKcal}` : '—', unit: burnedKcal > 0 ? 'kcal' : '' },
    ]
    cols.forEach((col, i) => {
      const cx = 60 + (SIZE - 120) / 6 + i * (SIZE - 120) / 3
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font = '22px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(col.label, cx, statsY + 34)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 34px sans-serif'
      ctx.fillText(col.value, cx, statsY + 68)
    })

    // --- BOCO branding ---
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('BOCO', SIZE / 2, SIZE - 28)

    // Meal kcal labels over photos
    photoMeals.forEach((meal, i) => {
      if (!meal?.items?.length) return
      const cx = i * panelW + panelW / 2
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      roundRect(ctx, i * panelW + 12, photoH - 56, panelW - 28, 44, 10)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(LABELS[mainMeals[i]], cx, photoH - 38)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 24px sans-serif'
      ctx.fillText(`${meal.totalKcal}kcal`, cx, photoH - 18)
    })

    setImageUrl(canvas.toDataURL('image/jpeg', 0.92))
    setGenerating(false)
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  async function handleShare() {
    if (!imageUrl) return
    const blob = await (await fetch(imageUrl)).blob()
    const file = new File([blob], 'boco-today.jpg', { type: 'image/jpeg' })
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'BOCO 오늘의 식단' })
    } else {
      // fallback: download
      const a = document.createElement('a')
      a.href = imageUrl
      a.download = 'boco-today.jpg'
      a.click()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-[#1A1A18] rounded-t-[28px] px-5 pt-3 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-4" />

        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview */}
        <div className="rounded-[16px] overflow-hidden mb-4 bg-[#141412]" style={{ aspectRatio: '1/1' }}>
          {generating ? (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" className="animate-spin" fill="none">
                <circle cx="14" cy="14" r="11" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                <path d="M14 3a11 11 0 0111 11" stroke="#C5E63A" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="share card" className="w-full h-full object-cover" />
          ) : null}
        </div>

        {/* Ranking summary */}
        {!generating && (
          <div className="text-center mb-4">
            <div className="text-[13px] text-white/40">오늘 식단</div>
            <div className="text-[28px] font-black text-[#C5E63A]">상위 {ranking}%</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            disabled={generating}
            className="flex-1 bg-[#C5E63A] text-[#141412] font-black text-[15px] py-4 rounded-[16px] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M12 6l3-3-3-3M15 3H9a6 6 0 000 12h1" stroke="#141412" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            공유하기
          </button>
          <button
            onClick={onClose}
            className="w-14 bg-white/8 rounded-[16px] flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2l14 14M16 2L2 16" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
