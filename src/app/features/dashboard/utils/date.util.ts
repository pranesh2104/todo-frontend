function normalizeToStartOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = normalizeToStartOfDay(date1);
  const d2 = normalizeToStartOfDay(date2);
  return d1.getTime() === d2.getTime();
}

export function isDateAfter(date1: Date | string, date2: Date | string): boolean {
  const d1 = normalizeToStartOfDay(date1);
  const d2 = normalizeToStartOfDay(date2);
  return d1.getTime() > d2.getTime();
}