import type { CategoryDef, CategoryId } from "../types/expense";

/**
 * 12 expense categories. Order matters — this is the layout of the
 * category grid in the quick-entry pad (3 cols × 4 rows on mobile).
 * Each has a distinct accent color used for chips, heatmap segments,
 * and chart legends.
 */
export const CATEGORIES: CategoryDef[] = [
  { id: "food", name: "Food", emoji: "🍔", color: "#f97316" },
  { id: "transport", name: "Transport", emoji: "🚗", color: "#3b82f6" },
  { id: "coffee", name: "Coffee", emoji: "☕", color: "#a16207" },
  { id: "groceries", name: "Groceries", emoji: "🛒", color: "#16a34a" },
  { id: "shopping", name: "Shopping", emoji: "🛍️", color: "#db2777" },
  { id: "entertainment", name: "Entertainment", emoji: "🎬", color: "#7c3aed" },
  { id: "bills", name: "Bills", emoji: "🧾", color: "#dc2626" },
  { id: "health", name: "Health", emoji: "🏥", color: "#0891b2" },
  { id: "travel", name: "Travel", emoji: "✈️", color: "#0ea5a3" },
  { id: "gift", name: "Gift", emoji: "🎁", color: "#e11d48" },
  { id: "subscriptions", name: "Subs", emoji: "🔄", color: "#4f46e5" },
  { id: "other", name: "Other", emoji: "📦", color: "#6b7280" },
];

const CATEGORY_MAP: Record<CategoryId, CategoryDef> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, CategoryDef>,
);

export function getCategory(id: CategoryId): CategoryDef {
  return CATEGORY_MAP[id];
}
