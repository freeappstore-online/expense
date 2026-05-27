import type { CurrencyCode, Expense } from "../types/expense";
import { getCategory } from "../lib/categories";
import { formatCents } from "../lib/money";

interface ExpenseRowProps {
  expense: Expense;
  currency: CurrencyCode;
  onClick?: () => void;
  /** Optional date label (used in Recent view to differentiate days). */
  showDate?: boolean;
  dateLabel?: string;
}

export function ExpenseRow({
  expense,
  currency,
  onClick,
  showDate,
  dateLabel,
}: ExpenseRowProps) {
  const cat = getCategory(expense.category);
  const interactive = Boolean(onClick);

  const inner = (
    <>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
        style={{ background: cat.color + "1f", color: cat.color }}
        aria-hidden
      >
        {cat.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold" style={{ color: "var(--ink)" }}>
          {cat.name}
        </div>
        {(expense.note || showDate) && (
          <div className="truncate text-xs" style={{ color: "var(--muted)" }}>
            {[showDate ? dateLabel : null, expense.note].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
      <div
        className="amount-display text-base font-semibold tabular-nums"
        style={{ color: "var(--ink)" }}
      >
        {formatCents(expense.amountCents, currency)}
      </div>
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="press flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
        }}
      >
        {inner}
      </button>
    );
  }
  return (
    <div
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
      }}
    >
      {inner}
    </div>
  );
}
