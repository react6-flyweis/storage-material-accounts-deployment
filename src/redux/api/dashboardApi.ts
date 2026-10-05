import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export interface FinancialOverview {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstanding?: number;
  outstandingPayments: number;
}

export interface InvoiceReport {
  total?: number;
  totalInvoicesGenerated: number;
  paid?: number;
  unpaid?: number;
  overdue?: number;
  totalPaid: number;
  totalUnpaid: number;
  overdueAmount: number;
  totalSales: number;
}

export interface DeliveryFinance {
  freightSpend: number;
  pendingCarrierPayments: number;
  freightSavings: number;
}

export interface OrderVsPlantCosts {
  totalOrderValue: number;
  totalPlantCosts: number;
  projectedProfit: number;
}

export interface RecentTransaction {
  id: string;
  type: "invoice" | "expense" | string;
  label: string;
  entityName: string;
  date: string;
  amount: number;
  direction: "credit" | "debit";
  status: string;
  invoiceNumber?: string;
  category?: string;
  raw?: Record<string, unknown>;
}

export interface DashboardAlert {
  id: string;
  type: string;
  message: string;
  priority: "high" | "medium" | "low" | string;
  dueDate: string | null;
  amount?: number;
}

export interface TopCarrier {
  carrierId: string | null;
  name: string;
  spend: number;
  deliveries: number;
}

export interface TopVendor {
  vendorId: string | null;
  name: string;
  contactName: string;
  amount: number;
  status: "Active" | "Expired" | string;
}

export interface UpcomingPayment {
  _id: string;
  invoiceNumber: string;
  totalAmount?: number;
  status?: string;
  description?: string;
  paymentDescription?: string;
  companyName: string;
  amount: number;
  dueDate: string;
  salesRep: string;
  priority: "high" | "medium" | "low" | string;
  leadId?: {
    _id: string;
    projectName?: string;
    assignedSales?: {
      _id: string;
      name?: string;
    };
  };
  customerId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    company?: string;
  };
}

export interface ProjectBudgetVsActual {
  leadId: string;
  projectName: string;
  jobId: string;
  material: number;
  estimated: number;
  actual: number;
  variance: number;
  varianceDirection: "over" | "under" | string;
  date: string;
}

export interface DashboardOverviewData {
  financialOverview: FinancialOverview;
  invoiceReport: InvoiceReport;
  deliveryFinance: DeliveryFinance;
  orderVsPlantCosts: OrderVsPlantCosts;
  recentTransactions: RecentTransaction[];
  alerts: DashboardAlert[];
  topCarriers: TopCarrier[];
  topVendors: TopVendor[];
  upcomingPayments: UpcomingPayment[];
  projectBudgetVsActual: ProjectBudgetVsActual[];
}

export interface IncomeVsExpensePoint {
  label: string;
  income: number;
  expense: number;
}

export interface IncomeVsExpenseData {
  period: string;
  points: IncomeVsExpensePoint[];
}

export interface PaymentDistributionCategory {
  count: number;
  amount: number;
  pct: number;
}

export interface PaymentDistributionData {
  paid: PaymentDistributionCategory;
  pending: PaymentDistributionCategory;
  overdue: PaymentDistributionCategory;
  totalAmount: number;
  totalCount: number;
}

export interface TrendPoint {
  month: string;
  amount: number;
}

export interface TrendData {
  points: TrendPoint[];
}

export interface DashboardQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  daysAhead?: number;
}

