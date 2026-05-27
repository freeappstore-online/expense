import { useState } from "react";
import type { CurrencyCode, TabId } from "./types/expense";
import { useExpenseStore } from "./hooks/useExpenseStore";
import { TodayView } from "./components/TodayView";
import { RecentView } from "./components/RecentView";
import { CalendarView } from "./components/CalendarView";
import { Charts } from "./components/Charts";
import { Insights } from "./components/Insights";
import { currencySymbol } from "./lib/money";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "today", label: "Today", emoji: "⚡" },
  { id: "recent", label: "Recent", emoji: "🗓" },
  { id: "calendar", label: "Heat", emoji: "🔥" },
  { id: "charts", label: "Charts", emoji: "📊" },
  { id: "insights", label: "Insights", emoji: "💡" },
];

const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "GBP", "AUD", "JPY", "CAD"];

export default function App() {
  const store = useExpenseStore();
  const [tab, setTab] = useState<TabId>("today");
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col" style={{ background: "var(--paper)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "var(--glass)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--line)",
          paddingTop: "max(12px, env(safe-area-inset-top))",
        }}
      >
        <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          Expense
        </h1>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCurrencyMenu((v) => !v)}
            className="press rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={{
              background: "var(--panel)",
              color: "var(--accent)",
              border: "1px solid var(--line)",
            }}
          >
            {currencySymbol(store.settings.currency)} {store.settings.currency}
          </button>
          {showCurrencyMenu && (
            <div
              className="absolute right-0 top-full z-50 mt-1 flex flex-col rounded-lg shadow-lg"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
                minWidth: 120,
              }}
            >
              {CURRENCIES.map((code) => {
                const active = store.settings.currency === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      store.setCurrency(code);
                      setShowCurrencyMenu(false);
                    }}
                    className="px-4 py-2 text-left text-sm hover:opacity-80"
                    style={{
                      color: active ? "var(--accent)" : "var(--ink)",
                      fontWeight: active ? 700 : 400,
                    }}
                  >
                    {currencySymbol(code)} {code}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {tab === "today" && (
          <TodayView
            expenses={store.expenses}
            currency={store.settings.currency}
            goalCents={store.settings.dailyGoalCents}
            onAdd={store.addExpense}
            onUpdate={store.updateExpense}
            onDelete={store.deleteExpense}
          />
        )}
        {tab === "recent" && (
          <RecentView
            expenses={store.expenses}
            currency={store.settings.currency}
            onUpdate={store.updateExpense}
            onDelete={store.deleteExpense}
          />
        )}
        {tab === "calendar" && (
          <CalendarView
            expenses={store.expenses}
            currency={store.settings.currency}
          />
        )}
        {tab === "charts" && (
          <Charts
            expenses={store.expenses}
            currency={store.settings.currency}
          />
        )}
        {tab === "insights" && (
          <Insights
            expenses={store.expenses}
            currency={store.settings.currency}
            goalCents={store.settings.dailyGoalCents}
            onSetGoal={store.setDailyGoal}
          />
        )}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex max-w-lg items-center justify-around py-2"
        style={{
          background: "var(--dock)",
          borderTop: "1px solid var(--line)",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}
      >
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="press flex flex-col items-center gap-0.5 px-3 py-1"
              aria-pressed={active}
            >
              <span className="text-lg" aria-hidden>
                {t.emoji}
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? "var(--accent)" : "var(--muted)" }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
