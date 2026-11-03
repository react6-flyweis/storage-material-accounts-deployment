import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export type CostStatColor = "purple" | "emerald" | "amber" | "blue" | "rose";

export interface CostStatCardProps {
  title: string;
  value: string | number;
  changeText?: string;
  isPositive?: boolean; // defaults to true
  icon: React.ReactNode;
  color?: CostStatColor;
  className?: string;
  isLoading?: boolean;
}

export const CostStatCard: React.FC<CostStatCardProps> = ({
  title,
  value,
  changeText,
  isPositive = true,
  icon,
  color = "purple",
  className = "",
  isLoading = false,
}) => {
  // Styles for the square rounded icon box
  const colorStyles = {
    purple: {
      border: "border-[#8B5CF6]/50",
      bg: "bg-[#8B5CF6]/10",
      text: "text-[#8B5CF6]",
      hatchStroke: "#8B5CF6",
    },
    emerald: {
      border: "border-[#10B981]/50",
      bg: "bg-[#10B981]/10",
      text: "text-[#10B981]",
      hatchStroke: "#10B981",
    },
    amber: {
      border: "border-[#F59E0B]/50",
      bg: "bg-[#F59E0B]/10",
      text: "text-[#F59E0B]",
      hatchStroke: "#F59E0B",
    },
    blue: {
      border: "border-[#3B82F6]/50",
      bg: "bg-[#3B82F6]/10",
      text: "text-[#3B82F6]",
      hatchStroke: "#3B82F6",
    },
    rose: {
      border: "border-[#EF4444]/50",
      bg: "bg-[#EF4444]/10",
      text: "text-[#EF4444]",
      hatchStroke: "#EF4444",
    },
  }[color];

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-100/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow ${className}`}
    >
      {/* Top row: Title and Icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs sm:text-[13px] font-medium text-slate-500 tracking-tight">
          {title}
        </span>
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border ${colorStyles.border} ${colorStyles.bg} flex items-center justify-center ${colorStyles.text} shrink-0 transition-transform group-hover:scale-105`}
        >
          {icon}
        </div>
      </div>

      {/* Bottom row: Value and Trend change */}
      <div className="mt-3 relative z-10">
        {isLoading ? (
          <div className="space-y-2 py-1">
            <Skeleton className="h-7 w-32 bg-slate-200/90" />
            <Skeleton className="h-3.5 w-24 bg-slate-100" />
          </div>
        ) : (
          <>
            <div className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
              {value}
            </div>
            {changeText && (
              <div
                className={`flex items-center gap-1 text-xs font-semibold mt-2 ${
                  isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>{changeText}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom-right diagonal hatching pattern accent as seen in the reference screenshot */}
      <svg
        className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="45" y1="100" x2="100" y2="45" stroke={colorStyles.hatchStroke} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="55" y1="100" x2="100" y2="55" stroke={colorStyles.hatchStroke} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="65" y1="100" x2="100" y2="65" stroke={colorStyles.hatchStroke} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="75" y1="100" x2="100" y2="75" stroke={colorStyles.hatchStroke} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="85" y1="100" x2="100" y2="85" stroke={colorStyles.hatchStroke} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="95" y1="100" x2="100" y2="95" stroke={colorStyles.hatchStroke} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default CostStatCard;
