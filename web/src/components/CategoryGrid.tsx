import type { CategoryId } from "../types/expense";
import { CATEGORIES } from "../lib/categories";

interface CategoryGridProps {
  selected: CategoryId | null;
  onSelect: (id: CategoryId) => void;
  /** When true, tapping a category immediately submits — visual cue tightens. */
  oneTap?: boolean;
}

export function CategoryGrid({ selected, onSelect, oneTap = false }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {CATEGORIES.map((c) => {
        const active = selected === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className="press flex flex-col items-center gap-1 rounded-2xl py-2.5"
            style={{
              background: active ? c.color : "var(--panel)",
              color: active ? "#ffffff" : "var(--ink)",
              border: `1px solid ${active ? c.color : "var(--line)"}`,
              boxShadow: active ? `0 4px 12px ${c.color}33` : "none",
            }}
            aria-pressed={active}
            aria-label={`${oneTap ? "Quick add " : "Select "}${c.name}`}
          >
            <span className="text-2xl leading-none" aria-hidden>
              {c.emoji}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {c.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
