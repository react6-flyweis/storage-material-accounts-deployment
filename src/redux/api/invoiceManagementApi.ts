import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

// Common query params for list/summary routes
export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  leadId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  verificationStatus?: string;
  paymentStatus?: string;
  category?: string;
}

// ---------------- 1. Shared Filters ----------------
export interface InvoiceFilterProject {
  leadId: string;
  projectId: string;
  projectName: string;
  jobId?: string;
}

export interface InvoiceFiltersData {
  projects: InvoiceFilterProject[];
  verificationStatuses: string[];
  paymentStatuses: string[];
  miscCategories: string[];
  quotationProfitStatuses: string[];
}

// ---------------- 2. Project Invoices ----------------
export interface ProjectInvoicesSummary {
  totalInvoices: number;
  invoiceAmount: number;
  totalBilled: number;
  totalReceived: number;
  outstandingAmount: number;
  overdueAmount: number;
}

export interface ProjectInvoiceRecordItem {
  invoiceId: string;
  invoiceNumber: string;
  customerName?: string;
  customerId?: string;
  project?: string;
  projectName?: string;
  leadId?: string;
  invoiceType?: string;
  invoiceTypeLabel?: string;
  amount: number;
  dueDate: string;
  invoiceDate?: string;
  paymentStatus: "Paid" | "Pending" | string;
  invoiceStatus?: "draft" | "sent" | "paid" | "overdue" | string;
  paid?: number;
  amountDue?: number;
  documentUrl?: string | null;
  pdfUrl?: string | null;
  documentType?: "generated_pdf" | "payment_proof" | string;
}

// ---------------- Project Invoice Detail (Sales Panel contract) ----------------
export interface InvoiceLineItem {
  _id?: string;
  id?: string;
  description?: string | null;
  notes?: string | null;
  images?: string[] | null;
  items?: string[] | null;
  rate?: number | null;
  markup?: number | null;
  quantity?: number | null;
  tax?: number | null;
  total?: number | null;
  photos?: string[] | null;
  markupType?: string | null;
  taxType?: string | null;
  effectiveRate?: number | null;
  markupAmount?: number | null;
  taxAmount?: number | null;
}

export interface PaymentScheduleStage {
  _id?: string;
  stageName?: string | null;
  amount?: number | null;
  amountType?: "percentage" | "fixed" | string | null;
  dueDate?: string | null;
  status?: string | null;
  invoiceId?: string | null;
}

export interface PaymentScheduleDocument {
  _id?: string;
  leadId?: string | null;
  customerId?: string | null;
  totalAmount?: number | null;
  stages?: PaymentScheduleStage[] | null;
}

