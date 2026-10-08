import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarRangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRange?: (range: string) => void;
  initialStartDate?: number;
  initialEndDate?: number;
}

export const CalendarRangePickerModal: React.FC<
  CalendarRangePickerModalProps
> = ({
  isOpen,
  onClose,
  onSelectRange,
  initialStartDate = 7,
  initialEndDate = 23,
}) => {
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = January
  const [currentYear, setCurrentYear] = useState(2026);
  const [startDate, setStartDate] = useState<number | null>(initialStartDate);
  const [endDate, setEndDate] = useState<number | null>(initialEndDate);

  if (!isOpen) return null;

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // January 2026 calendar structure as depicted in screenshot
  // Week begins on Monday
  // Previous month dates: 29, 30, 31
  // Current month: 1 to 31
  // Next month: 1, 2
  const prevMonthDays = [29, 30, 31];
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const nextMonthDays = [1, 2];

  const handleDateClick = (day: number) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else {
      if (day < startDate) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    }
  };

  const handleDone = () => {
    if (onSelectRange && startDate && endDate) {
      const monthStr = monthNames[currentMonth].slice(0, 3);
      onSelectRange(
        `${startDate} ${monthStr} ${currentYear} - ${endDate} ${monthStr} ${currentYear}`
      );
    }
    onClose();
  };

  const weekDayHeaders = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 w-[310px] sm:w-[330px]">
        {/* Header: Prev Arrow + Month Year + Next Arrow */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shadow-2xs"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-semibold text-slate-900 tracking-tight">
            {monthNames[currentMonth]} {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shadow-2xs"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday Row */}
        <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center">
          {weekDayHeaders.map((day, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold text-slate-400 select-none"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 py-1 text-center text-xs sm:text-sm font-medium">
          {/* Previous month days */}
          {prevMonthDays.map((d, i) => (
            <div
              key={`prev-${i}`}
              className="h-8 flex items-center justify-center text-slate-300 select-none"
            >
              {d}
            </div>
          ))}

          {/* Current month days */}
          {currentMonthDays.map((day) => {
            const isStart = startDate === day;
            const isEnd = endDate === day;
            const isInRange =
              startDate && endDate && day > startDate && day < endDate;

            if (isStart) {
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className="h-8 w-8 mx-auto rounded-lg border-2 border-[#5475F5] bg-[#E0E7FF]/70 text-[#3B5BDB] font-bold flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                >
                  {day}
                </button>
              );
            }

            if (isEnd) {
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className="h-8 w-8 mx-auto rounded-lg bg-[#5475F5] text-white font-bold flex items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-pointer"
                >
                  {day}
                </button>
              );
            }

            if (isInRange) {
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className="h-8 w-8 mx-auto rounded-lg bg-[#EEF2FF] text-[#4F46E5] font-semibold flex items-center justify-center cursor-pointer"
                >
                  {day}
                </button>
              );
            }

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDateClick(day)}
                className="h-8 w-8 mx-auto rounded-lg text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                {day}
              </button>
            );
          })}

          {/* Next month days */}
          {nextMonthDays.map((d, i) => (
            <div
              key={`next-${i}`}
              className="h-8 flex items-center justify-center text-slate-300 select-none"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Done Action Button */}
        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={handleDone}
            className="px-6 py-2 rounded-xl bg-[#5475F5] hover:bg-[#4361EE] text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
        </div>
      </div>
    </>
  );
};

export default CalendarRangePickerModal;
