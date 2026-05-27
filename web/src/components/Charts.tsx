import { useMemo } from "react";
import type { CurrencyCode, Expense } from "../types/expense";
import { useCanvasChart } from "../hooks/useCanvasChart";
import { drawBarChart, drawLineChart, drawPieChart } from "../lib/charts";
import {
  categoryTotals,
  dailySumsLastN,
  expensesInMonth,
} from "../lib/insights";
import { currentYM, formatDateShort } from "../lib/dates";
import { formatCents } from "../lib/money";

interface ChartsProps {
  expenses: Expense[];
  currency: CurrencyCode;
}

/**
 * Three charts:
 *   1. Pie — spend by category this month
 *   2. Bar — daily spend last 30 days
 *   3. Line — daily spend last 90 days (smoothed trend)
 */
export function Charts({ expenses, currency }: ChartsProps) {
  const ym = currentYM();
  const monthItems = useMemo(() => expensesInMonth(expenses, ym), [expenses, ym]);
  const totals = useMemo(() => categoryTotals(monthItems), [monthItems]);
  const monthTotal = useMemo(
    () => totals.reduce((s, t) => s + t.cents, 0),
    [totals],
  );

  const last30 = useMemo(() => dailySumsLastN(expenses, 30), [expenses]);
  const last90 = useMemo(() => dailySumsLastN(expenses, 90), [expenses]);

  // Canvas can't resolve CSS variables — use literal accent hex.
  // Light and dark accents are visually close; the literal is fine for charts.
  const accentHex = "#0ea5a3";

  const drawPie = useMemo(
    () => (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      drawPieChart(
        ctx,
        totals.map((t) => ({ label: t.name, value: t.cents, color: t.color })),
        w,
        h,
      );
    },
    [totals],
  );
  const pieRef = useCanvasChart(drawPie);

  const drawBars = useMemo(
    () => (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      drawBarChart(
        ctx,
        last30.map((d) => ({
          label: d.date.slice(-2),
          value: d.cents,
          color: accentHex,
        })),
        w,
        h,
      );
    },
    [last30],
  );
  const barRef = useCanvasChart(drawBars);

  const drawLine = useMemo(
    () => (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      drawLineChart(
        ctx,
        last90.map((d) => ({
          label: formatDateShort(d.date),
          value: d.cents,
        })),
        w,
        h,
        accentHex,
      );
    },
    [last90],
  );
  const lineRef = useCanvasChart(drawLine);

  return (
    <div className="flex flex-col gap-5">
      {/* Pie by category */}
      <section className="flex flex-col gap-2">
        <header className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            By category — this month
          </h2>
          <span
            className="amount-display text-sm font-semibold tabular-nums"
            style={{ color: "var(--accent)" }}
          >
            {formatCents(monthTotal, currency)}
          </span>
        </header>
        <div
          className="relative rounded-2xl p-3"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
          }}
        >
          <div className="aspect-square w-full">
            <canvas ref={pieRef} className="h-full w-full" />
          </div>
          {totals.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1">
              {totals.map((t) => (
                <li
                  key={t.category}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: t.color }}
                    />
                    <span style={{ color: "var(--ink)" }}>{t.name}</span>
                  </span>
                  <span
                    className="tabular-nums"
                    style={{ color: "var(--muted)" }}
                  >
                    {formatCents(t.cents, currency)}
                    {monthTotal > 0 && (
                      <span className="ml-1.5">
                        ({Math.round((t.cents / monthTotal) * 100)}%)
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Bar last 30 days */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Daily — last 30 days
        </h2>
        <div
          className="rounded-2xl p-3"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            height: 180,
          }}
        >
          <canvas ref={barRef} className="h-full w-full" />
        </div>
      </section>

      {/* Trend last 90 days */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Trend — last 90 days
        </h2>
        <div
          className="rounded-2xl p-3"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            height: 180,
          }}
        >
          <canvas ref={lineRef} className="h-full w-full" />
        </div>
      </section>
    </div>
  );
}
