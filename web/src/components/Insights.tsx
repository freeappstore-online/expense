import { useState } from "react";
import type { CurrencyCode, Expense } from "../types/expense";
import { computeInsights } from "../lib/insights";
import { getCategory } from "../lib/categories";
import { formatCents, parseToCents } from "../lib/money";
import { formatDateRelative } from "../lib/dates";

interface InsightsProps {
  expenses: Expense[];
  currency: CurrencyCode;
  goalCents: number | null;
  onSetGoal: (cents: number | null) => void;
}

/**
 * Headline numbers + goal control. Goal is optional; clearing it removes
 * the progress bar everywhere it appears.
 */
export function Insights({
  expenses,
  currency,
  goalCents,
  onSetGoal,
}: InsightsProps) {
  const summary = computeInsights(expenses, goalCents);
  const [goalInput, setGoalInput] = useState<string>(
    goalCents !== null ? String(goalCents / (currency === "JPY" ? 1 : 100)) : "",
  );

  const cards: { label: string; value: string; sub?: string }[] = [
    {
      label: "Avg / day (30d)",
      value: formatCents(summary.avgDailyLast30Cents, currency),
    },
    {
      label: "This week",
      value: formatCents(summary.weekCents, currency),
    },
    {
      label: "This month",
      value: formatCents(summary.monthCents, currency),
    },
    {
      label: "Days under goal (30d)",
      value: goalCents !== null ? `${summary.daysUnderGoal} / 30` : "—",
      sub: goalCents !== null ? formatCents(goalCents, currency) + " goal" : "set a goal below",
    },
  ];

  const biggest = summary.biggestThisWeek;
  const top = summary.topCategoryThisMonth;

  const submitGoal = () => {
    const cents = parseToCents(goalInput, currency);
    if (cents === null || cents <= 0) {
      onSetGoal(null);
      setGoalInput("");
    } else {
      onSetGoal(cents);
    }
  };

  const clearGoal = () => {
    onSetGoal(null);
    setGoalInput("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex flex-col gap-0.5 rounded-2xl px-3 py-3"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
            }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              {c.label}
            </span>
            <span
              className="amount-display text-xl font-bold tabular-nums"
              style={{ color: "var(--ink)" }}
            >
              {c.value}
            </span>
            {c.sub && (
              <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                {c.sub}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Biggest expense this week */}
      {biggest && (
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
          }}
        >
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
            style={{
              background: getCategory(biggest.category).color + "1f",
              color: getCategory(biggest.category).color,
            }}
            aria-hidden
          >
            {getCategory(biggest.category).emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              Biggest this week
            </div>
            <div className="truncate text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {getCategory(biggest.category).name}
              {biggest.note ? ` · ${biggest.note}` : ""}
            </div>
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
              {formatDateRelative(biggest.date)}
            </div>
          </div>
          <div
            className="amount-display text-lg font-bold tabular-nums"
            style={{ color: "var(--ink)" }}
          >
            {formatCents(biggest.amountCents, currency)}
          </div>
        </div>
      )}

      {/* Top category */}
      {top && (
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: top.color + "12",
            border: `1px solid ${top.color}66`,
          }}
        >
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
            style={{
              background: top.color,
              color: "#ffffff",
            }}
            aria-hidden
          >
            {top.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: top.color }}
            >
              Top category — this month
            </div>
            <div className="truncate text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {top.name}
            </div>
          </div>
          <div
            className="amount-display text-lg font-bold tabular-nums"
            style={{ color: "var(--ink)" }}
          >
            {formatCents(top.cents, currency)}
          </div>
        </div>
      )}

      {/* Goal control */}
      <section
        className="flex flex-col gap-2 rounded-2xl px-4 py-3"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
        }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--muted)" }}
        >
          Daily spend goal
        </span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="e.g. 30"
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--paper)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
            }}
          />
          <button
            type="button"
            onClick={submitGoal}
            className="press rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Save
          </button>
          {goalCents !== null && (
            <button
              type="button"
              onClick={clearGoal}
              className="press rounded-xl px-3 py-2 text-xs font-semibold"
              style={{
                background: "var(--panel-strong)",
                color: "var(--ink)",
                border: "1px solid var(--line)",
              }}
            >
              Clear
            </button>
          )}
        </div>
        {goalCents !== null && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            Current goal: {formatCents(goalCents, currency)} / day
          </span>
        )}
      </section>
    </div>
  );
}