export interface InvoiceCustomerReference {
  _id?: string;
  customerId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface InvoiceDocument {
  _id: string;
  leadId?: string | null;
  paymentScheduleId?: string | null;
  paymentScheduleStageId?: string | null;
  customerId?: string | InvoiceCustomerReference | null;
  customerName?: string | null;
  quotationId?: string | null;
  invoiceNumber?: string | null;
  description?: string | null;
  poNumber?: string | null;
  date?: string | null;
  daysToPay?: number | string | null;
  dueDate?: string | null;
  subtotal?: number | null;
  markupTotal?: number | null;
  tax?: number | null;
  taxAmount?: number | null;
  discount?: number | null;
  depositAmount?: number | null;
  totalAmount?: number | null;
  amount?: number | null;
  amountDue?: number | null;
  paid?: number | null;
  status?: string | null;
  invoiceStatus?: string | null;
  paymentStatus?: string | null;
  workflowStatus?: string | null;
  revision?: number | null;
  sentAt?: string | null;
  sendMethod?: "platform" | "manual" | string | null;
  sentTo?: string | null;
  paidAt?: string | null;
  documentUrl?: string | null;
  pdfUrl?: string | null;
  lineItems?: InvoiceLineItem[] | null;
  projectName?: string | null;
  project?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface InvoiceDetailData {
  invoice: InvoiceDocument;
  paymentSchedule?: PaymentScheduleDocument | null;
}

// ---------------- 3. Vendor Invoices ----------------
export interface VendorInvoicesSummary {
  totalInvoices: number;
  invoiceAmount: number;
  pendingVerification: number;
  pendingPaymentCount?: number;
  pendingPaymentAmount: number;
}

export interface VendorInvoiceRecordItem {
  invoiceId: string;
  invoiceNumber: string;
  vendorName?: string;
  name?: string;
  project?: string;
  projectName?: string;
  leadId?: string;
  amount: number;
  dueDate: string;
  verification: "Verified" | "Pending" | string;
  verificationStatus?: string;
  payment: "Completed" | "Pending" | string;
  paymentStatus?: string;
  payableStatus?: string;
  documentUrl?: string | null;
}

// ---------------- 4. Carrier Invoices ----------------
export interface CarrierInvoicesSummary {
  totalInvoices: number;
  invoiceAmount: number;
  pendingVerification: number;
  pendingPaymentCount: number;
  pendingPaymentAmount: number;
}

export interface CarrierInvoiceRecordItem {
  invoiceId: string;
  invoiceNumber: string;
  vendorName?: string;
  carrierName?: string;
  name?: string;
  project?: string;
  projectName?: string;
  leadId?: string;
  amount: number;
  dueDate: string;
  verification: "Verified" | "Pending" | string;
  verificationStatus?: string;
  payment: "Pending" | "Completed" | string;
  paymentStatus?: string;
  payableStatus?: string;
  documentUrl?: string | null;
}

// ---------------- 5. Miscellaneous Invoices ----------------
export interface MiscInvoicesSummary {
  totalInvoices: number;
  totalInvoiceAmount: number;
  pendingPaymentAmount: number;
  overdueAmount: number;
}

export interface MiscInvoiceRecordItem {
  invoiceId?: string;
  id?: string;
  invoiceNumber: string;
  serviceProvider?: string;
  payeeName?: string;
  serviceCategory?: string;
  category?: string;
  amount: number;
  dueDate: string;
  invoiceDate?: string;
  approval?: "Approved" | "Pending" | "Rejected" | string;
  payment?: "Unpaid" | "Paid" | "Pending" | string;
  projectName?: string;
  project?: string;
  leadId?: string;
  projectId?: string;
  documentUrl?: string | null;
  documentFileName?: string | null;
  description?: string;
}

export interface CreateMiscInvoicePayload {
  projectId?: string;
  leadId?: string;
  serviceProvider?: string;
  payeeName?: string;
  amount?: number;
  totalAmount?: number;
  serviceCategory?: string;
  dueDate?: string;
  documentUrl?: string;
  documentFileName?: string;
  invoiceNumber?: string;
  description?: string;
  paymentStatus?: string;
}

// ---------------- 6. Quotation-wise P&L ----------------
export interface QuotationProfitSummary {
  totalQuotations: number;
  quotedRevenue: number;
  actualRevenue: number;
  actualCost: number;
  actualProfit: number;
}

export interface QuotationProfitRecordItem {
  quotationId: string;
  quotationNumber?: string;
  projectName?: string;
  customerName?: string;
  leadId?: string;
  projectId?: string;
  proposalDate?: string;
  quotedRevenue: number;
  actualRevenue: number;
  actualCost: number;
  actualProfit: number;
  profitMarginPercent?: number;
  status: "Profitable" | "Low Margin" | "Loss" | string;
  documentUrl?: string | null;
}

export interface UploadQuotationProfitPayload {
  quotationId: string;
  documentUrl?: string;
  revenue: number;
  actualCost: number;
  status?: string;
}

export interface QuotationProfitDetailData {
  quotationId?: string;
  status?: string;
  quotedRevenue?: number;
  actualRevenue?: number;
  actualCost?: number;
  actualProfit?: number;
  documentUrl?: string | null;
  costBreakdown?: {
    manualExpenses?: number;
    emailVendorExpenses?: number;
    freightExpenses?: number;
  };
  record?: QuotationProfitRecordItem;
  quotation?: {
    _id: string;
    quotationNumber?: string;
    leadId?: string;
    projectName?: string;
    customerName?: string;
    proposalDate?: string;
    totalAmount?: number;
    profitAnalysis?: {
      revenue?: number;
      actualCost?: number;
      actualProfit?: number;
      status?: string;
      documentUrl?: string;
    };
    [key: string]: unknown;
  };
}

// ---------------- Paginated Envelope Helper ----------------
export interface PaginatedRecords<T> {
  records: T[];
  total: number;
  page: number;
  limit: number;
}

export interface RecordsWrapper<T> {
  records?: T[];
  total?: number;
  page?: number;
  limit?: number;
}

// Helper function to build clean URL query parameters
function buildQueryParams(params?: InvoiceQueryParams): Record<string, string | number> {
  if (!params) return {};
  const query: Record<string, string | number> = {};
  if (params.page !== undefined) query.page = params.page;
  if (params.limit !== undefined) query.limit = params.limit;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;
  if (params.projectId && params.projectId !== "All") {
    query.projectId = params.projectId;
    query.leadId = params.projectId;
  }
  if (params.leadId && params.leadId !== "All") {
    query.leadId = params.leadId;
  }
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.sortOrder) query.sortOrder = params.sortOrder;
  if (params.status && params.status !== "All") query.status = params.status;
  if (params.verificationStatus && params.verificationStatus !== "All") {
    query.verificationStatus = params.verificationStatus;
  }
  if (params.paymentStatus && params.paymentStatus !== "All") {
    query.paymentStatus = params.paymentStatus;
  }
  if (params.category && params.category !== "All") query.category = params.category;
  return query;
}

// Helper to safely extract paginated records from various response formats
function extractPaginatedRecords<T>(
  response: ApiResponse<RecordsWrapper<T> | T[]> | RecordsWrapper<T>
): PaginatedRecords<T> {
  const rootData = (response as ApiResponse<RecordsWrapper<T> | T[]>)?.data;
  // Format 1: data.records wrapped inside data -> response.data.records
  if (rootData && typeof rootData === "object" && !Array.isArray(rootData) && Array.isArray(rootData.records)) {
    return {
      records: rootData.records,
      total: rootData.total ?? rootData.records.length,
      page: rootData.page ?? 1,
      limit: rootData.limit ?? 20,
    };
  }
  // Format 2: direct records on response -> response.records
  const directObj = response as RecordsWrapper<T>;
  if (directObj && Array.isArray(directObj.records)) {
    return {
      records: directObj.records,
      total: directObj.total ?? directObj.records.length,
      page: directObj.page ?? 1,
      limit: directObj.limit ?? 20,
    };
  }
  // Format 3: bare array in data
  if (Array.isArray(rootData)) {
    return {
      records: rootData,
      total: rootData.length,
      page: 1,
      limit: rootData.length || 20,
    };
  }
  return { records: [], total: 0, page: 1, limit: 20 };
}

export const invoiceManagementApi = createApi({
  reducerPath: "invoiceManagementApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "InvoiceFilters",
    "ProjectInvoicesSummary",
    "ProjectInvoicesRecords",
    "VendorInvoicesSummary",
    "VendorInvoicesRecords",
    "CarrierInvoicesSummary",
    "CarrierInvoicesRecords",
    "MiscInvoicesSummary",
    "MiscInvoicesRecords",
    "QuotationProfitSummary",
    "QuotationProfitRecords",
    "QuotationProfitDetail",
    "InvoiceDetail",
  ],
  endpoints: (builder) => ({
    // ---------------- 1. Shared Filters ----------------
    getInvoiceManagementFilters: builder.query<InvoiceFiltersData, void>({
      query: () => ({
        url: "/api/account/invoice-management/filters",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<InvoiceFiltersData>) => {
        const d = response?.data;
        return {
          projects: Array.isArray(d?.projects) ? d.projects : [],
          verificationStatuses: Array.isArray(d?.verificationStatuses)
            ? d.verificationStatuses
            : ["Verified", "Pending"],
          paymentStatuses: Array.isArray(d?.paymentStatuses)
            ? d.paymentStatuses
            : ["Completed", "Pending"],
          miscCategories: Array.isArray(d?.miscCategories)
            ? d.miscCategories
            : ["Maintenance", "Software", "Security", "Professional", "Utilities", "Other"],
          quotationProfitStatuses: Array.isArray(d?.quotationProfitStatuses)
            ? d.quotationProfitStatuses
            : ["Profitable", "Low Margin", "Loss"],
        };
      },
      providesTags: ["InvoiceFilters"],
    }),

    // ---------------- 2. Project Invoices ----------------
    getProjectInvoicesSummary: builder.query<ProjectInvoicesSummary, InvoiceQueryParams | void>({
      query: (params) => ({
        url: "/api/account/invoice-management/project/summary",
        method: "GET",
        params: buildQueryParams(params || {}),
      }),
      transformResponse: (response: ApiResponse<ProjectInvoicesSummary>) => {
        return (
          response?.data || {
            totalInvoices: 0,
            invoiceAmount: 0,
            totalBilled: 0,
            totalReceived: 0,
            outstandingAmount: 0,
            overdueAmount: 0,
          }
        );
      },
      providesTags: ["ProjectInvoicesSummary"],
    }),

    getProjectInvoicesRecords: builder.query<PaginatedRecords<ProjectInvoiceRecordItem>, InvoiceQueryParams>({
      query: (params) => ({
        url: "/api/account/invoice-management/project/records",
        method: "GET",
        params: buildQueryParams(params),
      }),
      transformResponse: (response: ApiResponse<RecordsWrapper<ProjectInvoiceRecordItem>>) => {
        return extractPaginatedRecords<ProjectInvoiceRecordItem>(response);
      },
      providesTags: ["ProjectInvoicesRecords"],
    }),

    // Customer AR Mark Paid: PUT /api/account/invoices/:id/mark-paid
    markProjectInvoicePaid: builder.mutation<ApiResponse<unknown>, string>({
      query: (invoiceId) => ({
        url: `/api/account/invoices/${encodeURIComponent(invoiceId)}/mark-paid`,
        method: "PUT",
      }),
      invalidatesTags: (_res, _err, invoiceId) => [
        "ProjectInvoicesSummary",
        "ProjectInvoicesRecords",
        { type: "InvoiceDetail", id: invoiceId },
      ],
    }),

    // Customer AR Follow-up: POST /api/account/invoices/:invoiceId/follow-up
    followUpProjectInvoice: builder.mutation<ApiResponse<unknown>, string>({
      query: (invoiceId) => ({
        url: `/api/account/invoices/${encodeURIComponent(invoiceId)}/follow-up`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, invoiceId) => [
        "ProjectInvoicesRecords",
        { type: "InvoiceDetail", id: invoiceId },
      ],
    }),

    // Customer Invoice Details (shared with Sales Panel): GET /api/invoices/:id
    getInvoiceDetail: builder.query<InvoiceDetailData, string>({
      query: (invoiceId) => ({
        url: `/api/invoices/${encodeURIComponent(invoiceId)}`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const d = response?.data || response;
        if (d?.invoice) {
          return {
            invoice: d.invoice,
            paymentSchedule: d.paymentSchedule || null,
          };
        }
        return {
          invoice: d || {},
          paymentSchedule: d?.paymentSchedule || null,
        };
      },
      providesTags: (_res, _err, id) => [{ type: "InvoiceDetail", id }],
    }),

    // ---------------- 3. Vendor Invoices ----------------
    getVendorInvoicesSummary: builder.query<VendorInvoicesSummary, InvoiceQueryParams | void>({
      query: (params) => ({
        url: "/api/account/invoice-management/vendor/summary",
        method: "GET",
        params: buildQueryParams(params || {}),
      }),
      transformResponse: (response: ApiResponse<VendorInvoicesSummary>) => {
        return (
          response?.data || {
            totalInvoices: 0,
            invoiceAmount: 0,
            pendingVerification: 0,
            pendingPaymentCount: 0,
            pendingPaymentAmount: 0,
          }
        );
      },
      providesTags: ["VendorInvoicesSummary"],
    }),

    getVendorInvoicesRecords: builder.query<PaginatedRecords<VendorInvoiceRecordItem>, InvoiceQueryParams>({
      query: (params) => ({
        url: "/api/account/invoice-management/vendor/records",
        method: "GET",
        params: buildQueryParams(params),
      }),
      transformResponse: (response: ApiResponse<RecordsWrapper<VendorInvoiceRecordItem>>) => {
        return extractPaginatedRecords<VendorInvoiceRecordItem>(response);
      },
      providesTags: ["VendorInvoicesRecords"],
    }),

    // Payables Mark Paid: PUT /api/account/payables/:invoiceId/mark-paid
    markPayablePaid: builder.mutation<ApiResponse<unknown>, { invoiceId: string; paymentMethod?: string }>({
      query: ({ invoiceId, paymentMethod = "ACH" }) => ({
        url: `/api/account/payables/${encodeURIComponent(invoiceId)}/mark-paid`,
        method: "PUT",
        body: { paymentMethod },
      }),
      invalidatesTags: [
        "VendorInvoicesSummary",
        "VendorInvoicesRecords",
        "CarrierInvoicesSummary",
        "CarrierInvoicesRecords",
        "MiscInvoicesSummary",
        "MiscInvoicesRecords",
      ],
    }),

    // ---------------- 4. Carrier Invoices ----------------
    getCarrierInvoicesSummary: builder.query<CarrierInvoicesSummary, InvoiceQueryParams | void>({
      query: (params) => ({
        url: "/api/account/invoice-management/carrier/summary",
        method: "GET",
        params: buildQueryParams(params || {}),
      }),
      transformResponse: (response: ApiResponse<CarrierInvoicesSummary>) => {
        return (
          response?.data || {
            totalInvoices: 0,
            invoiceAmount: 0,
            pendingVerification: 0,
            pendingPaymentCount: 0,
            pendingPaymentAmount: 0,
          }
        );
      },
      providesTags: ["CarrierInvoicesSummary"],
    }),

    getCarrierInvoicesRecords: builder.query<PaginatedRecords<CarrierInvoiceRecordItem>, InvoiceQueryParams>({
      query: (params) => ({
        url: "/api/account/invoice-management/carrier/records",
        method: "GET",
        params: buildQueryParams(params),
      }),
      transformResponse: (response: ApiResponse<RecordsWrapper<CarrierInvoiceRecordItem>>) => {
        return extractPaginatedRecords<CarrierInvoiceRecordItem>(response);
      },
      providesTags: ["CarrierInvoicesRecords"],
    }),

    // ---------------- 5. Miscellaneous Invoices ----------------
    getMiscInvoicesSummary: builder.query<MiscInvoicesSummary, InvoiceQueryParams | void>({
      query: (params) => ({
        url: "/api/account/invoice-management/miscellaneous/summary",
        method: "GET",
        params: buildQueryParams(params || {}),
      }),
      transformResponse: (response: ApiResponse<MiscInvoicesSummary>) => {
        return (
          response?.data || {
            totalInvoices: 0,
            totalInvoiceAmount: 0,
            pendingPaymentAmount: 0,
            overdueAmount: 0,
          }
        );
      },
      providesTags: ["MiscInvoicesSummary"],
    }),

    getMiscInvoicesRecords: builder.query<PaginatedRecords<MiscInvoiceRecordItem>, InvoiceQueryParams>({
      query: (params) => ({
        url: "/api/account/invoice-management/miscellaneous/records",
        method: "GET",
        params: buildQueryParams(params),
      }),
      transformResponse: (response: ApiResponse<RecordsWrapper<MiscInvoiceRecordItem>>) => {
        return extractPaginatedRecords<MiscInvoiceRecordItem>(response);
      },
      providesTags: ["MiscInvoicesRecords"],
    }),

    createMiscInvoice: builder.mutation<ApiResponse<unknown>, CreateMiscInvoicePayload>({
      query: (body) => ({
        url: "/api/account/invoice-management/miscellaneous",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MiscInvoicesSummary", "MiscInvoicesRecords", "InvoiceFilters"],
    }),

    // ---------------- 6. Quotation-wise P&L ----------------
    getQuotationProfitSummary: builder.query<QuotationProfitSummary, InvoiceQueryParams | void>({
      query: (params) => ({
        url: "/api/account/invoice-management/quotation-profit/summary",
        method: "GET",
        params: buildQueryParams(params || {}),
      }),
      transformResponse: (response: ApiResponse<QuotationProfitSummary>) => {
        return (
          response?.data || {
            totalQuotations: 0,
            quotedRevenue: 0,
            actualRevenue: 0,
            actualCost: 0,
            actualProfit: 0,
          }
        );
      },
      providesTags: ["QuotationProfitSummary"],
    }),

    getQuotationProfitRecords: builder.query<PaginatedRecords<QuotationProfitRecordItem>, InvoiceQueryParams>({
      query: (params) => ({
        url: "/api/account/invoice-management/quotation-profit/records",
        method: "GET",
        params: buildQueryParams(params),
      }),
      transformResponse: (response: ApiResponse<RecordsWrapper<QuotationProfitRecordItem>>) => {
        return extractPaginatedRecords<QuotationProfitRecordItem>(response);
      },
      providesTags: ["QuotationProfitRecords"],
    }),

    getQuotationProfitDetail: builder.query<QuotationProfitDetailData, string>({
      query: (quotationId) => ({
        url: `/api/account/invoice-management/quotation-profit/${encodeURIComponent(quotationId)}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<QuotationProfitDetailData>) => {
        if (!response?.data) {
          throw new Error(response?.message || "Failed to load quotation P&L detail");
        }
        return response.data;
      },
      providesTags: (_result, _error, quotationId) => [{ type: "QuotationProfitDetail", id: quotationId }],
    }),

    uploadQuotationProfit: builder.mutation<ApiResponse<unknown>, UploadQuotationProfitPayload>({
      query: (body) => ({
        url: "/api/account/invoice-management/quotation-profit/upload",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "QuotationProfitSummary",
        "QuotationProfitRecords",
        { type: "QuotationProfitDetail" },
      ],
    }),
  }),
});

export const {
  useGetInvoiceManagementFiltersQuery,
  useLazyGetInvoiceManagementFiltersQuery,

  // Project Invoices
  useGetProjectInvoicesSummaryQuery,
  useGetProjectInvoicesRecordsQuery,
  useGetInvoiceDetailQuery,
  useLazyGetInvoiceDetailQuery,
  useMarkProjectInvoicePaidMutation,
  useFollowUpProjectInvoiceMutation,

  // Vendor Invoices
  useGetVendorInvoicesSummaryQuery,
  useGetVendorInvoicesRecordsQuery,
  useMarkPayablePaidMutation,

  // Carrier Invoices
  useGetCarrierInvoicesSummaryQuery,
  useGetCarrierInvoicesRecordsQuery,

  // Miscellaneous Invoices
  useGetMiscInvoicesSummaryQuery,
  useGetMiscInvoicesRecordsQuery,
  useCreateMiscInvoiceMutation,

  // Quotation Profit
  useGetQuotationProfitSummaryQuery,
  useGetQuotationProfitRecordsQuery,
  useGetQuotationProfitDetailQuery,
  useLazyGetQuotationProfitDetailQuery,
  useUploadQuotationProfitMutation,
} = invoiceManagementApi;

// Helper to trigger direct export downloads (.xlsx) with authentication
export async function downloadInvoiceExport(
  type: "project" | "vendor" | "carrier" | "miscellaneous" | "quotation-profit",
  params?: InvoiceQueryParams,
  filename?: string
): Promise<void> {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "https://mr-storage-backend-025k.onrender.com";
  const baseUrl = apiBase.replace(/\/$/, "");

  const token = (await import("@/redux/store")).store.getState().auth?.accessToken;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const queryObj = buildQueryParams(params);
  const searchParams = new URLSearchParams();
  Object.entries(queryObj).forEach(([k, v]) => {
    searchParams.append(k, String(v));
  });

  const url = `${baseUrl}/api/account/invoice-management/${type}/export?${searchParams.toString()}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Export failed (${response.status}: ${response.statusText})`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute(
    "download",
    filename || `${type}-invoices.xlsx`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

// Helper to download invoice binary PDF directly and trigger browser file save
export async function downloadInvoicePdfBinary(
  invoiceId: string,
  invoiceNumber?: string,
  customPdfUrl?: string | null
): Promise<void> {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "https://mr-storage-backend-025k.onrender.com";
  const baseUrl = apiBase.replace(/\/$/, "");

  const token = (await import("@/redux/store")).store.getState().auth?.accessToken;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const candidateUrls: string[] = [];
  if (customPdfUrl) {
    const resolvedUrl = customPdfUrl.startsWith("http")
      ? customPdfUrl
      : `${baseUrl}${customPdfUrl.startsWith("/") ? "" : "/"}${customPdfUrl}`;
    candidateUrls.push(resolvedUrl);
  }
  if (invoiceId) {
    candidateUrls.push(`${baseUrl}/api/invoices/${encodeURIComponent(invoiceId)}/pdf`);
    candidateUrls.push(`${baseUrl}/api/invoices/${encodeURIComponent(invoiceId)}/download`);
    candidateUrls.push(`${baseUrl}/api/account/invoices/${encodeURIComponent(invoiceId)}/pdf`);
  }

  let downloadedBlob: Blob | null = null;
  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, { headers });
      if (response.ok) {
        downloadedBlob = await response.blob();
        break;
      }
    } catch {
      // continue to next URL candidate
    }
  }

  if (!downloadedBlob) {
    throw new Error("Unable to download invoice PDF binary.");
  }

  const downloadUrl = window.URL.createObjectURL(downloadedBlob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", `Invoice-${invoiceNumber || invoiceId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
