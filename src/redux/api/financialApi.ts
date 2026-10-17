import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export interface BudgetVsActualProjectPickerItem {
  _id: string;
  projectName?: string;
  jobId?: string;
  clientName?: string;
  buildingType?: string;
  location?: string;
  address?: string;
}

export interface BudgetVsActualProjectInfo {
  _id: string;
  projectCode: string;
  projectName: string;
  clientName?: string;
  salesRep?: string;
  address?: string;
  startDate?: string;
  targetEndDate?: string;
}

export interface BudgetVsActualSummary {
  totalBudget: number;
  totalActualExpenses: number;
  totalVariance: number;
  budgetUsedPct: number;
  totalInvoiced?: number;
}

export interface BudgetVsActualCostHead {
  category: string;
  head?: string;
  budget: number;
  actual: number;
  variance: number;
  isCustom?: boolean;
}

export interface CustomBudgetLine {
  key: string;
  label: string;
  amount: number;
  expenseCategories?: string[];
}

export interface GroupedByDepartmentItem {
  department: string;
  budget: number;
  actual: number;
  variance: number;
  budgetUsedPct?: number;
}

export interface BudgetVsActualDetailData {
  project: BudgetVsActualProjectInfo;
  summary: BudgetVsActualSummary;
  costHeads: BudgetVsActualCostHead[];
  customBudgetLines?: CustomBudgetLine[];
  groupedByDepartment?: GroupedByDepartmentItem[];
}

export interface BudgetVsActualDetailParams {
  leadId: string;
  startDate?: string;
  endDate?: string;
  groupBy?: string;
}

export interface UpdateLeadBudgetPayload {
  materialBudget: number;
  logisticBudget: number;
  productionBudget: number;
  shipperBudget: number;
  otherCost: number;
  customLines?: Array<{
    key: string;
    label: string;
    amount: number;
    expenseCategories?: string[];
  }>;
}

export interface UpdateLeadBudgetRequest extends UpdateLeadBudgetPayload {
  leadId: string;
}

export const financialApi = createApi({
  reducerPath: "financialApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["BudgetVsActualProjects", "BudgetVsActualDetail"],
  endpoints: (builder) => ({
    // 5.1 Project picker (no leadId)
    getBudgetVsActualProjects: builder.query<BudgetVsActualProjectPickerItem[], void>({
      query: () => ({
        url: "/api/account/financial/budget-vs-actual",
        method: "GET",
      }),
      transformResponse: (
        response: ApiResponse<{ projects: BudgetVsActualProjectPickerItem[] }>
      ) => {
        return response?.data?.projects || [];
      },
      providesTags: ["BudgetVsActualProjects"],
    }),

    // 5.2 Project detail
    getBudgetVsActualDetail: builder.query<
      BudgetVsActualDetailData,
      BudgetVsActualDetailParams
    >({
      query: ({ leadId, startDate, endDate, groupBy }) => {
        const cleanParams: Record<string, string> = { leadId };
        if (startDate) cleanParams.startDate = startDate;
        if (endDate) cleanParams.endDate = endDate;
        if (groupBy && groupBy !== "costHead") cleanParams.groupBy = groupBy;

        return {
          url: "/api/account/financial/budget-vs-actual",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (response: ApiResponse<BudgetVsActualDetailData>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to load budget vs actual details");
        }
        return response.data;
      },
      providesTags: (_result, _error, arg) => [
        { type: "BudgetVsActualDetail", id: arg.leadId },
      ],
    }),

    // Set / update budget (admin lead API)
    updateLeadBudget: builder.mutation<unknown, UpdateLeadBudgetRequest>({
      query: ({ leadId, ...body }) => ({
        url: `/api/admin/leads/${encodeURIComponent(leadId)}/budget`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "BudgetVsActualProjects",
        { type: "BudgetVsActualDetail", id: arg.leadId },
      ],
    }),
  }),
});

export const {
  useGetBudgetVsActualProjectsQuery,
  useLazyGetBudgetVsActualProjectsQuery,
  useGetBudgetVsActualDetailQuery,
  useLazyGetBudgetVsActualDetailQuery,
  useUpdateLeadBudgetMutation,
} = financialApi;
