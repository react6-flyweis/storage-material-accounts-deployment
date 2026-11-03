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

export interface ProjectWiseIncomeDetailProject {
  leadId?: string;
  projectName?: string;
  projectId?: string;
  status?: string;
  location?: string;
  quoteValue?: number;
  startDate?: string;
  endDate?: string;
}

export interface ProjectWiseIncomeDetailSummary {
  totalIncome?: number;
  receivedIncome?: number;
  pendingIncome?: number;
  overdueIncome?: number;
}

export interface ProjectWiseIncomeSummarySidebar {
  totalContractValue?: number;
  billedToDate?: number;
  totalIncome?: number;
  receivedIncome?: number;
  pendingIncome?: number;
  overdueIncome?: number;
  retentionAmount?: number;
  retentionReleased?: number;
  balanceToBeReceived?: number;
}

export interface ProjectWiseIncomeTransaction {
  transactionId: string;
  incomeType?: string;
  incomeTypeLabel?: string;
  date?: string;
  description?: string;
  invoiceNumber?: string;
  amount?: number;
  status?: string;
  invoiceStatus?: string;
  tab?: string;
}

export interface IncomeTypeOption {
  key: string;
  label: string;
}

export interface ProjectWiseIncomeDetailResponse {
  project?: ProjectWiseIncomeDetailProject;
  summary?: ProjectWiseIncomeDetailSummary;
  incomeSummarySidebar?: ProjectWiseIncomeSummarySidebar;
  transactions?: ProjectWiseIncomeTransaction[];
  pagination?: PaginationInfo;
  incomeTypeOptions?: IncomeTypeOption[];
}

