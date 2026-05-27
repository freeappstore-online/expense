/**
 * Date helpers. All date strings are local-time YYYY-MM-DD.
 * All timestamps are ISO UTC.
 */

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Returns the date string `n` days before today (n=0 -> today).
 */
export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM" for a date string. */
export function ymOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/** Current YYYY-MM. */
export function currentYM(): string {
  return todayISO().slice(0, 7);
}

/** Shift YYYY-MM by +/- months. */
export function shiftYM(ym: string, delta: number): string {
  const parts = ym.split("-");
  const yearPart = parts[0];
  const monthPart = parts[1];
  if (!yearPart || !monthPart) return ym;
  const y = Number(yearPart);
  const m = Number(monthPart);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "May 2026" for "2026-05". */
export function formatYM(ym: string): string {
  const parts = ym.split("-");
  const yearPart = parts[0];
  const monthPart = parts[1];
  if (!yearPart || !monthPart) return ym;
  const date = new Date(Number(yearPart), Number(monthPart) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** "Wed, May 28" for "2026-05-28". */
export function formatDateMedium(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** "May 28" for "2026-05-28". */
export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "Today" / "Yesterday" / weekday short / formatDateShort fallback. */
export function formatDateRelative(dateStr: string): string {
  const today = todayISO();
  if (dateStr === today) return "Today";
  if (dateStr === daysAgoISO(1)) return "Yesterday";
  const daysBack = (() => {
    for (let i = 2; i <= 6; i++) {
      if (dateStr === daysAgoISO(i)) return i;
    }
    return null;
  })();
  if (daysBack !== null) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }
  return formatDateShort(dateStr);
}

/** Days in month (1..31) for "YYYY-MM". */
export function daysInMonth(ym: string): number {
  const parts = ym.split("-");
  const yearPart = parts[0];
  const monthPart = parts[1];
  if (!yearPart || !monthPart) return 0;
  return new Date(Number(yearPart), Number(monthPart), 0).getDate();
}

/** Weekday (0=Sun..6=Sat) for the first day of YYYY-MM. */
export function firstWeekdayOfMonth(ym: string): number {
  const parts = ym.split("-");
  const yearPart = parts[0];
  const monthPart = parts[1];
  if (!yearPart || !monthPart) return 0;
  return new Date(Number(yearPart), Number(monthPart) - 1, 1).getDay();
}

/** Build "YYYY-MM-DD" for day-of-month within YYYY-MM. */
export function dateInMonth(ym: string, day: number): string {
  return `${ym}-${String(day).padStart(2, "0")}`;
}

/** Last N day ISO strings, oldest first, ending today. */
export function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(daysAgoISO(i));
  return out;
}
