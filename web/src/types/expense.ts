export type CurrencyCode = "USD" | "EUR" | "GBP" | "AUD" | "JPY" | "CAD";

export type CategoryId =
  | "food"
  | "transport"
  | "coffee"
  | "groceries"
  | "shopping"
  | "entertainment"
  | "bills"
  | "health"
  | "travel"
  | "gift"
  | "subscriptions"
  | "other";

export interface CategoryDef {
  id: CategoryId;
  name: string;
  emoji: string;
  /** Tailwind-free CSS color used for chips, dots, heatmap. */
  color: string;
}

export interface Expense {
  id: string;
  /** Integer minor units (cents for USD/EUR/GBP/AUD/CAD; yen for JPY). */
  amountCents: number;
  category: CategoryId;
  /** YYYY-MM-DD in local time. */
  date: string;
  /** ISO timestamp; used for newest-first ordering within a day. */
  createdAt: string;
  /** Optional free-text note. */
  note?: string;
}

export interface AppSettings {
  currency: CurrencyCode;
  /** Optional daily spend goal in cents. null means no goal set. */
  dailyGoalCents: number | null;
}

export type TabId = "today" | "recent" | "calendar" | "charts" | "insights";
