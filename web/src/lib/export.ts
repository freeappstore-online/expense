import type { CurrencyCode, Expense } from "../types/expense";
import { getCategory } from "./categories";
import { currencyInfo } from "./money";

function escapeCSV(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Build a CSV string of all expenses. The amount column is rendered in
 * major units (e.g. 12.50, not 1250 cents) for spreadsheet ergonomics —
 * but we also include the raw minor-unit integer for round-trip safety.
 */
export function buildCSV(items: Expense[], currency: CurrencyCode): string {
  const info = currencyInfo(currency);
  const divisor = info.decimals === 0 ? 1 : 10 ** info.decimals;
  const rows: string[] = [];
  rows.push(["Date", "Category", "Amount", "MinorUnits", "Currency", "Note"].join(","));
  const sorted = [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  for (const e of sorted) {
    const cat = getCategory(e.category);
    const amountStr = (e.amountCents / divisor).toFixed(info.decimals);
    rows.push(
      [
        e.date,
        escapeCSV(cat.name),
        amountStr,
        String(e.amountCents),
        currency,
        escapeCSV(e.note ?? ""),
      ].join(","),
    );
  }
  return rows.join("\n");
}

/** Trigger a browser download of a CSV file. */
export function downloadCSV(items: Expense[], currency: CurrencyCode): void {
  const csv = buildCSV(items, currency);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const today = new Date().toISOString().slice(0, 10);
  a.download = `expenses-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
