/**
 * Pill-button category filter for commodity list
 */

import React from "react";
import type { CommodityCategory } from "@harvest-ai/shared";
import "./CategoryFilter.css";

type FilterCategory = CommodityCategory | "all";

interface FilterOption {
  value: FilterCategory;
  label: string;
  emoji: string;
}

const OPTIONS: FilterOption[] = [
  { value: "all", label: "All", emoji: "🌐" },
  { value: "grains", label: "Grains", emoji: "🌾" },
  { value: "vegetables", label: "Vegetables", emoji: "🥦" },
  { value: "fruits", label: "Fruits", emoji: "🍎" },
  { value: "livestock", label: "Livestock", emoji: "🐄" },
  { value: "cash-crops", label: "Cash Crops", emoji: "☕" },
];

interface Props {
  selected: FilterCategory;
  onChange: (cat: FilterCategory) => void;
  counts: Partial<Record<FilterCategory, number>>;
}

export const CategoryFilter: React.FC<Props> = ({ selected, onChange, counts }) => (
  <div className="category-filter" role="group" aria-label="Filter by category">
    {OPTIONS.map((opt) => (
      <button
        key={opt.value}
        className={`category-filter__pill ${selected === opt.value ? "category-filter__pill--active" : ""}`}
        onClick={() => onChange(opt.value)}
        aria-pressed={selected === opt.value}
      >
        <span>{opt.emoji}</span>
        <span>{opt.label}</span>
        {counts[opt.value] !== undefined && (
          <span className="category-filter__count">{counts[opt.value]}</span>
        )}
      </button>
    ))}
  </div>
);
