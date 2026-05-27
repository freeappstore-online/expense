import { useCallback, useEffect, useState } from "react";
import type { AppSettings, CurrencyCode, Expense } from "../types/expense";
import {
  loadExpenses,
  loadSettings,
  saveExpenses,
  saveSettings,
} from "../lib/storage";
import { nowISO } from "../lib/dates";

function genId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface ExpenseStore {
  expenses: Expense[];
  settings: AppSettings;
  addExpense: (input: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, patch: Partial<Omit<Expense, "id" | "createdAt">>) => void;
  deleteExpense: (id: string) => void;
  setCurrency: (code: CurrencyCode) => void;
  setDailyGoal: (cents: number | null) => void;
}

export function useExpenseStore(): ExpenseStore {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const addExpense = useCallback((input: Omit<Expense, "id" | "createdAt">) => {
    setExpenses((prev) => [
      ...prev,
      { ...input, id: genId(), createdAt: nowISO() },
    ]);
  }, []);

  const updateExpense = useCallback(
    (id: string, patch: Partial<Omit<Expense, "id" | "createdAt">>) => {
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    },
    [],
  );

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setSettings((prev) => ({ ...prev, currency: code }));
  }, []);

  const setDailyGoal = useCallback((cents: number | null) => {
    setSettings((prev) => ({ ...prev, dailyGoalCents: cents }));
  }, []);

  return {
    expenses,
    settings,
    addExpense,
    updateExpense,
    deleteExpense,
    setCurrency,
    setDailyGoal,
  };
}
