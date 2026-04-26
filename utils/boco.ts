export type BocoStatus = 'good' | 'over' | 'under' | 'empty'

export function calcBocoStatus(totalKcal: number, targetKcal: number): BocoStatus {
  if (totalKcal === 0) return 'empty'
  const ratio = totalKcal / targetKcal
  if (ratio < 0.85) return 'under'
  if (ratio > 1.15) return 'over'
  return 'good'
}

export function getStatusMessage(status: BocoStatus, diff?: number): string {
  if (status === 'good') return '잘하고 있어요! 이대로면 완벽해요'
  if (status === 'over') return `${diff}kcal 초과했어요`
  if (status === 'under') return '조금 부족해요. 충분히 드세요'
  return '식사를 기록하면 BOCO가 켜져요'
}

export function getGreeting(status: BocoStatus): string {
  if (status === 'good') return '잘하고 있어요'
  if (status === 'over') return '조금 많아요'
  if (status === 'under') return '조금 부족해요'
  return '안녕하세요'
}

export function formatDate(): string {
  const d = new Date()
  const month = d.getMonth() + 1
  const date = d.getDate()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const day = days[d.getDay()]
  return `${month}월 ${date}일 ${day}요일`
}
