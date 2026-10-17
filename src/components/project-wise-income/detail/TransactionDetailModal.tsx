import React, { useState } from "react";
import { FileDown, Loader2, Receipt, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetProjectWiseIncomeTransactionDetailQuery } from "@/redux/api/reportsApi";
import { downloadInvoicePdfBinary } from "@/redux/api/invoiceManagementApi";
import { formatCurrency, formatDisplayDate } from "@/lib/dashboardFormatters";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectIdOrLeadId: string;
  transactionId: string | null;
  invoiceNumber?: string;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  projectIdOrLeadId,
  transactionId,
  invoiceNumber: initialInvoiceNumber,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const shouldFetch = isOpen && Boolean(projectIdOrLeadId && transactionId);
  const { data, isLoading, isError, refetch } =
    useGetProjectWiseIncomeTransactionDetailQuery(
      {
        projectIdOrLeadId,
        transactionId: transactionId || "",
      },
      { skip: !shouldFetch }
    );

  const tx = data?.transaction;
  const project = data?.project;
  const incomeTypeLabel = data?.incomeTypeLabel || tx?.incomeTypeLabel || tx?.incomeType || "";
  const displayInvoiceNumber = tx?.invoiceNumber || initialInvoiceNumber || "";

  const handleDownloadPdf = async () => {
    if (!transactionId) return;
    try {
      setIsDownloadingPdf(true);
      setDownloadError(null);
      await downloadInvoicePdfBinary(transactionId, displayInvoiceNumber || transactionId);
    } catch (err: any) {
      console.error("Failed to download invoice PDF:", err);
      setDownloadError(err?.message || "Failed to download invoice PDF");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-4.5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50 pr-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {displayInvoiceNumber || "Transaction Detail"}
                </DialogTitle>
                {tx?.status && (
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold border ${
                      tx.status.toLowerCase() === "received" || tx.invoiceStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {tx.status}
                  </Badge>
                )}
              </div>
              {incomeTypeLabel && (
                <p className="text-xs text-slate-500 font-medium">{incomeTypeLabel}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading transaction details...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-red-600 font-medium">Unable to load transaction details.</p>
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
              {/* Summary Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block">Total Amount</span>
                  <span className="text-base sm:text-lg font-bold text-blue-600 mt-0.5 block">
                    {formatCurrency(tx?.totalAmount ?? tx?.amount)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block">Invoice Date</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 block">
                    {formatDisplayDate(tx?.date)}
                  </span>
                </div>

                {tx?.dueDate && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-400 block">Due Date</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 block">
                      {formatDisplayDate(tx.dueDate)}
                    </span>
                  </div>
                )}

                {tx?.paidAt && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-400 block">Paid At</span>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-700 mt-0.5 block">
                      {formatDisplayDate(tx.paidAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {tx?.description && (
                <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100/60">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Description
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {tx.description}
                  </p>
                </div>
              )}

              {/* Line Items Table if present */}
              {tx?.lineItems && tx.lineItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Line Items
                  </h4>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                          <th className="px-4 py-2.5">Item Description</th>
                          <th className="px-4 py-2.5 text-right">Qty</th>
                          <th className="px-4 py-2.5 text-right">Rate</th>
                          <th className="px-4 py-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tx.lineItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-medium text-slate-800">
                              {item.description || "-"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-600">
                              {item.quantity ?? 1}
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-600">
                              {formatCurrency(item.effectiveRate ?? item.rate)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Project Info if available */}
              {project && (
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">
                        {project.projectName || "-"}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {project.projectId || "-"} {project.location ? `• ${project.location}` : ""}
                      </span>
                    </div>
                  </div>
                  {project.quoteValue !== undefined && (
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Quote Value</span>
                      <span className="text-xs font-bold text-slate-800">
                        {formatCurrency(project.quoteValue)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {downloadError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                  {downloadError}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || !transactionId}
            className="flex items-center gap-2 text-xs font-semibold h-9 px-4 cursor-pointer disabled:opacity-50"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{isDownloadingPdf ? "Downloading..." : "Download Invoice PDF"}</span>
          </Button>

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

export default TransactionDetailModal;
