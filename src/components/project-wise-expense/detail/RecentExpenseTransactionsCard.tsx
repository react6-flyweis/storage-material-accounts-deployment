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
import AddProjectExpenseModal, {
  type AddProjectExpenseFormData,
} from "./AddProjectExpenseModal";
import ExpenseTransactionDetailModal from "./ExpenseTransactionDetailModal";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import SuccessModal from "@/components/common_components/SuccessModal";

export interface ProjectExpenseTransaction {
  id: string;
  category: string;
  description: string;
  vendorRef: string;
  invoiceRef: string;
  amount: string;
  amountNum: number;
  date: string;
  paymentStatus: string;
}

const initialExpenseTransactions: ProjectExpenseTransaction[] = [
  {
    id: "tx-1",
    category: "Material Cost",
    description: "Steel Purchase - 12 MT",
    vendorRef: "Jindal Steel Pvt. Ltd.",
    invoiceRef: "INV-001",
    amount: "$25,00,000",
    amountNum: 2500000,
    date: "31 April 2026",
    paymentStatus: "Paid",
  },
  {
    id: "tx-2",
    category: "Manpower Cost",
    description: "Labor Payment - April 2024",
    vendorRef: "Shree Enterprises",
    invoiceRef: "INV-001",
    amount: "$25,00,000",
    amountNum: 2500000,
    date: "29 April 2026",
    paymentStatus: "Paid",
  },
  {
    id: "tx-3",
    category: "Freight & Logistics",
    description: "Transportation - 5 Trips",
    vendorRef: "Shiv Cargo Movers",
    invoiceRef: "INV-001",
    amount: "$25,00,000",
    amountNum: 2500000,
    date: "25 April 2026",
    paymentStatus: "Paid",
  },
  {
    id: "tx-4",
    category: "Site / Project Expense",
    description: "Site Office Rent - April",
    vendorRef: "Patel Infra Services",
    invoiceRef: "INV-001",
    amount: "$25,00,000",
    amountNum: 2500000,
    date: "25 April 2026",
    paymentStatus: "Paid",
  },
  {
    id: "tx-5",
    category: "Equipment & Machinery",
    description: "Excavator Rental",
    vendorRef: "Shakti Equipment's",
    invoiceRef: "INV-001",
    amount: "$25,00,000",
    amountNum: 2500000,
    date: "25 April 2026",
    paymentStatus: "Paid",
  },
];

type SortField =
  | "category"
  | "description"
  | "vendorRef"
  | "invoiceRef"
  | "amountNum"
  | "date";

export const RecentExpenseTransactionsCard: React.FC = () => {
  const [transactions, setTransactions] = useState<
    ProjectExpenseTransaction[]
  >(initialExpenseTransactions);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(4); // Default to 4 matching screenshot
  const [dateRangeText, setDateRangeText] = useState(
    "01 Jan 2024 - 07 Jan 2024"
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [viewTx, setViewTx] = useState<ProjectExpenseTransaction | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTransactions = useMemo(() => {
    const result = [...transactions];
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
  }, [transactions, sortField, sortDirection]);

  const totalDisplayPages = 15;

  const handleAddExpense = (formData: AddProjectExpenseFormData) => {
    const newTx: ProjectExpenseTransaction = {
      id: `tx-${Date.now()}`,
      category: formData.expenseType || formData.category || "Material Cost",
      description: formData.description,
      vendorRef:
        formData.vendorReference || formData.vendorRef || "Jindal Steel Pvt. Ltd.",
      invoiceRef: formData.invoiceId || formData.invoiceRef || "INV-001",
      amount: formData.amount,
      amountNum: parseInt(formData.amount.replace(/[^0-9]/g, ""), 10) || 0,
      date: formData.date,
      paymentStatus: formData.status || formData.paymentStatus || "Paid",
    };
    setTransactions((prev) => [newTx, ...prev]);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Header Row */}
      <div className="p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base">
          Recent Exense Transactions
        </h3>

        <div className="flex items-center gap-3">
          {/* Date Range Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateRangeText}</span>
            </button>

            <CalendarRangePickerModal
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onSelectRange={(range: string) => setDateRangeText(range)}
            />
          </div>

          {/* + Add Expense Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-[#F8FAFC] text-[11px] sm:text-xs text-slate-700 font-semibold">
              <th
                onClick={() => handleSort("category")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort("description")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Description</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort("vendorRef")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Vendor / Reference</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort("invoiceRef")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Invoice / Ref No.</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort("amountNum")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Amount</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort("date")}
                className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="px-5 py-3.5 select-none">
                <span>Payment Status</span>
              </th>

              <th className="px-5 py-3.5 select-none">
                <span>Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4 font-semibold text-[#2563EB] cursor-pointer hover:underline">
                  {tx.category}
                </td>
                <td className="px-5 py-4 text-slate-700">{tx.description}</td>
                <td className="px-5 py-4 text-slate-700">{tx.vendorRef}</td>
                <td className="px-5 py-4 font-semibold text-[#16A34A]">
                  {tx.invoiceRef}
                </td>
                <td className="px-5 py-4 font-semibold text-[#2563EB]">
                  {tx.amount}
                </td>
                <td className="px-5 py-4 text-slate-700">{tx.date}</td>
                <td className="px-5 py-4">
                  <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-200 bg-slate-50 text-slate-700">
                    {tx.paymentStatus}
                  </span>
                </td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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

      {/* Add Modal */}
      <AddProjectExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddExpense}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Expense Added Successfully"
      />

      {/* View Detail Modal */}
      <ExpenseTransactionDetailModal
        isOpen={Boolean(viewTx)}
        onClose={() => setViewTx(null)}
        transaction={viewTx}
        onEdit={() => {
          setViewTx(null);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
};

export default RecentExpenseTransactionsCard;
