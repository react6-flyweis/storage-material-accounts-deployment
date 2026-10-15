import React, { useMemo } from "react";
import { CircleDollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetMarginAnalysisKpisQuery,
  type MarginAnalysisData,
} from "@/redux/api/marginAnalysisApi";
import type { MarginFilters } from "./types";

export interface MarginKpiCardsProps {
  filters?: MarginFilters;
  data?: MarginAnalysisData;
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

export const MarginKpiCards: React.FC<MarginKpiCardsProps> = ({
  filters,
  data: propData,
  isLoading: propIsLoading,
  isFetching: propIsFetching,
}) => {
  const kpiQueryParams = useMemo(() => {
    return {
      startDate: filters?.startDate || undefined,
      endDate: filters?.endDate || undefined,
      projectId:
        filters?.projectId && filters.projectId !== "all"
          ? filters.projectId
          : undefined,
      businessUnit:
        filters?.companyId && filters.companyId !== "all"
          ? filters.companyId
          : undefined,
    };
  }, [filters]);

  const {
    data: fetchedData,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
  } = useGetMarginAnalysisKpisQuery(kpiQueryParams, {
    skip: Boolean(propData),
  });

  const data = propData ?? fetchedData;
  const isLoading = propIsLoading ?? isQueryLoading;
  const isFetching = propIsFetching ?? isQueryFetching;
  if (isLoading || (!data && isFetching)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3.5 min-h-22"
          >
            <Skeleton className="w-10 h-10 rounded-lg shrink-0 bg-gray-100" />
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-20 bg-gray-100" />
              <Skeleton className="h-6 w-24 bg-gray-200/90" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = data?.kpis;
  const grossVal = kpis?.grossMarginPct?.value ?? data?.grossMarginPct;
  const opVal = kpis?.operatingMarginPct?.value ?? data?.operatingMarginPct;
  const netVal = kpis?.netProfitMarginPct?.value ?? data?.netProfitMarginPct;
  const contribVal = kpis?.contributionMarginPct?.value ?? data?.contributionMarginPct;
  const aspVal = kpis?.avgSellingPrice?.value ?? data?.avgSellingPrice;

  const metrics = [
    {
      title: "Gross Margin %",
      rawValue: grossVal,
      value: grossVal != null ? formatPercent(grossVal) : "-",
      change: kpis?.grossMarginPct?.changePct ?? null,
    },
    {
      title: "Operating Margin",
      rawValue: opVal,
      value: opVal != null ? formatPercent(opVal) : "-",
      change: kpis?.operatingMarginPct?.changePct ?? null,
    },
    {
      title: "Net Profit Margin",
      rawValue: netVal,
      value: netVal != null ? formatPercent(netVal) : "-",
      change: kpis?.netProfitMarginPct?.changePct ?? null,
    },
    {
      title: "Contribution Margin",
      rawValue: contribVal,
      value: contribVal != null ? formatPercent(contribVal) : "-",
      change: kpis?.contributionMarginPct?.changePct ?? null,
    },
    {
      title: "Avg Selling Price",
      rawValue: aspVal,
      value: aspVal != null ? formatCurrency(aspVal) : "-",
      change: kpis?.avgSellingPrice?.changePct ?? null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {metrics.map((item, index) => {
        const numChange =
          typeof item.change === "number"
            ? item.change
            : item.change != null
            ? parseFloat(String(item.change).replace(/[^0-9.-]/g, ""))
            : null;

        const hasChange = numChange != null && !isNaN(numChange);
        const isPositiveChange = hasChange && numChange >= 0;
        const isNegativeValue =
          typeof item.rawValue === "number" && !isNaN(item.rawValue) && item.rawValue < 0;

        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex items-center gap-3.5 transition-all hover:shadow-sm relative overflow-hidden"
          >
            {isFetching && (
              <div className="absolute top-1 right-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
              </div>
            )}
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isNegativeValue
                  ? "bg-rose-50 text-rose-600"
                  : "bg-[#EFF6FF] text-[#2563EB]"
              }`}
            >
              <CircleDollarSign
                className={`w-5 h-5 ${
                  isNegativeValue ? "text-rose-500" : "text-blue-500"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium truncate">
                {item.title}
              </p>
              <p
                className={`text-xl font-bold leading-tight mt-0.5 ${
                  isNegativeValue ? "text-rose-600" : "text-gray-900"
                }`}
              >
                {item.value}
              </p>
              {hasChange && (
                <div className="flex items-center gap-1 mt-0.5">
                  {isPositiveChange ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  )}
                  <p
                    className={`text-xs font-semibold ${
                      isPositiveChange ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {numChange! > 0 ? `+${numChange}%` : `${numChange}%`}
                  </p>
                  <span className="text-[10px] text-gray-400 font-normal">
                    vs prev
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
