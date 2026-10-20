import { useMemo, useState } from "react";
import { format, isValid } from "date-fns";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  RefreshCcw,
  DollarSign,
  ShoppingBag,
  Handbag,
  Hourglass,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TaxDetailsSheet from "@/components/payments/tax-details-sheet";
import StatCardV2 from "@/components/ui/stat-card-v2";
import DateRangeFilter from "@/components/ui/date-range-filter";
import UpcomingFilingDeadlines from "@/components/payments/upcoming-filing-deadlines";
import {
  useStateWiseTaxQuery,
  useStateWiseTaxStatsQuery,
  useExportStateWiseTaxMutation,
  useSyncStateWiseTaxMutation,
} from "@/modules/payments/payments.hooks";
import {
  useBudgetVsActualProjectsQuery,
  useExpensesFiltersQuery,
} from "@/modules/financials/financials.hooks";
import {
  getTaxFilingProvider,
  type StateOverviewItem,
} from "@/modules/payments/payments.api";

const STATE_COLORS: Record<string, string> = {
  TX: "bg-blue-900",
  Texas: "bg-blue-900",
  CA: "bg-orange-500",
  California: "bg-orange-500",
  NY: "bg-blue-700",
  "New York": "bg-blue-700",
  FL: "bg-emerald-700",
  Florida: "bg-emerald-700",
  AZ: "bg-yellow-500",
  Arizona: "bg-yellow-500",
  NV: "bg-blue-800",
  Nevada: "bg-blue-800",
};

const DEFAULT_COLOR_PALETTE = [
  "bg-blue-900",
  "bg-orange-500",
  "bg-blue-700",
  "bg-yellow-500",
  "bg-blue-800",
  "bg-purple-700",
  "bg-emerald-700",
  "bg-indigo-700",
];

function getStateColor(stateName: string, index: number) {
  if (STATE_COLORS[stateName]) return STATE_COLORS[stateName];
  return DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length];
}

