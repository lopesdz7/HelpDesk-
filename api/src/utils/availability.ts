/** Blocos de 1 hora com início entre 07:00 e 22:00 (o último termina às 23:00). */
export const AVAILABLE_HOURS = Array.from({ length: 16 }, (_, index) => formatHour(7 + index))

/** Disponibilidade padrão sugerida ao criar técnico: 08–12 e 14–18. */
export const DEFAULT_AVAILABILITY = [...hourRange(8, 12), ...hourRange(14, 18)]

export function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

/** Blocos de `start` (inclusivo) até `end` (exclusivo): hourRange(8, 12) → 08:00…11:00 */
export function hourRange(start: number, end: number) {
  return Array.from({ length: end - start }, (_, index) => formatHour(start + index))
}

export function sortHours(hours: string[]) {
  return [...hours].sort()
}
