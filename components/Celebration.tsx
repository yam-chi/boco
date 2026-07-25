'use client'
import { useEffect, useState } from 'react'

interface Props {
  message: string
  sub?: string
  onDone: () => void
}

const COLORS = ['#C5E63A', '#FF6B4A', '#4AE0FF', '#FF4AC8', '#FFD94A']
const PARTICLE_COUNT = 36

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a)
}

export default function Celebration({ message, sub, onDone }: Props) {
  const [visible, setVisible] = useState(true)
  const [particles] = useState(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: randomBetween(10, 90),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(6, 14),
      delay: randomBetween(0, 0.3),
      duration: randomBetween(0.9, 1.4),
      angle: randomBetween(-60, 60),
      dist: randomBetween(40, 80),
    }))
  )

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
    >
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: '45%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `particle-fly ${p.duration}s ${p.delay}s ease-out both`,
            '--angle': `${p.angle}deg`,
            '--dist': `${p.dist}vh`,
          } as React.CSSProperties}
        />
      ))}

      {/* Message card */}
      <div
        className="flex flex-col items-center px-8 py-5 rounded-[28px] text-center"
        style={{
          background: 'rgba(20,20,18,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(197,230,58,0.3)',
          animation: 'pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        <div className="text-[44px] mb-1">🎯</div>
        <div className="text-[22px] font-black text-white leading-tight">{message}</div>
        {sub && <div className="text-[13px] text-white/50 mt-1">{sub}</div>}
      </div>

      <style>{`
        @keyframes particle-fly {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(calc(sin(var(--angle)) * var(--dist)), calc(-1 * var(--dist))) scale(0); opacity: 0; }
        }
        @keyframes pop-in {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
