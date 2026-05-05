// charge.docx §4.4: SLA per priority. Hours config can move to settings later.
export const SLA_HOURS_BY_PRIORITY: Record<string, number> = {
  low: 72,
  medium: 24,
  high: 8,
  urgent: 2,
};

export function deadlineFor(priority: string, from: Date = new Date()): Date {
  const h = SLA_HOURS_BY_PRIORITY[priority?.toLowerCase()] ?? 24;
  const d = new Date(from);
  d.setHours(d.getHours() + h);
  return d;
}

export function effectiveDeadline(
  base: Date,
  pausedDurationMs: number,
  pausedAt: Date | null,
): Date {
  let extra = pausedDurationMs;
  if (pausedAt) {
    extra += Date.now() - pausedAt.getTime();
  }
  return new Date(base.getTime() + extra);
}

export function classifyStatus(deadline: Date, pausedAt: Date | null): 'ON_TRACK' | 'NEAR_BREACH' | 'BREACHED' {
  if (pausedAt) return 'ON_TRACK';
  const remainMs = deadline.getTime() - Date.now();
  if (remainMs <= 0) return 'BREACHED';
  if (remainMs <= 60 * 60 * 1000) return 'NEAR_BREACH';
  return 'ON_TRACK';
}

export function bumpPriority(p: string): string {
  const order = ['low', 'medium', 'high', 'urgent'];
  const i = order.indexOf(p?.toLowerCase());
  return i < 0 || i === order.length - 1 ? 'urgent' : order[i + 1];
}
