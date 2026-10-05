import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export interface PaymentStats {
  totalOrderValue: number;
  totalReceived: number;
  outstanding: number;
  totalWipProfit: number;
}

export interface PaymentOrderDetails {
  customerName: string;
  orderId?: string;
  quoteOrderId?: string;
  location?: string;
}

export interface PaymentBreakdown {
  deposit: number;
  progress: number;
  final: number;
}

export interface PaymentOrderItem {
  wipId?: string;
  leadId?: string;
  orderDetails: PaymentOrderDetails;
  orderValue: number;
  currentCost: number;
  paymentBreakdown: PaymentBreakdown;
  outstanding: number;
  profit: number;
  marginPct: number;
  status: string;
  statusCode?: string;
  totalReceived?: number;
}

export interface PaymentOrderDetailData {
  wipId?: string;
  leadId?: string;
  orderDetails?: {
    customerName?: string;
    orderId?: string;
    quoteOrderId?: string;
    location?: string;
  };
  orderValue: number;
  currentCost: number;
  paymentBreakdown?: {
    deposit?: number;
    progress?: number;
    final?: number;
  };
  outstanding: number;
  profit: number;
  marginPct: number;
  status: string;
  statusCode?: string;
  totalReceived?: number;
  profile?: {
    quoteId?: string;
    quoteOrderId?: string;
    customerName?: string;
    orderValue?: number;
    projectName?: string;
    location?: string;
  };
  financials?: {
    deposit?: number;
    progress?: number;
    final?: number;
    profit?: number;
    outstanding?: number;
    totalPayable?: number;
    totalReceived?: number;
    marginPct?: number;
  };
  paymentStatus?: string;
  paymentStatusCode?: string;
  notes?: string;
  payments?: Array<{
    amount?: number;
    date?: string;
    type?: string;
    status?: string;
    [key: string]: unknown;
  }>;
  updatedAt?: string;
  createdAt?: string;
}

export type PaymentStatusEnum =
  | "in_progress"
  | "started"
  | "completed"
  | "on_hold";

export interface CreatePaymentOrderRequest {
  quoteOrderId: string;
  orderValue: number;
  currentCost?: number;
  depositPaid: number;
  progressPaid: number;
  finalPaid?: number;
  status: PaymentStatusEnum;
  notes?: string;
}

export interface UpdatePaymentOrderRequest {
  id: string; // quoteOrderId, wipId, or leadId
  orderValue: number;
  depositPaid: number;
  progressPaid: number;
  finalPaid?: number;
  status: PaymentStatusEnum;
}

export interface PaymentStatsParams {
  period?: "today" | "week" | "month" | string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentOrdersParams extends PaymentStatsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaymentOrdersResponseData {
  stats?: PaymentStats;
  orders: PaymentOrderItem[];
  total: number;
  page: number;
  limit: number;
}

export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["PaymentStats", "PaymentOrders", "PaymentOrderDetail"],
  endpoints: (builder) => ({
    // A1. Stats (top 4 cards)
    getPaymentStats: builder.query<PaymentStats, PaymentStatsParams | void>({
      query: (params) => {
        const cleanParams: Record<string, string> = {};
        if (params?.period && params.period !== "all") cleanParams.period = params.period;
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;

        return {
          url: "/api/account/payments/stats",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (response: ApiResponse<PaymentStats>) => {
        return (
          response.data || {
            totalOrderValue: 0,
            totalReceived: 0,
            outstanding: 0,
            totalWipProfit: 0,
          }
        );
      },
      providesTags: ["PaymentStats"],
    }),

    // A2. Orders & payment summary (list)
    getPaymentOrders: builder.query<
      PaymentOrdersResponseData,
      PaymentOrdersParams | void
    >({
      query: (params) => {
        const cleanParams: Record<string, string | number> = {};
        if (params?.search && params.search.trim()) {
          cleanParams.search = params.search.trim();
        }
        if (params?.status && params.status !== "All" && params.status !== "all") {
          cleanParams.status = params.status;
        }
        if (params?.period && params.period !== "all") {
          cleanParams.period = params.period;
        }
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.page) cleanParams.page = params.page;
        if (params?.limit) cleanParams.limit = params.limit;

        return {
          url: "/api/account/payments/orders",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (response: ApiResponse<PaymentOrdersResponseData>) => {
        return (
          response.data || {
            orders: [],
            total: 0,
            page: 1,
            limit: 20,
          }
        );
      },
      providesTags: ["PaymentOrders"],
    }),

    // A3. Order detail / view modal
    getPaymentOrderDetail: builder.query<PaymentOrderDetailData, string>({
      query: (id) => ({
        url: `/api/account/payments/orders/${encodeURIComponent(id)}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<PaymentOrderDetailData>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to load order details");
        }
        return response.data;
      },
      providesTags: (_result, _error, id) => [{ type: "PaymentOrderDetail", id }],
    }),

    // A4. Create (Add Order Payment)
    createPaymentOrder: builder.mutation<
      PaymentOrderDetailData,
      CreatePaymentOrderRequest
    >({
      query: (body) => ({
        url: "/api/account/payments/orders",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<PaymentOrderDetailData>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to create order payment");
        }
        return response.data;
      },
      invalidatesTags: ["PaymentStats", "PaymentOrders"],
    }),

    // A4. Update (Update Payment screen)
    updatePaymentOrder: builder.mutation<
      PaymentOrderDetailData,
      UpdatePaymentOrderRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/api/account/payments/orders/${encodeURIComponent(id)}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<PaymentOrderDetailData>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to update payment order");
        }
        return response.data;
      },
      invalidatesTags: (_result, _error, { id }) => [
        "PaymentStats",
        "PaymentOrders",
        { type: "PaymentOrderDetail", id },
      ],
    }),

    // Export WIP Excel
    exportWipProfits: builder.mutation<
      Blob,
      PaymentStatsParams | void
    >({
      query: (params) => {
        const cleanParams: Record<string, string> = {};
        if (params?.period && params.period !== "all") cleanParams.period = params.period;
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;

        return {
          url: "/api/account/financial-extra/wip-profits/export",
          method: "GET",
          params: cleanParams,
          responseHandler: async (response) => {
            if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              throw new Error(err.message || "Failed to export WIP Excel");
            }
            return response.blob();
          },
        };
      },
    }),
  }),
});

export const {
  useGetPaymentStatsQuery,
  useLazyGetPaymentStatsQuery,
  useGetPaymentOrdersQuery,
  useLazyGetPaymentOrdersQuery,
  useGetPaymentOrderDetailQuery,
  useLazyGetPaymentOrderDetailQuery,
  useCreatePaymentOrderMutation,
  useUpdatePaymentOrderMutation,
  useExportWipProfitsMutation,
} = paymentsApi;
