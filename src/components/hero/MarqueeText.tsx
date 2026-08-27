import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { GLYPHS, GLYPH_HEIGHT, type Glyph } from './letterPaths'

type Props = {
  text: string
  /** cursor-proximity red glow (on once the hero is interactive) */
  interactive: boolean
  /** play the one-time warm-up when the sign sets in */
  animateIn: boolean
}

const BULB_SPACING = 13 // viewBox units between bulbs along a stroke
const ROW_OFFSET = 5 // half-distance between the two bulb rows (stroke thickness)
const GLOW_RADIUS = 140 // px — cursor reach
const GAP = 22 // viewBox units between letters

type Bulb = { gx: number; gy: number }

/**
 * "TEDXIGDTUW" as a marquee light-letter sign: every glyph is traced out in
 * two rows of bulbs so the strokes read thick, like rented marquee letters.
 * Bulbs rest at a warm glow and turn red where the cursor gets close.
 */
export default function MarqueeText({ text, interactive, animateIn }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [screenPos, setScreenPos] = useState<Array<{ x: number; y: number }>>([])
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const lastMove = useRef(0)

  const { bulbs, viewW } = useMemo(() => computeBulbs(text), [text])

  // Measure where each bulb landed on screen (once mounted, and on resize).
  const measure = useCallback(() => {
    const nodes = wrapRef.current?.querySelectorAll<SVGCircleElement>('circle[data-b]')
    if (!nodes) return
    const next: Array<{ x: number; y: number }> = []
    nodes.forEach((n) => {
      const r = n.getBoundingClientRect()
      next.push({ x: r.x + r.width / 2, y: r.y + r.height / 2 })
    })
    setScreenPos(next)
  }, [])

  useLayoutEffect(() => {
    measure()
    // catch the reveal slide-in settling
    const t1 = window.setTimeout(measure, 500)
    const t2 = window.setTimeout(measure, 1100)
    const ro = new ResizeObserver(measure)
    if (wrapRef.current) ro.observe(wrapRef.current)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [measure, bulbs.length])

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive) return
      const now = performance.now()
      if (now - lastMove.current < 16) return
      lastMove.current = now
      setPointer({ x: e.clientX, y: e.clientY })
    },
    [interactive],
  )

  useEffect(() => {
    if (!interactive) setPointer(null)
  }, [interactive])

  return (
    <div
      ref={wrapRef}
      onPointerEnter={measure}
      onPointerMove={onMove}
      onPointerLeave={() => setPointer(null)}
      className="select-none"
      role="img"
      aria-label={text}
    >
      <svg
        viewBox={`-10 -12 ${viewW + 20} ${GLYPH_HEIGHT + 24}`}
        className="block h-[clamp(76px,13.5vw,156px)] w-auto max-w-[94vw] overflow-visible"
        aria-hidden
      >
        {bulbs.map((b, i) => {
          const t = intensity(i, screenPos, pointer)
          const core = t > 0 ? mix('#fff4d6', '#ff3648', t) : '#fff4d6'
          const halo = t > 0 ? mix('#ffc46f', '#ff0d2c', t) : '#ffc46f'
          const haloOpacity = 0.28 + t * 0.64
          const delay = animateIn ? `${(i / bulbs.length) * 0.85}s` : '0s'
          return (
            <g
              key={i}
              style={{
                opacity: animateIn ? 0 : 1,
                animation: animateIn ? 'bulbOn 0.4s ease forwards' : undefined,
                animationDelay: delay,
              }}
            >
              <circle cx={b.gx} cy={b.gy} r={7.2 + t * 2.6} fill={halo} opacity={haloOpacity} />
              <circle data-b cx={b.gx} cy={b.gy} r={3.1 + t * 1} fill={core} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function intensity(
  i: number,
  screenPos: Array<{ x: number; y: number }>,
  pointer: { x: number; y: number } | null,
): number {
  if (!pointer || !screenPos[i]) return 0
  const d = Math.hypot(screenPos[i].x - pointer.x, screenPos[i].y - pointer.y)
  return d < GLOW_RADIUS ? Math.pow(1 - d / GLOW_RADIUS, 1.5) : 0
}

function computeBulbs(text: string): { bulbs: Bulb[]; viewW: number } {
  const canSample =
    typeof document !== 'undefined' && 'getPointAtLength' in SVGPathElement.prototype

  const bulbs: Bulb[] = []
  let cursorX = 0

  for (const ch of text) {
    const glyph: Glyph | undefined = GLYPHS[ch]
    if (!glyph) {
      cursorX += 40 + GAP
      continue
    }
    for (const d of glyph.strokes) {
      const samples = canSample ? samplePath(d, BULB_SPACING) : fallbackSamples(d)
      for (const s of samples) {
        // two rows, offset along the stroke normal, for thickness
        for (const side of [-1, 1]) {
          bulbs.push({
            gx: cursorX + s.x + s.nx * ROW_OFFSET * side,
            gy: s.y + s.ny * ROW_OFFSET * side,
          })
        }
      }
    }
    cursorX += glyph.w + GAP
  }
  return { bulbs, viewW: Math.max(0, cursorX - GAP) }
}

type Sample = { x: number; y: number; nx: number; ny: number }

function samplePath(d: string, spacing: number): Sample[] {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', d)
  const total = path.getTotalLength()
  const n = Math.max(2, Math.round(total / spacing))
  const out: Sample[] = []
  for (let i = 0; i <= n; i++) {
    const len = (total * i) / n
    const p = path.getPointAtLength(len)
    const a = path.getPointAtLength(Math.max(0, len - 1))
    const b = path.getPointAtLength(Math.min(total, len + 1))
    const tx = b.x - a.x
    const ty = b.y - a.y
    const mag = Math.hypot(tx, ty) || 1
    out.push({ x: p.x, y: p.y, nx: -ty / mag, ny: tx / mag })
  }
  return out
}

function fallbackSamples(d: string): Sample[] {
  const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  const out: Sample[] = []
  for (let i = 0; i + 1 < nums.length; i += 2)
    out.push({ x: nums[i], y: nums[i + 1], nx: 1, ny: 0 })
  return out
}

function mix(a: string, b: string, t: number): string {
  const pa = hex(a)
  const pb = hex(b)
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}
function hex(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
