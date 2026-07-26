'use client'
import type { ExerciseSession } from '@/utils/storage'

export const MUSCLE_LABELS: Record<string, string> = {
  chest: '가슴', shoulders: '어깨', biceps: '이두', triceps: '삼두',
  abs: '복근', quads: '대퇴사두', calves: '종아리', upper_back: '승모근',
  lats: '광배근', lower_back: '허리', glutes: '둔근', hamstrings: '햄스트링',
  forearms: '전완',
}

const MUSCLE_DATA_MAP: Record<string, string[]> = {
  chest:      ['chest-left', 'chest-right'],
  shoulders:  ['shoulder-left', 'shoulder-right', 'rear-shoulder-left', 'rear-shoulder-right'],
  biceps:     ['upper-arm-left', 'upper-arm-right'],
  triceps:    ['triceps-left', 'triceps-right'],
  forearms:   ['forearm-left', 'forearm-right'],
  abs:        ['abs-upper-left', 'abs-upper-right', 'abs-mid-left', 'abs-mid-right', 'abs-lower-left', 'abs-lower-right'],
  quads:      ['thigh-left', 'thigh-right'],
  calves:     ['calf-left', 'calf-right'],
  upper_back: ['trap-left', 'trap-right', 'upper-back-left', 'upper-back-right'],
  lats:       ['lat-left', 'lat-right'],
  lower_back: ['lower-back-left', 'lower-back-right'],
  glutes:     ['glute-left', 'glute-right'],
  hamstrings: ['hamstring-left', 'hamstring-right'],
}

export function getMuscleIntensity(sessions: ExerciseSession[], muscle: string): number {
  let count = 0
  sessions.forEach(s => { if (s.muscles?.includes(muscle)) count += (s.sets ?? 1) })
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 6) return 2
  return 3
}

interface Props { sessions: ExerciseSession[] }

