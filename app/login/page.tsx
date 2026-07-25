'use client'
import { createClient } from '@/utils/supabase'

export default function LoginPage() {
  async function signInWithGoogle() {
    const sb = createClient()
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#141412]">
      {/* Logo */}
      <div className="mb-12 text-center">
        <div className="text-[48px] font-black text-white tracking-tight leading-none mb-3">
          BOCO
        </div>
        <div className="text-[14px] text-white/40 font-medium">
          오늘 하루, 내 몸이 향하는 방향
        </div>
      </div>

      {/* 소개 */}
      <div className="w-full max-w-[320px] mb-10 flex flex-col gap-4">
        {[
          { icon: '📸', text: '사진 한 장으로 식단 기록' },
          { icon: '💪', text: '운동하면 몸 그림에서 부위가 켜짐' },
          { icon: '📊', text: '오늘 식단 상위 몇%인지 확인' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <span className="text-[22px]">{icon}</span>
            <span className="text-[14px] text-white/60 font-medium">{text}</span>
          </div>
        ))}
      </div>

      {/* 구글 로그인 */}
      <button
        onClick={signInWithGoogle}
        className="w-full max-w-[320px] flex items-center justify-center gap-3 bg-white text-[#141412] font-black text-[15px] py-4 rounded-[18px] hover:bg-white/90 transition-colors"
      >
        <GoogleIcon />
        Google로 시작하기
      </button>

      <p className="mt-6 text-[11px] text-white/20 text-center">
        시작하면 개인정보처리방침에 동의하는 것으로 간주돼요
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.78h5.4a4.61 4.61 0 01-2 3.02v2.5h3.22c1.89-1.74 2.98-4.3 2.98-7.3z" fill="#4285F4"/>
      <path d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.22-2.5c-.9.6-2.04.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H1.08v2.58A10 10 0 0010 20z" fill="#34A853"/>
      <path d="M4.4 11.92A5.98 5.98 0 014.18 10c0-.67.12-1.32.32-1.92V5.5H1.08A10 10 0 000 10c0 1.62.38 3.14 1.08 4.5l3.32-2.58z" fill="#FBBC05"/>
      <path d="M10 3.96c1.46 0 2.78.5 3.8 1.5l2.86-2.86A10 10 0 001.08 5.5l3.32 2.58C5.2 5.72 7.4 3.96 10 3.96z" fill="#EA4335"/>
    </svg>
  )
}
