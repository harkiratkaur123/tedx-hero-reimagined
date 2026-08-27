// Each glyph is drawn as one or more simple strokes in a 0..width × 0..104 box.
// Bulbs are distributed evenly along these strokes to build a marquee
// light-letter (the "DANCE sign" look).

export type Glyph = { w: number; strokes: string[] }

const H = 104

export const GLYPHS: Record<string, Glyph> = {
  T: { w: 66, strokes: [`M2 6 H64`, `M33 6 V${H}`] },
  E: { w: 58, strokes: [`M56 6 H8 V${H} H56`, `M8 55 H46`] },
  D: { w: 70, strokes: [`M10 6 V${H} M10 6 H34 Q64 6 64 55 Q64 ${H} 34 ${H} H10`] },
  X: { w: 66, strokes: [`M4 6 L62 ${H}`, `M62 6 L4 ${H}`] },
  I: { w: 40, strokes: [`M20 6 V${H}`, `M6 6 H34`, `M6 ${H} H34`] },
  G: { w: 74, strokes: [`M64 14 A34 46 0 1 0 64 96 L64 56 L44 56`] },
  U: { w: 70, strokes: [`M6 6 V56 Q6 ${H} 38 ${H} Q70 ${H} 70 56 V6`] },
  W: { w: 82, strokes: [`M4 6 L20 ${H} L41 44 L62 ${H} L78 6`] },
}

export const GLYPH_HEIGHT = H
