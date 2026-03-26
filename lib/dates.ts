/**
 * Format a Date to YYYY-MM-DD string using LOCAL timezone (not UTC).
 * This avoids the classic timezone bug where toISOString() shifts the date.
 */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 */
export function todayString(): string {
  return toLocalDateString(new Date());
}

/**
 * Parse a YYYY-MM-DD string into a Date at local midnight.
 * Use this instead of new Date(dateStr) to avoid UTC interpretation.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Generate array of next N days starting from today.
 */
export function getNext7Days(count: number = 14): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}
