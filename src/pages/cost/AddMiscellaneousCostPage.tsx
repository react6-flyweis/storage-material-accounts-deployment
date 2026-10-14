import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronDown,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SuccessModal from "@/components/common_components/SuccessModal";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import type { MiscExpenseRecord } from "@/components/cost/miscellaneousCostData";

const CATEGORIES = [
  "Maintenance",
  "Equipment",
  "Office Supplies",
  "Communication",
  "Safety",
  "Utilities",
  "Travel",
  "Others",
];

const PROJECTS = [
  "ABC Logistic Warehouse",
  "SMDT Warehouse",
  "Steel Unit",
  "Industrial Shed",
  "Warehouse Expansion",
  "HQ Operations",
];

const VENDORS = [
  "XYZ Services",
  "ABC Tools",
  "Office Mart",
  "Airtel",
  "Safety Pro",
  "Local Repairs",
  "Power Grid Corp",
];

export const AddMiscellaneousCostPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states matching screenshot exactly:
  // Expense Category: Maintenance
  // Expense Date Date: 12 Aug 2026
  // Expense Name: Machine Repair
  // Project: ABC Logistic Warehouse
  // Amount: 8 (or custom amount)
  // Vendor/Paybee: XYZ Services
  // Attachments: Receipt
  // Payment Status: Paid
  const [expenseCategory, setExpenseCategory] = useState("Maintenance");
  const [expenseDate, setExpenseDate] = useState("12 Aug 2026");
  const [expenseName, setExpenseName] = useState("Machine Repair");
  const [project, setProject] = useState("ABC Logistic Warehouse");
  const [amount, setAmount] = useState<string>("8");
  const [vendor, setVendor] = useState("XYZ Services");
  const [attachmentName, setAttachmentName] = useState("Receipt");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Unpaid">("Paid");

  // Dropdown open states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);
  const [isPaymentStatusOpen, setIsPaymentStatusOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success dialog state
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Refs for closing outside
  const categoryRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);
  const paymentStatusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (projectRef.current && !projectRef.current.contains(event.target as Node)) {
        setIsProjectOpen(false);
      }
      if (vendorRef.current && !vendorRef.current.contains(event.target as Node)) {
        setIsVendorOpen(false);
      }
      if (paymentStatusRef.current && !paymentStatusRef.current.contains(event.target as Node)) {
        setIsPaymentStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName.trim() || !amount) return;

    const numAmount = Number(amount) || 0;
    const newEntry: MiscExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: expenseDate,
      expense: expenseName.trim(),
      category: expenseCategory,
      project,
      vendor,
      amount: numAmount,
      amountFormatted: `$${numAmount.toLocaleString()}`,
      approvalStatus: "Approved",
    };

    try {
      const stored = localStorage.getItem("custom_misc_records");
      const currentList: MiscExpenseRecord[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem("custom_misc_records", JSON.stringify([newEntry, ...currentList]));
    } catch {
      // ignore
    }

    setIsSuccessOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header / Back Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate("/cost/miscellaneous-cost")}
          className="flex items-center gap-2.5 text-slate-800 hover:text-slate-950 font-bold text-lg sm:text-xl transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
          <span>Add Miscellaneous Cost</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6">
          Basic Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Expense Category & Expense Date Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Expense Category */}
            <div className="relative" ref={categoryRef}>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Expense Category <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{expenseCategory}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setExpenseCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Expense Date Date */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Expense Date Date <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{expenseDate}</span>
                <CalendarIcon className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Row 2: Expense Name & Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Expense Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Expense Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="e.g. Machine Repair"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Project */}
            <div className="relative" ref={projectRef}>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Project
              </label>
              <button
                type="button"
                onClick={() => setIsProjectOpen(!isProjectOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{project}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isProjectOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
                  {PROJECTS.map((proj) => (
                    <button
                      key={proj}
                      type="button"
                      onClick={() => {
                        setProject(proj);
                        setIsProjectOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>{proj}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Amount & Vendor/Paybee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Amount */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Amount <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Vendor/Paybee */}
            <div className="relative" ref={vendorRef}>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Vendor/Paybee <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsVendorOpen(!isVendorOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{vendor}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isVendorOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
                  {VENDORS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setVendor(v);
                        setIsVendorOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>{v}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Attachments & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Attachments */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Attachments
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <span>{attachmentName}</span>
                <Upload className="w-4 h-4 text-slate-600" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Payment Status */}
            <div className="relative" ref={paymentStatusRef}>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Payment Status <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsPaymentStatusOpen(!isPaymentStatusOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{paymentStatus}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isPaymentStatusOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus("Paid");
                      setIsPaymentStatusOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus("Unpaid");
                      setIsPaymentStatusOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                  >
                    Unpaid
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Buttons: Cancel & Submit for Approval */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate("/cost/miscellaneous-cost")}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </div>

      {/* Date Picker Modal */}
      <CalendarRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onApply={(range) => {
          if (range?.from) {
            const d = range.from;
            const months = [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            setExpenseDate(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
          }
          setIsDatePickerOpen(false);
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          navigate("/cost/miscellaneous-cost");
        }}
        title="Cost Submitted for Approval!"
        subTitle="The miscellaneous expense has been recorded and submitted for approval."
      />
    </div>
  );
};

export default AddMiscellaneousCostPage;
