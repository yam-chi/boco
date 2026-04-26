'use client'
import { useRouter } from 'next/navigation'

interface Props {
  foodName: string
  foodKcal: number
  onClose: () => void
}

export default function InfoNudgeSheet({ foodName, foodKcal, onClose }: Props) {
  const router = useRouter()

  function goProfile() {
    onClose()
    router.push('/profile')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[28px] px-6 pt-7 pb-10">
        <div className="w-10 h-1 bg-gray-light rounded-full mx-auto mb-5" />

        {/* Warning icon */}
        <div className="w-[52px] h-[52px] bg-yellow-100 rounded-[16px] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 4L26 24H2L14 4Z" fill="#FFC107" stroke="#FFA000" strokeWidth="1.5" />
            <rect x="13" y="11" width="2" height="7" rx="1" fill="#1A1A1A" />
            <rect x="13" y="20" width="2" height="2" rx="1" fill="#1A1A1A" />
          </svg>
        </div>

        <h2 className="text-[18px] font-black text-dark leading-snug mb-2">
          칼로리 목표가<br />설정되지 않았어요
        </h2>
        <p className="text-[13px] text-gray-mid leading-relaxed mb-6">
          방금 기록한{' '}
          <span className="bg-lime text-dark font-black px-1.5 py-0.5 rounded">
            {foodName} {foodKcal.toLocaleString()}kcal
          </span>
          는 저장됐어요.
          <br /><br />
          몸무게와 목표를 입력하면 오늘 얼마나 먹어도 되는지,
          BOCO 상태가 <strong className="text-dark">정확하게</strong> 계산돼요. 1분이면 돼요!
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={goProfile}
            className="w-full bg-dark text-white font-black text-[15px] py-4 rounded-[16px]"
          >
            정보 입력하고 정확하게 보기
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-mid font-bold text-[13px] py-2"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  )
}
