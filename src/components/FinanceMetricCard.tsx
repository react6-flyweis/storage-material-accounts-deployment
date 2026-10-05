import React from "react";
import { cn } from "@/lib/utils";

interface FinanceMetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "green" | "blue" | "orange-dark" | "red" | "orange-light";
}

const colorMap = {
  green: {
    border: "border-emerald-400/50",
    bg: "bg-emerald-500",
    text: "text-emerald-500",
  },
  blue: {
    border: "border-blue-500/50",
    bg: "bg-blue-600",
    text: "text-blue-600",
  },
  "orange-dark": {
    border: "border-orange-600/50",
    bg: "bg-[#E04F16]",
    text: "text-orange-700",
  },
  red: {
    border: "border-red-500/50",
    bg: "bg-red-600",
    text: "text-red-600",
  },
  "orange-light": {
    border: "border-orange-400/50",
    bg: "bg-[#F97316]",
    text: "text-orange-500",
  },
};

export function FinanceMetricCard({
  label,
  value,
  icon,
  color,
}: FinanceMetricCardProps) {
  const styles = colorMap[color];

  return (
    <div
      className={cn(
        "flex items-center p-3 sm:p-4 bg-white border rounded-[5px] shadow-sm transition-all hover:shadow-md min-w-0 h-full",
        styles.border
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-white mr-3 sm:mr-4 shrink-0 shadow-sm",
          styles.bg
        )}
      >
        <div className="[&>svg]:size-5 sm:[&>svg]:size-6">{icon}</div>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] sm:text-xs font-semibold text-gray-400 truncate uppercase tracking-wider mb-0.5">
          {label}
        </span>
        <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
          {value}
        </span>
      </div>
    </div>
  );
}
