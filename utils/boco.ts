export type BocoStatus = 'good' | 'over' | 'under' | 'empty'

export function calcBocoStatus(totalKcal: number, targetKcal: number): BocoStatus {
  if (totalKcal === 0) return 'empty'
  const ratio = totalKcal / targetKcal
  if (ratio < 0.85) return 'under'
  if (ratio > 1.15) return 'over'
  return 'good'
}

export const STATUS_DIRECTION = {
  good:  { heading: '방향 맞아요',     sub: '이대로 가면 오늘 목표 달성해요', needleAngle: 0   },
  over:  { heading: '방향 조정 필요',  sub: '운동으로 방향을 되찾을 수 있어요', needleAngle: 42  },
  under: { heading: '연료가 부족해요', sub: '조금 더 드셔야 몸이 움직여요',    needleAngle: -42 },
  empty: { heading: '나침반 켜는 중',  sub: '식사를 기록하면 방향이 잡혀요',   needleAngle: 0   },
}

export function getGreeting(status: BocoStatus): string {
  if (status === 'good')  return '오늘 방향 완벽해요'
  if (status === 'over')  return '방향을 조금 틀어볼까요'
  if (status === 'under') return '연료를 채워볼까요'
  return '오늘 어디로 갈까요'
}

export function getStatusMessage(status: BocoStatus, diff?: number): string {
  if (status === 'good')  return '잘하고 있어요! 이대로면 완벽해요'
  if (status === 'over')  return `${diff}kcal 초과했어요`
  if (status === 'under') return '조금 부족해요. 충분히 드세요'
  return '식사를 기록하면 BOCO가 켜져요'
}

export function formatDate(): string {
  const d = new Date()
  const month = d.getMonth() + 1
  const date = d.getDate()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const day = days[d.getDay()]
  return `${month}월 ${date}일 ${day}요일`
}
