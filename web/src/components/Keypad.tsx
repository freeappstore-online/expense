import type { CurrencyCode } from "../types/expense";
import { currencySymbol, currencyInfo } from "../lib/money";
import { keypadInput, type KeypadKey } from "../lib/keypad";

interface KeypadProps {
  value: string;
  currency: CurrencyCode;
  onChange: (next: string) => void;
}

/**
 * Big touch-friendly numeric keypad. Layout:
 *   1 2 3
 *   4 5 6
 *   7 8 9
 *   . 0 ⌫
 * Decimal is hidden on zero-decimal currencies (JPY).
 */
export function Keypad({ value, currency, onChange }: KeypadProps) {
  const info = currencyInfo(currency);
  const symbol = currencySymbol(currency);

  const press = (key: KeypadKey) => {
    onChange(keypadInput(value, key, currency));
  };

  const display = value === "" ? "0" : value;

  return (
    <div className="flex flex-col gap-3">
      {/* Amount display */}
      <div className="flex items-end justify-center gap-1 px-2 py-2">
        <span
          className="amount-display text-3xl font-bold"
          style={{ color: "var(--muted)" }}
        >
          {symbol}
        </span>
        <span
          className="amount-display text-6xl font-bold"
          style={{ color: "var(--ink)" }}
        >
          {display}
        </span>
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-2">
        {(["1", "2", "3", "4", "5", "6", "7", "8", "9"] as KeypadKey[]).map((d) => (
          <KeypadButton key={d} onClick={() => press(d)}>
            {d}
          </KeypadButton>
        ))}
        <KeypadButton onClick={() => press(".")} disabled={info.decimals === 0}>
          {info.decimals === 0 ? "" : "."}
        </KeypadButton>
        <KeypadButton onClick={() => press("0")}>0</KeypadButton>
        <KeypadButton onClick={() => press("back")} ariaLabel="Backspace">
          <span aria-hidden>⌫</span>
        </KeypadButton>
      </div>
    </div>
  );
}

interface KeypadButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

function KeypadButton({ children, onClick, disabled, ariaLabel }: KeypadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="press flex h-14 items-center justify-center rounded-2xl text-2xl font-semibold disabled:opacity-30"
      style={{
        background: "var(--panel)",
        color: "var(--ink)",
        border: "1px solid var(--line)",
      }}
    >
      {children}
    </button>
  );
}