export interface ProjectWiseIncomeDetailQueryParams {
  projectIdOrLeadId: string;
  tab?: "received" | "pending" | "overdue" | "all";
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProjectWiseIncomeTransactionLineItem {
  description?: string;
  quantity?: number;
  rate?: number;
  effectiveRate?: number;
  total?: number;
}

export interface ProjectWiseIncomeTransactionDetail {
  transactionId: string;
  incomeType?: string;
  incomeTypeLabel?: string;
  date?: string;
  description?: string;
  invoiceNumber?: string;
  amount?: number;
  status?: string;
  invoiceStatus?: string;
  tab?: string;
  dueDate?: string;
  paidAt?: string;
  lineItems?: ProjectWiseIncomeTransactionLineItem[];
  subtotal?: number;
  totalAmount?: number;
}

export interface ProjectWiseIncomeTransactionDetailResponse {
  transaction?: ProjectWiseIncomeTransactionDetail;
  incomeTypeLabel?: string;
  project?: ProjectWiseIncomeDetailProject;
}

export interface AddProjectWiseIncomeReceivedPayload {
  incomeType?: string;
  invoiceNumber?: string;
  description?: string;
  amount: number;
  date?: string;
  status?: "received" | "pending";
}

export interface AddProjectWiseIncomeReceivedRequest {
  projectIdOrLeadId: string;
  body: AddProjectWiseIncomeReceivedPayload;
}

export interface AddProjectWiseIncomeReceivedResponse {
  invoice?: {
    _id?: string;
    invoiceNumber?: string;
    leadId?: string;
    totalAmount?: number;
    status?: string;
    serviceCategory?: string;
  };
  transaction?: ProjectWiseIncomeTransaction;
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

export interface ProjectWiseExpenseDetailProject {
  leadId?: string;
  projectName?: string;
  projectId?: string;
  status?: string;
  location?: string;
  quoteValue?: number;
  startDate?: string;
  endDate?: string;
}

export interface ProjectWiseExpenseDetailSummarySources {
  manualExpenses?: number;
  vendorMaterialFromEmailBids?: number;
  freightFromEmailBids?: number;
}

export interface ProjectWiseExpenseDetailSummary {
  totalExpense?: number;
  approvedExpense?: number;
  pendingApproval?: number;
  budgetedExpense?: number;
  budgetVariance?: number;
  variancePct?: number;
  sources?: ProjectWiseExpenseDetailSummarySources;
}

export interface ProjectWiseExpenseTransactionItem {
  recordId: string;
  source?: string;
  expenseType?: string;
  category?: string;
  date?: string;
  description?: string;
  reference?: string;
  amount?: number;
  approvalStatus?: string;
  tab?: string;
  status?: string;
}

export interface ProjectWiseExpenseDetailResponse {
  project?: ProjectWiseExpenseDetailProject;
  summary?: ProjectWiseExpenseDetailSummary;
  transactions?: ProjectWiseExpenseTransactionItem[];
  pagination?: PaginationInfo;
}

export interface ProjectWiseExpenseDetailQueryParams {
  projectIdOrLeadId: string;
  tab?: "approved" | "pending" | "all";
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseRecordDetail {
  _id?: string;
  expenseId?: string;
  category?: string;
  amount?: number;
  description?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ProjectWiseExpenseTransactionDetailResponse {
  record?: ProjectWiseExpenseTransactionItem;
  detail?: ExpenseRecordDetail;
  project?: {
    leadId?: string;
    projectName?: string;
    projectId?: string;
  };
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
  tagTypes: [
    "ProjectWiseIncome",
    "ProjectWiseIncomeDetail",
    "ProjectWiseExpense",
    "ProjectWiseExpenseDetail",
    "ProfitLossStatement",
  ],
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
    getProjectWiseIncomeDetail: builder.query<
      ProjectWiseIncomeDetailResponse,
      ProjectWiseIncomeDetailQueryParams
    >({
      query: ({ projectIdOrLeadId, ...params }) => {
        const cleanParams: Record<string, string | number> = {};
        if (params.tab) cleanParams.tab = params.tab;
        if (params.startDate) cleanParams.startDate = params.startDate;
        if (params.endDate) cleanParams.endDate = params.endDate;
        if (params.search && params.search.trim()) {
          cleanParams.search = params.search.trim();
        }
        if (params.page !== undefined) cleanParams.page = params.page;
        if (params.limit !== undefined) cleanParams.limit = params.limit;

        return {
          url: `/api/account/reports/project-wise-income/${encodeURIComponent(projectIdOrLeadId)}`,
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (
        response:
          | ApiResponse<ProjectWiseIncomeDetailResponse>
          | ProjectWiseIncomeDetailResponse
      ) => {
        if (response && "data" in response && response.data) {
          return response.data;
        }
        return response as ProjectWiseIncomeDetailResponse;
      },
      providesTags: (_result, _error, arg) => [
        { type: "ProjectWiseIncomeDetail", id: arg.projectIdOrLeadId },
        "ProjectWiseIncomeDetail",
      ],
    }),
    getProjectWiseIncomeTransactionDetail: builder.query<
      ProjectWiseIncomeTransactionDetailResponse,
      { projectIdOrLeadId: string; transactionId: string }
    >({
      query: ({ projectIdOrLeadId, transactionId }) => ({
        url: `/api/account/reports/project-wise-income/${encodeURIComponent(projectIdOrLeadId)}/transactions/${encodeURIComponent(transactionId)}`,
        method: "GET",
      }),
      transformResponse: (
        response:
          | ApiResponse<ProjectWiseIncomeTransactionDetailResponse>
          | ProjectWiseIncomeTransactionDetailResponse
      ) => {
        if (response && "data" in response && response.data) {
          return response.data;
        }
        return response as ProjectWiseIncomeTransactionDetailResponse;
      },
    }),
    addProjectWiseIncomeReceived: builder.mutation<
      AddProjectWiseIncomeReceivedResponse,
      AddProjectWiseIncomeReceivedRequest
    >({
      query: ({ projectIdOrLeadId, body }) => ({
        url: `/api/account/reports/project-wise-income/${encodeURIComponent(projectIdOrLeadId)}/received`,
        method: "POST",
        body,
      }),
      transformResponse: (
        response:
          | ApiResponse<AddProjectWiseIncomeReceivedResponse>
          | AddProjectWiseIncomeReceivedResponse
      ) => {
        if (response && "data" in response && response.data) {
          return response.data;
        }
        return response as AddProjectWiseIncomeReceivedResponse;
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "ProjectWiseIncomeDetail", id: arg.projectIdOrLeadId },
        "ProjectWiseIncomeDetail",
        "ProjectWiseIncome",
      ],
    }),
    getProjectWiseExpenseDetail: builder.query<
      ProjectWiseExpenseDetailResponse,
      ProjectWiseExpenseDetailQueryParams
    >({
      query: ({ projectIdOrLeadId, ...params }) => {
        const cleanParams: Record<string, string | number> = {};
        if (params.tab) cleanParams.tab = params.tab;
        if (params.startDate) cleanParams.startDate = params.startDate;
        if (params.endDate) cleanParams.endDate = params.endDate;
        if (params.search && params.search.trim()) {
          cleanParams.search = params.search.trim();
        }
        if (params.page !== undefined) cleanParams.page = params.page;
        if (params.limit !== undefined) cleanParams.limit = params.limit;

        return {
          url: `/api/account/reports/project-wise-expense/${encodeURIComponent(projectIdOrLeadId)}`,
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (
        response:
          | ApiResponse<ProjectWiseExpenseDetailResponse>
          | ProjectWiseExpenseDetailResponse
      ) => {
        if (response && "data" in response && response.data) {
          return response.data;
        }
        return response as ProjectWiseExpenseDetailResponse;
      },
      providesTags: (_result, _error, arg) => [
        { type: "ProjectWiseExpenseDetail", id: arg.projectIdOrLeadId },
        "ProjectWiseExpenseDetail",
      ],
    }),
    getProjectWiseExpenseTransactionDetail: builder.query<
      ProjectWiseExpenseTransactionDetailResponse,
      { projectIdOrLeadId: string; source: string; recordId: string }
    >({
      query: ({ projectIdOrLeadId, source, recordId }) => ({
        url: `/api/account/reports/project-wise-expense/${encodeURIComponent(projectIdOrLeadId)}/transactions/${encodeURIComponent(source)}/${encodeURIComponent(recordId)}`,
        method: "GET",
      }),
      transformResponse: (
        response:
          | ApiResponse<ProjectWiseExpenseTransactionDetailResponse>
          | ProjectWiseExpenseTransactionDetailResponse
      ) => {
        if (response && "data" in response && response.data) {
          return response.data;
        }
        return response as ProjectWiseExpenseTransactionDetailResponse;
      },
    }),
  }),
});

export const {
  useGetProjectWiseIncomeQuery,
  useLazyGetProjectWiseIncomeQuery,
  useGetProjectWiseIncomeDetailQuery,
  useLazyGetProjectWiseIncomeDetailQuery,
  useGetProjectWiseIncomeTransactionDetailQuery,
  useLazyGetProjectWiseIncomeTransactionDetailQuery,
  useAddProjectWiseIncomeReceivedMutation,
  useGetProjectWiseExpenseQuery,
  useLazyGetProjectWiseExpenseQuery,
  useGetProjectWiseExpenseDetailQuery,
  useLazyGetProjectWiseExpenseDetailQuery,
  useGetProjectWiseExpenseTransactionDetailQuery,
  useLazyGetProjectWiseExpenseTransactionDetailQuery,
  useGetProfitLossStatementQuery,
  useLazyGetProfitLossStatementQuery,
} = reportsApi;


