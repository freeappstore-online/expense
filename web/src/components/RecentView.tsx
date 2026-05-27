import { useState } from "react";
import type { CurrencyCode, Expense } from "../types/expense";
import { ExpenseRow } from "./ExpenseRow";
import { EditExpense } from "./EditExpense";
import { daysAgoISO, formatDateRelative } from "../lib/dates";
import { formatCents } from "../lib/money";
import { downloadCSV } from "../lib/export";

interface RecentViewProps {
  expenses: Expense[];
  currency: CurrencyCode;
  onUpdate: (id: string, patch: Partial<Omit<Expense, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
}

/**
 * Last 7 days. Items grouped by day with a daily total header.
 * Empty days show a soft "—" row.
 */
export function RecentView({
  expenses,
  currency,
  onUpdate,
  onDelete,
}: RecentViewProps) {
  const [editing, setEditing] = useState<Expense | null>(null);

  // Build last 7 days newest first.
  const days: string[] = [];
  for (let i = 0; i < 7; i++) days.push(daysAgoISO(i));

  const byDay = new Map<string, Expense[]>();
  for (const d of days) byDay.set(d, []);
  for (const e of expenses) {
    const bucket = byDay.get(e.date);
    if (bucket) bucket.push(e);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  const sevenDayTotal = expenses
    .filter((e) => e.date >= days[6]!)
    .reduce((s, e) => s + e.amountCents, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* 7-day summary */}
      <div
        className="flex items-center justify-between rounded-2xl px-4 py-3"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
        }}
      >
        <div className="flex flex-col">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted)" }}
          >
            Last 7 days
          </span>
          <span
            className="amount-display text-2xl font-bold tabular-nums"
            style={{ color: "var(--ink)" }}
          >
            {formatCents(sevenDayTotal, currency)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => downloadCSV(expenses, currency)}
          className="press rounded-xl px-3 py-2 text-xs font-semibold"
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent)",
            border: "1px solid var(--accent)",
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Per-day groups */}
      <div className="flex flex-col gap-4">
        {days.map((d) => {
          const items = byDay.get(d) ?? [];
          const dayTotal = items.reduce((s, e) => s + e.amountCents, 0);
          return (
            <div key={d} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between px-1">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--ink)" }}
                >
                  {formatDateRelative(d)}
                </span>
                <span
                  className="amount-display text-sm font-semibold tabular-nums"
                  style={{
                    color: dayTotal === 0 ? "var(--muted)" : "var(--ink)",
                  }}
                >
                  {dayTotal === 0 ? "—" : formatCents(dayTotal, currency)}
                </span>
              </div>
              {items.length === 0 ? (
                <div
                  className="rounded-xl px-3 py-2 text-center text-xs"
                  style={{
                    background: "var(--panel)",
                    color: "var(--muted)",
                    border: "1px dashed var(--line)",
                  }}
                >
                  No expenses
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {items.map((e) => (
                    <ExpenseRow
                      key={e.id}
                      expense={e}
                      currency={currency}
                      onClick={() => setEditing(e)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <EditExpense
          expense={editing}
          currency={currency}
          onSave={(patch) => {
            onUpdate(editing.id, patch);
            setEditing(null);
          }}
          onDelete={() => {
            onDelete(editing.id);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
