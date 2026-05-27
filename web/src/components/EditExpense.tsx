import type { CurrencyCode, Expense } from "../types/expense";
import { QuickAdd } from "./QuickAdd";

interface EditExpenseProps {
  expense: Expense;
  currency: CurrencyCode;
  onSave: (patch: Omit<Expense, "id" | "createdAt">) => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * Overlay that lets the user edit (or delete) an existing expense.
 * Reuses QuickAdd's keypad+category UI in edit mode.
 */
export function EditExpense({
  expense,
  currency,
  onSave,
  onDelete,
  onClose,
}: EditExpenseProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-3 sm:items-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl"
        style={{ background: "var(--paper)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            Edit expense
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="text-xs font-semibold"
            style={{ color: "var(--error)" }}
          >
            Delete
          </button>
        </div>
        <div className="p-3">
          <QuickAdd
            currency={currency}
            expenses={[]}
            initial={expense}
            onSave={onSave}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
