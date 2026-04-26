import type { BocoStatus } from '@/utils/boco'

export type ExerciseType = 'cardio' | 'strength' | 'core' | 'flexibility'

export interface ExerciseItem {
  name: string
  type: ExerciseType
  // cardio
  distance?: string
  pace?: string
  duration?: string
  // strength
  sets?: number
  reps?: string
  rest?: string
  // flexibility / note
  note?: string
}

// 전체 운동 DB
const EXERCISE_DB: Record<string, ExerciseItem> = {
  달리기:       { name: '달리기',       type: 'cardio',      distance: '3km',  pace: '6분30초/km', duration: '20분' },
  수영:         { name: '수영',         type: 'cardio',      distance: '1km',  pace: '50분/km',    duration: '50분' },
  자전거:       { name: '자전거',       type: 'cardio',      distance: '15km', pace: '20km/h',     duration: '45분' },
  걷기:         { name: '걷기',         type: 'cardio',      distance: '5km',  pace: '15분/km',    duration: '75분' },
  인터벌달리기: { name: '인터벌달리기', type: 'cardio',      distance: '2km',  pace: '빠름+쉬기',  duration: '25분' },
  스쿼트:       { name: '스쿼트',       type: 'strength',    sets: 4, reps: '15회', rest: '45초' },
  런지:         { name: '런지',         type: 'strength',    sets: 3, reps: '12회씩', rest: '45초' },
  힙쓰러스트:   { name: '힙쓰러스트',   type: 'strength',    sets: 4, reps: '15회', rest: '60초' },
  데드리프트:   { name: '데드리프트',   type: 'strength',    sets: 4, reps: '8회',  rest: '90초' },
  벤치프레스:   { name: '벤치프레스',   type: 'strength',    sets: 4, reps: '10회', rest: '90초' },
  푸쉬업:       { name: '푸쉬업',       type: 'strength',    sets: 3, reps: '12회', rest: '45초' },
  버피:         { name: '버피',         type: 'core',        sets: 3, reps: '10회', rest: '60초' },
  플랭크:       { name: '플랭크',       type: 'core',        sets: 3, reps: '45초', rest: '30초' },
  마운틴클라이머: { name: '마운틴클라이머', type: 'core',    sets: 3, reps: '20회', rest: '45초' },
  점핑잭:       { name: '점핑잭',       type: 'core',        sets: 3, reps: '30회', rest: '30초' },
  크런치:       { name: '크런치',       type: 'core',        sets: 3, reps: '20회', rest: '30초' },
  요가:         { name: '요가',         type: 'flexibility', duration: '30분', note: '전신 이완' },
  필라테스:     { name: '필라테스',     type: 'flexibility', duration: '40분', note: '코어·자세 교정' },
  스트레칭:     { name: '스트레칭',     type: 'flexibility', duration: '15분', note: '전신 스트레칭' },
  폼롤러:       { name: '폼롤러',       type: 'flexibility', duration: '15분', note: '근막 이완' },
}

// 상태별 추천 풀 (우선순위 순)
const RECOMMENDED_POOL: Record<Exclude<BocoStatus, 'empty'>, string[]> = {
  over:  ['버피', '인터벌달리기', '점핑잭', '스쿼트', '마운틴클라이머', '런지', '자전거', '힙쓰러스트', '달리기'],
  good:  ['달리기', '플랭크', '푸쉬업', '스쿼트', '수영', '자전거', '요가', '스트레칭'],
  under: ['스트레칭', '요가', '걷기', '폼롤러', '필라테스'],
}

// preferred를 제외한 추천 운동 3개 반환
export function getRecommended(status: Exclude<BocoStatus, 'empty'>, preferred: string[]): ExerciseItem[] {
  const pool = RECOMMENDED_POOL[status]
  const filtered = pool.filter(name => !preferred.includes(name))
  const picks = filtered.length >= 3 ? filtered.slice(0, 3) : pool.slice(0, 3)
  return picks.map(name => EXERCISE_DB[name]).filter(Boolean)
}

// 선호 운동 선택 목록
export const PREFERRED_EXERCISES = [
  '달리기', '수영', '자전거', '걷기',
  '스쿼트', '런지', '푸쉬업', '데드리프트',
  '플랭크', '버피', '요가', '필라테스',
]

// 선호 운동 상세 조회
export function getExerciseDetail(name: string): ExerciseItem {
  return EXERCISE_DB[name] ?? { name, type: 'strength', sets: 3, reps: '10회', rest: '45초' }
}

// 하위 호환용 (BocoCard mini에서 사용)
export const EXERCISE_SETS: Record<Exclude<BocoStatus, 'empty'>, { name: string; detail: string }[]> = {
  over:  [{ name: '버피', detail: '3세트 × 10회' }, { name: '스쿼트', detail: '3세트 × 15회' }, { name: '달리기', detail: '3km' }],
  good:  [{ name: '플랭크', detail: '3세트 × 45초' }, { name: '푸쉬업', detail: '3세트 × 12회' }, { name: '스트레칭', detail: '15분' }],
  under: [],
}
