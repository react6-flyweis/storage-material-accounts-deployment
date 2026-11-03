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
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TaxDetailsSheet from "@/components/payments/tax-details-sheet";
import StatCardV2 from "@/components/ui/stat-card-v2";
import DateRangeFilter from "@/components/ui/date-range-filter";
import {
  useProjectWiseTaxQuery,
  useProjectWiseTaxStatsQuery,
  useExportProjectWiseTaxMutation,
  useSyncProjectWiseTaxMutation,
} from "@/modules/payments/payments.hooks";
import {
  useBudgetVsActualProjectsQuery,
  useExpensesFiltersQuery,
} from "@/modules/financials/financials.hooks";
import {
  type ProjectWiseTaxItem,
  type TaxFilingItem,
} from "@/modules/payments/payments.api";

const AVATAR_COLORS = [
  "bg-blue-900",
  "bg-orange-500",
  "bg-blue-700",
  "bg-yellow-500",
  "bg-blue-800",
  "bg-purple-700",
  "bg-emerald-700",
  "bg-indigo-700",
];

function getAvatarColor(name: string, index: number) {
  if (!name) return AVATAR_COLORS[index % AVATAR_COLORS.length];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatDateDisplay(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, "dd/MM/yyyy");
  } catch {
    return dateStr;
  }
}

