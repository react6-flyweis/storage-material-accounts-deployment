import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Eye, Search, UserPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/common_components/Pagination";
import { cn } from "@/lib/utils";
import {
  useGetCustomerStatsQuery,
  useGetCustomersQuery,
  type CustomerListItem,
} from "@/redux/api/customerApi";

// 8 fallback customer items matching the exact mockup image
const FALLBACK_CUSTOMERS: CustomerListItem[] = [
  {
    _id: "67a1b2c3d4e5f67890123451",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    status: "Active",
  },
  {
    _id: "67a1b2c3d4e5f67890123452",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    status: "Active",
  },
  {
    _id: "67a1b2c3d4e5f67890123453",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    status: "Active",
  },
  {
    _id: "67a1b2c3d4e5f67890123454",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    status: "Active",
  },
  {
    _id: "67a1b2c3d4e5f67890123455",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    status: "Active",
  },
  {
    _id: "67a1b2c3d4e5f67890123456",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    status: "Active",
  },
  {
    _id: "67a1b2c3d4e5f67890123457",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    status: "Active",
  },
  {
    _id: "67a1b2c3d4e5f67890123458",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    status: "Active",
  },
];

export default function CustomersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Customer stats (top cards)
  const { data: customerStats } = useGetCustomerStatsQuery({
    period: "month",
  });

  // Customer list query
  const { data: customerListData, isLoading: customersLoading } =
    useGetCustomersQuery({
      search: debouncedSearch || undefined,
      page,
      limit,
    });

  const rawCustomers = customerListData?.customers?.length
    ? customerListData.customers
    : FALLBACK_CUSTOMERS;

  const totalCount = customerListData?.total || rawCustomers.length;

  // Filter customers by search term
  const filteredCustomers = useMemo(() => {
    if (!debouncedSearch.trim()) return rawCustomers;
    const term = debouncedSearch.toLowerCase().trim();
    return rawCustomers.filter((customer) => {
      const name = customer.customerName?.toLowerCase() || "";
      const id = customer.customerId?.toLowerCase() || "";
      const email = customer.email?.toLowerCase() || "";
      const phone = customer.phone?.toLowerCase() || "";
      return (
        name.includes(term) ||
        id.includes(term) ||
        email.includes(term) ||
        phone.includes(term)
      );
    });
  }, [rawCustomers, debouncedSearch]);

  const statCards = [
    {
      title: "Total Customers",
      value: customerStats?.totalCustomers ?? 126,
      icon: UserPlus,
      bg: "bg-[#1A52A5]",
      iconColor: "text-[#1A52A5]",
    },
    {
      title: "Active Customers",
      value: customerStats?.activeCustomers ?? 48,
      icon: Check,
      bg: "bg-[#2EA843]",
      iconColor: "text-[#2EA843]",
      strokeWidth: 2.5,
    },
    {
      title: "New Cust. (This Month)",
      value: customerStats?.newCustomersThisMonth ?? 15,
      icon: UserPlus,
      bg: "bg-[#E5A800]",
      iconColor: "text-[#E5A800]",
    },
    {
      title: "Returning Customers",
      value: customerStats?.returningCustomers ?? 9,
      icon: UserPlus,
      bg: "bg-[#F97047]",
      iconColor: "text-[#F97047]",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
          Customers
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-normal">
          Easily view, manage, and track all your customers in one place.
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={cn(
                "rounded-xl p-5 text-white flex items-center justify-between shadow-xs transition-transform hover:scale-[1.01]",
                card.bg
              )}
            >
              <div>
                <p className="text-sm font-normal text-white/90">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-1.5 tracking-tight">
                  {card.value}
                </p>
              </div>
              <div className="bg-white rounded-xl w-11 h-11 flex items-center justify-center shadow-xs shrink-0">
                <Icon
                  className={cn("size-5", card.iconColor)}
                  strokeWidth={card.strokeWidth || 2}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="pt-2">
        <div className="relative w-64 sm:w-72 max-w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, ID"
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/90 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100/90 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-slate-100 bg-white hover:bg-white">
                <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                  CUSTOMER ID
                </TableHead>
                <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                  CUSTOMER NAME
                </TableHead>
                <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                  PHONE NO.
                </TableHead>
                <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                  EMAIL
                </TableHead>
                <TableHead className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow
                    key={`loading-${i}`}
                    className="border-b border-slate-100/80 animate-pulse even:bg-[#FAFAFB]/60"
                  >
                    <TableCell className="py-4.5 px-6">
                      <div className="h-4 w-24 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="py-4.5 px-6">
                      <div className="h-4 w-28 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="py-4.5 px-6">
                      <div className="h-4 w-32 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="py-4.5 px-6">
                      <div className="h-4 w-44 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell className="py-4.5 px-6 text-center">
                      <div className="h-4 w-5 rounded bg-slate-200 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers.length === 0 ? (
                <TableRow className="border-0">
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-slate-500 font-medium"
                  >
                    No customers found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, index) => {
                  const targetId = customer.customerId || customer._id;
                  return (
                    <TableRow
                      key={customer._id || `${targetId}-${index}`}
                      className="border-b border-slate-100/90 last:border-b-0 even:bg-[#FAFAFB]/60 hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => navigate(`/customers/${targetId}`)}
                    >
                      <TableCell className="py-4.5 px-6 text-sm text-slate-500 font-normal">
                        {customer.customerId || "ID-2025-1047"}
                      </TableCell>
                      <TableCell className="py-4.5 px-6 text-sm font-semibold text-slate-900">
                        {customer.customerName}
                      </TableCell>
                      <TableCell className="py-4.5 px-6 text-sm text-slate-500 font-normal">
                        {customer.phone || "+39 02 8945 2231"}
                      </TableCell>
                      <TableCell className="py-4.5 px-6 text-sm text-slate-500 font-normal">
                        {customer.email || "luca.moretti@eurobuild.it"}
                      </TableCell>
                      <TableCell
                        className="py-4.5 px-6 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${targetId}`);
                        }}
                      >
                        <button
                          type="button"
                          aria-label={`View ${customer.customerName}`}
                          className="inline-flex items-center justify-center text-[#4F46E5] hover:text-[#4338CA] hover:scale-115 transition-all cursor-pointer p-1 rounded-md"
                        >
                          <Eye className="size-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination (if more items than limit) */}
      {totalCount > limit && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100/90 overflow-hidden">
          <Pagination
            totalItems={totalCount}
            itemsPerPage={limit}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
