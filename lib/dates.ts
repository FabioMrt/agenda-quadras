/**
 * Format a Date to YYYY-MM-DD string using LOCAL timezone (not UTC).
 * Use this on CLIENT SIDE only.
 */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Format a Date to YYYY-MM-DD string using UTC.
 * Use this on SERVER SIDE for Prisma @db.Date values.
 */
export function toUTCDateString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 * Use on CLIENT SIDE.
 */
export function todayString(): string {
  return toLocalDateString(new Date());
}

/**
 * Parse a YYYY-MM-DD string to a Date at noon UTC.
 * This avoids timezone edge cases — noon UTC never shifts the day.
 * Use this when sending dates to Prisma.
 */
export function parseDateUTC(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00Z");
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
