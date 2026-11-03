import React, { useMemo } from "react";
import type { ExpenseCategoryItem } from "@/redux/api/reportsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

interface TopExpenseCategoriesCardProps {
  categories?: ExpenseCategoryItem[];
  fallbackCategories?: ExpenseCategoryItem[];
  isLoading?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  blue: "#2563EB",
  green: "#10B981",
  orange: "#F59E0B",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
  slate: "#64748B",
};

const DEFAULT_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

const resolveColor = (colorName: string, index: number): string => {
  if (colorName && COLOR_MAP[colorName.toLowerCase()]) {
    return COLOR_MAP[colorName.toLowerCase()];
  }
  if (colorName && colorName.startsWith("#")) {
    return colorName;
  }
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

export const TopExpenseCategoriesCard: React.FC<TopExpenseCategoriesCardProps> = ({
  categories = [],
  fallbackCategories = [],
  isLoading = false,
}) => {
  // If topExpenseCategoriesThisMonth is empty, fallback to sorting fallbackCategories (expenseByCategoryThisMonth) by amount
  const displayCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories;
    }
    if (fallbackCategories && fallbackCategories.length > 0) {
      return [...fallbackCategories].sort((a, b) => (b.amount || 0) - (a.amount || 0));
    }
    return [];
  }, [categories, fallbackCategories]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100">
      <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4">
        Top Expense Categories (This Month)
      </h3>

      {isLoading && displayCategories.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 animate-pulse h-18"
            />
          ))}
        </div>
      ) : displayCategories.length === 0 ? (
        <div className="text-xs text-slate-400 py-3 text-center">
          No expense categories recorded for this month
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {displayCategories.map((cat, idx) => (
            <div
              key={cat.key || `${cat.label}-${idx}`}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: resolveColor(cat.color, idx) }}
                />
                <span className="text-xs text-slate-500 font-normal truncate">
                  {cat.label}
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1 truncate">
                {formatCurrency(cat.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopExpenseCategoriesCard;
