import React, { useState } from "react";
import { format, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarRangePickerRange {
  from?: Date;
  to?: Date;
  startDate?: string;
  endDate?: string;
}

export interface CalendarRangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRange?: (range: string) => void;
  onApply?: (range: CalendarRangePickerRange) => void;
  initialStartDate?: number | string | Date;
  initialEndDate?: number | string | Date;
  singleDate?: boolean;
  align?: "left" | "right";
}

function parseToDate(val?: number | string | Date): Date | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return isValid(val) ? val : undefined;
  if (typeof val === "number") {
    const d = new Date();
    d.setDate(val);
    return isValid(d) ? d : undefined;
  }
  const d = new Date(val);
  return isValid(d) ? d : undefined;
}

interface CalendarRangePickerContentProps {
  onClose: () => void;
  onSelectRange?: (range: string) => void;
  onApply?: (range: CalendarRangePickerRange) => void;
  initFrom?: Date;
  initTo?: Date;
  singleDate?: boolean;
  align?: "left" | "right";
}

const CalendarRangePickerContent: React.FC<CalendarRangePickerContentProps> = ({
  onClose,
  onSelectRange,
  onApply,
  initFrom,
  initTo,
  singleDate = false,
  align = "right",
}) => {
  const [selectedSingle, setSelectedSingle] = useState<Date | undefined>(initFrom);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(() => ({
    from: initFrom,
    to: initTo,
  }));
  const [currentMonth, setCurrentMonth] = useState<Date | undefined>(initFrom || new Date());

  const handleSelectSingle = (day: Date | undefined) => {
    if (day && isValid(day)) {
      setSelectedSingle(day);
      const str = format(day, "dd MMM yyyy");
      onSelectRange?.(str);
      onApply?.({
        from: day,
        to: day,
        startDate: str,
        endDate: str,
      });
      onClose();
    }
  };

  const handleSelectRange = (range: DateRange | undefined) => {
    setSelectedRange(range);
  };

  const handleDone = () => {
    if (singleDate) {
      if (selectedSingle && isValid(selectedSingle)) {
        const str = format(selectedSingle, "dd MMM yyyy");
        onSelectRange?.(str);
        onApply?.({
          from: selectedSingle,
          to: selectedSingle,
          startDate: str,
          endDate: str,
        });
      }
    } else {
      if (selectedRange?.from && isValid(selectedRange.from)) {
        const fromStr = format(selectedRange.from, "dd MMM yyyy");
        const toDate = selectedRange.to || selectedRange.from;
        const toStr = format(toDate, "dd MMM yyyy");
        const rangeStr =
          selectedRange.to && selectedRange.to.getTime() !== selectedRange.from.getTime()
            ? `${fromStr} - ${toStr}`
            : fromStr;

        onSelectRange?.(rangeStr);
        onApply?.({
          from: selectedRange.from,
          to: toDate,
          startDate: fromStr,
          endDate: toStr,
        });
      }
    }
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute top-full mt-2 z-50 animate-in fade-in zoom-in-95 duration-150",
          align === "left" ? "left-0" : "right-0"
        )}
      >
        <div className="bg-white rounded-2xl p-3 shadow-2xl border border-slate-100 w-75 sm:w-80">
          {singleDate ? (
            <Calendar
              mode="single"
              selected={selectedSingle}
              onSelect={handleSelectSingle}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          ) : (
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={handleSelectRange}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          )}

          {!singleDate && (
            <div className="flex justify-end pt-2 border-t border-slate-100 mt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleDone}
                className="bg-[#5475F5] hover:bg-[#4361EE] text-white rounded-lg px-4"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const CalendarRangePickerModal: React.FC<CalendarRangePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectRange,
  onApply,
  initialStartDate,
  initialEndDate,
  singleDate = false,
  align = "right",
}) => {
  if (!isOpen) return null;

  const initFrom = parseToDate(initialStartDate);
  const initTo = parseToDate(initialEndDate);
  const key = `${initFrom?.getTime() || ""}-${initTo?.getTime() || ""}`;

  return (
    <CalendarRangePickerContent
      key={key}
      onClose={onClose}
      onSelectRange={onSelectRange}
      onApply={onApply}
      initFrom={initFrom}
      initTo={initTo}
      singleDate={singleDate}
      align={align}
    />
  );
};

export default CalendarRangePickerModal;