const ChangeText = ({ value }: { value?: number }) => {
  if (value === undefined || value === null || isNaN(value)) {
    return (
      <span className="text-gray-400 font-normal text-xs">
        from last month
      </span>
    );
  }
  const isPositive = value >= 0;
  return (
    <span
      className={`flex items-center font-medium text-xs ${
        isPositive ? "text-emerald-500" : "text-rose-500"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3 mr-1" />
      ) : (
        <TrendingDown className="w-3 h-3 mr-1" />
      )}
      {isPositive ? `+${value}%` : `${value}%`}{" "}
      <span className="text-gray-400 font-normal ml-1">from last month</span>
    </span>
  );
};

export default function ProjectWiseTax() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<RDateRange | undefined>(undefined);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPrepareMode, setIsPrepareMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    state: string;
    status: string;
    item?: TaxFilingItem;
  } | null>(null);

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
    page,
    limit,
    projectId: activeProjectId,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  const statsParams = {
    projectId: activeProjectId,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  // 7.2 Table query
  const { data, isLoading, isFetching, isError, refetch } =
    useProjectWiseTaxQuery(queryParams);

  // 7.1 Stats query
  const {
    data: statsRes,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    refetch: refetchStats,
  } = useProjectWiseTaxStatsQuery(statsParams);

  // 7.3 Export mutation
  const exportMutation = useExportProjectWiseTaxMutation();
  const syncMutation = useSyncProjectWiseTaxMutation();
  const [isSyncing, setIsSyncing] = useState(false);

  const projects = useMemo<ProjectWiseTaxItem[]>(
    () => data?.data?.projects || [],
    [data?.data?.projects]
  );
  const totalItems: number = data?.data?.total || 0;
  const totalPages: number = Math.max(1, Math.ceil(totalItems / limit));

  const statsData = statsRes?.data;

  const finalTaxCollected =
    statsData?.totalTaxCollected?.value ?? 0;

  const finalPaid =
    statsData?.totalPaid?.value ?? 0;

  const finalPayable =
    statsData?.totalPayable?.value ?? 0;

  const finalPendingCount =
    statsData?.pendingFiling?.count ?? 0;

  const pendingLabel =
    statsData?.pendingFiling?.label || "Requires Filing";

  const nextDueDateDisplay = statsData?.nextFilingDue?.date
    ? formatDateDisplay(statsData.nextFilingDue.date)
    : "-";

  const nextDueLocationDisplay =
    statsData?.nextFilingDue?.location || "-";

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await syncMutation.mutateAsync();
    } catch (err) {
      console.warn("Sync project tax endpoint failed, refreshing local data:", err);
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
        `Project_Wise_Tax_Report_${format(new Date(), "yyyyMMdd")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleOpenSheet = (
    row: ProjectWiseTaxItem,
    prepare: boolean = false
  ) => {
    const resolvedTaxId = row.taxRecordId || row.taxId;
    if (!resolvedTaxId) return;

    const statusLabel =
      typeof row.status === "object"
        ? row.status.label
        : row.status || "Pending";
    const stateName = row.location || "Texas";

    const taxItem: TaxFilingItem = {
      _id: resolvedTaxId,
      taxRecordId: resolvedTaxId,
      state: stateName,
      stateLabel: stateName,
      salesTaxRateLabel: row.salesTaxRateLabel,
      filingFrequency: "monthly",
      dueDate: row.dueDate || "",
      amount: row.payable ?? row.taxCollected ?? 0,
      payable: row.payable,
      taxDue: row.payable ?? row.taxCollected ?? 0,
      status: row.status,
      leadId: row.leadId,
      projectName: row.projectName,
      jobId: row.jobId,
      customerName: row.customerName,
      createdAt: "",
      updatedAt: "",
    };

    setSelectedProject({
      state: stateName,
      status: statusLabel,
      item: taxItem,
    });
    setIsPrepareMode(prepare);
    setIsSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setSelectedProject(null);
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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page, "...", totalPages);
      }
    }
    return pages;
  };

  const startRecordIndex = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endRecordIndex = Math.min(page * limit, totalItems);

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">
            Project Wise Tax
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review file and pay sales tax by project, all payments are processed
            securely through our integrated tax provider.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-white text-gray-700 border-gray-200 cursor-pointer"
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

      {/* Filters and Sync Header */}
      <Card className="p-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-none shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5 w-64">
            <label className="text-sm font-medium text-gray-700">Project</label>
            <Select
              value={selectedProjectId}
              onValueChange={(val) => {
                setSelectedProjectId(val);
                setPage(1);
              }}
              disabled={isProjectsLoading}
            >
              <SelectTrigger className="bg-white w-full">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projectOptions.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 w-70">
            <label className="text-sm font-medium text-gray-700">
              Date Range
            </label>
            <DateRangeFilter
              value={dateRange}
              onChange={(range?: RDateRange) => {
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
              className={`w-4 h-4 ml-2 ${isSyncing || isFetching || isStatsFetching ? "animate-spin text-blue-600" : ""}`}
            />
          </Button>
        </div>
      </Card>

      {/* 7.1 Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCardV2
          title="Total Tax Collected"
          isLoading={isStatsLoading}
          value={formatCurrency(finalTaxCollected)}
          subtitle={
            <ChangeText
              value={statsData?.totalTaxCollected?.pctChangeFromLastMonth}
            />
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
            <ChangeText value={statsData?.totalPaid?.pctChangeFromLastMonth} />
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
            <ChangeText
              value={statsData?.totalPayable?.pctChangeFromLastMonth}
            />
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
              {finalPendingCount}{" "}
              {finalPendingCount === 1 ? "Project" : "Projects"}
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
          value={<span className="text-xl font-bold">{nextDueDateDisplay}</span>}
          subtitle={
            nextDueLocationDisplay && nextDueLocationDisplay !== "-" ? (
              <span className="text-emerald-500 text-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {nextDueLocationDisplay}
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

      {/* 7.2 Main Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900 text-lg">
            Project wise tax overview
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-[#f8fafc]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="font-semibold text-gray-900 h-11">
                Project
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
                Due Date ▾
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
                <TableRow key={`project-skel-${idx}`} className="border-b">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
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
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-red-500 text-sm"
                >
                  Failed to load project tax data. Please try syncing again.
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-gray-500 text-sm"
                >
                  No project tax records found.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((row, idx) => {
                const displayName =
                  row.projectName?.trim() ||
                  row.jobId ||
                  row.customerName ||
                  "Unnamed Project";
                const initialLetter = displayName.charAt(0).toUpperCase();

                const secondaryInfo = [
                  row.jobId,
                  row.location ||
                    (row.customerName ? `Customer: ${row.customerName}` : null),
                ]
                  .filter(Boolean)
                  .join(" • ");

                const isPayablePositive = (row.payable || 0) > 0;
                const statusStr =
                  typeof row.status === "object"
                    ? (row.status.label || row.status.code || "").toLowerCase()
                    : (row.status?.toLowerCase() || "");
                const isPendingOrDue =
                  statusStr.includes("due") ||
                  statusStr.includes("pending") ||
                  isPayablePositive;

                const canPay = row.showPayTax ?? isPendingOrDue;

                const hasTaxRecordId = Boolean(
                  row.taxRecordId || row.taxId
                );

                return (
                  <TableRow
                    key={row.taxRecordId || row.leadId || idx}
                    className="border-b last:border-none hover:bg-gray-50/50"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                            displayName,
                            (page - 1) * limit + idx
                          )}`}
                        >
                          <span className="text-xs font-bold">
                            {initialLetter}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {displayName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {secondaryInfo || "-"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {formatCurrency(row.taxCollected)}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {formatCurrency(row.taxableSales)}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {formatCurrency(row.paidFiled)}
                    </TableCell>
                    <TableCell
                      className={`py-4 font-medium ${
                        isPayablePositive
                          ? "text-red-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {formatCurrency(row.payable)}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {formatDateDisplay(row.dueDate)}
                    </TableCell>
                    <TableCell className="py-4">
                      {getStatusBadge(row.status)}
                    </TableCell>
                    <TableCell className="py-4">
                      {!hasTaxRecordId ? (
                        <span className="text-xs text-slate-400 font-medium">-</span>
                      ) : canPay ? (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium px-4 cursor-pointer"
                          onClick={() => handleOpenSheet(row, true)}
                        >
                          Pay Tax
                        </Button>
                      ) : (
                        <button
                          type="button"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 px-2 cursor-pointer"
                          onClick={() => handleOpenSheet(row, false)}
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

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-3">
          <div className="flex items-center text-sm text-gray-500">
            Showing
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-18 mx-2 bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            Results ({startRecordIndex}-{endRecordIndex} of {totalItems})
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-400 rounded-md border-gray-200 cursor-pointer disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((pageNum, idx) =>
              pageNum === "..." ? (
                <div
                  key={`ellipsis-${idx}`}
                  className="px-2 text-gray-400 flex items-center justify-center h-8"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  key={`page-${pageNum}`}
                  variant="outline"
                  className={`h-8 w-8 p-0 rounded-md cursor-pointer ${
                    pageNum === page
                      ? "border-blue-600 text-blue-600 font-medium"
                      : "text-gray-600 border-none hover:bg-gray-50"
                  }`}
                  onClick={() => setPage(pageNum as number)}
                >
                  {pageNum}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-600 rounded-md border-gray-200 cursor-pointer disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Controlled Tax Details Sheet (Action: View Details / Pay Tax) */}
      {selectedProject && (
        <TaxDetailsSheet
          key={selectedProject.item?.taxRecordId || selectedProject.item?._id || "project-tax-sheet"}
          state={selectedProject.state}
          status={selectedProject.status}
          isOpen={isSheetOpen}
          onOpenChange={handleSheetOpenChange}
          item={selectedProject.item}
          isPrepareMode={isPrepareMode}
          onSuccess={handleSyncNow}
        />
      )}
    </div>
  );
}
