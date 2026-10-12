import { useState } from "react";
import { DollarSign, X, CheckCircle2 } from "lucide-react";
import type { PayableInvoiceEntry } from "./ManualPayableUploadDialog";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PayableInvoiceEntry | null;
  onConfirmPayment: (
    invoiceId: string,
    paymentData: {
      amount: number;
      date: string;
      method: string;
      referenceNumber: string;
      bankAccount: string;
      notes: string;
    },
  ) => void;
}

const PAYMENT_METHODS = [
  "Bank Transfer (ACH / NEFT)",
  "Wire Transfer",
  "Company Cheque",
  "Corporate Card",
  "Direct Debit",
  "Cash",
];

const BANK_ACCOUNTS = [
  "Chase Operating A/C (****4912)",
  "Wells Fargo Payroll & Payables (****8831)",
  "Bank of America Capital A/C (****1204)",
];

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onConfirmPayment,
}: RecordPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<string>(
    String(invoice.amount),
  );
  const [paymentDate, setPaymentDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [referenceNumber, setReferenceNumber] = useState(
    `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
  );
  const [bankAccount, setBankAccount] = useState(BANK_ACCOUNTS[0]);
  const [notes, setNotes] = useState("");
  if (!isOpen || !invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount) || invoice.amount;
    onConfirmPayment(invoice.id, {
      amount: amt,
      date: paymentDate,
      method: paymentMethod,
      referenceNumber: referenceNumber.trim(),
      bankAccount,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Record Payment
              </h3>
              <p className="text-xs text-slate-500">
                Disburse payment and update accounts ledger
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Summary Box */}
        <div className="mx-6 mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">
              Invoice #{invoice.invoiceNumber}
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {invoice.payeeName}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Project: {invoice.project}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">
              Invoice Total
            </div>
            <div className="text-base font-extrabold text-[#1D51A4] mt-0.5">
              ${invoice.amount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Paid Amount ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>
          </div>

          {/* Row 2: Payment Method & Reference # */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#1D51A4]"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Transaction / Reference #{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. UTR / Check #"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4]"
              />
            </div>
          </div>

          {/* Bank Account */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Disbursed From Bank Account
            </label>
            <select
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#1D51A4]"
            >
              {BANK_ACCOUNTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Remarks / Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Wire confirmation sent to vendor accounts department..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1D51A4] resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Paid</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordPaymentModal;
