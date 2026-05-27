import type { CurrencyCode } from "../types/expense";
import { currencyInfo } from "./money";

/**
 * The keypad operates as a string of digits, optionally containing a single
 * decimal point. We re-parse it on render to convert to minor units. This
 * keeps the keypad logic dead simple — no floating point until the final
 * conversion at save time.
 */

export type KeypadKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "."
  | "back";

export function keypadInput(prev: string, key: KeypadKey, code: CurrencyCode): string {
  const info = currencyInfo(code);

  if (key === "back") {
    if (prev.length <= 1) return "";
    return prev.slice(0, -1);
  }

  if (key === ".") {
    // JPY has no fractional part — ignore decimal key entirely.
    if (info.decimals === 0) return prev;
    if (prev.includes(".")) return prev;
    if (prev === "") return "0.";
    return prev + ".";
  }

  // Digit key.
  // Limit fractional digits to currency precision.
  if (prev.includes(".")) {
    const dot = prev.indexOf(".");
    const decimalsSoFar = prev.length - dot - 1;
    if (decimalsSoFar >= info.decimals) return prev;
  }

  // Avoid leading zeros like "00", "01" — but keep "0." valid.
  if (prev === "0") {
    return key;
  }

  // Cap whole-number portion to a sensible length so the display never overflows.
  if (!prev.includes(".") && prev.length >= 9) return prev;

  return prev + key;
}

/**
 * Convert keypad-string state to minor units. Empty string -> 0.
 */
export function keypadToCents(input: string, code: CurrencyCode): number {
  if (input === "" || input === ".") return 0;
  const info = currencyInfo(code);
  const num = parseFloat(input);
  if (!isFinite(num)) return 0;
  return Math.round(num * (info.decimals === 0 ? 1 : 10 ** info.decimals));
}

/**
 * Render keypad-string for display. Empty -> "0".
 */
export function keypadDisplay(input: string): string {
  return input === "" ? "0" : input;
}

/**
 * Convert cents back into a keypad-editable string (used when editing
 * an existing expense). e.g. (1234, USD) -> "12.34"; (1500, JPY) -> "1500".
 */
export function centsToKeypad(cents: number, code: CurrencyCode): string {
  const info = currencyInfo(code);
  if (cents === 0) return "";
  if (info.decimals === 0) return String(Math.abs(cents));
  const abs = Math.abs(cents);
  const divisor = 10 ** info.decimals;
  const major = Math.floor(abs / divisor);
  const minor = abs % divisor;
  if (minor === 0) return String(major);
  const minorStr = String(minor).padStart(info.decimals, "0").replace(/0+$/, "");
  if (minorStr === "") return String(major);
  return `${major}.${minorStr}`;
}
