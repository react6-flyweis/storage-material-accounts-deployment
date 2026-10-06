import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
}

export interface CustomerStatsParams {
  period?: "today" | "week" | "month" | "all" | string;
  startDate?: string;
  endDate?: string;
}

export interface CustomerListItem {
  _id: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive" | string;
  totalProjects?: number;
  joinedDate?: string;
  company?: string;
  photo?: string | null;
}

export interface CustomerListResponseData {
  customers: CustomerListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerListParams {
  period?: "today" | "week" | "month" | "all" | string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomerProfile {
  _id: string;
  customerId: string;
  customerName: string;
  status: "Active" | "Inactive" | string;
  joinedDate: string;
  phone: string;
  email: string;
  address?: string;
  company?: string;
  photo?: string | null;
}

export interface CustomerSummary {
  totalProjects: number;
  totalProjectValue: number;
  totalProjectCost: number;
  totalFreightCost: number;
  expectedMargin: number;
  actualMargin: number;
  totalExpenses: number;
  outstandingAmount: number;
}

export interface CustomerRevenue {
  totalQuotedValue: number;
  totalInvoiced: number;
  totalReceived: number;
  outstandingAmount: number;
  overdue: number;
}

export interface ProfitabilityOverviewItem {
  key: string;
  label: string;
  expected: number;
  actual: number;
  variance: number;
  unit?: "percent" | "currency" | string;
}

export interface CustomerProjectItem {
  leadId: string;
  projectId: string;
  projectName: string;
  amount: number;
  status: string;
  lifecycleStatus?: string;
  startDate: string;
  endDate?: string | null;
  buildingType?: string;
  location?: string;
}

export interface CustomerInvoiceItem {
  invoiceId: string;
  invoiceNumber: string;
  dueDate: string;
  amount: number;
  paid: number;
  amountDue: number;
  status: "Paid" | "Unpaid" | "Overdue" | string;
  invoiceStatus?: "paid" | "sent" | "draft" | "overdue" | string;
  projectName?: string;
}

export interface CustomerDetailData {
  profile: CustomerProfile;
  summary: CustomerSummary;
  customerRevenue: CustomerRevenue;
  profitabilityOverview: ProfitabilityOverviewItem[];
  projects: CustomerProjectItem[];
  invoices: CustomerInvoiceItem[];
}

export interface CustomerDetailParams {
  id: string;
  search?: string;
  period?: "today" | "week" | "month" | "all" | string;
  startDate?: string;
  endDate?: string;
}

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CustomerStats", "Customers", "CustomerDetail"],
  endpoints: (builder) => ({
    // 1. Customer stats
    getCustomerStats: builder.query<CustomerStats, CustomerStatsParams | void>({
      query: (params) => {
        const cleanParams: Record<string, string> = {};
        if (params?.period && params.period !== "all") {
          cleanParams.period = params.period;
        }
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;

        return {
          url: "/api/account/customers/stats",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (response: ApiResponse<CustomerStats>) => {
        return (
          response.data || {
            totalCustomers: 126,
            activeCustomers: 48,
            newCustomersThisMonth: 15,
            returningCustomers: 9,
          }
        );
      },
      providesTags: ["CustomerStats"],
    }),

    // 2. Customer list
    getCustomers: builder.query<CustomerListResponseData, CustomerListParams | void>({
      query: (params) => {
        const cleanParams: Record<string, string | number> = {};
        if (params?.period && params.period !== "all") {
          cleanParams.period = params.period;
        }
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.search && params.search.trim()) {
          cleanParams.search = params.search.trim();
        }
        if (params?.page) cleanParams.page = params.page;
        if (params?.limit) cleanParams.limit = params.limit;

        return {
          url: "/api/account/customers",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (response: ApiResponse<CustomerListResponseData>) => {
        return (
          response.data || {
            customers: [],
            total: 0,
            page: 1,
            limit: 20,
          }
        );
      },
      providesTags: ["Customers"],
    }),

    // 3. Customer detail
    getCustomerDetail: builder.query<CustomerDetailData, CustomerDetailParams | string>({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const cleanParams: Record<string, string> = {};
        if (typeof arg !== "string") {
          if (arg.search && arg.search.trim()) cleanParams.search = arg.search.trim();
          if (arg.period && arg.period !== "all") cleanParams.period = arg.period;
          if (arg.startDate) cleanParams.startDate = arg.startDate;
          if (arg.endDate) cleanParams.endDate = arg.endDate;
        }

        return {
          url: `/api/account/customers/${encodeURIComponent(id)}`,
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (response: ApiResponse<CustomerDetailData>) => {
        if (!response.data) {
          throw new Error(response.message || "Customer details not found");
        }
        return response.data;
      },
      providesTags: (_result, _error, arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        return [{ type: "CustomerDetail", id }];
      },
    }),

    // 4. Mark invoice paid
    markInvoicePaid: builder.mutation<ApiResponse<unknown>, string>({
      query: (invoiceId) => ({
        url: `/api/account/invoices/${encodeURIComponent(invoiceId)}/mark-paid`,
        method: "PUT",
      }),
      invalidatesTags: ["CustomerDetail", "CustomerStats"],
    }),
  }),
});

export const {
  useGetCustomerStatsQuery,
  useLazyGetCustomerStatsQuery,
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useGetCustomerDetailQuery,
  useLazyGetCustomerDetailQuery,
  useMarkInvoicePaidMutation,
} = customerApi;
