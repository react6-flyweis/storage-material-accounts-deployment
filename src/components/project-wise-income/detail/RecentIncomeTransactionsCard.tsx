import React, { useState, useMemo } from "react";
import {
  Calendar,
  ChevronsUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";
import AddIncomeModal from "./AddIncomeModal";
import SuccessModal from "@/components/common_components/SuccessModal";

export interface IncomeTransaction {
  id: string;
  incomeType: string;
  date: string;
  description: string;
  invoiceRef: string;
  amount: string;
  amountNum: number;
  status: "Received" | "Pending";
}

const initialTransactions: IncomeTransaction[] = [
  {
    id: "tx-1",
    incomeType: "Milestone Income",
    date: "31 April 2026",
    description: "Structure Completion - Phase 3",
    invoiceRef: "INV-001",
    amount: "$25,00,000",
    amountNum: 2500000,
    status: "Received",
  },
  {
    id: "tx-2",
    incomeType: "Advance Received",
    date: "29 April 2026",
    description: "Advance against PO #PO-1123",
    invoiceRef: "INV-001",
    amount: "$25,00,000",
    amountNum: 2500000,
    status: "Received",
  },
  {
    id: "tx-3",
    incomeType: "Variation Order",
    date: "25 April 2026",
    description: "Steel Rate Variation -Jan 2024",
    invoiceRef: "INV-001",
    amount: "$25,00,000",
    amountNum: 2500000,
    status: "Received",
  },
  {
    id: "tx-4",
    incomeType: "Milestone Income",
    date: "25 April 2026",
    description: "Cladding Work Completion",
    invoiceRef: "INV-001",
    amount: "$25,00,000",
    amountNum: 2500000,
    status: "Received",
  },
  {
    id: "tx-5",
    incomeType: "Claims & Adjustments",
    date: "25 April 2026",
    description: "Site Extra Work Claim #12",
    invoiceRef: "INV-001",
    amount: "$25,00,000",
    amountNum: 2500000,
    status: "Received",
  },
  // Pending items for when switching to Pending tab
  {
    id: "tx-6",
    incomeType: "Milestone Income",
    date: "10 May 2026",
    description: "Roofing Installation Milestone",
    invoiceRef: "INV-002",
    amount: "$15,00,000",
    amountNum: 1500000,
    status: "Pending",
  },
  {
    id: "tx-7",
    incomeType: "Retention Release",
    date: "15 June 2026",
    description: "First Half Retention Warranty",
    invoiceRef: "INV-003",
    amount: "$10,00,000",
    amountNum: 1000000,
    status: "Pending",
  },
];

type SortField = "incomeType" | "date" | "description" | "invoiceRef" | "amountNum";

export const RecentIncomeTransactionsCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Received" | "Pending">("Received");
  const [transactions, setTransactions] = useState<IncomeTransaction[]>(
    initialTransactions
  );
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(4); // Default to page 4 to match the screenshot!
  const [dateRangeText, setDateRangeText] = useState("01 Jan 2024 - 07 Jan 2024");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState(
    "Payment Received Added Successfully"
  );
  const [viewTx, setViewTx] = useState<IncomeTransaction | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((t) => t.status === activeTab);

    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortDirection === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
    }

    return result;
  }, [transactions, activeTab, sortField, sortDirection]);

  const totalDisplayPages = 15;

  const handleAddTransaction = (newTx: Omit<IncomeTransaction, "id" | "amountNum">) => {
    const created: IncomeTransaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
      amountNum: parseInt(newTx.amount.replace(/[^0-9]/g, ""), 10) || 0,
    };
    setTransactions((prev) => [created, ...prev]);
    setSuccessModalTitle(
      newTx.status === "Received"
        ? "Payment Received Added Successfully"
        : "Pending Payment Added Successfully"
    );
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Tabs & Action Button Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Tabs: Received / Pending */}
        <div className="flex items-center gap-6 border-b border-transparent">
          <button
            type="button"
            onClick={() => {
              setActiveTab("Received");
              setCurrentPage(4);
            }}
            className={`pb-2 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === "Received"
                ? "text-[#2563EB] border-[#2563EB]"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            Received
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("Pending");
              setCurrentPage(1);
            }}
            className={`pb-2 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === "Pending"
                ? "text-[#2563EB] border-[#2563EB]"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            Pending
          </button>
        </div>

        {/* Action Button: + Add Received / Pending Payment */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>
            + Add {activeTab === "Received" ? "Received Payment" : "Pending Payment"}
          </span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Card Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Recent Income Transactions
          </h3>

          {/* Date Range Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateRangeText}</span>
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Date Range
                </span>
                <div className="space-y-1">
                  {[
                    "01 Jan 2024 - 07 Jan 2024",
                    "08 Jan 2024 - 14 Jan 2024",
                    "01 Dec 2023 - 31 Dec 2023",
                    "01 Nov 2023 - 30 Nov 2023",
                  ].map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => {
                        setDateRangeText(range);
                        setIsDatePickerOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        dateRangeText === range
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F8FAFC] text-[11px] sm:text-xs text-slate-700 font-semibold">
                {/* Income Type */}
                <th
                  onClick={() => handleSort("incomeType")}
                  className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Income Type</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Date */}
                <th
                  onClick={() => handleSort("date")}
                  className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Description */}
                <th
                  onClick={() => handleSort("description")}
                  className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Description</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Invoice / Ref No. */}
                <th
                  onClick={() => handleSort("invoiceRef")}
                  className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Invoice / Ref No.</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Amount */}
                <th
                  onClick={() => handleSort("amountNum")}
                  className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Amount</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Status */}
                <th className="px-5 py-3.5 select-none">
                  <span>Status</span>
                </th>

                {/* Action */}
                <th className="px-5 py-3.5 select-none">
                  <span>Action</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No transactions found for {activeTab}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Income Type */}
                    <td className="px-5 py-4 font-semibold text-[#2563EB]">
                      {tx.incomeType}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-slate-700">{tx.date}</td>

                    {/* Description */}
                    <td className="px-5 py-4 text-slate-600">
                      {tx.description}
                    </td>

                    {/* Invoice / Ref No. */}
                    <td className="px-5 py-4 font-semibold text-[#16A34A]">
                      {tx.invoiceRef}
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 font-semibold text-[#2563EB]">
                      {tx.amount}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-200 bg-slate-50 text-slate-700">
                        {tx.status}
                      </span>
                    </td>

                    {/* Action: Eye Icon Button */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setViewTx(tx)}
                        aria-label={`View transaction ${tx.invoiceRef}`}
                        className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching screenshot */}
        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Row Per Page [10 v] Entries */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
            <span>Row Per Page</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 rounded-md pl-2.5 pr-6 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span>Entries</span>
          </div>

          {/* Right: < 1 2 3 [4] ... 15 > */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3, 4].map((page) => {
              const isCurrent = page === currentPage;
              return (
                <button
                  key={`page-${page}`}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                    isCurrent
                      ? "bg-[#2563EB] text-white font-bold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 font-medium"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <span className="text-slate-400 px-1 select-none">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(15)}
              className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center cursor-pointer ${
                currentPage === 15
                  ? "bg-[#2563EB] text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 font-medium"
              }`}
            >
              15
            </button>

            <button
              type="button"
              disabled={currentPage === totalDisplayPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalDisplayPages, p + 1))
              }
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AddIncomeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
        defaultType={activeTab}
      />

      {/* View Detail Quick Modal */}
      {viewTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Transaction Details
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Income Type:</span>
                <span className="font-semibold text-slate-900">
                  {viewTx.incomeType}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date:</span>
                <span className="font-semibold text-slate-900">
                  {viewTx.date}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Invoice / Ref:</span>
                <span className="font-semibold text-[#16A34A]">
                  {viewTx.invoiceRef}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount:</span>
                <span className="font-semibold text-[#2563EB]">
                  {viewTx.amount}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Description:</span>
                <span className="font-medium text-slate-700">
                  {viewTx.description}
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewTx(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successModalTitle}
      />
    </div>
  );
};

export default RecentIncomeTransactionsCard;
