import React, { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";

export type DateRange = {
  from?: Date;
  to?: Date;
};

interface DateRangeFilterProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

export default function DateRangeFilter({
  value,
  onChange,
  dateRange,
  onDateRangeChange,
  className,
  placeholder = "Select Date Range",
}: DateRangeFilterProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const effectiveValue = value !== undefined ? value : dateRange;
  const handleChange = (newRange: DateRange | undefined) => {
    onChange?.(newRange);
    onDateRangeChange?.(newRange);
  };

  const formatDisplay = () => {
    if (!effectiveValue?.from) return placeholder;
    const fromStr = isValid(effectiveValue.from)
      ? format(effectiveValue.from, "dd MMM yyyy")
      : "";
    if (!effectiveValue.to) return fromStr;
    const toStr = isValid(effectiveValue.to)
      ? format(effectiveValue.to, "dd MMM yyyy")
      : "";
    return `${fromStr} - ${toStr}`;
  };

  const handleSelectFromCalendar = (rangeStr: string) => {
    // Expected format: "24 Mar 2025 - 31 Mar 2025" or "7 Jan 2026 - 23 Jan 2026"
    try {
      const parts = rangeStr.split(" - ");
      if (parts.length === 2) {
        const d1 = new Date(parts[0]);
        const d2 = new Date(parts[1]);
        if (isValid(d1) && isValid(d2)) {
          handleChange({ from: d1, to: d2 });
          return;
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleChange(undefined);
  };

  const hasValue = Boolean(effectiveValue?.from);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "flex items-center justify-between h-9 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50/70 transition-colors cursor-pointer select-none",
          className
        )}
      >
        <span
          className={cn(
            "truncate text-xs sm:text-sm font-medium",
            hasValue ? "text-gray-900" : "text-gray-400"
          )}
        >
          {formatDisplay()}
        </span>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {hasValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
          <CalendarIcon className="w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <CalendarRangePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectRange={handleSelectFromCalendar}
      />
    </>
  );
}
