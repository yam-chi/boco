'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    href: '/',
    label: '홈',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 10L11 3l8 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1z" fill={active ? '#1A1A1A' : 'rgba(255,255,255,0.3)'} />
        <rect x="8" y="14" width="6" height="7" rx="1" fill={active ? '#C5E63A' : 'rgba(255,255,255,0.2)'} />
      </svg>
    ),
  },
  {
    href: '/exercise',
    label: '운동',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="1" y="8" width="4" height="6" rx="2" fill={active ? '#1A1A1A' : 'rgba(255,255,255,0.3)'} />
        <rect x="17" y="8" width="4" height="6" rx="2" fill={active ? '#1A1A1A' : 'rgba(255,255,255,0.3)'} />
        <rect x="4" y="6" width="3" height="10" rx="1.5" fill={active ? '#1A1A1A' : 'rgba(255,255,255,0.3)'} />
        <rect x="15" y="6" width="3" height="10" rx="1.5" fill={active ? '#1A1A1A' : 'rgba(255,255,255,0.3)'} />
        <rect x="7" y="10" width="8" height="2" rx="1" fill={active ? '#1A1A1A' : 'rgba(255,255,255,0.3)'} />
      </svg>
    ),
  },
  {
    href: '/log',
    label: '일지',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="2" width="16" height="18" rx="3" fill={active ? '#1A1A1A' : 'none'} stroke={active ? 'none' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" />
        <line x1="7" y1="7" x2="15" y2="7" stroke={active ? '#C5E63A' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="11" x2="15" y2="11" stroke={active ? '#C5E63A' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="15" x2="11" y2="15" stroke={active ? '#C5E63A' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: '내정보',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="7" r="3.5" fill={active ? '#1A1A1A' : 'rgba(255,255,255,0.3)'} />
        <path d="M4 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke={active ? '#1A1A1A' : 'rgba(255,255,255,0.3)'} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[72px] bg-dark flex items-center justify-around pb-2 z-40">
      {NAV.map(({ href, label, icon }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-1">
            <div className={`w-[42px] h-[42px] rounded-[13px] flex items-center justify-center transition-colors ${active ? 'bg-lime' : ''}`}>
              {icon(active)}
            </div>
            {active
              ? <div className="w-[5px] h-[5px] rounded-full bg-lime" />
              : <span className="text-[10px] font-bold text-white/35">{label}</span>
            }
          </Link>
        )
      })}
    </nav>
  )
}
