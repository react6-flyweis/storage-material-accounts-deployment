import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export interface ProjectWiseIncomeSummary {
  totalIncome: number;
  receivedIncome: number;
  pendingIncome: number;
  overdueIncome: number;
}

export interface IncomeOverviewChartItem {
  label: string;
  totalIncome: number;
  receivedIncome: number;
  pendingIncome: number;
}

export interface IncomeByProjectSegment {
  leadId: string;
  projectName: string;
  amount: number;
  pct: number;
}

export interface IncomeByProjectThisMonth {
  total: number;
  segments: IncomeByProjectSegment[];
}

export interface ProjectWiseIncomeRowItem {
  leadId: string;
  projectName: string;
  projectId: string; // jobId
  totalIncome: number;
  receivedIncome: number;
  pendingIncome: number;
  overdueIncome: number;
  receivedPct: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectWiseIncomeResponse {
  summary: ProjectWiseIncomeSummary;
  incomeOverviewChart: IncomeOverviewChartItem[];
  incomeByProjectThisMonth: IncomeByProjectThisMonth;
  rows: ProjectWiseIncomeRowItem[];
  pagination: PaginationInfo;
}

export interface ProjectWiseIncomeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  months?: number;
}

export interface ExpenseSources {
  manualExpenses: number;
  vendorMaterialFromEmailBids: number;
  freightFromEmailBids: number;
}

export interface ProjectWiseExpenseSummary {
  totalExpense: number;
  approvedExpense: number;
  pendingApproval: number;
  budgetedExpense: number;
  budgetVariance: number;
  sources?: ExpenseSources;
}

export interface ExpenseOverviewChartItem {
  label: string;
  totalExpense: number;
  approvedExpense: number;
  pendingApproval: number;
}

export interface ExpenseCategoryItem {
  key: string;
  label: string;
  amount: number;
  color: string;
}

export interface ProjectWiseExpenseRowItem {
  leadId: string;
  projectName: string;
  projectId: string; // jobId
  status?: string;
  totalExpense: number;
  approvedExpense: number;
  pendingApproval: number;
  budgetedExpense: number;
  budgetVariance: number;
  variancePct: number;
  sources?: ExpenseSources;
}

export interface ProjectWiseExpenseResponse {
  summary: ProjectWiseExpenseSummary;
  expenseOverviewChart: ExpenseOverviewChartItem[];
  expenseByCategoryThisMonth: ExpenseCategoryItem[];
  topExpenseCategoriesThisMonth: ExpenseCategoryItem[];
  rows: ProjectWiseExpenseRowItem[];
  pagination: PaginationInfo;
}

export interface ProjectWiseExpenseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  months?: number;
}

export interface ProfitLossRowItem {
  orderId: string;
  invoiceNumber: string;
  projectName: string;
  projectId: string;
  revenue: number;
  expense: number;
  netProfit: number;
  margin: number;
  status: string;
  date: string;
}

export interface ProfitLossSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  avgMargin: number;
}

export interface ProfitLossMonthlyTrendItem {
  label: string;
  revenue: number;
  expense: number;
  profit: number;
}

export interface ProfitLossResponse {
  rows: ProfitLossRowItem[];
  total: number;
  summary: ProfitLossSummary;
  expenseByCategory: Record<string, number>;
  monthlyTrend: ProfitLossMonthlyTrendItem[];
}

export interface ProfitLossQueryParams {
  leadId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ProjectWiseIncome", "ProjectWiseExpense", "ProfitLossStatement"],
  endpoints: (builder) => ({
    getProjectWiseIncome: builder.query<
      ProjectWiseIncomeResponse,
      ProjectWiseIncomeQueryParams | void
    >({
      query: (params) => {
        const cleanParams: Record<string, string | number> = {};
        if (params?.page !== undefined) cleanParams.page = params.page;
        if (params?.limit !== undefined) cleanParams.limit = params.limit;
        if (params?.search && params.search.trim()) {
          cleanParams.search = params.search.trim();
        }
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.months !== undefined) cleanParams.months = params.months;

        return {
          url: "/api/account/reports/project-wise-income",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (
        response:
          | ApiResponse<ProjectWiseIncomeResponse>
          | ProjectWiseIncomeResponse
      ) => {
        if (
          response &&
          "data" in response &&
          response.data &&
          typeof response.data === "object" &&
          "rows" in response.data
        ) {
          return response.data;
        }
        return response as ProjectWiseIncomeResponse;
      },
      providesTags: ["ProjectWiseIncome"],
    }),
    getProjectWiseExpense: builder.query<
      ProjectWiseExpenseResponse,
      ProjectWiseExpenseQueryParams | void
    >({
      query: (params) => {
        const cleanParams: Record<string, string | number> = {};
        if (params?.page !== undefined) cleanParams.page = params.page;
        if (params?.limit !== undefined) cleanParams.limit = params.limit;
        if (params?.search && params.search.trim()) {
          cleanParams.search = params.search.trim();
        }
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.months !== undefined) cleanParams.months = params.months;

        return {
          url: "/api/account/reports/project-wise-expense",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (
        response:
          | ApiResponse<ProjectWiseExpenseResponse>
          | ProjectWiseExpenseResponse
      ) => {
        if (
          response &&
          "data" in response &&
          response.data &&
          typeof response.data === "object" &&
          "rows" in response.data
        ) {
          return response.data;
        }
        return response as ProjectWiseExpenseResponse;
      },
      providesTags: ["ProjectWiseExpense"],
    }),
    getProfitLossStatement: builder.query<
      ProfitLossResponse,
      ProfitLossQueryParams | void
    >({
      query: (params) => {
        const cleanParams: Record<string, string | number> = {};
        if (params?.leadId) cleanParams.leadId = params.leadId;
        if (params?.page !== undefined) cleanParams.page = params.page;
        if (params?.limit !== undefined) cleanParams.limit = params.limit;
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;

        return {
          url: "/api/account/reports/profit-loss",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (
        response: ApiResponse<ProfitLossResponse> | ProfitLossResponse
      ) => {
        if (
          response &&
          "data" in response &&
          response.data &&
          typeof response.data === "object" &&
          "rows" in response.data
        ) {
          return response.data;
        }
        return response as ProfitLossResponse;
      },
      providesTags: ["ProfitLossStatement"],
    }),
  }),
});

export const {
  useGetProjectWiseIncomeQuery,
  useLazyGetProjectWiseIncomeQuery,
  useGetProjectWiseExpenseQuery,
  useLazyGetProjectWiseExpenseQuery,
  useGetProfitLossStatementQuery,
  useLazyGetProfitLossStatementQuery,
} = reportsApi;


