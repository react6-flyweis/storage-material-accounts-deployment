import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, TrendingUp, Download, Loader2 } from "lucide-react";
import Modal from "@/components/common_components/Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetProfitLossDetailQuery,
  useGetMarginAnalysisFiltersQuery,
  useExportProfitLossMutation,
  type ProfitLossDetailData,
  type MarginFilterProject,
  type MarginTotals,
} from "@/redux/api/marginAnalysisApi";
import type { MarginFilters } from "./types";

export interface ProfitLossDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  filters?: MarginFilters;
  data?: ProfitLossDetailData;
  kpiTotals?: MarginTotals;
  kpiGrossMargin?: number;
  projectOptions?: MarginFilterProject[];
  onSelectProject?: (projectId: string) => void;
  onExport?: (projectId?: string) => void;
  isExporting?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
}

const formatCurrency = (val: number | undefined | null) => {
  if (val == null || isNaN(val)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const formatPercent = (val: number | undefined | null) => {
  if (val == null || isNaN(val)) return "0.00%";
  return `${Number(val).toFixed(2)}%`;
};

export const ProfitLossDetailModal: React.FC<ProfitLossDetailModalProps> = ({
  isOpen,
  onClose,
  projectId: propProjectId,
  filters,
  data: propData,
  kpiTotals,
  kpiGrossMargin,
  projectOptions: propProjectOptions,
  onSelectProject,
  onExport,
  isExporting: propIsExporting,
  isLoading: propIsLoading,
  isFetching: propIsFetching,
}) => {
  const navigate = useNavigate();

  const { data: filtersData } = useGetMarginAnalysisFiltersQuery(undefined, {
    skip: Boolean(propProjectOptions),
  });

  const projectOptions = propProjectOptions ?? filtersData?.projects ?? [];

  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(
    propProjectId,
  );

  const selectedProjectId =
    activeProjectId ||
    propProjectId ||
    (filters?.projectId && filters.projectId !== "all"
      ? filters.projectId
      : undefined) ||
    (projectOptions.length > 0 ? projectOptions[0].leadId : undefined);

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    onSelectProject?.(id);
  };

  const [exportProfitLoss, { isLoading: isExportingInternal }] =
    useExportProfitLossMutation();

  const handleExport = async (pid?: string) => {
    const targetId = pid || selectedProjectId;
    if (onExport) {
      onExport(targetId);
      return;
    }
    try {
      const blob = await exportProfitLoss({
        projectId: targetId,
        startDate: filters?.startDate || undefined,
        endDate: filters?.endDate || undefined,
        businessUnit:
          filters?.companyId && filters.companyId !== "all"
            ? filters.companyId
            : undefined,
      }).unwrap();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const filename = `profit-loss-analysis${targetId ? `-${targetId}` : ""}.xlsx`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const isExporting = propIsExporting ?? isExportingInternal;

  const {
    data: fetchedData,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
  } = useGetProfitLossDetailQuery(
    {
      projectId: selectedProjectId,
      startDate: filters?.startDate || undefined,
      endDate: filters?.endDate || undefined,
      businessUnit:
        filters?.companyId && filters.companyId !== "all"
          ? filters.companyId
          : undefined,
    },
    { skip: Boolean(propData) || !isOpen || !selectedProjectId },
  );

  const data = propData ?? fetchedData;
  const isLoading = propIsLoading ?? isQueryLoading;
  const isFetching = propIsFetching ?? isQueryFetching;

  const activeProject = projectOptions.find(
    (p) => p.leadId === selectedProjectId,
  );

  const revenueVal = data?.totalRevenue ?? kpiTotals?.revenue;
  const cogsVal = data?.cogs ?? data?.totalExpenses ?? kpiTotals?.cogs;
  const grossProfitVal = data?.grossProfit ?? kpiTotals?.grossProfit;
  const grossMarginVal = data?.grossMarginPct ?? kpiGrossMargin;
  const operatingProfitVal = data?.operatingProfit ?? kpiTotals?.operatingProfit;
  const netProfitVal = data?.netProfit ?? kpiTotals?.netProfit;

  const isGrossProfitNegative = grossProfitVal != null && grossProfitVal < 0;
  const isGrossMarginNegative = grossMarginVal != null && grossMarginVal < 0;
  const isOperatingProfitNegative = operatingProfitVal != null && operatingProfitVal < 0;
  const isNetProfitNegative = netProfitVal != null && netProfitVal < 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader={true}
      width="max-w-xl"
      className="p-0 overflow-hidden rounded-2xl"
    >
      <div className="flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                  Profit & Loss Details
                </h2>
                {activeProject?.jobId && (
                  <Badge className="bg-gray-100 hover:bg-gray-100 text-gray-700 text-[11px] font-semibold border-none px-2 py-0.5">
                    #{activeProject.jobId}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {filters?.startDate && filters?.endDate
                  ? `${filters.startDate} to ${filters.endDate}`
                  : "All Time"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Selector Bar */}
        {projectOptions.length > 0 && (
          <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-gray-600">Select Project:</span>
            <select
              value={selectedProjectId || ""}
              onChange={(e) => handleSelectProject(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-xs truncate"
            >
              {projectOptions.map((p) => (
                <option key={p.leadId} value={p.leadId}>
                  {p.projectName} {p.jobId ? `(#${p.jobId})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Loading State */}
        {isLoading || isFetching ? (
          <div className="p-6 space-y-6">
            <div className="space-y-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-36 bg-gray-100" />
                  <Skeleton className="h-4 w-24 bg-gray-200/90" />
                </div>
              ))}
            </div>
            <div className="border-b border-gray-100" />
            <div className="space-y-3">
              <Skeleton className="h-3.5 w-40 bg-gray-200" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <Skeleton className="h-3.5 w-32 bg-gray-100" />
                  <Skeleton className="h-3.5 w-20 bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-h-[65vh] overflow-y-auto">
            {/* Section 1: Financial Performance Highlights */}
            <div className="px-6 py-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Total Sales / Revenue</span>
                <span className="text-gray-900 font-bold">
                  {revenueVal != null ? formatCurrency(revenueVal) : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Cost of Goods Sold (COGS)</span>
                <span className="text-gray-700 font-medium">
                  {cogsVal != null ? formatCurrency(cogsVal) : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Gross Profit</span>
                <span
                  className={`font-semibold ${
                    isGrossProfitNegative ? "text-[#EF4444]" : "text-[#16A34A]"
                  }`}
                >
                  {grossProfitVal != null ? formatCurrency(grossProfitVal) : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-normal">Gross Margin</span>
                <span
                  className={`font-bold ${
                    isGrossMarginNegative ? "text-[#EF4444]" : "text-[#16A34A]"
                  }`}
                >
                  {grossMarginVal != null ? formatPercent(grossMarginVal) : "-"}
                </span>
              </div>

              {operatingProfitVal != null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-normal">Operating Profit</span>
                  <span
                    className={`font-semibold ${
                      isOperatingProfitNegative ? "text-[#EF4444]" : "text-gray-800"
                    }`}
                  >
                    {formatCurrency(operatingProfitVal)}
                  </span>
                </div>
              )}

              {netProfitVal != null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-normal">Net Profit</span>
                  <span
                    className={`font-bold ${
                      isNetProfitNegative ? "text-[#EF4444]" : "text-gray-900"
                    }`}
                  >
                    {formatCurrency(netProfitVal)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-b border-gray-100 mx-6" />

            {/* Section 2: Line Items Breakdown */}
            <div className="px-6 py-4 space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Cost Breakdown & Line Items
              </h4>

              {data?.summary && data.summary.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {data.summary.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-none"
                    >
                      <span className="text-gray-600">
                        {item.name || item.title || item.category || `Line Item ${i + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.percentage != null && (
                          <span className="text-gray-400 text-xs">
                            ({Number(item.percentage).toFixed(1)}%)
                          </span>
                        )}
                        <span className="text-gray-900 font-medium">
                          {formatCurrency(item.amount ?? item.actual ?? 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-3 text-center">
                  No line item breakdown available for this project.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onClose();
              navigate("/project_budget_details");
            }}
            className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 cursor-pointer h-9 px-3"
          >
            Budget Details Page
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs text-gray-700 border-gray-200 hover:bg-gray-100 h-9 px-4 cursor-pointer"
            >
              Close
            </Button>
            <Button
              type="button"
              disabled={isExporting}
              onClick={() => handleExport(selectedProjectId)}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs rounded-xl h-9 px-4 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Export Report</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProfitLossDetailModal;
