import { Search, ChevronDown, RotateCcw } from "lucide-react";
import DateRangeFilter, { type DateRange } from "@/components/ui/date-range-filter";

interface PayableFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  payableStatusFilter: string;
  onPayableStatusFilterChange: (val: string) => void;
  projectFilter: string;
  onProjectFilterChange: (val: string) => void;
  projectsList: string[];
  onReset?: () => void;
}

export function PayableFilters({
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  payableStatusFilter,
  onPayableStatusFilterChange,
  projectFilter,
  onProjectFilterChange,
  projectsList,
  onReset,
}: PayableFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search invoice, payee, ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
          />
        </div>

        {/* Date Range */}
        <div>
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            placeholder="Select Due/Invoice Date"
            className="w-full"
          />
        </div>

        {/* Payment Status */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:outline-none focus:border-blue-500 transition-colors pr-9 cursor-pointer"
          >
            <option value="All">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Payable Workflow Status */}
        <div className="relative">
          <select
            value={payableStatusFilter}
            onChange={(e) => onPayableStatusFilterChange(e.target.value)}
            className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:outline-none focus:border-blue-500 transition-colors pr-9 cursor-pointer"
          >
            <option value="All">All Workflow States</option>
            <option value="pending_admin_approval">Pending Approval</option>
            <option value="approved_for_payment">Approved for Payment</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Project Filter & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={projectFilter}
              onChange={(e) => onProjectFilterChange(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:outline-none focus:border-blue-500 transition-colors pr-9 cursor-pointer"
            >
              <option value="All">All Projects</option>
              {projectsList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="Reset Filters"
              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PayableFilters;
