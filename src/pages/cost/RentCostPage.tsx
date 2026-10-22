import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Plus,
  Coins,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import {
  useGetRentSummaryQuery,
  useGetRentRecordsQuery,
  useMarkRentPaidMutation,
} from "@/redux/api/costsApi";
import { formatDisplayDate } from "@/lib/dashboardFormatters";
import { Skeleton } from "@/components/ui/skeleton";

// Top upcoming rent payment record interface
export interface UpcomingRentPayment {
  id: string;
  property: string;
  dueDate: string;
  rentPeriod: string;
  amount: string;
  paymentStatus: "Upcoming" | "Paid" | "Pending";
  daysRemaining: string;
}

// Active rental property record interface
export interface ActiveRentalProperty {
  id: string;
  property: string;
  type: string;
  location: string;
  landlord: string;
  monthlyRent: string;
  leaseEnd: string;
  paymentStatus: "Pending" | "Paid";
}

export const RentCostPage: React.FC = () => {
  const navigate = useNavigate();

  // RTK Query endpoints
  const { data: summaryData, isLoading: isSummaryLoading } = useGetRentSummaryQuery();
  const { data: recordsData, isLoading: isRecordsLoading } = useGetRentRecordsQuery();
  const [markRentPaidApi] = useMarkRentPaidMutation();

  // Local paid tracking & action state
  const [localPaidIds, setLocalPaidIds] = useState<string[]>([]);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [successDialogConfig, setSuccessDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Normalized upcoming payments from API
  const upcomingPayments: UpcomingRentPayment[] = useMemo(() => {
    const list = recordsData?.upcomingPayments || [];
    return list.map((item, idx) => {
      const id = item.id || (item as { _id?: string })._id || `up-${idx}`;
      const isPaid = localPaidIds.includes(id) || String(item.paymentStatus).toLowerCase() === "paid";
      return {
        id,
        property: item.property || item.propertyName || "-",
        dueDate: formatDisplayDate(item.dueDate || item.date),
        rentPeriod: item.rentPeriod || "-",
        amount:
          typeof item.monthlyRent === "number"
            ? `$${item.monthlyRent.toLocaleString()}`
            : String(item.monthlyRent || "$0"),
        paymentStatus: (isPaid ? "Paid" : item.paymentStatus || "Upcoming") as
          | "Upcoming"
          | "Paid"
          | "Pending",
        daysRemaining: item.daysRemaining || "-",
      };
    });
  }, [recordsData, localPaidIds]);

  // Normalized active rental properties from API
  const activeProperties: ActiveRentalProperty[] = useMemo(() => {
    const list = recordsData?.activeProperties || recordsData?.rows || [];
    return list.map((item, idx) => {
      const id = item.id || (item as { _id?: string })._id || `prop-${idx}`;
      const isPaid = localPaidIds.includes(id) || String(item.paymentStatus).toLowerCase() === "paid";
      return {
        id,
        property: item.property || item.propertyName || "-",
        type: item.type || item.propertyType || "Warehouse",
        location: item.location || "-",
        landlord: item.landlord || "-",
        monthlyRent:
          typeof item.monthlyRent === "number"
            ? `$${item.monthlyRent.toLocaleString()}`
            : String(item.monthlyRent || "$0"),
        leaseEnd: formatDisplayDate(item.leaseEnd || item.leaseEndDate),
        paymentStatus: (isPaid ? "Paid" : item.paymentStatus || "Pending") as "Pending" | "Paid",
      };
    });
  }, [recordsData, localPaidIds]);

  // Export dropdown
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Upcoming Payments table states
  const [upcomingDateRangeText, setUpcomingDateRangeText] = useState("dd/mm/yyyy - dd/mm/yyyy");
  const [isUpcomingDatePickerOpen, setIsUpcomingDatePickerOpen] = useState(false);
  const [, setUpcomingAmountFilter] = useState("All");
  const [isUpcomingAmountOpen, setIsUpcomingAmountOpen] = useState(false);
  const [upcomingSort, setUpcomingSort] = useState("Last 7 Days");
  const [isUpcomingSortOpen, setIsUpcomingSortOpen] = useState(false);

  const [activeDateRangeText, setActiveDateRangeText] = useState("dd/mm/yyyy - dd/mm/yyyy");
  const [isActiveDatePickerOpen, setIsActiveDatePickerOpen] = useState(false);
  const [, setActiveAmountFilter] = useState("All");
  const [isActiveAmountOpen, setIsActiveAmountOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("Last 7 Days");
  const [isActiveSortOpen, setIsActiveSortOpen] = useState(false);

  // Active properties table pagination & search
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isRowsPerPageOpen, setIsRowsPerPageOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(4); // Match screenshot: page 4 highlighted, total 16 entries

  // Sort states for active rental properties
  const [propertySortField, setPropertySortField] = useState<string>("property");
  const [propertySortAsc, setPropertySortAsc] = useState<boolean>(true);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    setIsExportOpen(false);
    const headers = ["Property", "Type", "Location", "Landlord", "Monthly Rent", "Lease End", "Payment Status"];
    const rows = activeProperties.map((p) => [
      p.property,
      p.type,
      p.location,
      p.landlord,
      p.monthlyRent,
      p.leaseEnd,
      p.paymentStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rent_cost_${format}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mark an upcoming or active rent payment as Paid
  const handleMarkPaid = async (id: string) => {
    if (!id) return;
    try {
      setMarkingPaidId(id);
      const res = await markRentPaidApi(id).unwrap();
      setLocalPaidIds((prev) => [...prev, id]);
      setSuccessDialogConfig({
        isOpen: true,
        title: "Rent Marked as Paid",
        message: res.message || "Rent expense has been successfully marked as paid.",
      });
    } catch (err: unknown) {
      console.error("Failed to mark rent as paid", err);
      const errorMsg =
        (err as { data?: { message?: string }; message?: string })?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to mark rent as paid.";
      alert(errorMsg);
    } finally {
      setMarkingPaidId(null);
    }
  };

  // Filtered & sorted active properties
  const filteredActiveProperties = useMemo(() => {
    return activeProperties.filter((item) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.property.toLowerCase().includes(term) ||
        item.type.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term) ||
        item.landlord.toLowerCase().includes(term) ||
        item.monthlyRent.toLowerCase().includes(term) ||
        item.paymentStatus.toLowerCase().includes(term)
      );
    });
  }, [activeProperties, searchTerm]);

  const totalEntries = filteredActiveProperties.length;

  const sortedActiveProperties = useMemo(() => {
    const sorted = [...filteredActiveProperties];
    sorted.sort((a, b) => {
      const aVal = a[propertySortField as keyof ActiveRentalProperty] || "";
      const bVal = b[propertySortField as keyof ActiveRentalProperty] || "";
      return propertySortAsc
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
    return sorted;
  }, [filteredActiveProperties, propertySortField, propertySortAsc]);

  const handleSortToggle = (field: string) => {
    if (propertySortField === field) {
      setPropertySortAsc(!propertySortAsc);
    } else {
      setPropertySortField(field);
      setPropertySortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section matching screenshot exactly */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Rent Cost
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1 flex items-center gap-1.5 font-normal">
            <span className="text-slate-400">☖</span>
            <span>
              Track rental expenses, lease commitments, payment schedules, renewals, and location-wise rent costs.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 text-xs">
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  Export PDF
                </button>
              </div>
            )}
          </div>

          {/* Add Rent Button */}
          <button
            onClick={() => navigate("/cost/rent-cost/add")}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1D51A4] hover:bg-[#163e7c] rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <div className="w-4 h-4 rounded-full border border-white/70 flex items-center justify-center">
              <Plus className="w-2.5 h-2.5 text-white stroke-3" />
            </div>
            <span>Add Rent</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Cards matching screenshot precisely with hatched bottom-right corner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Rent Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs sm:text-[13px] font-medium text-slate-500">
              Total Rent Cost
            </span>
            <div className="w-8 h-8 rounded-lg border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] shrink-0">
              <Coins className="w-4 h-4 stroke-[1.8]" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
                {summaryData?.totalRentCost != null
                  ? `$${Number(summaryData.totalRentCost).toLocaleString()}`
                  : "$0"}
              </div>
            )}
            <p className="text-xs text-slate-400 font-medium mt-1">
              Yearly
            </p>
          </div>
          {/* Blue diagonal stripes in bottom-right */}
          <svg className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-80" viewBox="0 0 70 70" fill="none">
            <line x1="25" y1="70" x2="70" y2="25" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="70" x2="70" y2="35" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="45" y1="70" x2="70" y2="45" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="55" y1="70" x2="70" y2="55" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="65" y1="70" x2="70" y2="65" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 2: Monthly Rent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs sm:text-[13px] font-medium text-slate-500">
              Monthly Rent
            </span>
          </div>
          <div className="mt-4 relative z-10">
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
                {summaryData?.totalMonthlyRent != null
                  ? `$${Number(summaryData.totalMonthlyRent).toLocaleString()}`
                  : "$0"}
              </div>
            )}
          </div>
          {/* Blue diagonal stripes in bottom-right */}
          <svg className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-80" viewBox="0 0 70 70" fill="none">
            <line x1="25" y1="70" x2="70" y2="25" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="70" x2="70" y2="35" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="45" y1="70" x2="70" y2="45" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="55" y1="70" x2="70" y2="55" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="65" y1="70" x2="70" y2="65" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 3: Paid Rent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs sm:text-[13px] font-medium text-slate-500">
              Paid Rent
            </span>
          </div>
          <div className="mt-4 relative z-10">
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
                {summaryData?.paidRent != null
                  ? `$${Number(summaryData.paidRent).toLocaleString()}`
                  : "$0"}
              </div>
            )}
          </div>
          {/* Blue diagonal stripes in bottom-right */}
          <svg className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-80" viewBox="0 0 70 70" fill="none">
            <line x1="25" y1="70" x2="70" y2="25" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="70" x2="70" y2="35" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="45" y1="70" x2="70" y2="45" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="55" y1="70" x2="70" y2="55" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="65" y1="70" x2="70" y2="65" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 4: Pending Rent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs sm:text-[13px] font-medium text-slate-500">
              Pending Rent
            </span>
          </div>
          <div className="mt-4 relative z-10">
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
                {summaryData?.pendingRent != null
                  ? `$${Number(summaryData.pendingRent).toLocaleString()}`
                  : "$0"}
              </div>
            )}
          </div>
          {/* Blue diagonal stripes in bottom-right */}
          <svg className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-80" viewBox="0 0 70 70" fill="none">
            <line x1="25" y1="70" x2="70" y2="25" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="70" x2="70" y2="35" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="45" y1="70" x2="70" y2="45" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="55" y1="70" x2="70" y2="55" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="65" y1="70" x2="70" y2="65" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 5: Upcoming Rent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs sm:text-[13px] font-medium text-slate-500">
              Upcoming Rent
            </span>
          </div>
          <div className="mt-4 relative z-10">
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
                {summaryData?.upcomingRentDue != null
                  ? `$${Number(summaryData.upcomingRentDue).toLocaleString()}`
                  : "$0"}
              </div>
            )}
          </div>
          {/* Blue diagonal stripes in bottom-right */}
          <svg className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-80" viewBox="0 0 70 70" fill="none">
            <line x1="25" y1="70" x2="70" y2="25" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="70" x2="70" y2="35" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="45" y1="70" x2="70" y2="45" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="55" y1="70" x2="70" y2="55" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="65" y1="70" x2="70" y2="65" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 3. Section: Upcoming Rent Payments */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Section Header */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Upcoming Rent Payments
          </h2>

          {/* Controls: Date Picker, Price Range, Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Picker */}
            <button
              type="button"
              onClick={() => setIsUpcomingDatePickerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{upcomingDateRangeText}</span>
            </button>

            {/* Price Range Filter: $0.00 - $00 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUpcomingAmountOpen(!isUpcomingAmountOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>$0.00 - $00</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {isUpcomingAmountOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {["All", "$0 - $1,000", "$1,000 - $50,000", "$50,000+"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setUpcomingAmountFilter(amt);
                        setIsUpcomingAmountOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort: Sort By : Last 7 Days */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUpcomingSortOpen(!isUpcomingSortOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="text-slate-500">Sort By :</span>
                <span className="font-semibold text-slate-800">{upcomingSort}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>
              {isUpcomingSortOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {["Last 7 Days", "Last 30 Days", "Amount: High to Low", "Due Date"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setUpcomingSort(s);
                        setIsUpcomingSortOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-700">
                <th className="py-3 px-6 whitespace-nowrap">Property</th>
                <th className="py-3 px-6 whitespace-nowrap">Due Date</th>
                <th className="py-3 px-6 whitespace-nowrap">Rent Period</th>
                <th className="py-3 px-6 whitespace-nowrap">Amount</th>
                <th className="py-3 px-6 whitespace-nowrap">Payment Status</th>
                <th className="py-3 px-6 whitespace-nowrap">Days Remaining</th>
                <th className="py-3 px-6 whitespace-nowrap text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isRecordsLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`up-skel-${idx}`}>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4 px-6 text-right"><Skeleton className="h-7 w-20 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : upcomingPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No upcoming rent payments found.
                  </td>
                </tr>
              ) : (
                upcomingPayments.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                    {row.property}
                  </td>
                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                    {row.dueDate}
                  </td>
                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                    {row.rentPeriod}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                    {row.amount}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-[#2563EB] font-medium hover:underline cursor-pointer">
                      {row.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-800 font-medium whitespace-nowrap">
                    {row.daysRemaining}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    {row.paymentStatus === "Paid" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4" /> Paid
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(row.id)}
                        disabled={markingPaidId === row.id}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {markingPaidId === row.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Section: Active Rental Properties */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Section Header Top Row: Title & Right Filters */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Active Rental Properties
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Picker */}
            <button
              type="button"
              onClick={() => setIsActiveDatePickerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeDateRangeText}</span>
            </button>

            {/* Price Range: $0.00 - $00 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsActiveAmountOpen(!isActiveAmountOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>$0.00 - $00</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {isActiveAmountOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {["All", "$0 - $1,000", "$1,000 - $5,000", "$5,000+"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setActiveAmountFilter(amt);
                        setIsActiveAmountOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort: Sort By : Last 7 Days */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsActiveSortOpen(!isActiveSortOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="text-slate-500">Sort By :</span>
                <span className="font-semibold text-slate-800">{activeSort}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>
              {isActiveSortOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {["Last 7 Days", "Last 30 Days", "Monthly Rent", "Lease End"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setActiveSort(s);
                        setIsActiveSortOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Secondary Row: Row Per Page & Search */}
        <div className="p-4 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
          {/* Row Per Page 10 Entries */}
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span>Row Per Page</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRowsPerPageOpen(!isRowsPerPageOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{rowsPerPage}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {isRowsPerPageOpen && (
                <div className="absolute left-0 mt-1 w-20 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {[5, 10, 20, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setRowsPerPage(num);
                        setIsRowsPerPageOpen(false);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span>Entries</span>
          </div>

          {/* Search Box on right */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Active Properties Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-700">
                <th className="py-3 px-6 whitespace-nowrap">Property</th>
                <th className="py-3 px-6 whitespace-nowrap">Type</th>
                <th className="py-3 px-6 whitespace-nowrap">Location</th>
                <th
                  onClick={() => handleSortToggle("landlord")}
                  className="py-3 px-6 whitespace-nowrap cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Landlord</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </div>
                </th>
                <th className="py-3 px-6 whitespace-nowrap">Monthly Rent</th>
                <th
                  onClick={() => handleSortToggle("leaseEnd")}
                  className="py-3 px-6 whitespace-nowrap cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Lease End</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </div>
                </th>
                <th className="py-3 px-6 whitespace-nowrap">Payment Status</th>
                <th className="py-3 px-6 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isRecordsLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`prop-skel-${idx}`}>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-6 w-16 rounded-md" /></td>
                    <td className="py-4 px-6 text-right"><Skeleton className="h-7 w-20 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : sortedActiveProperties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No active rental properties found.
                  </td>
                </tr>
              ) : (
                sortedActiveProperties.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                    {row.property}
                  </td>
                  <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                    {row.type}
                  </td>
                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                    {row.location}
                  </td>
                  <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                    {row.landlord}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                    {row.monthlyRent}
                  </td>
                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                    {row.leaseEnd}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                        row.paymentStatus === "Paid"
                          ? "bg-[#DCFCE7] text-[#16A34A]"
                          : "bg-[#FEF3C7] text-[#D97706]"
                      }`}
                    >
                      {row.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    {row.paymentStatus === "Paid" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4" /> Paid
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(row.id)}
                        disabled={markingPaidId === row.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {markingPaidId === row.id && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching screenshot */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-normal">
            Showing 1 to 10 of {totalEntries} entries
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3].map((page) => (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-full flex items-center justify-center font-medium transition-colors cursor-pointer ${
                  page === currentPage
                    ? "bg-[#1D51A4] text-white font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage(4)}
              className={`w-7 h-7 rounded-full flex items-center justify-center font-medium transition-colors cursor-pointer ${
                currentPage === 4
                  ? "bg-[#1D51A4] text-white font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              4
            </button>

            <span className="px-1 text-slate-400 text-xs">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(15)}
              className={`w-7 h-7 rounded-full flex items-center justify-center font-medium transition-colors cursor-pointer ${
                currentPage === 15
                  ? "bg-[#1D51A4] text-white font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              15
            </button>

            <button
              type="button"
              disabled={currentPage >= 15}
              onClick={() => setCurrentPage((p) => Math.min(15, p + 1))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Picker Modals */}
      <CalendarRangePickerModal
        isOpen={isUpcomingDatePickerOpen}
        onClose={() => setIsUpcomingDatePickerOpen(false)}
        onApply={(range) => {
          setUpcomingDateRangeText(`${range.startDate} - ${range.endDate}`);
          setIsUpcomingDatePickerOpen(false);
        }}
      />

      <CalendarRangePickerModal
        isOpen={isActiveDatePickerOpen}
        onClose={() => setIsActiveDatePickerOpen(false)}
        onApply={(range) => {
          setActiveDateRangeText(`${range.startDate} - ${range.endDate}`);
          setIsActiveDatePickerOpen(false);
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successDialogConfig.isOpen}
        onClose={() =>
          setSuccessDialogConfig((prev) => ({ ...prev, isOpen: false }))
        }
        title={successDialogConfig.title}
        message={successDialogConfig.message}
      />
    </div>
  );
};

export default RentCostPage;
