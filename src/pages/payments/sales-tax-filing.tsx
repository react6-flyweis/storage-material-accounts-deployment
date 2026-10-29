import { useState } from "react";
import { format } from "date-fns";
import type { DateRange as RDateRange } from "@/components/ui/date-range-filter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  DollarSign,
  ShoppingBag,
  Handbag,
  Hourglass,
  Search,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import StatCardV2 from "@/components/ui/stat-card-v2";
import DateRangeFilter from "@/components/ui/date-range-filter";
import SuccessDialog from "@/components/success-dialog";
import TaxDetailsSheet from "@/components/payments/tax-details-sheet";
import TaxPaymentDialog from "@/components/payments/tax-payment-dialog";
import {
  FilingHistoryTab,
  PendingFilingTab,
} from "./sales-tax-filing-tabs";
import {
  useTaxFilingStatsQuery,
  useTaxFilingFiltersQuery,
  useTaxFilingQuery,
  useExportTaxFilingMutation,
  useDownloadTaxReceiptPdfMutation,
  useSyncTaxFilingMutation,
  useFileTaxMutation,
} from "@/modules/payments/payments.hooks";
import type {
  TaxFilingItem,
  TaxFilingFilterProject,
  TaxFilingFilterClient,
} from "@/modules/payments/payments.api";

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
}

