import { useState, useEffect, useMemo } from "react";
import {
  Download,
  Plus,
  Database,
  Search,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SuccessModal from "@/components/common_components/SuccessModal";
import OrderPaymentDetailsModal from "@/components/modals/OrderPaymentDetailsModal";
import UpdatePaymentPage from "./UpdatePaymentPage";
import { formatCurrency } from "@/lib/dashboardFormatters";
import {
  useGetPaymentStatsQuery,
  useGetPaymentOrdersQuery,
  useExportWipProfitsMutation,
  type PaymentOrderItem,
} from "@/redux/api/paymentsApi";

export interface OrderItem {
  id: string;
  wipId?: string;
  leadId?: string;
  client: string;
  projectId: string;
  location: string;
  orderValue: string;
  currentCost: string;
  deposit: string;
  progress: string;
  final: string;
  outstanding: string;
  profit: string;
  margin: string;
  status: "In progress" | "Completed" | "Started" | string;
  totalReceived?: string;
  raw?: PaymentOrderItem;
}

const mapApiOrderToOrderItem = (order: PaymentOrderItem): OrderItem => {
  return {
    id:
      order.wipId ||
      order.leadId ||
      order.orderDetails?.orderId ||
      order.orderDetails?.quoteOrderId ||
      String(Math.random()),
    wipId: order.wipId,
    leadId: order.leadId,
    client: order.orderDetails?.customerName || "Customer",
    projectId:
      order.orderDetails?.orderId ||
      order.orderDetails?.quoteOrderId ||
      "N/A",
    location: order.orderDetails?.location || "N/A",
    orderValue: formatCurrency(order.orderValue),
    currentCost: formatCurrency(order.currentCost),
    deposit: formatCurrency(order.paymentBreakdown?.deposit ?? 0),
    progress: formatCurrency(order.paymentBreakdown?.progress ?? 0),
    final: formatCurrency(order.paymentBreakdown?.final ?? 0),
    outstanding: formatCurrency(order.outstanding),
    profit: formatCurrency(order.profit),
    margin: `${order.marginPct ?? 0}%`,
    status: order.status || "In progress",
    totalReceived: formatCurrency(order.totalReceived ?? 0),
    raw: order,
  };
};

const PaymentOverview = () => {
  // Query state
  const [periodFilter, setPeriodFilter] = useState<string>("month");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  // UI state
  const [viewMode, setViewMode] = useState<"list" | "update" | "add">("list");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null);

  // Local state for client-side modifications / newly added items during session
  const [localAddedOrders, setLocalAddedOrders] = useState<OrderItem[]>([]);
  const [localUpdatedOrders, setLocalUpdatedOrders] = useState<
    Record<string, OrderItem>
  >({});

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // A1: Fetch payment stats
  const {
    data: statsData,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    refetch: refetchStats,
  } = useGetPaymentStatsQuery({
    period: periodFilter !== "all" ? periodFilter : undefined,
  });

  // A2: Fetch payment orders & summary list
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    isError: isOrdersError,
    error: ordersErrorObj,
    refetch: refetchOrders,
  } = useGetPaymentOrdersQuery({
    search: debouncedSearch.trim() || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
    period: periodFilter !== "all" ? periodFilter : undefined,
    page,
    limit,
  });

  // Export WIP Excel Mutation
  const [exportWipProfits, { isLoading: isExporting }] =
    useExportWipProfitsMutation();

  // Combine server stats with orders response stats as fallback
  const currentStats = useMemo(() => {
    return (
      statsData ||
      ordersData?.stats || {
        totalOrderValue: 0,
        totalReceived: 0,
        outstanding: 0,
        totalWipProfit: 0,
      }
    );
  }, [statsData, ordersData?.stats]);

  // Map API orders and merge local updates/additions
  const displayedOrders: OrderItem[] = useMemo(() => {
    const apiOrders = (ordersData?.orders || []).map(mapApiOrderToOrderItem);

    // Apply any local edits
    const withEdits = apiOrders.map((o) =>
      localUpdatedOrders[o.id] ? localUpdatedOrders[o.id] : o
    );

    // Prepend locally added orders if on page 1
    if (page === 1 && localAddedOrders.length > 0) {
      return [...localAddedOrders, ...withEdits];
    }

    return withEdits;
  }, [ordersData?.orders, localUpdatedOrders, localAddedOrders, page]);

  const totalOrders = (ordersData?.total ?? 0) + localAddedOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / limit));

  // Reset page when filters change
  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handlePeriodChange = (val: string) => {
    setPeriodFilter(val);
    setPage(1);
  };

  // Export report handler
  const handleExport = async () => {
    setExportErrorMessage(null);
    try {
      const blob = await exportWipProfits(
        periodFilter !== "all" ? { period: periodFilter } : undefined
      ).unwrap();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `wip-profits-report-${periodFilter || "all"}-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setSuccessModalTitle("Report Exported Successfully");
      setIsSuccessModalOpen(true);
    } catch (err: unknown) {
      console.error("Failed to export WIP Excel:", err);
      const errMsg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to export report. Please try again later.";
      setExportErrorMessage(errMsg);
    }
  };

  const handleView = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEdit = (order: OrderItem) => {
    setSelectedOrder(order);
    setViewMode("update");
  };

  const handleAddNew = () => {
    setSelectedOrder(null);
    setViewMode("add");
  };

  const handleRefreshAll = () => {
    refetchStats();
    refetchOrders();
  };

  // If in Add or Update page mode, render UpdatePaymentPage
  if (viewMode !== "list") {
    return (
      <UpdatePaymentPage
        title={viewMode === "add" ? "Add Payment" : "Update Payment"}
        order={selectedOrder}
        onBack={() => {
          setViewMode("list");
          setSelectedOrder(null);
        }}
        onSave={(updated) => {
          if (viewMode === "add") {
            setLocalAddedOrders((prev) => [updated, ...prev]);
            setSuccessModalTitle("Payment Entry Saved Successfully");
          } else {
            setLocalUpdatedOrders((prev) => ({
              ...prev,
              [updated.id]: updated,
            }));
            setSuccessModalTitle("Payment Updated Successfully");
          }
          setViewMode("list");
          setSelectedOrder(null);
          setIsSuccessModalOpen(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 xl:px-0 pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Payment Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Financial performance tracking and management
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Period selector */}
          <Select value={periodFilter} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32 h-9 text-xs sm:text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 focus:ring-1 focus:ring-blue-500 shadow-xs">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh button */}
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={handleRefreshAll}
            disabled={isStatsFetching || isOrdersFetching}
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 rounded-lg h-9 w-9 shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw
              className={cn(
                "w-4 h-4 text-gray-600",
                (isStatsFetching || isOrdersFetching) && "animate-spin"
              )}
            />
          </Button>

          {/* Export Reports button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 rounded-lg h-9 px-4 gap-2 text-sm font-medium shadow-xs"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-gray-600" />
            )}
            <span>{isExporting ? "Exporting..." : "Export Reports"}</span>
          </Button>

          {/* Add Order Payment button */}
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg h-9 px-4 gap-1.5 text-sm font-medium shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Order Payment</span>
          </Button>
        </div>
      </div>

      {/* Export error banner if occurred */}
      {exportErrorMessage && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{exportErrorMessage}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExportErrorMessage(null)}
            className="ml-auto text-xs text-red-600 hover:text-red-800"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Order Value */}
        <Card className="rounded-2xl p-5 shadow-xs border border-gray-100 bg-white flex flex-row items-center justify-between gap-0">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">
              Total Order Value
            </p>
            {isStatsLoading && !statsData && !ordersData?.stats ? (
              <div className="h-7 w-28 bg-gray-100 animate-pulse rounded-md" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(currentStats.totalOrderValue)}
              </p>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-[#2563EB]" />
          </div>
        </Card>

        {/* Total Received */}
        <Card className="rounded-2xl p-5 shadow-xs border border-gray-100 bg-white flex flex-row items-center justify-between gap-0">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">
              Total Received
            </p>
            {isStatsLoading && !statsData && !ordersData?.stats ? (
              <div className="h-7 w-28 bg-gray-100 animate-pulse rounded-md" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-[#16A34A] tracking-tight">
                {formatCurrency(currentStats.totalReceived)}
              </p>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#DCFCE7] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-[#16A34A]" />
          </div>
        </Card>

        {/* Outstanding */}
        <Card className="rounded-2xl p-5 shadow-xs border border-gray-100 bg-white flex flex-row items-center justify-between gap-0">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">
              Outstanding
            </p>
            {isStatsLoading && !statsData && !ordersData?.stats ? (
              <div className="h-7 w-28 bg-gray-100 animate-pulse rounded-md" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-[#EF4444] tracking-tight">
                {formatCurrency(currentStats.outstanding)}
              </p>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FEE2E2] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-[#EF4444]" />
          </div>
        </Card>

        {/* Total WIP Profit */}
        <Card className="rounded-2xl p-5 shadow-xs border border-gray-100 bg-white flex flex-row items-center justify-between gap-0">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">
              Total WIP Profit
            </p>
            {isStatsLoading && !statsData && !ordersData?.stats ? (
              <div className="h-7 w-28 bg-gray-100 animate-pulse rounded-md" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(currentStats.totalWipProfit)}
              </p>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#F3E8FF] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-[#9333EA]" />
          </div>
        </Card>
      </div>

      {/* Orders & Payment Summary Card */}
      <Card className="rounded-2xl border border-gray-100 shadow-xs bg-white overflow-hidden py-0 gap-0">
        {/* Table header bar */}
        <div className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Orders & Payment Summary
            </h2>
            {isOrdersFetching && (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Orders payment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 sm:w-64 pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Select */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32 h-9 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 focus:ring-1 focus:ring-blue-500 shadow-none">
                <SelectValue placeholder="Status">
                  {statusFilter === "All" ? "All Status" : statusFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="In progress">In progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Started">Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error message state */}
        {isOrdersError && (
          <div className="p-6 text-center border-t border-gray-100 bg-red-50/40">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-800">
              Failed to load orders
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {ordersErrorObj &&
              typeof ordersErrorObj === "object" &&
              "data" in ordersErrorObj
                ? String(
                    (ordersErrorObj as { data?: { message?: string } }).data
                      ?.message || "Server error occurred"
                  )
                : "An unexpected error occurred while fetching orders."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetchOrders()}
              className="mt-3 text-xs bg-white"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead className="bg-[#FAFAFB] border-t border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6 font-semibold">ORDER DETAILS</th>
                <th className="py-3 px-6 font-semibold">ORDER VALUE</th>
                <th className="py-3 px-6 font-semibold">PAYMENT BREAKDOWN</th>
                <th className="py-3 px-6 font-semibold text-center">OUTSTANDING</th>
                <th className="py-3 px-6 font-semibold text-center">PROFIT</th>
                <th className="py-3 px-6 font-semibold text-center">STATUS</th>
                <th className="py-3 px-6 font-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {/* Skeleton loading state */}
              {isOrdersLoading && !ordersData ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 w-28 bg-gray-200 rounded mb-1.5" />
                      <div className="h-3 w-20 bg-gray-100 rounded mb-1" />
                      <div className="h-3 w-24 bg-gray-100 rounded" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 w-24 bg-gray-200 rounded mb-1.5" />
                      <div className="h-3 w-32 bg-gray-100 rounded" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-3 w-28 bg-gray-100 rounded mb-1.5" />
                      <div className="h-3 w-28 bg-gray-100 rounded mb-1.5" />
                      <div className="h-3 w-28 bg-gray-100 rounded" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-4 w-20 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-1" />
                      <div className="h-3 w-16 bg-gray-100 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-6 w-20 bg-gray-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-7 w-16 bg-gray-100 rounded mx-auto" />
                    </td>
                  </tr>
                ))
              ) : displayedOrders.length === 0 ? (
                /* Empty state */
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-700">
                        No orders found
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Try adjusting your search query or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Data rows */
                displayedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/40 transition-colors"
                  >
                    {/* ORDER DETAILS */}
                    <td className="py-4 px-6 align-middle">
                      <div className="font-bold text-gray-900 text-sm">
                        {order.client}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {order.projectId}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {order.location}
                      </div>
                    </td>

                    {/* ORDER VALUE */}
                    <td className="py-4 px-6 align-middle">
                      <div className="font-bold text-gray-900 text-sm">
                        {order.orderValue}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Current Cost {order.currentCost}
                      </div>
                    </td>

                    {/* PAYMENT BREAKDOWN */}
                    <td className="py-4 px-6 align-middle">
                      <div className="space-y-1 text-xs max-w-[150px]">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Deposit:</span>
                          <span className="font-bold text-gray-900">
                            {order.deposit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Progress</span>
                          <span className="font-bold text-gray-900">
                            {order.progress}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Final</span>
                          <span className="font-bold text-gray-900">
                            {order.final}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* OUTSTANDING */}
                    <td className="py-4 px-6 align-middle text-center">
                      <span className="font-bold text-sm text-[#EF4444]">
                        {order.outstanding}
                      </span>
                    </td>

                    {/* PROFIT */}
                    <td className="py-4 px-6 align-middle text-center">
                      <div className="font-bold text-sm text-[#16A34A]">
                        {order.profit}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {order.margin} margin
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-6 align-middle text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-3.5 py-1 text-xs font-medium border-none shadow-none",
                          order.status.toLowerCase() === "in progress" &&
                            "bg-[#DBEAFE] text-[#2563EB]",
                          order.status.toLowerCase() === "completed" &&
                            "bg-[#DCFCE7] text-[#16A34A]",
                          order.status.toLowerCase() === "started" &&
                            "bg-[#FEF3C7] text-[#D97706]"
                        )}
                      >
                        {order.status}
                      </Badge>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-6 align-middle text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleView(order)}
                          className="rounded-full text-[#3B49DF] hover:bg-gray-100 hover:text-blue-700 cursor-pointer"
                          title="View"
                        >
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEdit(order)}
                          className="rounded-full text-[#16A34A] hover:bg-gray-100 hover:text-green-700 cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 stroke-[1.8]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 sm:px-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-500 bg-white">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-gray-900 font-semibold">
                {totalOrders === 0 ? 0 : (page - 1) * limit + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900 font-semibold">
                {Math.min(page * limit, totalOrders)}
              </strong>{" "}
              of{" "}
              <strong className="text-gray-900 font-semibold">
                {totalOrders}
              </strong>{" "}
              orders
            </span>

            <span className="text-gray-300">|</span>

            {/* Page limit selector */}
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isOrdersFetching}
              className="h-8 px-2.5 text-xs rounded-lg border-gray-200 text-gray-600 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>

            <span className="px-2 text-xs font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isOrdersFetching}
              className="h-8 px-2.5 text-xs rounded-lg border-gray-200 text-gray-600 disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Order & Payment Details Modal */}
      <OrderPaymentDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onUpdate={(order) => {
          setIsViewModalOpen(false);
          setSelectedOrder(order);
          setViewMode("update");
        }}
      />

      {/* Success Notification Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successModalTitle}
      />
    </div>
  );
};

export default PaymentOverview;
