import type { CategoryId, Expense } from "../types/expense";
import { CATEGORIES, getCategory } from "./categories";
import { daysAgoISO, lastNDays, todayISO, ymOf } from "./dates";

export interface CategoryTotal {
  category: CategoryId;
  name: string;
  color: string;
  emoji: string;
  cents: number;
}

/** Totals per category for a given set of expenses. Sorted desc by amount. */
export function categoryTotals(items: Expense[]): CategoryTotal[] {
  const map = new Map<CategoryId, number>();
  for (const e of items) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amountCents);
  }
  const out: CategoryTotal[] = [];
  for (const cat of CATEGORIES) {
    const v = map.get(cat.id);
    if (v && v > 0) {
      out.push({
        category: cat.id,
        name: cat.name,
        color: cat.color,
        emoji: cat.emoji,
        cents: v,
      });
    }
  }
  out.sort((a, b) => b.cents - a.cents);
  return out;
}

/** Sum of amountCents in an iterable of expenses. */
export function sumCents(items: Expense[]): number {
  let s = 0;
  for (const e of items) s += e.amountCents;
  return s;
}

/** Expenses on a specific date. */
export function expensesOn(items: Expense[], date: string): Expense[] {
  return items.filter((e) => e.date === date);
}

/** Expenses between (inclusive) start and end YYYY-MM-DD. */
export function expensesBetween(items: Expense[], start: string, end: string): Expense[] {
  return items.filter((e) => e.date >= start && e.date <= end);
}

/** Expenses within YYYY-MM. */
export function expensesInMonth(items: Expense[], ym: string): Expense[] {
  return items.filter((e) => ymOf(e.date) === ym);
}

/** Map of YYYY-MM-DD -> sum cents, for a given month. */
export function dailySumsForMonth(items: Expense[], ym: string): Map<string, number> {
  const out = new Map<string, number>();
  for (const e of items) {
    if (ymOf(e.date) !== ym) continue;
    out.set(e.date, (out.get(e.date) ?? 0) + e.amountCents);
  }
  return out;
}

/** Daily sums for the last N days, oldest first. */
export function dailySumsLastN(items: Expense[], n: number): { date: string; cents: number }[] {
  const days = lastNDays(n);
  const totals = new Map<string, number>();
  for (const e of items) {
    if (e.date >= days[0]! && e.date <= days[days.length - 1]!) {
      totals.set(e.date, (totals.get(e.date) ?? 0) + e.amountCents);
    }
  }
  return days.map((d) => ({ date: d, cents: totals.get(d) ?? 0 }));
}

export interface InsightsSummary {
  todayCents: number;
  weekCents: number;
  monthCents: number;
  avgDailyLast30Cents: number;
  biggestThisWeek: Expense | null;
  topCategoryThisMonth: CategoryTotal | null;
  daysUnderGoal: number;
  goalCents: number | null;
}

/**
 * Compute the headline numbers shown in Insights / Today views.
 * Past-30-day average uses days that had any spend OR are within the last
 * 30 days (whichever the user has data for), divided by 30 — so a single
 * heavy day still shows a meaningful average for new users.
 */
export function computeInsights(items: Expense[], goalCents: number | null): InsightsSummary {
  const today = todayISO();
  const weekStart = daysAgoISO(6);
  const monthStart = daysAgoISO(29);
  const ym = today.slice(0, 7);

  const todayItems = items.filter((e) => e.date === today);
  const weekItems = items.filter((e) => e.date >= weekStart && e.date <= today);
  const last30 = items.filter((e) => e.date >= monthStart && e.date <= today);

  let biggestThisWeek: Expense | null = null;
  for (const e of weekItems) {
    if (!biggestThisWeek || e.amountCents > biggestThisWeek.amountCents) {
      biggestThisWeek = e;
    }
  }

  const monthTotals = categoryTotals(expensesInMonth(items, ym));
  const topCategoryThisMonth = monthTotals[0] ?? null;

  let daysUnderGoal = 0;
  if (goalCents !== null) {
    const dailyTotals = new Map<string, number>();
    for (const e of last30) {
      dailyTotals.set(e.date, (dailyTotals.get(e.date) ?? 0) + e.amountCents);
    }
    for (const d of lastNDays(30)) {
      const v = dailyTotals.get(d) ?? 0;
      if (v <= goalCents) daysUnderGoal++;
    }
  }

  return {
    todayCents: sumCents(todayItems),
    weekCents: sumCents(weekItems),
    monthCents: sumCents(items.filter((e) => ymOf(e.date) === ym)),
    avgDailyLast30Cents: Math.round(sumCents(last30) / 30),
    biggestThisWeek,
    topCategoryThisMonth,
    daysUnderGoal,
    goalCents,
  };
}

export interface RecurringSuggestion {
  category: CategoryId;
  name: string;
  emoji: string;
  color: string;
  amountCents: number;
  /** How many times the same (category, amount) pair appears in the lookback window. */
  count: number;
}

/**
 * Heuristic: surface expense (category, amount) pairs that repeat at least
 * 3 times in the last 30 days. Returns up to 3 suggestions, most-recent first.
 */
export function detectRecurring(items: Expense[]): RecurringSuggestion[] {
  const since = daysAgoISO(30);
  const recent = items.filter((e) => e.date >= since);
  const buckets = new Map<string, { cat: CategoryId; cents: number; count: number; last: string }>();
  for (const e of recent) {
    const key = `${e.category}:${e.amountCents}`;
    const cur = buckets.get(key);
    if (cur) {
      cur.count++;
      if (e.createdAt > cur.last) cur.last = e.createdAt;
    } else {
      buckets.set(key, { cat: e.category, cents: e.amountCents, count: 1, last: e.createdAt });
    }
  }
  const candidates = [...buckets.values()].filter((b) => b.count >= 3);
  candidates.sort((a, b) => (a.last < b.last ? 1 : -1));
  return candidates.slice(0, 3).map((b) => {
    const cat = getCategory(b.cat);
    return {
      category: b.cat,
      name: cat.name,
      emoji: cat.emoji,
      color: cat.color,
      amountCents: b.cents,
      count: b.count,
    };
  });
}
