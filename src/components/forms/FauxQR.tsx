/**
 * A deterministic QR-style block generated from the ticket id. It is NOT a
 * scannable QR code — real ticketing would issue one server-side. It stands in
 * for the "mock ticket" visual in this prototype.
 */
export default function FauxQR({ seed, size = 116 }: { seed: string; size?: number }) {
  const grid = 11
  const cell = size / grid
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const rand = () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 1000) / 1000
  }

  const cells: Array<[number, number]> = []
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < Math.ceil(grid / 2); x++) {
      if (rand() > 0.5) {
        cells.push([x, y])
        cells.push([grid - 1 - x, y]) // mirror for a QR-ish look
      }
    }
  }

  const finder = (ox: number, oy: number) => (
    <>
      <rect x={ox * cell} y={oy * cell} width={cell * 3} height={cell * 3} fill="#000" />
      <rect
        x={(ox + 0.6) * cell}
        y={(oy + 0.6) * cell}
        width={cell * 1.8}
        height={cell * 1.8}
        fill="#fff"
      />
      <rect x={(ox + 1) * cell} y={(oy + 1) * cell} width={cell} height={cell} fill="#000" />
    </>
  )

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md bg-white p-1">
      {cells.map(([x, y], i) => (
        <rect key={i} x={x * cell} y={y * cell} width={cell} height={cell} fill="#000" />
      ))}
      {finder(0, 0)}
      {finder(grid - 3, 0)}
      {finder(0, grid - 3)}
    </svg>
  )
}
