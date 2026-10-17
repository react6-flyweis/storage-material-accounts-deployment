import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

// --- Shared Filter Types ---
export interface CostFilterProject {
  _id: string;
  projectName: string;
  id?: string;
  name?: string;
  jobId?: string;
  code?: string;
}

export interface CostFilterEmployee {
  _id: string;
  name: string;
  empId?: string;
  designation?: string;
}

export interface CostFilterVendor {
  _id: string;
  name: string;
  vendorName?: string;
  category?: string;
}

export interface CostFiltersResponse {
  projects: CostFilterProject[];
  vendors: Array<CostFilterVendor | string>;
  employees: CostFilterEmployee[];
  designations: string[];
}

export interface CostListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  leadId?: string;
  projectId?: string;
  status?: string;
  designation?: string;
  category?: string;
  sort?: string;
  flowType?: "income" | "expense";
  timeframe?: string;
  project?: string;
}

// --- 1. Salary Types ---
export interface SalarySummary {
  totalSalaryCost?: number;
  netSalaryPaid?: number;
  pendingSalary?: number;
  totalEmployees?: number;
  totalSalary?: number;
  paidSalary?: number;
  [key: string]: unknown;
}

export interface SalaryRecord {
  _id: string;
  id?: string;
  date: string;
  netSalary: number;
  basicSalary?: number;
  deductions?: number;
  employeeName: string;
  employeeId?: string;
  employeeUserId?: string;
  designation?: string;
  paymentStatus: "Paid" | "Unpaid" | "Pending" | string;
  adminApproval?: "Approved" | "Pending" | "Rejected" | string;
  avatar?: string;
}

