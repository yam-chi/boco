import { NextRequest, NextResponse } from 'next/server'

const SYSTEM = `당신은 음식 칼로리 분석 전문가입니다.
사용자가 먹은 음식을 텍스트나 이미지로 알려주면, 각 음식의 칼로리를 추정해서 JSON 배열로만 응답하세요.
설명, 마크다운, 코드블록 없이 순수 JSON 배열만 출력하세요.
형식: [{"name": "음식명", "kcal": 숫자}]
칼로리는 일반적인 1인분 기준으로 추정하세요.`

export async function POST(req: NextRequest) {
  const key = process.env.BOCO_AI_KEY
  if (!key) return NextResponse.json({ error: 'no key' }, { status: 500 })

  const body = await req.json()
  const { text, image, mediaType } = body

  if (!text && !image) return NextResponse.json({ error: 'no input' }, { status: 400 })

  const contentParts: object[] = []
  if (image) {
    contentParts.push({
      type: 'image',
      source: { type: 'base64', media_type: mediaType ?? 'image/jpeg', data: image },
    })
    contentParts.push({ type: 'text', text: '이 음식 사진에서 음식을 인식하고 칼로리를 계산해주세요.' })
  } else {
    contentParts.push({ type: 'text', text })
  }

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
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: 'user', content: contentParts }],
      }),
    })

    const data = await res.json()
    const raw = data.content?.[0]?.text ?? '[]'

    const clean = raw.replace(/```json\n?/g, '').replace(/```/g, '').trim()
    const items = JSON.parse(clean)

    return NextResponse.json(items)
  } catch {
    return NextResponse.json([])
  }
}

