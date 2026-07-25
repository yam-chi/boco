import { NextRequest, NextResponse } from 'next/server'

const SYSTEM = `당신은 운동 기록 분석 전문가입니다.
사용자가 입력한 운동 텍스트를 분석해서 JSON 배열로만 응답하세요.
설명, 마크다운, 코드블록 없이 순수 JSON 배열만 출력하세요.

형식: [{"type": "운동명", "sets": 세트수, "reps": 횟수, "weight": 무게(없으면null), "durationMin": 시간분(없으면null), "burnedKcal": 예상소모칼로리, "muscles": ["근육부위1", "근육부위2"]}]

muscles는 다음 중에서만 선택: chest, shoulders, biceps, triceps, abs, quads, calves, upper_back, lats, lower_back, glutes, hamstrings, forearms

예시 입력: "벤치프레스 3세트 10회 60kg"
예시 출력: [{"type": "벤치프레스", "sets": 3, "reps": 10, "weight": 60, "durationMin": null, "burnedKcal": 45, "muscles": ["chest", "triceps", "shoulders"]}]

여러 운동이 있으면 배열에 여러 항목으로 반환하세요.
burnedKcal은 70kg 기준 예상치로 추정하세요.`

export async function POST(req: NextRequest) {
  const key = process.env.BOCO_AI_KEY
  if (!key) return NextResponse.json([], { status: 500 })

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json([])

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM,
        messages: [{ role: 'user', content: text }],
      }),
    })

    const data = await res.json()
    const raw = data.content?.[0]?.text ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```/g, '').trim()
    return NextResponse.json(JSON.parse(clean))
  } catch {
    return NextResponse.json([])
  }
}
