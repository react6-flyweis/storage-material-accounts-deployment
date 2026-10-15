import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface PaymentApprovalFilterProject {
  leadId: string;
  projectName: string;
  jobId: string;
  businessUnit?: string;
}

export interface PaymentApprovalFilterPayeeType {
  code: string;
  label: string;
}

export interface PaymentApprovalFiltersData {
  projects: PaymentApprovalFilterProject[];
  payeeTypes: PaymentApprovalFilterPayeeType[];
  statuses: string[];
  workflowStages: string[];
}

export interface ExportPaymentApprovalsParams {
  status?: string;
  startDate?: string;
  endDate?: string;
}

// ─── B1. Stats ────────────────────────────────────────────────────────────────

export interface PaymentApprovalStats {
  pendingApproval: number;
  underReview: number;
  approved: number;
  disputed: number;
}

// ─── B2. List ─────────────────────────────────────────────────────────────────

export interface PaymentApprovalApiItem {
  approvalId: string;
  invoiceType: string;
  invoiceTypeCode: string;
  companyName: string;
  invoiceNumber: string;
  project: {
    leadId: string;
    projectName: string;
    jobId: string;
  };
  amount: number;
  dueDate: string;
  linkedTo: string;
  linkedType: string;
  linkedId: string;
  status: string;
  statusLabel: string;
  category: string;
  paidAt?: string | null;
  workflowStage?: string;
}

export interface PaymentApprovalsListData {
  stats: PaymentApprovalStats;
  approvals: PaymentApprovalApiItem[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentApprovalsListParams {
  search?: string;
  status?: string;
  payeeType?: string;
  project?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ─── B3. Detail ───────────────────────────────────────────────────────────────

export interface PaymentApprovalDetail {
  approvalId: string;
  status: string;
  statusLabel: string;
  invoiceNumber: string;
  invoiceType: string;
  invoiceTypeCode: string;
  companyName: string;
  invoiceDetails: {
    invoiceAmount: number;
    status: string;
    paymentDueDate: string;
    paymentPriority: string;
  };
  companyInformation: {
    companyName: string;
    deliveryDate: string;
    deliveryId: string;
  };
  costBreakdown: {
    baseFreight: number;
    fuelSurcharge: number;
    handlingFee: number;
    total: number;
  };
  linkedTransaction: {
    freightRequestId: string;
    loadId: string;
    projectName: string;
    linkedDeliveryId: string;
    linkedDeliveryNumber: string;
    route: string;
  };
  project: {
    leadId: string;
    projectName: string;
    jobId: string;
    location: string;
  };
  amount: number;
  dueDate: string;
  category: string;
  notes: string;
}

// ─── B4. Review workflow ──────────────────────────────────────────────────────

export type ReviewAction = "under_review" | "approved" | "disputed" | "rejected";

export interface ReviewPaymentApprovalRequest {
  approvalId: string;
  action: ReviewAction;
  reviewNotes?: string;
}

// ─── API slice ────────────────────────────────────────────────────────────────

export const paymentApprovalsApi = createApi({
  reducerPath: "paymentApprovalsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "PaymentApprovalStats",
    "PaymentApprovals",
    "PaymentApprovalDetail",
    "PaymentApprovalFilters",
  ],
  endpoints: (builder) => ({
    // 3.1 Filters (dropdowns)
    getPaymentApprovalFilters: builder.query<PaymentApprovalFiltersData, void>({
      query: () => ({
        url: "/api/account/financial/payment-approvals/filters",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<PaymentApprovalFiltersData>) =>
        response.data ?? {
          projects: [],
          payeeTypes: [],
          statuses: [],
          workflowStages: [],
        },
      providesTags: ["PaymentApprovalFilters"],
    }),

    // B1. Stats
    getPaymentApprovalStats: builder.query<PaymentApprovalStats, void>({
      query: () => ({
        url: "/api/account/financial/payment-approvals/stats",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<PaymentApprovalStats>) =>
        response.data ?? {
          pendingApproval: 0,
          underReview: 0,
          approved: 0,
          disputed: 0,
        },
      providesTags: ["PaymentApprovalStats"],
    }),

    // B2. Approval queue (list)
    getPaymentApprovals: builder.query<
      PaymentApprovalsListData,
      PaymentApprovalsListParams | void
    >({
      query: (params) => {
        const cleanParams: Record<string, string | number> = {};
        if (params?.search?.trim()) cleanParams.search = params.search.trim();
        if (params?.status && params.status !== "All" && params.status !== "all")
          cleanParams.status = params.status;
        if (params?.payeeType && params.payeeType !== "All")
          cleanParams.payeeType = params.payeeType;
        if (params?.project && params.project !== "All")
          cleanParams.project = params.project;
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.page) cleanParams.page = params.page;
        if (params?.limit) cleanParams.limit = params.limit;

        return {
          url: "/api/account/financial/payment-approvals",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (response: ApiResponse<PaymentApprovalsListData>) =>
        response.data ?? {
          stats: { pendingApproval: 0, underReview: 0, approved: 0, disputed: 0 },
          approvals: [],
          total: 0,
          page: 1,
          limit: 20,
        },
      providesTags: ["PaymentApprovals"],
    }),

    // B3. Payment detail (modal)
    getPaymentApprovalDetail: builder.query<PaymentApprovalDetail, string>({
      query: (approvalId) => ({
        url: `/api/account/financial/payment-approvals/${encodeURIComponent(approvalId)}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<PaymentApprovalDetail>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to load approval details");
        }
        return response.data;
      },
      providesTags: (_result, _error, approvalId) => [
        { type: "PaymentApprovalDetail", id: approvalId },
      ],
    }),

    // B4. Review workflow (approve / reject / dispute / under_review)
    reviewPaymentApproval: builder.mutation<
      { success: boolean; message: string },
      ReviewPaymentApprovalRequest
    >({
      query: ({ approvalId, action, reviewNotes }) => ({
        url: `/api/account/financial/payment-approvals/${encodeURIComponent(approvalId)}/review`,
        method: "PUT",
        body: { action, ...(reviewNotes ? { reviewNotes } : {}) },
      }),
      transformResponse: (
        response: ApiResponse<{ success: boolean; message: string }>
      ) => ({
        success: response.success,
        message: response.message,
      }),
      invalidatesTags: (_result, _error, { approvalId }) => [
        "PaymentApprovals",
        "PaymentApprovalStats",
        { type: "PaymentApprovalDetail", id: approvalId },
      ],
    }),

    // 3.6 Export
    exportPaymentApprovals: builder.mutation<
      Blob,
      ExportPaymentApprovalsParams | void
    >({
      query: (params) => {
        const cleanParams: Record<string, string> = {};
        if (params?.status && params.status !== "All" && params.status !== "all") {
          cleanParams.status = params.status;
        }
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;

        return {
          url: "/api/account/financial/payment-approvals/export",
          method: "GET",
          params: cleanParams,
          responseHandler: async (response) => {
            if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              throw new Error(err.message || "Failed to export payment approvals");
            }
            return response.blob();
          },
        };
      },
    }),
  }),
});

export const {
  useGetPaymentApprovalFiltersQuery,
  useLazyGetPaymentApprovalFiltersQuery,
  useGetPaymentApprovalStatsQuery,
  useGetPaymentApprovalsQuery,
  useLazyGetPaymentApprovalsQuery,
  useGetPaymentApprovalDetailQuery,
  useLazyGetPaymentApprovalDetailQuery,
  useReviewPaymentApprovalMutation,
  useExportPaymentApprovalsMutation,
} = paymentApprovalsApi;