export default function SalesTaxFiling() {
  const [activeTab, setActiveTab] = useState<"Pending Filing" | "Filing History">(
    "Pending Filing"
  );
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [downloadSuccessOpen, setDownloadSuccessOpen] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("Downloaded successfully");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPrepareMode, setIsPrepareMode] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedTaxItem, setSelectedTaxItem] = useState<TaxFilingItem | null>(null);

  // 1. Fetch Filters Data
  const { data: filtersRes, isLoading: isFiltersLoading } =
    useTaxFilingFiltersQuery();

  const states = filtersRes?.data?.states || [];
  const projects = filtersRes?.data?.projects || [];
  const clients = filtersRes?.data?.clients || [];

  // 2. Prepare Query Parameters
  const startDateStr = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined;
  const endDateStr = dateRange?.to
    ? format(dateRange.to, "yyyy-MM-dd")
    : undefined;

  const effectiveSearch = searchQuery.trim() ? searchQuery.trim() : undefined;

  const statsParams = {
    state: selectedState !== "all" ? selectedState : undefined,
    projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
    clientId: selectedClientId !== "all" ? selectedClientId : undefined,
    search: effectiveSearch,
  };

  const queryParams = {
    state: selectedState !== "all" ? selectedState : undefined,
    projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
    clientId: selectedClientId !== "all" ? selectedClientId : undefined,
    search: effectiveSearch,
    startDate: startDateStr,
    endDate: endDateStr,
    page,
    limit,
  };

  // 3. Fetch Dedicated KPI Stats (4.1)
  const {
    data: statsRes,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useTaxFilingStatsQuery(statsParams);

  // 4. Fetch Pending + Filing History (4.3)
  const {
    data: taxFilingRes,
    isLoading: isTaxFilingLoading,
    isFetching,
    refetch,
  } = useTaxFilingQuery(queryParams);

  const exportMutation = useExportTaxFilingMutation();
  const downloadReceiptMutation = useDownloadTaxReceiptPdfMutation();
  const syncMutation = useSyncTaxFilingMutation();
  const fileTaxMutation = useFileTaxMutation();
  const [isSyncing, setIsSyncing] = useState(false);

  const kpiStats = statsRes?.data;
  const tableStats = taxFilingRes?.data?.stats;
  const pendingFiling = taxFilingRes?.data?.pendingFiling || [];
  const filingHistory = taxFilingRes?.data?.filingHistory || [];
  const meta = taxFilingRes?.data?.meta;
  const totalCount =
    activeTab === "Pending Filing"
      ? (tableStats?.unfiled ?? pendingFiling.length)
      : (tableStats?.filed ?? filingHistory.length);

  const handleStateChange = (val: string) => {
    setSelectedState(val);
    setPage(1);
  };

  const handleProjectChange = (val: string) => {
    setSelectedProjectId(val);
    setPage(1);
  };

  const handleClientChange = (val: string) => {
    setSelectedClientId(val);
    setPage(1);
  };

  const handleDateRangeChange = (range: RDateRange | undefined) => {
    setDateRange(range);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleReviewDetails = (item: TaxFilingItem) => {
    setSelectedTaxItem(item);
    setIsPrepareMode(false);
    setIsSheetOpen(true);
  };

  const handlePrepareFiling = (item: TaxFilingItem) => {
    setSelectedTaxItem(item);
    setIsPrepareMode(true);
    setIsSheetOpen(true);
  };

  const handlePayTax = (item: TaxFilingItem) => {
    setSelectedTaxItem(item);
    setIsPayDialogOpen(true);
  };

  const handleMarkFiled = async (item: TaxFilingItem) => {
    const taxId = item.taxRecordId || item._id;
    if (!taxId || taxId === "temp-id") return;
    try {
      await fileTaxMutation.mutateAsync(taxId);
      setDownloadMessage("Tax record successfully marked as filed");
      setDownloadSuccessOpen(true);
      await Promise.all([refetch(), refetchStats()]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to mark tax as filed";
      setDownloadMessage(errMsg);
      setDownloadSuccessOpen(true);
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open && !isPayDialogOpen) {
      setSelectedTaxItem(null);
    }
  };

  const handleDownloadItem = async (item?: TaxFilingItem) => {
    if (item?._id) {
      try {
        const blob = await downloadReceiptMutation.mutateAsync(item._id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const receiptNum = item.receipt?.confirmationNumber || `tax-receipt-${item.state || item._id.slice(-6)}`;
        link.setAttribute("download", `${receiptNum}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setDownloadMessage("Receipt PDF downloaded successfully");
        setDownloadSuccessOpen(true);
        return;
      } catch (err) {
        console.warn("PDF receipt download failed, falling back to CSV receipt:", err);
      }
    }

    // Fallback CSV receipt
    if (item) {
      const csvContent = `data:text/csv;charset=utf-8,State,Due Date,Amount,Status,Job ID,Project Name\n"${
        item.state
      }","${item.dueDate || item.filedDate || ""}","${item.taxDue ?? item.taxPaid ?? item.amount ?? 0}","${
        typeof item.status === "object" ? item.status.label : item.status || ""
      }","${item.jobId || ""}","${item.projectName || ""}"`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `filing-receipt-${item._id.slice(-6)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    setDownloadMessage("Receipt downloaded successfully");
    setDownloadSuccessOpen(true);
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        state: selectedState !== "all" ? selectedState : undefined,
        projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
        clientId: selectedClientId !== "all" ? selectedClientId : undefined,
        search: effectiveSearch,
        startDate: startDateStr,
        endDate: endDateStr,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales-tax-filing-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadMessage("Exported successfully");
      setDownloadSuccessOpen(true);
    } catch {
      // Fallback client CSV export
      const rowsToExport =
        activeTab === "Pending Filing" ? pendingFiling : filingHistory;
      if (rowsToExport.length > 0) {
        const headers = [
          "State",
          "Due Date",
          "Amount",
          "Frequency",
          "Status",
          "Job ID",
          "Project Name",
          "Customer",
        ];
        const csvRows = (rowsToExport as TaxFilingItem[]).map((row: TaxFilingItem) => [
          `"${row.state || ""}"`,
          `"${row.dueDate || row.filedDate || ""}"`,
          `"${row.taxDue ?? row.taxPaid ?? row.amount ?? 0}"`,
          `"${row.filingFrequency || ""}"`,
          `"${typeof row.status === "object" ? row.status.label : row.status || ""}"`,
          `"${row.jobId || ""}"`,
          `"${row.projectName || ""}"`,
          `"${row.customerName || ""}"`,
        ]);
        const csvContent =
          "data:text/csv;charset=utf-8," +
          [headers.join(","), ...csvRows.map((r: string[]) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales-tax-filing-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      setDownloadMessage("Exported successfully");
      setDownloadSuccessOpen(true);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await syncMutation.mutateAsync();
    } catch (err) {
      console.warn("Sync endpoint call failed, refreshing queries:", err);
    } finally {
      await Promise.all([refetch(), refetchStats()]);
      setIsSyncing(false);
    }
  };

  // Metric trend subtitle helper
  const renderTrendSubtitle = (
    pctChange?: number,
    defaultLabel = "Based on active invoices"
  ) => {
    if (pctChange !== undefined && pctChange !== null) {
      const isPositive = pctChange >= 0;
      return (
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`font-semibold text-xs flex items-center ${
              isPositive ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 mr-0.5 inline" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-0.5 inline" />
            )}
            {isPositive ? `+${pctChange}%` : `${pctChange}%`}
          </span>
          <span className="text-gray-400 font-normal text-xs">from last month</span>
        </div>
      );
    }
    return (
      <span className="text-gray-400 font-normal text-xs">
        {defaultLabel}
      </span>
    );
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sales Tax & Filing
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track sales tax collected on invoices and manage filing by state
          </p>
          {meta?.lastSyncedAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Last synced: {format(new Date(meta.lastSyncedAt), "MMM dd, yyyy, hh:mm a")}
              </span>
              {meta.complianceStatus && (
                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium text-[10px]">
                  {meta.complianceStatus}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncNow}
            disabled={isSyncing || isFetching || isTaxFilingLoading}
            className="bg-white text-gray-700 cursor-pointer"
          >
            <RefreshCcw
              className={`w-4 h-4 mr-2 ${isSyncing || isFetching ? "animate-spin text-blue-600" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="bg-white text-gray-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-white shadow-xs">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            State
          </label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger className="bg-white w-full">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((st: string) => (
                <SelectItem key={st} value={st}>
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Project
          </label>
          <Select
            value={selectedProjectId}
            onValueChange={handleProjectChange}
            disabled={isFiltersLoading}
          >
            <SelectTrigger className="bg-white w-full">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((proj: TaxFilingFilterProject) => (
                <SelectItem key={proj.leadId} value={proj.leadId}>
                  {proj.jobId}
                  {proj.projectName ? ` - ${proj.projectName}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Date Range
          </label>
          <DateRangeFilter
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Client
          </label>
          <Select
            value={selectedClientId}
            onValueChange={handleClientChange}
            disabled={isFiltersLoading}
          >
            <SelectTrigger className="bg-white w-full">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client: TaxFilingFilterClient) => (
                <SelectItem key={client.customerId} value={client.customerId}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* 4.1 Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardV2
          title="Total Sales (Taxable)"
          isLoading={isStatsLoading}
          value={formatCurrency(
            kpiStats?.totalSalesTaxable?.value ?? tableStats?.totalTaxable
          )}
          subtitle={renderTrendSubtitle(
            kpiStats?.totalSalesTaxable?.pctChangeFromLastMonth,
            "Based on active invoices"
          )}
          icon={
            <div className="flex items-center justify-center p-1 rounded bg-purple-50 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          }
          color="purple"
        />
        <StatCardV2
          title="Total Sales Tax Collected"
          isLoading={isStatsLoading}
          value={formatCurrency(
            kpiStats?.totalSalesTaxCollected?.value ?? tableStats?.totalCollected
          )}
          subtitle={renderTrendSubtitle(
            kpiStats?.totalSalesTaxCollected?.pctChangeFromLastMonth,
            "Collected to date"
          )}
          icon={
            <div className="flex items-center justify-center p-1 rounded bg-emerald-50 text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          }
          color="green"
        />
        <StatCardV2
          title="Tax Payable by States"
          isLoading={isStatsLoading}
          value={
            kpiStats?.taxPayableByStates?.value !== undefined && kpiStats?.taxPayableByStates?.value !== null
              ? formatCurrency(kpiStats.taxPayableByStates.value)
              : tableStats?.taxPayableByStates !== undefined && tableStats?.taxPayableByStates !== null
              ? typeof tableStats.taxPayableByStates === "number" && tableStats.taxPayableByStates < 100
                ? `${tableStats.taxPayableByStates} State${tableStats.taxPayableByStates === 1 ? "" : "s"}`
                : formatCurrency(tableStats.taxPayableByStates)
              : "-"
          }
          subtitle={
            <span className="text-gray-400 font-normal text-xs">
              Requires filing action
            </span>
          }
          icon={
            <div className="flex items-center justify-center p-1 rounded bg-amber-50 text-yellow-600">
              <Handbag className="w-4 h-4" />
            </div>
          }
          color="yellow"
        />
        <StatCardV2
          title="Filed VS Unfiled Tax"
          isLoading={isStatsLoading}
          value={
            <div className="flex flex-col text-sm font-semibold space-y-1 mt-1">
              <span className="text-emerald-600">
                Filed: {kpiStats?.fileVsUnfiledTax?.filed !== undefined
                  ? formatCurrency(kpiStats.fileVsUnfiledTax.filed)
                  : tableStats?.filed ?? "-"}
              </span>
              <span className="text-rose-500">
                Unfiled: {kpiStats?.fileVsUnfiledTax?.unfiled !== undefined
                  ? formatCurrency(kpiStats.fileVsUnfiledTax.unfiled)
                  : tableStats?.unfiled ?? "-"}
              </span>
            </div>
          }
          subtitle=""
          icon={
            <div className="flex items-center justify-center p-1 rounded bg-rose-50 text-red-500">
              <Hourglass className="w-4 h-4" />
            </div>
          }
          color="red"
        />
      </div>

      {/* 4.3 Tabs and Content */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-0 gap-4">
          <div className="flex space-x-8">
            {(["Pending Filing", "Filing History"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`pb-3 text-sm font-semibold relative transition-colors ${
                  activeTab === tab
                    ? "text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {tab === "Pending Filing" && pendingFiling.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                    {pendingFiling.length}
                  </span>
                )}
                {tab === "Filing History" && filingHistory.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                    {filingHistory.length}
                  </span>
                )}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700" />
                )}
              </button>
            ))}
          </div>
          <div className="pb-2 sm:pb-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search state, project or client..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-9 w-full sm:w-72 rounded-md border border-input bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {activeTab === "Pending Filing" ? (
          <PendingFilingTab
            rows={pendingFiling}
            isLoading={isTaxFilingLoading}
            page={page}
            limit={limit}
            total={totalCount}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onReviewDetails={handleReviewDetails}
            onPrepareFiling={handlePrepareFiling}
            onPayTax={handlePayTax}
            onMarkFiled={handleMarkFiled}
          />
        ) : (
          <FilingHistoryTab
            rows={filingHistory}
            isLoading={isTaxFilingLoading}
            page={page}
            limit={limit}
            total={totalCount}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onDownload={handleDownloadItem}
            onViewDetails={handleReviewDetails}
          />
        )}
      </div>

      {/* Review Details / Prepare Filing Sheet */}
      {selectedTaxItem && (
        <TaxDetailsSheet
          key={selectedTaxItem.taxRecordId || selectedTaxItem._id || "sales-tax-sheet"}
          state={selectedTaxItem.state}
          status={
            typeof selectedTaxItem.status === "object"
              ? selectedTaxItem.status.label
              : selectedTaxItem.status || "Pending"
          }
          isOpen={isSheetOpen}
          onOpenChange={handleSheetOpenChange}
          item={selectedTaxItem}
          isPrepareMode={isPrepareMode}
          onSuccess={async () => {
            await Promise.all([refetch(), refetchStats()]);
          }}
        />
      )}

      {/* Direct Pay Tax Dialog from Table Row */}
      {selectedTaxItem && (
        <TaxPaymentDialog
          taxId={selectedTaxItem.taxRecordId || selectedTaxItem._id}
          state={selectedTaxItem.stateLabel || selectedTaxItem.state}
          amount={selectedTaxItem.taxDue ?? selectedTaxItem.payable ?? selectedTaxItem.amount ?? 0}
          filingPeriod={selectedTaxItem.filingPeriod}
          dueDate={selectedTaxItem.dueDate}
          daysUntilDue={selectedTaxItem.daysUntilDue}
          isOpen={isPayDialogOpen}
          onOpenChange={(open) => {
            setIsPayDialogOpen(open);
            if (!open && !isSheetOpen) {
              setSelectedTaxItem(null);
            }
          }}
          onSuccess={async () => {
            await Promise.all([refetch(), refetchStats()]);
          }}
        />
      )}



      {/* Success Notification Dialog */}
      <SuccessDialog
        open={downloadSuccessOpen}
        onClose={() => setDownloadSuccessOpen(false)}
        title={downloadMessage}
        okLabel="Close"
      />
    </div>
  );
}
