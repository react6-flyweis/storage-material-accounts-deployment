import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import type { SalaryEntry } from "@/components/cost/AddSalaryEntryModal";
import { X } from "lucide-react";

interface SalaryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: SalaryEntry | null;
}

export const SalaryDetailModal: React.FC<SalaryDetailModalProps> = ({
  isOpen,
  onClose,
  entry,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Employee Salary Details
            </h2>
            <span
              className={`px-3 py-0.5 rounded-md text-xs font-semibold ${
                entry.status === "Paid"
                  ? "bg-[#16A34A] text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              {entry.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-2" />
          </button>
        </div>

        {/* Content Details matching screenshot */}
        <div className="p-7 space-y-4">
          {/* Section 1: ID, Name, Designation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-normal">Employee ID</span>
              <span className="text-slate-700 font-medium">{entry.empId}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-normal">Name</span>
              <span className="text-slate-700 font-medium">{entry.name}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-normal">Designation</span>
              <span className="text-slate-900 font-semibold">{entry.designation}</span>
            </div>
          </div>

          <div className="border-b border-slate-200/80 my-3" />

          {/* Section 2: Basic Salary & Deduction */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-normal">Basic Salary</span>
              <span className="text-slate-700 font-medium">${entry.basicSalary}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-normal">Deduction</span>
              <span className="text-slate-700 font-medium">${entry.deductions}</span>
            </div>
          </div>

          <div className="border-b border-slate-200/80 my-3" />

          {/* Section 3: Net Salary (Vibrant Red) & Date */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-900 font-bold text-base">Net Salary</span>
              <span className="text-[#DC2626] font-bold text-lg">
                ${entry.netSalary}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-normal">Date</span>
              <span className="text-slate-700 font-medium">{entry.date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SalaryDetailModal;
