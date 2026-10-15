import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ListFilter,
  Calendar,
  ChevronDown,
  Download,
  Loader2,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetMarginAnalysisFiltersQuery,
  useExportProfitLossMutation,
} from "@/redux/api/marginAnalysisApi";
import { DATE_PRESETS, type MarginFilters } from "./types";

export interface MarginAnalysisHeaderProps {
  filters: MarginFilters;
  onFilterChange: (filters: MarginFilters) => void;
  onExport?: (projectId?: string) => void;
}

export const MarginAnalysisHeader: React.FC<MarginAnalysisHeaderProps> = ({
  filters,
  onFilterChange,
  onExport,
}) => {
  const { data: filtersData, isLoading: isLoadingFilters } =
    useGetMarginAnalysisFiltersQuery();

  const [exportProfitLoss, { isLoading: isExportingInternal }] =
    useExportProfitLossMutation();
  const [exportNotification, setExportNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (exportNotification) {
      const timer = setTimeout(() => setExportNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [exportNotification]);

  const companyOptions = useMemo(
    () => filtersData?.companies || [],
    [filtersData],
  );

  const projectOptions = useMemo(() => {
    if (!filtersData?.projects) return [];
    if (filters.companyId !== "all") {
      return filtersData.projects.filter(
        (p) =>
          p.businessUnit?.toLowerCase() === filters.companyId.toLowerCase(),
      );
    }
    return filtersData.projects;
  }, [filtersData, filters.companyId]);

  const currencyOptions = useMemo(
    () => filtersData?.currencies || [{ code: "USD", label: "USD" }],
    [filtersData],
  );

  const handleExportClick = async () => {
    if (onExport) {
      onExport(filters.projectId !== "all" ? filters.projectId : undefined);
      return;
    }
    try {
      const pid = filters.projectId !== "all" ? filters.projectId : undefined;
      const blob = await exportProfitLoss({
        projectId: pid,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        businessUnit:
          filters.companyId !== "all" ? filters.companyId : undefined,
      }).unwrap();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const filename = `profit-loss-analysis${pid ? `-${pid}` : ""}.xlsx`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setExportNotification({
        type: "success",
        message: "Profit & Loss report exported successfully.",
      });
    } catch (err: unknown) {
      console.error("Export failed:", err);
      const errMsg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to export Profit & Loss report. Please try again.";
      setExportNotification({
        type: "error",
        message: errMsg,
      });
    }
  };

  const selectedCompanyId = filters.companyId;
  const selectedProjectId = filters.projectId;
  const selectedCurrency = filters.currency;
  const selectedPresetLabel = filters.presetLabel || "All Time";

  const onSelectCompany = (id: string) => {
    onFilterChange({ ...filters, companyId: id });
  };
  const onSelectProject = (id: string) => {
    onFilterChange({ ...filters, projectId: id });
  };
  const onSelectCurrency = (code: string) => {
    onFilterChange({ ...filters, currency: code });
  };
  const onSelectDateRange = (label: string, start: string, end: string) => {
    onFilterChange({
      ...filters,
      presetLabel: label,
      startDate: start,
      endDate: end,
    });
  };

  const isExporting = isExportingInternal;
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCompanyOpen(false);
        setIsProjectOpen(false);
        setIsCurrencyOpen(false);
        setIsDateRangeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCompanyLabel =
    selectedCompanyId === "all"
      ? "All Companies"
      : companyOptions.find((c) => c.id === selectedCompanyId)?.label ||
        selectedCompanyId;

  const selectedProjectLabel =
    selectedProjectId === "all"
      ? "All Projects"
      : projectOptions.find((p) => p.leadId === selectedProjectId)
          ?.projectName || selectedProjectId;

  return (
    <div>
      {/* Toast Notification */}
      {exportNotification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-xs md:text-sm transition-all duration-300 ${
            exportNotification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {exportNotification.type === "success" ? (
            <TrendingUp className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{exportNotification.message}</span>
          <button
            onClick={() => setExportNotification(null)}
            className="ml-2 hover:opacity-80 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Margin Analysis
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Analyze product margins, period trends, and project-wise profit & loss breakdowns.
          </p>
        </div>

        {/* Quick Export Button */}
        <Button
          variant="outline"
          onClick={handleExportClick}
          disabled={isExporting}
          className="border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs md:text-sm px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          ) : (
            <Download className="w-4 h-4 text-purple-600" />
          )}
          <span>Export P&L</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div
        ref={dropdownRef}
        className="mt-4 flex flex-wrap items-center gap-3 relative z-30"
      >
        {/* 1. All Companies Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCompanyOpen(!isCompanyOpen);
              setIsProjectOpen(false);
              setIsCurrencyOpen(false);
              setIsDateRangeOpen(false);
            }}
            className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50/80 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ListFilter className="w-4 h-4 text-gray-500 shrink-0" />
            {isLoadingFilters ? (
              <Skeleton className="h-4 w-24 bg-gray-200" />
            ) : (
              <span>{selectedCompanyLabel}</span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </button>
          {isCompanyOpen && (
            <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-40 text-xs max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  onSelectCompany("all");
                  setIsCompanyOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                  selectedCompanyId === "all"
                    ? "text-blue-600 font-semibold bg-blue-50/40"
                    : "text-gray-700"
                }`}
              >
                All Companies
              </button>
              {isLoadingFilters && (
                <div className="px-3 py-2 text-gray-400 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                </div>
              )}
              {companyOptions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCompany(c.id);
                    setIsCompanyOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer capitalize ${
                    selectedCompanyId === c.id
                      ? "text-blue-600 font-semibold bg-blue-50/40"
                      : "text-gray-700"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. All Projects Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProjectOpen(!isProjectOpen);
              setIsCompanyOpen(false);
              setIsCurrencyOpen(false);
              setIsDateRangeOpen(false);
            }}
            className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50/80 flex items-center gap-2 cursor-pointer transition-colors max-w-xs truncate"
          >
            <ListFilter className="w-4 h-4 text-gray-500 shrink-0" />
            {isLoadingFilters ? (
              <Skeleton className="h-4 w-24 bg-gray-200" />
            ) : (
              <span className="truncate">{selectedProjectLabel}</span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </button>
          {isProjectOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-40 text-xs max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  onSelectProject("all");
                  setIsProjectOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                  selectedProjectId === "all"
                    ? "text-blue-600 font-semibold bg-blue-50/40"
                    : "text-gray-700"
                }`}
              >
                All Projects
              </button>
              {isLoadingFilters && (
                <div className="px-3 py-2 text-gray-400 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading projects...
                </div>
              )}
              {projectOptions.map((p) => (
                <button
                  key={p.leadId}
                  onClick={() => {
                    onSelectProject(p.leadId);
                    setIsProjectOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between gap-2 ${
                    selectedProjectId === p.leadId
                      ? "text-blue-600 font-semibold bg-blue-50/40"
                      : "text-gray-700"
                  }`}
                >
                  <span className="truncate">{p.projectName}</span>
                  {p.jobId && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      #{p.jobId}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. All Currencies Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCurrencyOpen(!isCurrencyOpen);
              setIsCompanyOpen(false);
              setIsProjectOpen(false);
              setIsDateRangeOpen(false);
            }}
            className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50/80 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ListFilter className="w-4 h-4 text-gray-500 shrink-0" />
            {isLoadingFilters ? (
              <Skeleton className="h-4 w-24 bg-gray-200" />
            ) : (
              <span>{`Currency (${selectedCurrency})`}</span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </button>
          {isCurrencyOpen && (
            <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-40 text-xs">
              {currencyOptions.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    onSelectCurrency(curr.code);
                    setIsCurrencyOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                    selectedCurrency === curr.code
                      ? "text-blue-600 font-semibold bg-blue-50/40"
                      : "text-gray-700"
                  }`}
                >
                  {curr.label || curr.code}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Date Range Dropdown (Default: All Time) */}
        <div className="relative">
          <button
            onClick={() => {
              setIsDateRangeOpen(!isDateRangeOpen);
              setIsCompanyOpen(false);
              setIsProjectOpen(false);
              setIsCurrencyOpen(false);
            }}
            className="bg-white border border-gray-200/90 rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50/80 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>{selectedPresetLabel}</span>
            <Calendar className="w-4 h-4 text-gray-500 ml-1" />
          </button>
          {isDateRangeOpen && (
            <div className="absolute left-0 mt-1 w-72 bg-white border border-gray-100 rounded-lg shadow-lg p-2 z-40 text-xs space-y-2">
              <div className="space-y-1">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      if (preset.label !== "Custom Range") {
                        onSelectDateRange(preset.label, preset.startDate, preset.endDate);
                        setIsDateRangeOpen(false);
                      }
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded hover:bg-gray-50 cursor-pointer ${
                      selectedPresetLabel === preset.label
                        ? "text-blue-600 font-semibold bg-blue-50/40"
                        : "text-gray-700"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Range Inputs */}
              {selectedPresetLabel === "Custom Range" && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-12 text-[11px]">Start:</span>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-12 text-[11px]">End:</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        const label =
                          customStart && customEnd
                            ? `${customStart} - ${customEnd}`
                            : "Custom Range";
                        onSelectDateRange(label, customStart, customEnd);
                        setIsDateRangeOpen(false);
                      }}
                      className="text-xs h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
