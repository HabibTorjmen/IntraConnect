import { Holiday } from '@prisma/client';

/**
 * Counts working days between [start, end] inclusive,
 * skipping configured weekend days (0..6, where 0=Sunday) and holiday dates.
 * charge.docx §4.3: "Weekends and public holidays are automatically excluded".
 */
export function countWorkingDays(
  start: Date,
  end: Date,
  weekendDays: number[],
  holidays: Holiday[] = [],
): number {
  if (end < start) return 0;
  const holidayKeys = new Set(
    holidays.map((h) => h.date.toISOString().slice(0, 10)),
  );
  let count = 0;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const finalDay = new Date(end);
  finalDay.setHours(0, 0, 0, 0);
  while (cursor <= finalDay) {
    const day = cursor.getDay();
    const key = cursor.toISOString().slice(0, 10);
    if (!weekendDays.includes(day) && !holidayKeys.has(key)) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

export function fallsInBlackout(
  start: Date,
  end: Date,
  blackoutPeriods: Array<{ start: string; end: string; reason?: string }> | null | undefined,
): { reason?: string } | null {
  if (!blackoutPeriods?.length) return null;
  for (const b of blackoutPeriods) {
    const bs = new Date(b.start);
    const be = new Date(b.end);
    if (rangesOverlap(start, end, bs, be)) {
      return { reason: b.reason };
    }
  }
  return null;
}
