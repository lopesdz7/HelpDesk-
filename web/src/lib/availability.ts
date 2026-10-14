const hour = (h: number) => `${String(h).padStart(2, '0')}:00`
const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => hour(start + index))

/** Blocos de 1 hora entre 07:00 e 23:00, agrupados como na grade do Figma. */
export const SHIFTS = [
  { id: 'morning', label: 'Manhã', hours: range(7, 12) },
  { id: 'afternoon', label: 'Tarde', hours: range(13, 18) },
  { id: 'night', label: 'Noite', hours: range(19, 22) },
] as const

export const DEFAULT_AVAILABILITY = [...range(8, 11), ...range(14, 17)]

/** ["08:00","09:00","10:00","14:00"] → "08–11h, 14h" (blocos contíguos agrupados). */
export function summarizeAvailability(hours: string[]) {
  const sorted = [...hours].map((h) => Number(h.slice(0, 2))).sort((a, b) => a - b)
  const groups: [number, number][] = []
  for (const h of sorted) {
    const last = groups[groups.length - 1]
    if (last && h === last[1] + 1) last[1] = h
    else groups.push([h, h])
  }
  return groups
    .map(([start, end]) =>
      start === end
        ? `${String(start).padStart(2, '0')}h`
        : `${String(start).padStart(2, '0')}–${String(end + 1).padStart(2, '0')}h`,
    )
    .join(', ')
}
