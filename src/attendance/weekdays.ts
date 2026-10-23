// Os treinos guardam os dias como texto ("segunda", "terca", "sábado"...).
// Normaliza para o índice de Date.getDay() (0 = domingo).
const WEEKDAY_INDEX: Record<string, number> = {
  dom: 0,
  seg: 1,
  ter: 2,
  qua: 3,
  qui: 4,
  sex: 5,
  sab: 6,
};

export function weekdayIndex(day: string): number | undefined {
  const key = day
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .slice(0, 3);
  return WEEKDAY_INDEX[key];
}

/** Data local no formato YYYY-MM-DD. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Converte YYYY-MM-DD em Date local (meio-dia, para evitar problemas de fuso). */
export function parseISODate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function trainingHappensOn(weekdays: string[], date: string): boolean {
  const day = parseISODate(date).getDay();
  return weekdays.some((w) => weekdayIndex(w) === day);
}
