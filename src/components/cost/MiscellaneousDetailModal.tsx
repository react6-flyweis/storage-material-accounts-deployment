import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { X, Calendar, DollarSign, Tag, Building2, FileText } from "lucide-react";
import type { MiscellaneousCostEntry } from "./miscellaneousCostData";

interface MiscellaneousDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: MiscellaneousCostEntry | null;
}

export const MiscellaneousDetailModal: React.FC<MiscellaneousDetailModalProps> = ({
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {entry.expenseId}
              </span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  entry.status === "Approved"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : entry.status === "Rejected"
                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}
              >
                {entry.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
              {entry.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* Key Amount Display */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-2xl p-4 border border-blue-100/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Expense Amount</span>
              <div className="text-2xl font-extrabold text-[#1D51A4] tracking-tight mt-0.5">
                ${entry.amount.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Expense Type</span>
              <div className="mt-1">
                <span
                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                    entry.expenseType === "Planned"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {entry.expenseType}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Category
              </span>
              <p className="font-semibold text-slate-800">{entry.category}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Project / Facility
              </span>
              <p className="font-semibold text-slate-800">{entry.project}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Expense Date
              </span>
              <p className="font-semibold text-slate-800">{entry.date}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Payment Status
              </span>
              <p className="font-semibold">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                    entry.paymentStatus === "Paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {entry.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          {/* Recorded By */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={entry.recordedBy.avatar}
                alt={entry.recordedBy.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    entry.recordedBy.name,
                  )}&background=1D51A4&color=fff&size=100`;
                }}
              />
              <div>
                <p className="text-xs text-slate-400 font-medium">Recorded By</p>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  {entry.recordedBy.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium">Department</p>
              <p className="font-semibold text-slate-700 text-xs sm:text-sm">
                {entry.department}
              </p>
            </div>
          </div>

          {/* Description */}
          {entry.description && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Notes & Description
              </span>
              <p className="text-slate-600 text-xs leading-relaxed">
                {entry.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
