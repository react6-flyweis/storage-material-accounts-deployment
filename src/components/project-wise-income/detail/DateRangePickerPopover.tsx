import React, { useState } from "react";
import { format, isValid } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, X } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { formatDateToIso } from "@/lib/dashboardFormatters";
import { cn } from "@/lib/utils";

interface DateRangePickerPopoverProps {
  startDate?: string;
  endDate?: string;
  dateRangeText?: string;
  onApply: (
    startDate?: string,
    endDate?: string,
    displayText?: string
  ) => void;
  placeholder?: string;
  className?: string;
}

function parseIso(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return isValid(d) ? d : undefined;
}

export const DateRangePickerPopover: React.FC<DateRangePickerPopoverProps> = ({
  startDate,
  endDate,
  dateRangeText,
  onApply,
  placeholder = "Filter by Date",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(() => ({
    from: parseIso(startDate),
    to: parseIso(endDate),
  }));

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTempRange({
        from: parseIso(startDate),
        to: parseIso(endDate),
      });
    }
  };

  const handleApply = () => {
    if (tempRange?.from && isValid(tempRange.from)) {
      const isoStart = formatDateToIso(tempRange.from);
      const toDate = tempRange.to && isValid(tempRange.to) ? tempRange.to : tempRange.from;
      const isoEnd = formatDateToIso(toDate);

      const startText = format(tempRange.from, "dd MMM yyyy");
      const endText = format(toDate, "dd MMM yyyy");
      const displayText =
        tempRange.to && tempRange.to.getTime() !== tempRange.from.getTime()
          ? `${startText} - ${endText}`
          : startText;

      onApply(isoStart, isoEnd, displayText);
    }
    setIsOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTempRange(undefined);
    onApply(undefined, undefined, "");
    setIsOpen(false);
  };

  const hasFilter = Boolean(dateRangeText || startDate || endDate);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer select-none",
            hasFilter && "border-blue-400 text-blue-700 bg-blue-50/30",
            className
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate max-w-50">
            {dateRangeText || placeholder}
          </span>
          {hasFilter && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 -mr-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Clear date filter"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-auto p-3 bg-white shadow-2xl border border-slate-200 rounded-2xl z-50 space-y-3"
      >
        <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800">
            Select Date Range
          </span>
          {tempRange?.from && (
            <span className="text-[11px] text-slate-500 font-medium">
              {format(tempRange.from, "dd MMM yyyy")}
              {tempRange.to ? ` - ${format(tempRange.to, "dd MMM yyyy")}` : ""}
            </span>
          )}
        </div>

        <Calendar
          mode="range"
          selected={tempRange}
          onSelect={setTempRange}
          defaultMonth={tempRange?.from || new Date()}
          numberOfMonths={1}
          className="rounded-lg"
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleClear()}
            className="text-xs text-slate-500 hover:text-red-600 h-8 px-3 cursor-pointer"
          >
            Reset
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={!tempRange?.from}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-8 px-4 rounded-lg cursor-pointer disabled:opacity-50"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePickerPopover;
