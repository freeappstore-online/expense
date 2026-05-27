import type { AppSettings, Expense } from "../types/expense";

const KEYS = {
  expenses: "expense_log",
  settings: "expense_settings",
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private-mode — silently ignore */
  }
}

export function loadExpenses(): Expense[] {
  return load<Expense[]>(KEYS.expenses, []);
}

export function saveExpenses(items: Expense[]): void {
  save(KEYS.expenses, items);
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: "USD",
  dailyGoalCents: null,
};

export function loadSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...load<Partial<AppSettings>>(KEYS.settings, {}) };
}

export function saveSettings(settings: AppSettings): void {
  save(KEYS.settings, settings);
}