export interface SalaryRecordsResponse {
  rows: SalaryRecord[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSalaryPayload {
  date: string;
  netSalary: number;
  employeeName: string;
  employeeId?: string;
  employeeUserId?: string;
  designation?: string;
  paymentStatus: string;
  basicSalary?: number;
  deductions?: number;
}

// --- 2. Manpower Types ---
export interface ManpowerSummary {
  totalManpowerCost?: number;
  totalHours?: number;
  overtimeHours?: number;
  averageRatePerHour?: number;
  [key: string]: unknown;
}

export interface ManpowerEmployee {
  userId?: string;
  name?: string;
  designation?: string;
}

export interface ManpowerRecord {
  id?: string;
  _id?: string;
  expenseId?: string;
  date: string;
  employee?: ManpowerEmployee;
  employeeName?: string;
  employeeId?: string;
  employeeUserId?: string;
  designation?: string;
  project?: string;
  projectName?: string;
  leadId?: string | null;
  hours?: number;
  workingHours?: number;
  otHours?: number;
  ratePerHour?: number;
  totalCost?: number;
  status?: string;
  paymentStatus?: string;
}

export interface ManpowerRecordsResponse {
  rows: ManpowerRecord[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateManpowerPayload {
  date: string;
  leadId?: string | null;
  projectName?: string;
  project?: string;
  employeeName?: string;
  employeeUserId?: string;
  employee?: ManpowerEmployee;
  designation?: string;
  workingHours?: number;
  hours?: number;
  otHours?: number;
  ratePerHour?: number;
  totalCost?: number;
  paymentStatus?: string;
  status?: string;
}

export interface UpdateManpowerRequest extends CreateManpowerPayload {
  id: string;
}

// --- 3. Miscellaneous Types ---
export interface MiscellaneousSummary {
  totalMiscellaneousCost?: number;
  monthlyPlanned?: number;
  monthlyActual?: number;
  pendingApprovals?: number;
  [key: string]: unknown;
}

export interface MiscOverviewChartItem {
  label: string;
  planned: number;
  actual: number;
}

export interface MiscCategoryDistributionItem {
  category: string;
  amount: number | string;
  percentage?: string | number;
}

export interface MiscProjectWiseCostItem {
  leadId?: string;
  projectName: string;
  amount: number;
  transactionsCount?: number;
}

export interface MiscExpenseRecordItem {
  _id: string;
  id?: string;
  expenseCategory: string;
  expenseDate: string;
  expenseName: string;
  leadId?: string;
  projectName?: string;
  amount: number;
  vendorPayee?: string;
  paymentStatus: "Paid" | "Unpaid" | "Pending" | string;
  receiptFile?: string;
}

export interface MiscRecordsResponse {
  rows: MiscExpenseRecordItem[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateMiscExpensePayload {
  expenseCategory: string;
  expenseDate: string;
  expenseName: string;
  leadId?: string;
  amount: number;
  vendorPayee?: string;
  paymentStatus: string;
  receiptFile?: string;
}

// --- 4. Freight Types ---
export interface FreightSummary {
  totalFreightCost?: number | string;
  totalFreightCostSubtitle?: string;
  activeCarriers?: number;
  avgCostPerDelivery?: number | string;
  pendingInvoices?: number;
  [key: string]: unknown;
}

export interface FreightTrendItem {
  month: string;
  cost: number;
  deliveries?: number;
}

export interface FreightCarrierDistributionItem {
  carrier: string;
  amount: number;
  deliveriesCount?: number;
  percentage?: string | number;
}

export interface FreightDeliveryRecordItem {
  _id: string;
  id?: string;
  deliveryId: string;
  freightId?: string;
  carrierName: string;
  deliveryCompany?: string;
  route?: string;
  origin?: string;
  destination?: string;
  leadId?: string;
  projectName?: string;
  project?: string;
  amount: number;
  cost?: number;
  costFormatted?: string;
  status: string;
  approvalStatus?: string;
  date: string;
  selectedBidId?: string;
}

export interface FreightRecordsResponse {
  rows: FreightDeliveryRecordItem[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// --- 5. Logistics Types ---
export interface LogisticsSummary {
  totalLogisticsCost?: number | string;
  totalSavings?: number | string;
  pendingInvoices?: number;
  disputedItems?: number;
  [key: string]: unknown;
}

export interface LogisticsRecordItem {
  _id: string;
  id?: string;
  deliveryId: string;
  deliveryRef?: string;
  deliveryCompany: string;
  carrier?: string;
  project?: string;
  projectName?: string;
  leadId?: string;
  finalAmount: number;
  finalAmountFormatted?: string;
  date: string;
  createdAt?: string;
  approvalStatus?: "Approved" | "Pending" | "Rejected" | string;
  paymentStatus?: "Paid" | "Unpaid" | "Pending" | string;
}

export interface LogisticsRecordsResponse {
  rows: LogisticsRecordItem[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeliveryLookupResponse {
  deliveryId: string;
  deliveryRef?: string;
  project?: string;
  leadId?: string;
  deliveryCompany?: string;
  carrier?: string;
  finalAmount?: number;
  date?: string;
  status?: string;
}

export interface CreateLogisticsPayload {
  deliveryId?: string;
  deliveryRef?: string;
  project?: string;
  date: string;
  finalAmount: number;
  deliveryCompany: string;
  paymentStatus: string;
}

// --- 6. Cost Variance Types ---
export interface CostVarianceSummary {
  netVariance?: number | string;
  netVarianceSub?: string;
  overBudgetCount?: number;
  overBudgetAmount?: number | string;
  underBudgetCount?: number;
  underBudgetAmount?: number | string;
  onBudgetCount?: number;
  onBudgetSub?: string;
  [key: string]: unknown;
}

export interface CostVarianceAlertItem {
  _id?: string;
  id?: string;
  title: string;
  subtitle?: string;
  projectName?: string;
  awarded: number | string;
  actual: number | string;
  variance: number | string;
  percentageBadge?: string;
}

export interface CostVarianceTrendItem {
  month?: string;
  label?: string;
  awardedAmount: number;
  actualInvoice: number;
}

export interface CostVarianceDetailItem {
  _id: string;
  id?: string;
  project: string;
  leadId?: string;
  description: string;
  deliveryId?: string;
  vendor: string;
  vendorCode?: string;
  awardedAmount: number | string;
  actualInvoice: number | string;
  variance: number | string;
  varianceType?: "over" | "under" | "exact";
  status: "Over Budget" | "Under Budget" | "On Budget" | string;
}

export interface CostVarianceDetailsResponse {
  rows: CostVarianceDetailItem[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// --- 7. Rent Types ---
export interface RentSummary {
  totalMonthlyRent?: number | string;
  activeProperties?: number;
  upcomingRentDue?: number | string;
  paidThisMonth?: number | string;
  [key: string]: unknown;
}

export interface RentRecordItem {
  _id: string;
  id?: string;
  property: string;
  propertyName?: string;
  landlord?: string;
  type?: string;
  propertyType?: string;
  location?: string;
  monthlyRent: number | string;
  amount?: number | string;
  date?: string;
  dueDate?: string;
  rentPeriod?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  leaseEnd?: string;
  paymentSchedule?: string;
  paymentStatus: "Upcoming" | "Pending" | "Paid" | string;
  daysRemaining?: string;
}

export interface RentRecordsResponse {
  upcomingPayments?: RentRecordItem[];
  activeProperties?: RentRecordItem[];
  rows?: RentRecordItem[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateRentPayload {
  propertyName: string;
  landlord: string;
  propertyType?: string;
  location?: string;
  monthlyRent: number;
  paymentSchedule?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  paymentStatus?: string;
}

// --- 8. Item Cost List (SMDT) Types ---
export interface ItemListStats {
  totalItemCost: number;
  totalItems: number;
  newAdded: number;
  costVersion?: string | number;
}

export interface ItemCostRecord {
  itemId: string;
  _id?: string;
  id?: string;
  partName: string;
  partColour?: string | null;
  costUnit: string;
  mbsCost: number;
  currentMarketCost?: number | null;
  description: string;
  category: string;
}

export interface ItemListRecordsResponse {
  stats?: ItemListStats;
  rows: ItemCostRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
  costVersion?: string | number;
}

export interface CreateItemPartPayload {
  category: string;
  partName: string;
  partColor?: string;
  costUnit: string;
  mbsCost: number;
  currentMarketCost?: number;
  description?: string;
}

export interface UpdateItemPartPayload extends Partial<CreateItemPartPayload> {
  itemId: string;
  isActive?: boolean;
}

// --- 9. Future Income / Expense Types ---
export interface FutureCostSummary {
  expectedIncome?: number | string;
  expectedExpense?: number | string;
  expectedNetProfit?: number | string;
  upcomingPayments?: number | string;
  expectedReceivables?: number | string;
  [key: string]: unknown;
}

export interface FutureCostRecord {
  _id: string;
  id?: string;
  flowType: "income" | "expense";
  sourceName?: string;
  incomeSource?: string;
  expenseCategory?: string;
  expectedAmount: number;
  confidence?: "High" | "Medium" | "Low" | string;
  expectedDate?: string;
  status?: string;
  description?: string;
}

export interface ProjectForecastItem {
  id?: string;
  _id?: string;
  project: string;
  expectedIncome: number | string;
  expectedIncomeValue?: number;
  expectedExpense: number | string;
  expectedExpenseValue?: number;
  expectedProfit: number | string;
  expectedProfitValue?: number;
  margin?: string;
  marginPercent?: number;
  status?: "Healthy" | "Risk" | string;
  date?: string;
}

export interface FutureCostRecordsResponse {
  rows: FutureCostRecord[];
  total?: number;
  incomeBreakdown?: FutureCostRecord[];
  expenseBreakdown?: FutureCostRecord[];
  monthlyOverview?: Array<{
    month: string;
    year: string;
    income: number;
    expense: number;
    profit: number;
  }>;
  projectForecast?: ProjectForecastItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateFutureCostPayload {
  flowType: "income" | "expense";
  sourceName?: string;
  incomeSource?: string;
  expenseCategory?: string;
  expectedAmount: number;
  confidence?: "High" | "Medium" | "Low" | string;
  expectedDate?: string;
  description?: string;
}

// Helper to normalize query parameters
const cleanQueryParams = (params?: CostListQueryParams): Record<string, string | number> => {
  const clean: Record<string, string | number> = {};
  if (!params) return clean;
  if (params.page !== undefined) clean.page = params.page;
  if (params.limit !== undefined) clean.limit = params.limit;
  if (params.search && params.search.trim()) clean.search = params.search.trim();
  if (params.startDate) clean.startDate = params.startDate;
  if (params.endDate) clean.endDate = params.endDate;
  if (params.leadId) clean.leadId = params.leadId;
  if (params.projectId) clean.projectId = params.projectId;
  if (params.status && params.status !== "All") clean.status = params.status;
  if (params.designation && params.designation !== "All") clean.designation = params.designation;
  if (params.category && params.category !== "All") clean.category = params.category;
  if (params.sort) clean.sort = params.sort;
  if (params.flowType) clean.flowType = params.flowType;
  if (params.timeframe) clean.timeframe = params.timeframe;
  if (params.project && params.project !== "All") clean.project = params.project;
  return clean;
};

// Response unwrapper helper
const unwrapData = <T>(res: ApiResponse<T> | T): T => {
  if (res && typeof res === "object" && "data" in res && (res as ApiResponse<T>).data !== undefined) {
    return (res as ApiResponse<T>).data as T;
  }
  return res as T;
};

export const costsApi = createApi({
  reducerPath: "costsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "CostFilters",
    "SalarySummary",
    "SalaryRecords",
    "ManpowerSummary",
    "ManpowerRecords",
    "MiscSummary",
    "MiscOverviewChart",
    "MiscByCategory",
    "MiscByProject",
    "MiscRecords",
    "FreightSummary",
    "FreightTrend",
    "FreightCarriers",
    "FreightRecords",
    "LogisticsSummary",
    "LogisticsRecords",
    "VarianceSummary",
    "VarianceAlerts",
    "VarianceTrend",
    "VarianceDetails",
    "RentSummary",
    "RentRecords",
    "ItemListCategories",
    "ItemListSummary",
    "ItemListStats",
    "ItemListRecords",
    "FutureSummary",
    "FutureRecords",
  ],
  endpoints: (builder) => ({
    // Shared Filters
    getCostFilters: builder.query<CostFiltersResponse, void>({
      query: () => ({
        url: "/api/account/costs/filters",
        method: "GET",
      }),
      transformResponse: unwrapData<CostFiltersResponse>,
      providesTags: ["CostFilters"],
    }),

    // 1. Salary
    getSalarySummary: builder.query<SalarySummary, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/salary/summary",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<SalarySummary>,
      providesTags: ["SalarySummary"],
    }),
    getSalaryRecords: builder.query<SalaryRecordsResponse, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/salary/records",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<SalaryRecordsResponse>,
      providesTags: ["SalaryRecords"],
    }),
    createSalaryRecord: builder.mutation<SalaryRecord, CreateSalaryPayload>({
      query: (body) => ({
        url: "/api/account/costs/salary/records",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SalarySummary", "SalaryRecords"],
    }),
    markSalaryPaid: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/account/costs/salary/${encodeURIComponent(id)}/mark-paid`,
        method: "PATCH",
      }),
      invalidatesTags: ["SalarySummary", "SalaryRecords"],
    }),
    deleteSalaryRecord: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/account/costs/salary/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalarySummary", "SalaryRecords"],
    }),

    // 2. Manpower
    getManpowerSummary: builder.query<ManpowerSummary, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/manpower/summary",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<ManpowerSummary>,
      providesTags: ["ManpowerSummary"],
    }),
    getManpowerRecords: builder.query<ManpowerRecordsResponse, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/manpower/records",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<ManpowerRecordsResponse>,
      providesTags: ["ManpowerRecords"],
    }),
    createManpowerRecord: builder.mutation<ManpowerRecord, CreateManpowerPayload>({
      query: (body) => ({
        url: "/api/account/costs/manpower/records",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ManpowerSummary", "ManpowerRecords"],
    }),
    updateManpowerRecord: builder.mutation<ManpowerRecord, UpdateManpowerRequest>({
      query: ({ id, ...body }) => ({
        url: `/api/account/costs/manpower/${encodeURIComponent(id)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ManpowerSummary", "ManpowerRecords"],
    }),
    deleteManpowerRecord: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/account/costs/manpower/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ManpowerSummary", "ManpowerRecords"],
    }),

    // 3. Miscellaneous
    getMiscSummary: builder.query<MiscellaneousSummary, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/miscellaneous/summary",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<MiscellaneousSummary>,
      providesTags: ["MiscSummary"],
    }),
    getMiscOverviewChart: builder.query<MiscOverviewChartItem[], CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/miscellaneous/overview-chart",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<MiscOverviewChartItem[]>,
      providesTags: ["MiscOverviewChart"],
    }),
    getMiscByCategory: builder.query<MiscCategoryDistributionItem[], CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/miscellaneous/by-category",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<MiscCategoryDistributionItem[]>,
      providesTags: ["MiscByCategory"],
    }),
    getMiscByProject: builder.query<MiscProjectWiseCostItem[], CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/miscellaneous/by-project",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<MiscProjectWiseCostItem[]>,
      providesTags: ["MiscByProject"],
    }),
    getMiscRecords: builder.query<MiscRecordsResponse, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/miscellaneous/records",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<MiscRecordsResponse>,
      providesTags: ["MiscRecords"],
    }),
    createMiscRecord: builder.mutation<MiscExpenseRecordItem, CreateMiscExpensePayload>({
      query: (body) => ({
        url: "/api/account/costs/miscellaneous/records",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MiscSummary", "MiscOverviewChart", "MiscByCategory", "MiscByProject", "MiscRecords"],
    }),

    // 4. Freight (Read-only bids)
    getFreightSummary: builder.query<FreightSummary, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/freight/summary",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<FreightSummary>,
      providesTags: ["FreightSummary"],
    }),
    getFreightTrend: builder.query<FreightTrendItem[], CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/freight/trend",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<FreightTrendItem[]>,
      providesTags: ["FreightTrend"],
    }),
    getFreightCarrierDistribution: builder.query<FreightCarrierDistributionItem[], CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/freight/carrier-distribution",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<FreightCarrierDistributionItem[]>,
      providesTags: ["FreightCarriers"],
    }),
    getFreightRecords: builder.query<FreightRecordsResponse, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/freight/records",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<FreightRecordsResponse>,
      providesTags: ["FreightRecords"],
    }),

    // 5. Logistics
    getLogisticsSummary: builder.query<LogisticsSummary, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/logistics/summary",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<LogisticsSummary>,
      providesTags: ["LogisticsSummary"],
    }),
    getLogisticsRecords: builder.query<LogisticsRecordsResponse, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/logistics/records",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<LogisticsRecordsResponse>,
      providesTags: ["LogisticsRecords"],
    }),
    lookupLogisticsDelivery: builder.query<DeliveryLookupResponse, string>({
      query: (deliveryRef) => ({
        url: `/api/account/costs/logistics/delivery-lookup/${encodeURIComponent(deliveryRef)}`,
        method: "GET",
      }),
      transformResponse: unwrapData<DeliveryLookupResponse>,
    }),
    createLogisticsRecord: builder.mutation<LogisticsRecordItem, CreateLogisticsPayload>({
      query: (body) => ({
        url: "/api/account/costs/logistics/records",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LogisticsSummary", "LogisticsRecords"],
    }),

    // 6. Cost Variance
    getCostVarianceSummary: builder.query<CostVarianceSummary, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/variance/summary",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<CostVarianceSummary>,
      providesTags: ["VarianceSummary"],
    }),
    getCostVarianceAlerts: builder.query<CostVarianceAlertItem[], CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/variance/alerts",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: (
        res: ApiResponse<unknown> | unknown
      ): CostVarianceAlertItem[] => {
        const unwrapped = unwrapData<unknown>(res);
        if (Array.isArray(unwrapped)) {
          return unwrapped as CostVarianceAlertItem[];
        }
        if (unwrapped && typeof unwrapped === "object") {
          const obj = unwrapped as Record<string, unknown>;
          if (Array.isArray(obj.alerts)) return obj.alerts as CostVarianceAlertItem[];
          if (Array.isArray(obj.rows)) return obj.rows as CostVarianceAlertItem[];
          if (Array.isArray(obj.data)) return obj.data as CostVarianceAlertItem[];
        }
        return [];
      },
      providesTags: ["VarianceAlerts"],
    }),
    getCostVarianceTrend: builder.query<CostVarianceTrendItem[], CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/variance/trend",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: (
        res: ApiResponse<unknown> | unknown
      ): CostVarianceTrendItem[] => {
        const unwrapped = unwrapData<unknown>(res);
        if (Array.isArray(unwrapped)) {
          return unwrapped as CostVarianceTrendItem[];
        }
        if (unwrapped && typeof unwrapped === "object") {
          const obj = unwrapped as Record<string, unknown>;
          if (Array.isArray(obj.points)) return obj.points as CostVarianceTrendItem[];
          if (Array.isArray(obj.trend)) return obj.trend as CostVarianceTrendItem[];
          if (Array.isArray(obj.rows)) return obj.rows as CostVarianceTrendItem[];
          if (Array.isArray(obj.data)) return obj.data as CostVarianceTrendItem[];
        }
        return [];
      },
      providesTags: ["VarianceTrend"],
    }),
    getCostVarianceDetails: builder.query<CostVarianceDetailsResponse, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/variance/details",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<CostVarianceDetailsResponse>,
      providesTags: ["VarianceDetails"],
    }),

    // 7. Rent
    getRentSummary: builder.query<RentSummary, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/rent/summary",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<RentSummary>,
      providesTags: ["RentSummary"],
    }),
    getRentRecords: builder.query<RentRecordsResponse, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/rent/records",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<RentRecordsResponse>,
      providesTags: ["RentRecords"],
    }),
    createRentRecord: builder.mutation<RentRecordItem, CreateRentPayload>({
      query: (body) => ({
        url: "/api/account/costs/rent/records",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RentSummary", "RentRecords"],
    }),

    // 8. Item Cost List (SMDT)
    getItemListCategories: builder.query<string[], void>({
      query: () => ({
        url: "/api/account/costs/item-list/categories",
        method: "GET",
      }),
      transformResponse: unwrapData<string[]>,
      providesTags: ["ItemListCategories"],
    }),
    getItemListSummary: builder.query<ItemListStats, void>({
      query: () => ({
        url: "/api/account/costs/item-list/summary",
        method: "GET",
      }),
      transformResponse: unwrapData<ItemListStats>,
      providesTags: ["ItemListSummary"],
    }),
    getItemListStats: builder.query<ItemListStats, void>({
      query: () => ({
        url: "/api/account/costs/item-list/stats",
        method: "GET",
      }),
      transformResponse: unwrapData<ItemListStats>,
      providesTags: ["ItemListStats"],
    }),
    getItemListRecords: builder.query<ItemListRecordsResponse, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/item-list/records",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<ItemListRecordsResponse>,
      providesTags: ["ItemListRecords"],
    }),
    getItemDetail: builder.query<ItemCostRecord, string>({
      query: (itemId) => ({
        url: `/api/account/costs/item-list/records/${encodeURIComponent(itemId)}`,
        method: "GET",
      }),
      transformResponse: unwrapData<ItemCostRecord>,
    }),
    createItemPart: builder.mutation<ItemCostRecord, CreateItemPartPayload>({
      query: (body) => ({
        url: "/api/account/costs/item-list/records",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ItemListSummary", "ItemListStats", "ItemListRecords"],
    }),
    updateItemPart: builder.mutation<ItemCostRecord, UpdateItemPartPayload>({
      query: ({ itemId, ...body }) => ({
        url: `/api/account/costs/item-list/records/${encodeURIComponent(itemId)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ItemListSummary", "ItemListStats", "ItemListRecords"],
    }),

    // 9. Future Income / Expense
    getFutureSummary: builder.query<FutureCostSummary, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/future/summary",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<FutureCostSummary>,
      providesTags: ["FutureSummary"],
    }),
    getFutureRecords: builder.query<FutureCostRecordsResponse, CostListQueryParams | void>({
      query: (params) => ({
        url: "/api/account/costs/future/records",
        method: "GET",
        params: cleanQueryParams(params || undefined),
      }),
      transformResponse: unwrapData<FutureCostRecordsResponse>,
      providesTags: ["FutureRecords"],
    }),
    createFutureRecord: builder.mutation<FutureCostRecord, CreateFutureCostPayload>({
      query: (body) => ({
        url: "/api/account/costs/future/records",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FutureSummary", "FutureRecords"],
    }),
  }),
});

export const {
  useGetCostFiltersQuery,
  // Salary
  useGetSalarySummaryQuery,
  useGetSalaryRecordsQuery,
  useCreateSalaryRecordMutation,
  useMarkSalaryPaidMutation,
  useDeleteSalaryRecordMutation,
  // Manpower
  useGetManpowerSummaryQuery,
  useGetManpowerRecordsQuery,
  useCreateManpowerRecordMutation,
  useUpdateManpowerRecordMutation,
  useDeleteManpowerRecordMutation,
  // Miscellaneous
  useGetMiscSummaryQuery,
  useGetMiscOverviewChartQuery,
  useGetMiscByCategoryQuery,
  useGetMiscByProjectQuery,
  useGetMiscRecordsQuery,
  useCreateMiscRecordMutation,
  // Freight
  useGetFreightSummaryQuery,
  useGetFreightTrendQuery,
  useGetFreightCarrierDistributionQuery,
  useGetFreightRecordsQuery,
  // Logistics
  useGetLogisticsSummaryQuery,
  useGetLogisticsRecordsQuery,
  useLookupLogisticsDeliveryQuery,
  useLazyLookupLogisticsDeliveryQuery,
  useCreateLogisticsRecordMutation,
  // Cost Variance
  useGetCostVarianceSummaryQuery,
  useGetCostVarianceAlertsQuery,
  useGetCostVarianceTrendQuery,
  useGetCostVarianceDetailsQuery,
  // Rent
  useGetRentSummaryQuery,
  useGetRentRecordsQuery,
  useCreateRentRecordMutation,
  // Item Cost List (SMDT)
  useGetItemListCategoriesQuery,
  useGetItemListSummaryQuery,
  useGetItemListStatsQuery,
  useGetItemListRecordsQuery,
  useGetItemDetailQuery,
  useLazyGetItemDetailQuery,
  useCreateItemPartMutation,
  useUpdateItemPartMutation,
  // Future Income/Expense
  useGetFutureSummaryQuery,
  useGetFutureRecordsQuery,
  useCreateFutureRecordMutation,
} = costsApi;
