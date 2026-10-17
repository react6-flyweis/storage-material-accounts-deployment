import React from "react";
import { Loader2, Receipt, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetProjectWiseExpenseTransactionDetailQuery } from "@/redux/api/reportsApi";
import { formatCurrency, formatDisplayDate } from "@/lib/dashboardFormatters";

interface ExpenseTransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectIdOrLeadId: string;
  source: string;
  recordId: string | null;
  fallbackReference?: string;
}

const formatSourceLabel = (src?: string): string => {
  if (!src) return "Expense";
  const map: Record<string, string> = {
    manual: "Manual Expense Ledger",
    manual_expense: "Manual Expense Ledger",
    shipper: "Vendor/Material Email Bid",
    vendor_material_bid: "Vendor/Material Email Bid",
    freight: "Selected Freight Bid",
    freight_bid: "Selected Freight Bid",
    approval: "Payment Approval",
  };
  return map[src.toLowerCase()] || src.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export const ExpenseTransactionDetailModal: React.FC<
  ExpenseTransactionDetailModalProps
> = ({
  isOpen,
  onClose,
  projectIdOrLeadId,
  source,
  recordId,
  fallbackReference,
}) => {
  const shouldFetch = isOpen && Boolean(projectIdOrLeadId && source && recordId);
  const { data, isLoading, isError, refetch } =
    useGetProjectWiseExpenseTransactionDetailQuery(
      {
        projectIdOrLeadId,
        source,
        recordId: recordId || "",
      },
      { skip: !shouldFetch }
    );

  const record = data?.record;
  const detail = data?.detail;
  const project = data?.project;

  const displayRef =
    record?.reference ||
    (detail?.expenseId as string) ||
    fallbackReference ||
    "";
  const displaySource = formatSourceLabel(record?.source || source);
  const status =
    record?.approvalStatus || record?.status || (detail?.status as string) || "";
  const isApproved =
    status.toLowerCase() === "approved" || status.toLowerCase() === "paid";

  const amount = record?.amount ?? (detail?.amount as number | undefined);
  const date = record?.date;
  const category =
    record?.expenseType || record?.category || (detail?.category as string) || "-";
  const description =
    record?.description || (detail?.description as string) || "-";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4.5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50 pr-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {displayRef || "Expense Record"}
                </DialogTitle>
                {status && (
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold border ${
                      isApproved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">{displaySource}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading expense details...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-red-600 font-medium">
                Unable to load expense record details.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs font-semibold"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Expense Amount
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">
                    {formatCurrency(amount)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Record Date
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 block">
                    {formatDisplayDate(date)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Category
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 block capitalize">
                    {category}
                  </span>
                </div>
              </div>

              {/* Description Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Description
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Project Card if present */}
              {project && (
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">
                        {project.projectName || "-"}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {project.projectId || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold h-9 px-5 cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseTransactionDetailModal;