export default function BodyMapOverlay({ sessions }: Props) {
  const fillMap: Record<string, string> = {}
  const ALPHAS = [0, 0.45, 0.7, 0.92]
  for (const [muscle, ids] of Object.entries(MUSCLE_DATA_MAP)) {
    const a = ALPHAS[getMuscleIntensity(sessions, muscle)]
    if (a > 0) ids.forEach(id => { fillMap[id] = `rgba(197,230,58,${a})` })
  }

  const fill = (id: string) => fillMap[id] ?? 'transparent'
  const stroke = (id: string) => fillMap[id] ? 'rgba(197,230,58,0.7)' : 'rgba(255,255,255,0.28)'

  const p = (id: string, d: string) => (
    <path key={id} d={d}
      fill={fill(id)} stroke={stroke(id)}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'fill .25s ease, stroke .25s ease' }}
    />
  )

  return (
    <svg viewBox="0 0 1200 800" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="bm-pencil" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>

      {/* ── 전면 ── */}
      <g filter="url(#bm-pencil)" transform="translate(115 35)">
        {p('head',              'M215 42 C183 43 168 63 169 98 C170 132 188 151 215 153 C242 151 260 132 261 98 C262 63 247 43 215 42 Z')}
        {p('neck',              'M198 151 L232 151 L234 185 L196 185 Z')}
        {p('shoulder-left',     'M195 183 C167 178 137 184 116 205 C105 216 101 235 106 257 C124 252 144 245 158 232 C169 221 180 204 195 183 Z')}
        {p('shoulder-right',    'M235 183 C263 178 293 184 314 205 C325 216 329 235 324 257 C306 252 286 245 272 232 C261 221 250 204 235 183 Z')}
        {p('chest-left',        'M196 188 C173 188 157 198 150 217 L158 263 C169 279 183 286 203 282 L208 199 C205 194 201 190 196 188 Z')}
        {p('chest-right',       'M234 188 C257 188 273 198 280 217 L272 263 C261 279 247 286 227 282 L222 199 C225 194 229 190 234 188 Z')}
        {p('upper-arm-left',    'M108 255 C98 273 97 307 106 330 C116 344 132 343 142 329 L151 264 C140 252 124 249 108 255 Z')}
        {p('upper-arm-right',   'M322 255 C332 273 333 307 324 330 C314 344 298 343 288 329 L279 264 C290 252 306 249 322 255 Z')}
        {p('forearm-left',      'M106 329 C96 350 92 390 97 422 C103 440 117 447 132 438 C143 420 145 379 140 335 C132 326 117 324 106 329 Z')}
        {p('forearm-right',     'M324 329 C334 350 338 390 333 422 C327 440 313 447 298 438 C287 420 285 379 290 335 C298 326 313 324 324 329 Z')}
        {p('abs-upper-left',    'M176 290 C188 286 199 288 207 294 L205 326 C195 332 184 332 175 326 Z')}
        {p('abs-upper-right',   'M254 290 C242 286 231 288 223 294 L225 326 C235 332 246 332 255 326 Z')}
        {p('abs-mid-left',      'M175 333 C184 328 195 328 205 334 L204 365 C194 370 184 370 176 365 Z')}
        {p('abs-mid-right',     'M255 333 C246 328 235 328 225 334 L226 365 C236 370 246 370 254 365 Z')}
        {p('abs-lower-left',    'M177 372 C186 367 195 367 204 372 L202 403 C193 409 184 408 178 402 Z')}
        {p('abs-lower-right',   'M253 372 C244 367 235 367 226 372 L228 403 C237 409 246 408 252 402 Z')}
        {p('oblique-left',      'M157 273 C164 282 169 288 176 291 L178 402 C164 397 154 386 149 369 L145 304 Z')}
        {p('oblique-right',     'M273 273 C266 282 261 288 254 291 L252 402 C266 397 276 386 281 369 L285 304 Z')}
        {p('pelvis',            'M150 400 C168 410 190 414 215 414 C240 414 262 410 280 400 L286 444 C265 453 241 456 215 456 C189 456 165 453 144 444 Z')}
        {p('thigh-left',        'M151 450 C161 444 182 445 205 456 L203 560 C190 576 169 577 154 562 C143 531 142 487 151 450 Z')}
        {p('thigh-right',       'M279 450 C269 444 248 445 225 456 L227 560 C240 576 261 577 276 562 C287 531 288 487 279 450 Z')}
        {p('knee-left',         'M154 562 C169 572 190 572 203 561 L201 604 C187 612 169 612 156 603 Z')}
        {p('knee-right',        'M276 562 C261 572 240 572 227 561 L229 604 C243 612 261 612 274 603 Z')}
        {p('calf-left',         'M156 604 C170 611 187 611 201 604 C206 646 203 687 193 718 C181 727 166 726 157 716 C148 681 148 639 156 604 Z')}
        {p('calf-right',        'M274 604 C260 611 243 611 229 604 C224 646 227 687 237 718 C249 727 264 726 273 716 C282 681 282 639 274 604 Z')}
        {p('foot-left',         'M157 716 C166 726 181 727 193 718 L198 747 C188 756 166 757 153 749 Z')}
        {p('foot-right',        'M273 716 C264 726 249 727 237 718 L232 747 C242 756 264 757 277 749 Z')}
        <text fontSize="22" fill="rgba(255,255,255,0.25)" textAnchor="middle" x="215" y="785">전면</text>
      </g>

      {/* ── 후면 ── */}
      <g filter="url(#bm-pencil)" transform="translate(655 35)">
        {p('back-head',              'M215 42 C183 43 168 63 169 98 C170 132 188 151 215 153 C242 151 260 132 261 98 C262 63 247 43 215 42 Z')}
        {p('back-neck',              'M198 151 L232 151 L234 185 L196 185 Z')}
        {p('rear-shoulder-left',     'M195 183 C166 178 137 184 116 205 C105 216 101 235 106 257 C124 252 144 245 158 232 C169 221 180 204 195 183 Z')}
        {p('rear-shoulder-right',    'M235 183 C264 178 293 184 314 205 C325 216 329 235 324 257 C306 252 286 245 272 232 C261 221 250 204 235 183 Z')}
        {p('trap-left',              'M197 185 C185 191 172 201 163 216 L174 278 C187 294 199 298 210 290 L210 200 Z')}
        {p('trap-right',             'M233 185 C245 191 258 201 267 216 L256 278 C243 294 231 298 220 290 L220 200 Z')}
        {p('upper-back-left',        'M163 218 C151 238 148 265 154 291 C166 312 184 326 207 331 L210 291 C194 296 181 289 174 278 Z')}
        {p('upper-back-right',       'M267 218 C279 238 282 265 276 291 C264 312 246 326 223 331 L220 291 C236 296 249 289 256 278 Z')}
        {p('lat-left',               'M154 289 C160 305 178 326 207 332 L206 401 C185 395 168 383 156 365 L147 316 Z')}
        {p('lat-right',              'M276 289 C270 305 252 326 223 332 L224 401 C245 395 262 383 274 365 L283 316 Z')}
        {p('triceps-left',           'M108 255 C98 273 97 307 106 330 C116 344 132 343 142 329 L151 264 C140 252 124 249 108 255 Z')}
        {p('triceps-right',          'M322 255 C332 273 333 307 324 330 C314 344 298 343 288 329 L279 264 C290 252 306 249 322 255 Z')}
        {p('back-forearm-left',      'M106 329 C96 350 92 390 97 422 C103 440 117 447 132 438 C143 420 145 379 140 335 C132 326 117 324 106 329 Z')}
        {p('back-forearm-right',     'M324 329 C334 350 338 390 333 422 C327 440 313 447 298 438 C287 420 285 379 290 335 C298 326 313 324 324 329 Z')}
        {p('lower-back-left',        'M206 332 C190 343 180 361 178 397 C187 411 197 418 208 420 L211 333 Z')}
        {p('lower-back-right',       'M224 332 C240 343 250 361 252 397 C243 411 233 418 222 420 L219 333 Z')}
        {p('glute-left',             'M151 407 C167 400 187 401 210 418 L210 468 C189 483 165 481 146 466 C140 446 141 424 151 407 Z')}
        {p('glute-right',            'M279 407 C263 400 243 401 220 418 L220 468 C241 483 265 481 284 466 C290 446 289 424 279 407 Z')}
        {p('hamstring-left',         'M151 469 C166 480 189 484 210 469 L203 560 C190 576 169 577 154 562 C143 531 142 493 151 469 Z')}
        {p('hamstring-right',        'M279 469 C264 480 241 484 220 469 L227 560 C240 576 261 577 276 562 C287 531 288 493 279 469 Z')}
        {p('back-knee-left',         'M154 562 C169 572 190 572 203 561 L201 604 C187 612 169 612 156 603 Z')}
        {p('back-knee-right',        'M276 562 C261 572 240 572 227 561 L229 604 C243 612 261 612 274 603 Z')}
        {p('back-calf-left',         'M156 604 C170 611 187 611 201 604 C206 646 203 687 193 718 C181 727 166 726 157 716 C148 681 148 639 156 604 Z')}
        {p('back-calf-right',        'M274 604 C260 611 243 611 229 604 C224 646 227 687 237 718 C249 727 264 726 273 716 C282 681 282 639 274 604 Z')}
        {p('back-foot-left',         'M157 716 C166 726 181 727 193 718 L198 747 C188 756 166 757 153 749 Z')}
        {p('back-foot-right',        'M273 716 C264 726 249 727 237 718 L232 747 C242 756 264 757 277 749 Z')}
        <text fontSize="22" fill="rgba(255,255,255,0.25)" textAnchor="middle" x="215" y="785">후면</text>
      </g>
    </svg>
  )
}
