export const BREAKS = [-20, -10, -5, 0, 5, 10, 20]

export const PALETTE = [
  '#d73027', // < -20 %
  '#f46d43', // -20 to -10 %
  '#fdae61', // -10 to -5 %
  '#fee090', // -5 to 0 %
  '#e0f3f8', //  0 to 5 %
  '#abd9e9', //  5 to 10 %
  '#74add1', // 10 to 20 %
  '#313695', // > +20 %
]

export const LABELS = [
  '< -20 %',
  '-20 to -10 %',
  '-10 to -5 %',
  '-5 to 0 %',
  '0 to 5 %',
  '5 to 10 %',
  '10 to 20 %',
  '> +20 %',
]

/** MapLibre GL paint expression — colours each cell by pct_change */
export const colourExpression = [
  'step',
  ['get', 'pct_change'],
  PALETTE[0],          // default: < first break
  ...BREAKS.flatMap((b, i) => [b, PALETTE[i + 1]]),
] as unknown as maplibregl.ExpressionSpecification

/** Returns hex colour for a given pct_change value */
export function getColour(v: number | null): string {
  if (v == null) return '#aaaaaa'
  for (let i = 0; i < BREAKS.length; i++) {
    if (v < BREAKS[i]) return PALETTE[i]
  }
  return PALETTE[PALETTE.length - 1]
}

/** Formatted change string, e.g. "+3.2 %" */
export function fmtPct(v: number | null): string {
  if (v == null) return '—'
  return (v >= 0 ? '+' : '') + v.toFixed(1) + ' %'
}

/** Formatted population, e.g. "3.62 M" */
export function fmtPop(v: number | null): string {
  if (v == null) return '—'
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + ' M'
  if (v >= 1_000)     return (v / 1_000).toFixed(1) + ' k'
  return v.toFixed(0)
}
