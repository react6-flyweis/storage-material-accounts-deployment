import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TaxFilingItem } from "@/modules/payments/payments.api";

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

function getAvatarColor(name?: string) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
}

function formatDate(dateStr?: string | null, pattern: string = "dd/MM/yyyy") {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return "-";
    return format(d, pattern);
  } catch {
    return "-";
  }
}

function formatPeriod(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return "-";
    return format(d, "MMM yyyy");
  } catch {
    return "-";
  }
}

function getDueInText(dueDateStr?: string | null) {
  if (!dueDateStr) return "-";
  try {
    const due = new Date(dueDateStr);
    if (!isValid(due)) return "-";
    const now = new Date();
    // Normalize to start of day for comparison
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = dueDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return `In ${diffDays} Days`;
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === 0) return "Due Today";
    return `Overdue by ${Math.abs(diffDays)} Days`;
  } catch {
    return "-";
  }
}

const getStatusBadge = (status?: string | { code: string; label: string; tone?: string }) => {
  if (!status) return <span className="text-gray-400 text-sm">-</span>;
  const label = typeof status === "object" ? status.label : status;
  const tone = typeof status === "object" ? status.tone : undefined;
  const s = label.toLowerCase().trim();

  if (
    tone === "warning" ||
    s === "due soon" ||
    s === "due_soon" ||
    s === "payment due" ||
    s === "payment_due"
  ) {
    return (
      <Badge className="bg-orange-400 hover:bg-orange-500 text-white font-normal rounded-sm">
        {label}
      </Badge>
    );
  }
  if (tone === "success" || s === "filed" || s === "paid" || s === "no tax due" || s === "no_tax_due") {
    return (
      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-normal rounded-sm capitalize">
        {label}
      </Badge>
    );
  }
  if (tone === "danger" || s === "overdue") {
    return (
      <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-normal rounded-sm">
        {label}
      </Badge>
    );
  }
  if (s === "pending") {
    return (
      <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white font-normal rounded-sm">
        {label}
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-500 text-white font-normal rounded-sm capitalize">
      {label}
    </Badge>
  );
};

type PaginationFooterProps = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export function PaginationFooter({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

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

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-3 bg-white">
      <div className="flex items-center text-sm text-gray-500">
        <span>Showing</span>
        <Select
          value={limit.toString()}
          onValueChange={(val) => {
            onLimitChange(Number(val));
            onPageChange(1);
          }}
        >
          <SelectTrigger className="h-8 mx-2 bg-white w-18">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span>
          Results ({total > 0 ? (page - 1) * limit + 1 : 0} -{" "}
          {Math.min(page * limit, total)} of {total})
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 text-gray-600 disabled:text-gray-300 rounded-md border-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {getPageNumbers().map((p, idx) =>
          typeof p === "number" ? (
            <Button
              key={idx}
              variant="outline"
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 p-0 rounded-md text-xs font-medium ${page === p
                ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                : "text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
            >
              {p}
            </Button>
          ) : (
            <span key={idx} className="px-1 text-gray-400 text-xs">
              ...
            </span>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 text-gray-600 disabled:text-gray-300 rounded-md border-gray-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function PendingFilingTab({
  rows,
  isLoading = false,
  page = 1,
  limit = 10,
  total = 0,
  onPageChange,
  onLimitChange,
  onReviewDetails,
  onPrepareFiling,
  onPayTax,
  onMarkFiled,
}: {
  rows: TaxFilingItem[];
  isLoading?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onReviewDetails?: (item: TaxFilingItem) => void;
  onPrepareFiling?: (item: TaxFilingItem) => void;
  onPayTax?: (item: TaxFilingItem) => void;
  onMarkFiled?: (item: TaxFilingItem) => void;
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden shadow-xs">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Pending Filings</h3>
        <span className="text-xs text-gray-500 font-medium">
          {rows.length} pending record{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#f8fafc]">
            <TableRow className="border-none">
              <TableHead className="font-semibold text-gray-600 h-11">State</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Filing Period</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Due Date ▾</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Tax Due</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Status</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`pending-skel-${idx}`} className="border-b">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  No pending filings found for the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const stateDisplay = row.stateLabel || row.state || "-";
                const leadProjectText = row.jobId
                  ? `${row.jobId}${row.projectName ? ` • ${row.projectName}` : ""}`
                  : typeof row.leadId === "object" && row.leadId?.jobId
                  ? `${row.leadId.jobId}${row.leadId.projectName ? ` • ${row.leadId.projectName}` : ""}`
                  : row.salesTaxRateLabel || row.threshold || "-";
                const periodText = row.filingPeriod || formatPeriod(row.dueDate);
                const dueInText =
                  row.daysUntilDueLabel ||
                  (row.daysUntilDue !== undefined
                    ? `In ${row.daysUntilDue} Days`
                    : getDueInText(row.dueDate));
                const amountVal = row.taxDue ?? row.payable ?? row.amount;
                const statusStr =
                  typeof row.status === "object"
                    ? (row.status?.label || row.status?.code || "").toLowerCase()
                    : (row.status || "").toLowerCase();
                const isNoTaxDue = statusStr === "no tax due" || statusStr === "no_tax_due";

                return (
                  <TableRow
                    key={row._id}
                    className="border-b last:border-none hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                            stateDisplay
                          )}`}
                        >
                          <span className="text-xs font-bold">
                            {stateDisplay.charAt(0) || "T"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{stateDisplay}</span>
                          <span className="text-xs text-gray-500">
                            {leadProjectText}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {periodText}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {row.filingFrequency || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {formatDate(row.dueDate)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dueInText}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-gray-900 font-semibold text-sm">
                      {formatCurrency(amountVal)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {getStatusBadge(row.status)}
                        {row.isPrepared || row.prepared ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded"
                            title={row.preparedAt ? `Prepared at ${formatDate(row.preparedAt, "MMM dd, yyyy hh:mm a")}` : "Prepared"}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            Prepared
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                            Not prepared
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        {isNoTaxDue ? (
                          <button
                            type="button"
                            onClick={() => onReviewDetails?.(row)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            View Details
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onReviewDetails?.(row)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Review Details
                            </button>
                            <Button
                              type="button"
                              size="sm"
                              variant={row.isPrepared || row.prepared ? "outline" : "default"}
                              onClick={() => onPrepareFiling?.(row)}
                              className={`h-8 text-xs px-2.5 cursor-pointer whitespace-nowrap ${
                                row.isPrepared || row.prepared
                                  ? "border-blue-300 text-blue-700 hover:bg-blue-50"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                            >
                              {row.isPrepared || row.prepared ? "Prepared" : "Prepare Filing"}
                            </Button>
                            {onPayTax && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => onPayTax(row)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs px-2.5 font-medium cursor-pointer whitespace-nowrap"
                              >
                                Pay Tax
                              </Button>
                            )}
                            {onMarkFiled && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => onMarkFiled(row)}
                                className="text-xs text-gray-500 hover:text-gray-800 h-8 px-2 cursor-pointer whitespace-nowrap"
                                title="Mark as filed (manual remittal)"
                              >
                                Mark Filed
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {onPageChange && onLimitChange && (
        <PaginationFooter
          page={page}
          limit={limit}
          total={total || rows.length}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}

export function FilingHistoryTab({
  rows,
  isLoading = false,
  page = 1,
  limit = 10,
  total = 0,
  onPageChange,
  onLimitChange,
  onDownload,
  onViewDetails,
}: {
  rows: TaxFilingItem[];
  isLoading?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onDownload?: (item: TaxFilingItem) => void;
  onViewDetails?: (item: TaxFilingItem) => void;
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden shadow-xs">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Filing History</h3>
        <span className="text-xs text-gray-500 font-medium">
          {rows.length} filed record{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#f8fafc]">
            <TableRow className="border-none">
              <TableHead className="font-semibold text-gray-600 h-11">State</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Filing Period</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Filed Date</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Tax Paid</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Method</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Status</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Receipt</TableHead>
              <TableHead className="font-semibold text-gray-600 h-11">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`history-skel-${idx}`} className="border-b">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                  No filing history records found for the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const filedDateValue = row.filedDate || row.paidAt || row.updatedAt || row.createdAt;
                const receiptId = row.receipt?.confirmationNumber || "-";
                const receiptDateValue = row.receipt?.receiptDate || filedDateValue;
                const stateDisplay = row.stateLabel || row.state || "-";
                const historySubtitle = row.projectName
                  ? `${row.jobId ? `${row.jobId} • ` : ""}${row.projectName}`
                  : typeof row.leadId === "object" && row.leadId?.jobId
                  ? `${row.leadId.jobId}${row.leadId.projectName ? ` • ${row.leadId.projectName}` : ""}`
                  : row.customerName
                  ? row.customerName
                  : typeof row.customerId === "object" && row.customerId?.firstName
                  ? `${row.customerId.firstName}${row.customerId.lastName ? ` ${row.customerId.lastName}` : ""}`
                  : row.salesTaxRateLabel || "-";
                const amountPaidVal = row.taxPaid ?? row.amount;
                const methodVal = row.method || row.filingFrequency || "Avalara API";
                const periodText = row.filingPeriod || formatPeriod(row.dueDate || filedDateValue);

                return (
                  <TableRow
                    key={row._id}
                    className="border-b last:border-none hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                            stateDisplay
                          )}`}
                        >
                          <span className="text-xs font-bold">
                            {stateDisplay.charAt(0) || "-"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{stateDisplay}</span>
                          <span className="text-xs text-gray-500">
                            {historySubtitle}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {periodText}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {row.filingFrequency || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {formatDate(filedDateValue)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(filedDateValue, "hh:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-gray-900 font-semibold text-sm">
                      {formatCurrency(amountPaidVal)}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600 text-sm">
                      {methodVal}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {getStatusBadge(row.status)}
                        {row.isPrepared || row.prepared ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded"
                            title={row.preparedAt ? `Prepared at ${formatDate(row.preparedAt, "MMM dd, yyyy hh:mm a")}` : "Prepared"}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            Prepared
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {receiptId !== "-" ? (
                        <button
                          type="button"
                          onClick={() => onDownload?.(row)}
                          className="text-blue-600 font-medium hover:underline text-left block text-sm"
                          title="Click to download receipt PDF"
                        >
                          {receiptId}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                      <div className="text-xs text-gray-400">
                        {formatDate(receiptDateValue, "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => onViewDetails?.(row)}
                          className="rounded font-medium text-blue-600 hover:text-blue-800 h-8 text-xs"
                        >
                          View Filing
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"
                          onClick={() => onDownload?.(row)}
                          title="Download receipt PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {onPageChange && onLimitChange && (
        <PaginationFooter
          page={page}
          limit={limit}
          total={total || rows.length}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}