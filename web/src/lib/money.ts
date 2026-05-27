import type { CurrencyCode } from "../types/expense";

interface CurrencyInfo {
  symbol: string;
  /** Number of minor-unit digits (e.g. 2 for USD cents, 0 for JPY). */
  decimals: number;
  /** Locale used for grouping (just thousands separators). */
  locale: string;
}

const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { symbol: "$", decimals: 2, locale: "en-US" },
  EUR: { symbol: "€", decimals: 2, locale: "en-GB" },
  GBP: { symbol: "£", decimals: 2, locale: "en-GB" },
  AUD: { symbol: "A$", decimals: 2, locale: "en-AU" },
  JPY: { symbol: "¥", decimals: 0, locale: "ja-JP" },
  CAD: { symbol: "C$", decimals: 2, locale: "en-CA" },
};

export function currencyInfo(code: CurrencyCode): CurrencyInfo {
  return CURRENCIES[code];
}

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCIES[code].symbol;
}

/**
 * Format minor-unit integer as a string with currency symbol.
 * e.g. (123456, "USD") -> "$1,234.56"; (1500, "JPY") -> "¥1,500".
 */
export function formatCents(cents: number, code: CurrencyCode): string {
  const info = CURRENCIES[code];
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const divisor = info.decimals === 0 ? 1 : 10 ** info.decimals;
  const major = Math.floor(abs / divisor);
  const minor = abs % divisor;
  const majorStr = major.toLocaleString(info.locale);
  const body =
    info.decimals === 0
      ? majorStr
      : majorStr + "." + String(minor).padStart(info.decimals, "0");
  return (negative ? "-" : "") + info.symbol + body;
}

/**
 * Format without symbol, just digits. Used inside the keypad display.
 * e.g. (12345, "USD") -> "123.45"; (1500, "JPY") -> "1500".
 */
export function formatCentsBare(cents: number, code: CurrencyCode): string {
  const info = CURRENCIES[code];
  const abs = Math.abs(cents);
  const divisor = info.decimals === 0 ? 1 : 10 ** info.decimals;
  const major = Math.floor(abs / divisor);
  const minor = abs % divisor;
  const majorStr = major.toLocaleString(info.locale);
  if (info.decimals === 0) return majorStr;
  return majorStr + "." + String(minor).padStart(info.decimals, "0");
}

/**
 * Parse a user-entered string like "12.50" into minor units.
 * Returns null if invalid.
 */
export function parseToCents(input: string, code: CurrencyCode): number | null {
  const info = CURRENCIES[code];
  const cleaned = input.replace(/[,\s]/g, "").replace(/[^\d.]/g, "");
  if (cleaned === "") return null;
  const num = parseFloat(cleaned);
  if (!isFinite(num)) return null;
  return Math.round(num * (info.decimals === 0 ? 1 : 10 ** info.decimals));
}