export interface DashboardOverviewParams extends DashboardQueryParams {
  transactionsLimit?: number;
  carriersLimit?: number;
  vendorsLimit?: number;
  budgetRowsLimit?: number;
}

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "DashboardOverview",
    "FinancialStats",
    "InvoiceStats",
    "DeliveryFinance",
    "OrderPlantCosts",
    "RecentTransactions",
    "Alerts",
    "TopCarriers",
    "TopVendors",
    "UpcomingPayments",
    "ProjectBudgetVsActual",
    "IncomeVsExpense",
    "PaymentDistribution",
    "RevenueTrend",
    "ExpenseTrend",
  ],
  endpoints: (builder) => ({
    // 1. Dashboard overview (single load)
    getDashboardOverview: builder.query<
      DashboardOverviewData,
      DashboardOverviewParams | void
    >({
      query: (params) => ({
        url: "/api/account/dashboard/overview",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<DashboardOverviewData>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to load dashboard overview");
        }
        return response.data;
      },
      providesTags: ["DashboardOverview"],
    }),

    // 2. Financial overview (top 4 cards)
    getFinancialStats: builder.query<FinancialOverview, DashboardQueryParams | void>({
      query: (params) => ({
        url: "/api/account/dashboard/stats",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<FinancialOverview>) => {
        return (
          response.data || {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            outstandingPayments: 0,
          }
        );
      },
      providesTags: ["FinancialStats"],
    }),

    // 3. Invoice report row
    getInvoiceStats: builder.query<InvoiceReport, DashboardQueryParams | void>({
      query: (params) => ({
        url: "/api/account/dashboard/invoice-stats",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<InvoiceReport>) => {
        return (
          response.data || {
            totalInvoicesGenerated: 0,
            totalPaid: 0,
            totalUnpaid: 0,
            overdueAmount: 0,
            totalSales: 0,
          }
        );
      },
      providesTags: ["InvoiceStats"],
    }),

    // 4. Delivery finance row
    getDeliveryFinance: builder.query<DeliveryFinance, DashboardQueryParams | void>({
      query: (params) => ({
        url: "/api/account/dashboard/delivery-finance",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<DeliveryFinance>) => {
        return (
          response.data || {
            freightSpend: 0,
            pendingCarrierPayments: 0,
            freightSavings: 0,
          }
        );
      },
      providesTags: ["DeliveryFinance"],
    }),

    // 5. Order value vs plant costs
    getOrderVsPlantCosts: builder.query<OrderVsPlantCosts, DashboardQueryParams | void>({
      query: (params) => ({
        url: "/api/account/dashboard/order-vs-plant-costs",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<OrderVsPlantCosts>) => {
        return (
          response.data || {
            totalOrderValue: 0,
            totalPlantCosts: 0,
            projectedProfit: 0,
          }
        );
      },
      providesTags: ["OrderPlantCosts"],
    }),

    // 6. Recent transactions
    getRecentTransactions: builder.query<
      RecentTransaction[],
      DashboardQueryParams | void
    >({
      query: (params) => ({
        url: "/api/account/dashboard/recent-transactions",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (
        response: ApiResponse<{ transactions: RecentTransaction[] }>
      ) => {
        return response.data?.transactions || [];
      },
      providesTags: ["RecentTransactions"],
    }),

    // 7. Alerts & notifications
    getAlerts: builder.query<DashboardAlert[], { limit?: number } | void>({
      query: (params) => ({
        url: "/api/account/dashboard/alerts",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (
        response: ApiResponse<{ alerts: DashboardAlert[] }>
      ) => {
        return response.data?.alerts || [];
      },
      providesTags: ["Alerts"],
    }),

    // 8. Top carriers by spend
    getTopCarriers: builder.query<TopCarrier[], DashboardQueryParams | void>({
      query: (params) => ({
        url: "/api/account/dashboard/top-carriers",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (
        response: ApiResponse<{ carriers: TopCarrier[] }>
      ) => {
        return response.data?.carriers || [];
      },
      providesTags: ["TopCarriers"],
    }),

    // 9. Top vendors
    getTopVendors: builder.query<TopVendor[], DashboardQueryParams | void>({
      query: (params) => ({
        url: "/api/account/dashboard/top-vendors",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (
        response: ApiResponse<{ vendors: TopVendor[] }>
      ) => {
        return response.data?.vendors || [];
      },
      providesTags: ["TopVendors"],
    }),

    // 10. Upcoming payments (from sales)
    getUpcomingPayments: builder.query<
      UpcomingPayment[],
      { daysAhead?: number } | void
    >({
      query: (params) => ({
        url: "/api/account/dashboard/upcoming-payments",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (
        response: ApiResponse<{ upcoming: UpcomingPayment[] }>
      ) => {
        return response.data?.upcoming || [];
      },
      providesTags: ["UpcomingPayments"],
    }),

    // 11. Project budget vs actual
    getProjectBudgetVsActual: builder.query<
      ProjectBudgetVsActual[],
      { limit?: number } | void
    >({
      query: (params) => ({
        url: "/api/account/dashboard/project-budget-vs-actual",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (
        response: ApiResponse<{ projects: ProjectBudgetVsActual[] }>
      ) => {
        return response.data?.projects || [];
      },
      providesTags: ["ProjectBudgetVsActual"],
    }),

    // 12. Other routes (charts)
    getIncomeVsExpense: builder.query<
      IncomeVsExpenseData,
      { period?: "daily" | "weekly" | "monthly" | string } | void
    >({
      query: (params) => ({
        url: "/api/account/dashboard/income-vs-expense",
        method: "GET",
        params: params || { period: "monthly" },
      }),
      transformResponse: (response: ApiResponse<IncomeVsExpenseData>) => {
        return response.data || { period: "monthly", points: [] };
      },
      providesTags: ["IncomeVsExpense"],
    }),

    getPaymentDistribution: builder.query<
      PaymentDistributionData,
      DashboardQueryParams | void
    >({
      query: (params) => ({
        url: "/api/account/dashboard/payment-distribution",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<PaymentDistributionData>) => {
        return (
          response.data || {
            paid: { count: 0, amount: 0, pct: 0 },
            pending: { count: 0, amount: 0, pct: 0 },
            overdue: { count: 0, amount: 0, pct: 0 },
            totalAmount: 0,
            totalCount: 0,
          }
        );
      },
      providesTags: ["PaymentDistribution"],
    }),

    getRevenueTrend: builder.query<TrendData, void>({
      query: () => ({
        url: "/api/account/dashboard/revenue-trend",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<TrendData>) => {
        return response.data || { points: [] };
      },
      providesTags: ["RevenueTrend"],
    }),

    getExpenseTrend: builder.query<TrendData, void>({
      query: () => ({
        url: "/api/account/dashboard/expense-trend",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<TrendData>) => {
        return response.data || { points: [] };
      },
      providesTags: ["ExpenseTrend"],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useLazyGetDashboardOverviewQuery,
  useGetFinancialStatsQuery,
  useGetInvoiceStatsQuery,
  useGetDeliveryFinanceQuery,
  useGetOrderVsPlantCostsQuery,
  useGetRecentTransactionsQuery,
  useGetAlertsQuery,
  useGetTopCarriersQuery,
  useGetTopVendorsQuery,
  useGetUpcomingPaymentsQuery,
  useGetProjectBudgetVsActualQuery,
  useGetIncomeVsExpenseQuery,
  useGetPaymentDistributionQuery,
  useGetRevenueTrendQuery,
  useGetExpenseTrendQuery,
} = dashboardApi;
