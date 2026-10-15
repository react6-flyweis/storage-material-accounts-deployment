import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

// --- 4.1 Filters Interfaces ---
export interface MarginFilterCompany {
  id: string;
  label: string;
}

export interface MarginFilterProject {
  leadId: string;
  projectName: string;
  jobId: string;
  businessUnit: string;
}

export interface MarginFilterCurrency {
  code: string;
  label: string;
}

export interface MarginFiltersData {
  companies: MarginFilterCompany[];
  projects: MarginFilterProject[];
  currencies: MarginFilterCurrency[];
}

// --- 4.2 KPI Cards Interfaces ---
export interface MarginKpiItem {
  value: number;
  changePct: number;
}

export interface MarginTotals {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
}

export interface MarginAnalysisData {
  grossMarginPct: number;
  operatingMarginPct: number;
  netProfitMarginPct: number;
  contributionMarginPct: number;
  avgSellingPrice: number;
  period?: {
    startDate?: string;
    endDate?: string;
  };
  kpis?: {
    grossMarginPct?: MarginKpiItem;
    operatingMarginPct?: MarginKpiItem;
    netProfitMarginPct?: MarginKpiItem;
    contributionMarginPct?: MarginKpiItem;
    avgSellingPrice?: MarginKpiItem;
  };
  totals?: MarginTotals;
}

export interface MarginAnalysisParams {
  startDate?: string;
  endDate?: string;
  projectId?: string;
  businessUnit?: string;
}

// --- 4.3 Trend Interfaces ---
export interface MarginTrendPoint {
  period: string;
  label: string;
  grossMarginPct: number;
  operatingMarginPct: number;
  netProfitMarginPct: number;
  contributionMarginPct: number;
}

export interface MarginTrendData {
  period: "month" | "quarter" | "year" | string;
  trend: MarginTrendPoint[];
}

export interface MarginTrendParams {
  period?: "month" | "quarter" | "year" | string;
  projectId?: string;
  businessUnit?: string;
  startDate?: string;
  endDate?: string;
}

// --- 4.4 By Project Interfaces ---
export interface MarginByProjectItem {
  leadId: string;
  projectName: string;
  jobId?: string;
  category?: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingMarginPct: number;
  netProfitMarginPct: number;
  contributionMarginPct: number;
}

export interface MarginByProjectsData {
  projects: MarginByProjectItem[];
}

export interface MarginByProjectsParams {
  limit?: number;
  startDate?: string;
  endDate?: string;
  businessUnit?: string;
  projectId?: string;
}

// --- 4.5 P&L Summary Table Interfaces ---
export interface ProfitLossSummaryRow {
  leadId: string;
  projectName: string;
  jobId?: string;
  category: string;
  salesUSD: number;
  cogsUSD: number;
  grossProfitUSD: number;
  grossMarginPct: number;
}

export interface ProfitLossSummaryData {
  rows: ProfitLossSummaryRow[];
  total: number;
  page: number;
  limit: number;
}

export interface ProfitLossSummaryParams {
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  businessUnit?: string;
  projectId?: string;
}

// --- 4.6 P&L Detail Interfaces ---
export interface ProfitLossLineItem {
  name?: string;
  title?: string;
  category?: string;
  amount?: number;
  percentage?: number;
  budget?: number;
  actual?: number;
  variance?: number;
  [key: string]: unknown;
}

export interface ProfitLossDetailData {
  projectId?: string;
  projectName?: string;
  period?: {
    startDate?: string;
    endDate?: string;
  };
  totalRevenue?: number;
  totalExpenses?: number;
  cogs?: number;
  grossProfit?: number;
  grossMarginPct?: number;
  operatingProfit?: number;
  netProfit?: number;
  summary?: ProfitLossLineItem[];
  incomeVsExpenseTrend?: Array<{
    period?: string;
    label?: string;
    income?: number;
    expense?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface ProfitLossDetailParams {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  businessUnit?: string;
}

// Helper to unwrap standard ApiResponse or return raw data
function unwrapResponse<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === "object" && "data" in response && (response as ApiResponse<T>).data !== undefined) {
    return (response as ApiResponse<T>).data as T;
  }
  return response as T;
}