function formatCurrency(val?: number) {
  if (val === undefined || val === null || isNaN(val)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatDateDisplay(dateStr?: string) {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  if (!isValid(dateObj)) return dateStr;
  return format(dateObj, "MMM dd, yyyy");
}

const TrendText = ({ value }: { value?: number }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  return (
    <span
      className={`flex items-center font-medium ${
        isPositive ? "text-emerald-500" : "text-rose-500"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3 mr-1" />
      ) : (
        <TrendingDown className="w-3 h-3 mr-1" />
      )}
      {Math.abs(value)}%{" "}
      <span className="text-gray-400 font-normal ml-1">from last month</span>
    </span>
  );
};

export default function StateWiseTax() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTaxItem, setSelectedTaxItem] = useState<{
    taxRecordId?: string;
    state: string;
    status: string;
    payable?: number;
    salesTaxRateLabel?: string;
  } | null>(null);
  const [isPrepareMode, setIsPrepareMode] = useState(false);

  // Fetch project options from budget vs actual and expenses filters
  const { data: bvaProjectsData, isLoading: isBvaLoading } =
    useBudgetVsActualProjectsQuery();
  const { data: filtersData, isLoading: isFiltersLoading } =
    useExpensesFiltersQuery();

  const isProjectsLoading = isBvaLoading || isFiltersLoading;

  // Build unified project options list
  const projectOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; jobId?: string }>();

    const bvaList = bvaProjectsData?.data?.projects || [];
    for (const p of bvaList) {
      if (p._id) {
        map.set(p._id, {
          id: p._id,
          name: p.projectName || "",
          jobId: p.jobId || "",
        });
      }
    }

    const filterProjects = filtersData?.data?.projects || [];
    for (const p of filterProjects) {
      if (p.leadId) {
        const existing = map.get(p.leadId);
        map.set(p.leadId, {
          id: p.leadId,
          name: p.projectName || existing?.name || "",
          jobId: p.jobId || existing?.jobId || "",
        });
      }
    }

    return Array.from(map.values()).map((p) => {
      const displayLabel = p.name
        ? p.jobId
          ? `${p.name} (${p.jobId})`
          : p.name
        : p.jobId || p.id;
      return {
        id: p.id,
        label: displayLabel,
      };
    });
  }, [bvaProjectsData, filtersData]);

  const startDateStr = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined;
  const endDateStr = dateRange?.to
    ? format(dateRange.to, "yyyy-MM-dd")
    : undefined;
  const activeProjectId =
    selectedProjectId !== "all" ? selectedProjectId : undefined;

  const queryParams = {
    projectId: activeProjectId,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  const statsParams = {
    projectId: activeProjectId,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  // 6.2 Table and main response
  const { data, isLoading, isFetching, isError, refetch } =
    useStateWiseTaxQuery(queryParams);

  // 6.1 Stats Row response
  const {
    data: statsRes,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    refetch: refetchStats,
  } = useStateWiseTaxStatsQuery(statsParams);

  // 6.4 Export mutation
  const exportMutation = useExportStateWiseTaxMutation();
  const syncMutation = useSyncStateWiseTaxMutation();
  const [isSyncing, setIsSyncing] = useState(false);

  const stateOverview = useMemo<StateOverviewItem[]>(
    () => data?.data?.stateOverview || [],
    [data?.data?.stateOverview]
  );
  const statsData = statsRes?.data;
  const apiMainStats = data?.data?.stats;

  // Pagination for state table
  const totalItems = stateOverview.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const paginatedStates = useMemo(() => {
    const start = (page - 1) * limit;
    return stateOverview.slice(start, start + limit);
  }, [stateOverview, page, limit]);

  const finalTaxCollected =
    statsData?.totalTaxCollected?.value ??
    apiMainStats?.totalTaxCollected ??
    0;

  const finalPaid =
    statsData?.totalPaid?.value ??
    apiMainStats?.totalPaid ??
    0;

  const finalPayable =
    statsData?.totalPayable?.value ??
    apiMainStats?.totalPayable ??
    0;

  const finalPendingCount =
    statsData?.pendingFilingStates?.count ??
    apiMainStats?.pendingFilingStates ??
    0;

  const pendingLabel =
    statsData?.pendingFilingStates?.label || "Requires Filing";

  const nextDueDateDisplay = statsData?.nextFilingDue?.date
    ? formatDateDisplay(statsData.nextFilingDue.date)
    : apiMainStats?.nextFilingDue
    ? formatDateDisplay(apiMainStats.nextFilingDue)
    : "-";

  const nextDueStateDisplay =
    statsData?.nextFilingDue?.state || "-";

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await syncMutation.mutateAsync();
    } catch (err) {
      console.warn("Sync state tax endpoint failed, refreshing local data:", err);
    } finally {
      await Promise.all([refetch(), refetchStats()]);
      setLastSyncedTime(new Date());
      setIsSyncing(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        projectId: activeProjectId,
        startDate: startDateStr,
        endDate: endDateStr,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `State_Wise_Tax_Report_${format(new Date(), "yyyyMMdd")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleOpenSheet = async (
    stateName: string,
    statusVal?: string | { code: string; label: string; tone?: string },
    taxRecordId?: string,
    payable?: number,
    salesTaxRateLabel?: string,
    prepare: boolean = false
  ) => {
    let resolvedTaxId = taxRecordId;

    if (!resolvedTaxId) {
      try {
        const res = await getTaxFilingProvider({ state: stateName, limit: 1 });
        const match = res?.data?.pendingFiling?.[0] || res?.data?.filingHistory?.[0];
        resolvedTaxId = match?._id;
      } catch (err) {
        console.warn("Could not resolve taxRecordId fallback for state", stateName, err);
      }
    }

    const statusStr =
      typeof statusVal === "object" ? statusVal.label : statusVal || "Pending";
    setSelectedTaxItem({
      taxRecordId: resolvedTaxId,
      state: stateName,
      status: statusStr,
      payable,
      salesTaxRateLabel,
    });
    setIsPrepareMode(prepare);
    setIsSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setSelectedTaxItem(null);
    }
  };

  const getStatusBadge = (
    status?: string | { code: string; label: string; tone?: string }
  ) => {
    if (!status) return <span className="text-gray-400 text-sm">-</span>;
    const label = typeof status === "object" ? status.label : status;
    const tone = typeof status === "object" ? status.tone : undefined;
    const s = label?.toLowerCase().trim() || "";

    if (
      tone === "warning" ||
      s.includes("due") ||
      s.includes("pending")
    ) {
      return (
        <Badge className="bg-orange-400 hover:bg-orange-500 text-white font-normal rounded-sm">
          {label}
        </Badge>
      );
    }
    if (tone === "success" || s.includes("filed") || s.includes("paid")) {
      return (
        <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white font-normal rounded-sm px-3">
          {label}
        </Badge>
      );
    }
    if (s.includes("no due") || s.includes("none")) {
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-normal rounded-sm">
          {label}
        </Badge>
      );
    }
    return <Badge>{label}</Badge>;
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">State wise Tax</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review file and pay sales tax by state, all payments are processed
            securely through our integrated tax provider.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-white text-gray-700 border-gray-200"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {exportMutation.isPending ? "Exporting..." : "Export"}
        </Button>
      </div>

      {/* Filters and Sync */}
      <Card className="p-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-none shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5 w-60">
            <label className="text-sm font-medium text-gray-700">Project</label>
            <Select
              value={selectedProjectId}
              onValueChange={(val) => {
                setSelectedProjectId(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-white w-full">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {isProjectsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading projects...
                  </SelectItem>
                ) : (
                  projectOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 w-70">
            <label className="text-sm font-medium text-gray-700">
              Date Range
            </label>
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            Last Synced:{" "}
            {data?.data?.lastSynced
              ? format(new Date(data.data.lastSynced), "MMM dd, yyyy HH:mm")
              : format(lastSyncedTime, "MMM dd, yyyy HH:mm")}{" "}
            <span className="text-emerald-500 font-medium capitalize">
              {data?.data?.meta?.syncState || "Synced"}
            </span>
          </div>
          <Button
            variant="outline"
            className="bg-white border-gray-200 text-gray-700 cursor-pointer"
            onClick={handleSyncNow}
            disabled={isSyncing || isFetching || isStatsFetching}
          >
            {isSyncing ? "Syncing..." : "Sync Now"}
            <RefreshCcw
              className={`w-4 h-4 ml-2 ${
                isSyncing || isFetching || isStatsFetching ? "animate-spin text-blue-600" : ""
              }`}
            />
          </Button>
        </div>
      </Card>

      {/* 6.1 Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCardV2
          title="Total Tax Collected"
          isLoading={isStatsLoading}
          value={formatCurrency(finalTaxCollected)}
          subtitle={
            statsData?.totalTaxCollected?.pctChangeFromLastMonth !==
            undefined ? (
              <TrendText
                value={statsData.totalTaxCollected.pctChangeFromLastMonth}
              />
            ) : undefined
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-purple-200 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          }
          color="purple"
        />
        <StatCardV2
          title="Total Paid"
          isLoading={isStatsLoading}
          value={formatCurrency(finalPaid)}
          subtitle={
            statsData?.totalPaid?.pctChangeFromLastMonth !== undefined ? (
              <TrendText value={statsData.totalPaid.pctChangeFromLastMonth} />
            ) : undefined
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-emerald-200 text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          }
          color="green"
        />
        <StatCardV2
          title="Total Payable"
          isLoading={isStatsLoading}
          value={formatCurrency(finalPayable)}
          subtitle={
            statsData?.totalPayable?.pctChangeFromLastMonth !== undefined ? (
              <TrendText
                value={statsData.totalPayable.pctChangeFromLastMonth}
              />
            ) : undefined
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-amber-200 text-yellow-600">
              <Handbag className="w-4 h-4" />
            </div>
          }
          color="yellow"
        />
        <StatCardV2
          title="Pending Filing"
          isLoading={isStatsLoading}
          value={
            <span className="text-xl font-bold">
              {finalPendingCount} State{finalPendingCount === 1 ? "" : "s"}
            </span>
          }
          subtitle={
            <span className="text-gray-500 text-sm">{pendingLabel}</span>
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-rose-200 text-red-500">
              <Hourglass className="w-4 h-4" />
            </div>
          }
          color="red"
        />
        <StatCardV2
          title="Next Filing Due"
          isLoading={isStatsLoading}
          value={
            <span className="text-xl font-bold">{nextDueDateDisplay}</span>
          }
          subtitle={
            nextDueStateDisplay && nextDueStateDisplay !== "-" ? (
              <span className="text-emerald-500 text-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {nextDueStateDisplay}
              </span>
            ) : undefined
          }
          icon={
            <div className="flex items-center justify-center p-1.5 rounded-md border border-purple-200 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          }
          color="purple"
        />
      </div>

      {/* 6.2 Main Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">
            State wise tax overview
          </h3>
          {isFetching && !isLoading && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Updating...
            </span>
          )}
        </div>

        {isError ? (
          <div className="flex flex-col items-center justify-center p-12 text-rose-500 space-y-3">
            <p>Failed to load state-wise tax data.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f8fafc]">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="font-semibold text-gray-900 h-11">
                  State
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Tax Collected
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Taxable Sales
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Paid/Filed
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Payable
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Due Date
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-900 h-11">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={`state-skel-${idx}`} className="border-b">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-6 w-20 rounded-md" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedStates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No tax data available for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStates.map((row, idx) => {
                  const stateCode =
                    row.state || row.stateLabel || row._id || "-";
                  const stateName =
                    row.stateLabel || row.state || row._id || "-";
                  const rateLabel =
                    row.salesTaxRateLabel || row.rate || "-";
                  const avatarColor = getStateColor(
                    stateCode,
                    (page - 1) * limit + idx
                  );
                  const isPayablePositive = Number(row.payable) > 0;
                  const statusStr =
                    typeof row.status === "object"
                      ? (row.status.label || row.status.code || "").toLowerCase()
                      : (row.status?.toLowerCase() || "");
                  const isPendingOrDue =
                    statusStr.includes("due") ||
                    statusStr.includes("pending") ||
                    isPayablePositive;
                  const taxRecordId = row.taxRecordId || row._id;

                  return (
                    <TableRow
                      key={taxRecordId || idx}
                      className="border-b last:border-none hover:bg-gray-50/50"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${avatarColor}`}
                          >
                            <span className="text-xs font-bold">
                              {stateCode.charAt(0)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {stateName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {rateLabel}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-gray-700">
                        {formatCurrency(row.taxCollected)}
                      </TableCell>
                      <TableCell className="py-4 text-gray-700">
                        {formatCurrency(row.taxableSales)}
                      </TableCell>
                      <TableCell className="py-4 text-gray-700">
                        {formatCurrency(row.paidFiled)}
                      </TableCell>
                      <TableCell
                        className={`py-4 font-medium ${
                          isPayablePositive ? "text-red-500" : "text-emerald-500"
                        }`}
                      >
                        {formatCurrency(row.payable)}
                      </TableCell>
                      <TableCell className="py-4 text-gray-500">
                        {formatDateDisplay(row.dueDate || row.nextDue)}
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(row.status)}
                      </TableCell>
                      <TableCell className="py-4">
                        {!taxRecordId ? (
                          <span className="text-xs text-slate-400 font-medium">-</span>
                        ) : isPendingOrDue ? (
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium px-4 cursor-pointer"
                            onClick={() =>
                              handleOpenSheet(
                                stateName,
                                row.status,
                                taxRecordId,
                                row.payable,
                                rateLabel,
                                true
                              )
                            }
                          >
                            Pay Tax
                          </Button>
                        ) : (
                          <button
                            type="button"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 px-2 cursor-pointer"
                            onClick={() =>
                              handleOpenSheet(
                                stateName,
                                row.status,
                                taxRecordId,
                                row.payable,
                                rateLabel,
                                false
                              )
                            }
                          >
                            View Details
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center text-sm text-gray-500">
            Showing
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-16 mx-2 bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            Results
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-400 rounded-md border-gray-200"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <Button
                key={pNum}
                variant="outline"
                className={`h-8 w-8 p-0 rounded-md ${
                  pNum === page
                    ? "border-blue-600 text-blue-600 font-medium"
                    : "text-gray-600 border-none hover:bg-gray-50"
                }`}
                onClick={() => setPage(pNum)}
              >
                {pNum}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-600 rounded-md border-gray-200"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 6.3 Upcoming Filing Deadlines */}
      <UpcomingFilingDeadlines
        projectId={activeProjectId}
        limit={6}
        onSelectDeadline={(taxRecordId, stateName, status) => {
          handleOpenSheet(
            stateName,
            status || "Pending",
            taxRecordId,
            undefined,
            undefined,
            false
          );
        }}
      />

      {/* Controlled Tax Details Sheet (Action: View Details / Pay Tax) */}
      {selectedTaxItem && (
        <TaxDetailsSheet
          key={selectedTaxItem.taxRecordId || selectedTaxItem.state || "state-tax-sheet"}
          state={selectedTaxItem.state}
          status={selectedTaxItem.status}
          isOpen={isSheetOpen}
          onOpenChange={handleSheetOpenChange}
          isPrepareMode={isPrepareMode}
          item={
            selectedTaxItem.taxRecordId
              ? {
                  _id: selectedTaxItem.taxRecordId,
                  state: selectedTaxItem.state,
                  stateLabel: selectedTaxItem.state,
                  salesTaxRateLabel: selectedTaxItem.salesTaxRateLabel,
                  status: selectedTaxItem.status,
                  payable: selectedTaxItem.payable,
                  taxDue: selectedTaxItem.payable,
                  amount: selectedTaxItem.payable,
                }
              : null
          }
          onSuccess={handleSyncNow}
        />
      )}
    </div>
  );
}
