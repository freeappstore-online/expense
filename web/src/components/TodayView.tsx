import { useState } from "react";
import type { CurrencyCode, Expense } from "../types/expense";
import { QuickAdd } from "./QuickAdd";
import { ExpenseRow } from "./ExpenseRow";
import { EditExpense } from "./EditExpense";
import { todayISO } from "../lib/dates";
import { expensesOn, sumCents } from "../lib/insights";
import { formatCents } from "../lib/money";

interface TodayViewProps {
  expenses: Expense[];
  currency: CurrencyCode;
  goalCents: number | null;
  onAdd: (input: Omit<Expense, "id" | "createdAt">) => void;
  onUpdate: (id: string, patch: Partial<Omit<Expense, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
}

/**
 * Today's spending: large headline total, goal progress bar, quick-add pad,
 * and the list of today's expenses (newest first, tap to edit).
 */
export function TodayView({
  expenses,
  currency,
  goalCents,
  onAdd,
  onUpdate,
  onDelete,
}: TodayViewProps) {
  const today = todayISO();
  const todayItems = expensesOn(expenses, today).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
  const total = sumCents(todayItems);
  const [editing, setEditing] = useState<Expense | null>(null);

  const pct = goalCents && goalCents > 0 ? Math.min(1, total / goalCents) : null;
  const overGoal = goalCents !== null && total > goalCents;

  return (
    <div className="flex flex-col gap-4">
      {/* Headline total */}
      <div
        className="flex flex-col items-center gap-1 rounded-2xl px-4 py-5"
        style={{
          background: "var(--accent-soft)",
          border: "1px solid var(--accent)",
        }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--accent)" }}
        >
          Spent today
        </span>
        <span
          className="amount-display text-5xl font-bold tabular-nums"
          style={{ color: "var(--ink)" }}
        >
          {formatCents(total, currency)}
        </span>
        {goalCents !== null && (
          <div className="mt-2 flex w-full max-w-xs flex-col gap-1">
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{ background: "var(--panel-strong)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(pct ?? 0) * 100}%`,
                  background: overGoal ? "var(--error)" : "var(--accent)",
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: "var(--muted)" }}>
                Goal {formatCents(goalCents, currency)}
              </span>
              <span
                style={{
                  color: overGoal ? "var(--error)" : "var(--muted)",
                  fontWeight: 600,
                }}
              >
                {overGoal
                  ? `${formatCents(total - goalCents, currency)} over`
                  : `${formatCents(goalCents - total, currency)} left`}
              </span>
            </div>
          </div>
        )}
      </div>

      <QuickAdd currency={currency} expenses={expenses} onSave={onAdd} />

      {/* Today's expense list */}
      <div className="flex flex-col gap-2">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--muted)" }}
        >
          {todayItems.length === 0
            ? "No expenses yet today"
            : `${todayItems.length} expense${todayItems.length === 1 ? "" : "s"}`}
        </span>
        <div className="flex flex-col gap-1.5">
          {todayItems.map((e) => (
            <ExpenseRow
              key={e.id}
              expense={e}
              currency={currency}
              onClick={() => setEditing(e)}
            />
          ))}
        </div>
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