export const marginAnalysisApi = createApi({
  reducerPath: "marginAnalysisApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "MarginFilters",
    "MarginKPIs",
    "MarginTrend",
    "MarginByProject",
    "ProfitLossSummary",
    "ProfitLossDetail",
  ],
  endpoints: (builder) => ({
    // 4.1 Filters
    getMarginAnalysisFilters: builder.query<MarginFiltersData, void>({
      query: () => ({
        url: "/api/account/financial/margin-analysis/filters",
        method: "GET",
      }),
      transformResponse: (res: ApiResponse<MarginFiltersData> | MarginFiltersData) => {
        const data = unwrapResponse(res);
        return {
          companies: data?.companies || [],
          projects: data?.projects || [],
          currencies: data?.currencies || [{ code: "USD", label: "USD" }],
        };
      },
      providesTags: ["MarginFilters"],
    }),

    // 4.2 KPI cards (5 metrics + period change %)
    getMarginAnalysisKpis: builder.query<MarginAnalysisData, MarginAnalysisParams | void>({
      query: (params) => {
        const cleanParams: Record<string, string> = {};
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.projectId && params.projectId !== "all") cleanParams.projectId = params.projectId;
        if (params?.businessUnit && params.businessUnit !== "all") cleanParams.businessUnit = params.businessUnit;

        return {
          url: "/api/account/financial/margin-analysis",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (res: ApiResponse<MarginAnalysisData> | MarginAnalysisData) => {
        return unwrapResponse(res);
      },
      providesTags: ["MarginKPIs"],
    }),

    // 4.3 Margin trend (line chart — 4 series)
    getMarginAnalysisTrend: builder.query<MarginTrendData, MarginTrendParams | void>({
      query: (params) => {
        const cleanParams: Record<string, string> = {};
        if (params?.period) cleanParams.period = params.period;
        if (params?.projectId && params.projectId !== "all") cleanParams.projectId = params.projectId;
        if (params?.businessUnit && params.businessUnit !== "all") cleanParams.businessUnit = params.businessUnit;
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;

        return {
          url: "/api/account/financial/margin-analysis/trend",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (res: ApiResponse<MarginTrendData> | MarginTrendData) => {
        const data = unwrapResponse(res);
        return {
          period: data?.period || "month",
          trend: data?.trend || [],
        };
      },
      providesTags: ["MarginTrend"],
    }),

    // 4.4 Margin by projects (bar chart)
    getMarginAnalysisByProject: builder.query<MarginByProjectsData, MarginByProjectsParams | void>({
      query: (params) => {
        const cleanParams: Record<string, string | number> = {};
        if (params?.limit) cleanParams.limit = params.limit;
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.businessUnit && params.businessUnit !== "all") cleanParams.businessUnit = params.businessUnit;
        if (params?.projectId && params.projectId !== "all") cleanParams.projectId = params.projectId;

        return {
          url: "/api/account/financial/margin-analysis/by-project",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (res: ApiResponse<MarginByProjectsData> | MarginByProjectsData) => {
        const data = unwrapResponse(res);
        return {
          projects: data?.projects || [],
        };
      },
      providesTags: ["MarginByProject"],
    }),

    // 4.5 Profit & Loss summary table
    getProfitLossSummary: builder.query<ProfitLossSummaryData, ProfitLossSummaryParams | void>({
      query: (params) => {
        const cleanParams: Record<string, string | number> = {};
        if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();
        if (params?.page) cleanParams.page = params.page;
        if (params?.limit) cleanParams.limit = params.limit;
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.businessUnit && params.businessUnit !== "all") cleanParams.businessUnit = params.businessUnit;
        if (params?.projectId && params.projectId !== "all") cleanParams.projectId = params.projectId;

        return {
          url: "/api/account/financial/profit-loss/summary",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (res: ApiResponse<ProfitLossSummaryData> | ProfitLossSummaryData) => {
        const data = unwrapResponse(res);
        return {
          rows: data?.rows || [],
          total: data?.total ?? (data?.rows?.length || 0),
          page: data?.page ?? 1,
          limit: data?.limit ?? 10,
        };
      },
      providesTags: ["ProfitLossSummary"],
    }),

    // 4.6 View Profit & Loss Analysis (detail)
    getProfitLossDetail: builder.query<ProfitLossDetailData, ProfitLossDetailParams | void>({
      query: (params) => {
        const cleanParams: Record<string, string> = {};
        if (params?.projectId && params.projectId !== "all") cleanParams.projectId = params.projectId;
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.businessUnit && params.businessUnit !== "all") cleanParams.businessUnit = params.businessUnit;

        return {
          url: "/api/account/financial/profit-loss",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (res: ApiResponse<ProfitLossDetailData> | ProfitLossDetailData) => {
        return unwrapResponse(res);
      },
      providesTags: ["ProfitLossDetail"],
    }),

    // 4.7 P&L export
    exportProfitLoss: builder.mutation<Blob, ProfitLossDetailParams | void>({
      query: (params) => {
        const cleanParams: Record<string, string> = {};
        if (params?.projectId && params.projectId !== "all") cleanParams.projectId = params.projectId;
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.businessUnit && params.businessUnit !== "all") cleanParams.businessUnit = params.businessUnit;

        return {
          url: "/api/account/financial/profit-loss/export",
          method: "GET",
          params: cleanParams,
          responseHandler: async (response) => {
            if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              throw new Error(err.message || "Failed to export Profit & Loss report");
            }
            return response.blob();
          },
        };
      },
    }),
  }),
});

export const {
  useGetMarginAnalysisFiltersQuery,
  useGetMarginAnalysisKpisQuery,
  useGetMarginAnalysisTrendQuery,
  useGetMarginAnalysisByProjectQuery,
  useGetProfitLossSummaryQuery,
  useGetProfitLossDetailQuery,
  useExportProfitLossMutation,
} = marginAnalysisApi;
