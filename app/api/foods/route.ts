import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json([])

  const key = process.env.FOOD_API_KEY
  if (!key) return NextResponse.json({ error: 'no key' }, { status: 500 })

  const url = new URL('https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02')
  url.searchParams.set('serviceKey', key)
  url.searchParams.set('pageNo', '1')
  url.searchParams.set('numOfRows', '20')
  url.searchParams.set('type', 'json')
  url.searchParams.set('FOOD_NM_KR', q)

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
    const data = await res.json()

    if (data.header?.resultCode !== '00') return NextResponse.json([])

    const items = (data.body?.items ?? []).map((item: Record<string, string>) => ({
      name: item.FOOD_NM_KR,
      kcal: Math.round(parseFloat(item.AMT_NUM1) || 0),
      serving: item.SERVING_SIZE || '100g',
    }))

    return NextResponse.json(items)
  } catch {
    return NextResponse.json([])
  }
}
