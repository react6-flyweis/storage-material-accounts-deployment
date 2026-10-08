import React from "react";
import { X } from "lucide-react";
import type { ProjectExpenseTransaction } from "./RecentExpenseTransactionsCard";

interface ExpenseTransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: ProjectExpenseTransaction | null;
  onEdit?: (transaction: ProjectExpenseTransaction) => void;
}

export const ExpenseTransactionDetailModal: React.FC<
  ExpenseTransactionDetailModalProps
> = ({ isOpen, onClose, transaction, onEdit }) => {
  if (!isOpen || !transaction) return null;

  const isPaid = transaction.paymentStatus.toLowerCase() === "paid";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Expense Transaction Details
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold text-white ${
                isPaid ? "bg-[#10B981]" : "bg-[#F59E0B]"
              }`}
            >
              {transaction.paymentStatus}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-sm">
          {/* Section 1: Invoice, Category, Date */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">
                Invoice / Ref. No:
              </span>
              <span className="text-slate-700 font-medium">
                {transaction.invoiceRef}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">Category:</span>
              <span className="text-slate-700 font-medium">
                {transaction.category}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">Date:</span>
              <span className="text-slate-900 font-bold">
                {transaction.date}
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-t border-gray-200" />

          {/* Section 2: Vendor, Description */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">
                Vendor / Reference:
              </span>
              <span className="text-slate-700 font-medium">
                {transaction.vendorRef}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">Description:</span>
              <span className="text-slate-700 font-medium">
                {transaction.description}
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-t border-gray-200" />

          {/* Section 3: Amount Highlight */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold text-slate-900">Amount</span>
            <span className="text-base sm:text-lg font-bold text-[#DC2626]">
              {transaction.amount}
            </span>
          </div>

          {/* Centered Edit Button */}
          <div className="flex justify-center pt-5 pb-1">
            <button
              type="button"
              onClick={() => {
                if (onEdit) {
                  onEdit(transaction);
                }
                onClose();
              }}
              className="px-14 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm transition-colors shadow-xs cursor-pointer"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTransactionDetailModal;
