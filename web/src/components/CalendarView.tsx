import { useMemo, useState } from "react";
import type { CurrencyCode, Expense } from "../types/expense";
import { useCanvasChart } from "../hooks/useCanvasChart";
import { drawHeatmap } from "../lib/charts";
import {
  currentYM,
  daysInMonth,
  firstWeekdayOfMonth,
  formatYM,
  shiftYM,
  todayISO,
} from "../lib/dates";
import { dailySumsForMonth } from "../lib/insights";
import { ExpenseRow } from "./ExpenseRow";
import { formatCents } from "../lib/money";

interface CalendarViewProps {
  expenses: Expense[];
  currency: CurrencyCode;
}

/**
 * Month heat-map calendar. Cells colored by daily spend; gradient
 * green->yellow->orange->red against the heaviest day in the month.
 * Tapping a day shows that day's expense list below.
 */
export function CalendarView({ expenses, currency }: CalendarViewProps) {
  const [ym, setYm] = useState<string>(() => currentYM());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const totals = useMemo(
    () => dailySumsForMonth(expenses, ym),
    [expenses, ym],
  );
  const days = daysInMonth(ym);
  const firstWd = firstWeekdayOfMonth(ym);

  const cells = useMemo(() => {
    const out: { day: number; cents: number }[] = [];
    for (let d = 1; d <= days; d++) {
      const dateStr = `${ym}-${String(d).padStart(2, "0")}`;
      out.push({ day: d, cents: totals.get(dateStr) ?? 0 });
    }
    return out;
  }, [days, ym, totals]);

  const maxCents = useMemo(
    () => cells.reduce((m, c) => Math.max(m, c.cents), 0),
    [cells],
  );

  const monthTotal = useMemo(
    () => cells.reduce((s, c) => s + c.cents, 0),
    [cells],
  );

  const draw = useMemo(
    () => (ctx: CanvasRenderingContext2D, w: number, h: number) =>
      drawHeatmap(ctx, w, h, cells, firstWd, maxCents),
    [cells, firstWd, maxCents],
  );
  const canvasRef = useCanvasChart(draw);

  // Tap-to-select day via overlay grid sitting on the canvas.
  const cols = 7;
  const rows = Math.ceil((firstWd + days) / cols);
  const today = todayISO();
  const todayDay = today.slice(0, 7) === ym ? Number(today.slice(8)) : null;

  const selectedDate =
    selectedDay !== null ? `${ym}-${String(selectedDay).padStart(2, "0")}` : null;
  const selectedItems = selectedDate
    ? expenses
        .filter((e) => e.date === selectedDate)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between rounded-2xl px-3 py-2"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <button
          type="button"
          onClick={() => {
            setYm(shiftYM(ym, -1));
            setSelectedDay(null);
          }}
          className="press flex h-8 w-8 items-center justify-center rounded-full text-lg"
          style={{ color: "var(--ink)" }}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            {formatYM(ym)}
          </span>
          <span
            className="amount-display text-base font-bold tabular-nums"
            style={{ color: "var(--accent)" }}
          >
            {formatCents(monthTotal, currency)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setYm(shiftYM(ym, 1));
            setSelectedDay(null);
          }}
          className="press flex h-8 w-8 items-center justify-center rounded-full text-lg"
          style={{ color: "var(--ink)" }}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Heatmap canvas + overlay tap grid */}
      <div
        className="relative w-full rounded-2xl p-2"
        style={{
          aspectRatio: `${cols} / ${rows + 0.4}`,
          background: "var(--panel)",
          border: "1px solid var(--line)",
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {/* Invisible tap targets for selection */}
        <div className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `auto repeat(${rows}, 1fr)`,
          }}
        >
          <div style={{ gridColumn: `1 / span ${cols}` }} />
          {cells.map((cell) => {
            const slot = firstWd + cell.day - 1;
            const r = Math.floor(slot / cols) + 2;
            const c = (slot % cols) + 1;
            const isToday = todayDay === cell.day;
            const isSelected = selectedDay === cell.day;
            return (
              <button
                key={cell.day}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : cell.day)}
                aria-label={`Day ${cell.day} — ${formatCents(cell.cents, currency)}`}
                className="press rounded-md"
                style={{
                  gridColumn: c,
                  gridRow: r,
                  background: "transparent",
                  outline: isSelected
                    ? `2px solid var(--accent)`
                    : isToday
                    ? `2px solid var(--accent-soft)`
                    : "none",
                  outlineOffset: -2,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 text-[10px]"
        style={{ color: "var(--muted)" }}
      >
        <span>Less</span>
        <span className="h-3 w-4 rounded" style={{ background: "rgb(22,163,74)" }} />
        <span className="h-3 w-4 rounded" style={{ background: "rgb(250,204,21)" }} />
        <span className="h-3 w-4 rounded" style={{ background: "rgb(249,115,22)" }} />
        <span className="h-3 w-4 rounded" style={{ background: "rgb(220,38,38)" }} />
        <span>More</span>
      </div>

      {/* Selected day list */}
      {selectedDay !== null && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--ink)" }}
          >
            {`${formatYM(ym)} ${selectedDay}`}
          </span>
          {selectedItems.length === 0 ? (
            <div
              className="rounded-xl px-3 py-2 text-center text-xs"
              style={{
                background: "var(--panel)",
                color: "var(--muted)",
                border: "1px dashed var(--line)",
              }}
            >
              No expenses on this day
            </div>
          ) : (
            selectedItems.map((e) => (
              <ExpenseRow key={e.id} expense={e} currency={currency} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
