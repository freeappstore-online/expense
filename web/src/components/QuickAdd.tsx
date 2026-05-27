import { useState } from "react";
import type { CategoryId, CurrencyCode, Expense } from "../types/expense";
import { Keypad } from "./Keypad";
import { CategoryGrid } from "./CategoryGrid";
import { keypadToCents, centsToKeypad } from "../lib/keypad";
import { formatCents, currencyInfo } from "../lib/money";
import { todayISO } from "../lib/dates";
import { detectRecurring } from "../lib/insights";

interface QuickAddProps {
  currency: CurrencyCode;
  expenses: Expense[];
  onSave: (input: Omit<Expense, "id" | "createdAt">) => void;
  onClose?: () => void;
  /** If provided, the form starts in edit mode for this expense. */
  initial?: Expense;
}

/**
 * The fast-entry surface. Keypad → category buttons → instant save.
 * Tapping a category button is the save action — no separate confirm.
 *
 * Includes:
 *   - quick-amount chips ($5/$10/$20/$50)
 *   - recurring suggestions (most-frequent recent (cat, amount) pairs)
 *   - optional note field, collapsed by default
 */
export function QuickAdd({
  currency,
  expenses,
  onSave,
  onClose,
  initial,
}: QuickAddProps) {
  const info = currencyInfo(currency);
  const [amount, setAmount] = useState<string>(() =>
    initial ? centsToKeypad(initial.amountCents, currency) : "",
  );
  const [note, setNote] = useState<string>(initial?.note ?? "");
  const [showNote, setShowNote] = useState<boolean>(Boolean(initial?.note));

  const cents = keypadToCents(amount, currency);
  const recurring = initial ? [] : detectRecurring(expenses);

  // Quick-amount chips scale with currency precision so JPY shows 500/1000/2000/5000.
  const quickAmounts = info.decimals === 0
    ? [500, 1000, 2000, 5000]
    : [500, 1000, 2000, 5000]; // 5.00, 10.00, 20.00, 50.00 in cents

  const handleCategory = (cat: CategoryId) => {
    if (cents <= 0) return;
    const trimmed = note.trim();
    const payload: Omit<Expense, "id" | "createdAt"> = {
      amountCents: cents,
      category: cat,
      date: initial?.date ?? todayISO(),
      // In edit mode emit `note: undefined` so the spread in the store
      // clears any previously-saved note; in create mode just omit it.
      ...(trimmed ? { note: trimmed } : initial ? { note: undefined } : {}),
    };
    onSave(payload);
    if (!initial) {
      setAmount("");
      setNote("");
      setShowNote(false);
    }
    onClose?.();
  };

  const handleQuickAmount = (c: number) => {
    setAmount(centsToKeypad(c, currency));
  };

  const handleRecurring = (cat: CategoryId, c: number) => {
    onSave({
      amountCents: c,
      category: cat,
      date: todayISO(),
    });
    setAmount("");
    setNote("");
    setShowNote(false);
    onClose?.();
  };

  return (
    <section
      className="flex flex-col gap-4 rounded-2xl p-4"
      style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
    >
      <Keypad value={amount} currency={currency} onChange={setAmount} />

      {/* Quick-amount chips */}
      <div className="flex flex-wrap gap-2">
        {quickAmounts.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleQuickAmount(c)}
            className="press rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: "var(--panel-strong)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
            }}
          >
            {formatCents(c, currency)}
          </button>
        ))}
      </div>

      {/* Recurring suggestions */}
      {recurring.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted)" }}
          >
            Again?
          </span>
          <div className="flex flex-wrap gap-2">
            {recurring.map((r) => (
              <button
                key={`${r.category}-${r.amountCents}`}
                type="button"
                onClick={() => handleRecurring(r.category, r.amountCents)}
                className="press flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: r.color + "22",
                  color: r.color,
                  border: `1px solid ${r.color}55`,
                }}
              >
                <span aria-hidden>{r.emoji}</span>
                <span>{r.name}</span>
                <span style={{ color: "var(--ink)" }}>
                  {formatCents(r.amountCents, currency)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Optional note */}
      {showNote ? (
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          maxLength={120}
          className="w-full rounded-xl px-3 py-2 text-sm outline-none"
          style={{
            background: "var(--panel)",
            color: "var(--ink)",
            border: "1px solid var(--line)",
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowNote(true)}
          className="text-xs font-semibold underline-offset-2 hover:underline"
          style={{ color: "var(--muted)" }}
        >
          + add note
        </button>
      )}

      {/* Category grid — tapping any saves. Disabled when amount is zero. */}
      <div className="flex flex-col gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: cents > 0 ? "var(--accent)" : "var(--muted)" }}
        >
          {cents > 0 ? "Tap category to save" : "Enter an amount"}
        </span>
        <div style={{ opacity: cents > 0 ? 1 : 0.4, pointerEvents: cents > 0 ? "auto" : "none" }}>
          <CategoryGrid
            selected={initial?.category ?? null}
            onSelect={handleCategory}
            oneTap
          />
        </div>
      </div>

      {initial && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="press rounded-xl py-2 text-sm font-semibold"
          style={{
            background: "var(--panel-strong)",
            color: "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          Cancel
        </button>
      )}
    </section>
  );
}
