import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export interface ProjectOverview {
  leadId: string;
  projectName: string;
  jobId: string;
  projectId: string;
  status: string;
  statusLabel: string;
  buildingType: string;
  quoteValue: number;
  createdOn: string;
  location: string;
}

export interface ProjectContact {
  name: string;
  phone: string;
  email: string;
  address: string;
  company?: string;
}

export interface ProjectAssignment {
  _id?: string;
  name: string;
  role: string;
}

export interface ProjectAgreement {
  signed: boolean;
  documentName?: string;
  signedOn?: string;
  url?: string;
}

export interface ProjectFinancialSummary {
  projectValue: number;
  totalInvoiced: number;
  totalReceived: number;
  outstanding: number;
  totalProjectCost: number;
  expectedProfit: number;
  actualProfit: number;
  actualMargin: number;
}

export interface ProjectProgressStepItem {
  stepNumber: number;
  key: string;
  label: string;
  status: "completed" | "current" | "pending" | string;
  date?: string;
}

export interface ProjectProgressStep {
  steps: ProjectProgressStepItem[];
  totalSteps: number;
  completedSteps: number;
  progressLabel: string;
  currentStepKey: string;
  currentStepLabel: string;
  lifecycleStatus: string;
  lifecycleStatusLabel: string;
  leadGeneratedDate: string;
  currentStepDate: string;
  assignedSales?: {
    _id?: string;
    name?: string;
    role?: string;
  };
  priority: string;
  nextStepLabel: string;
  nextStepNote: string;
}

export interface ProjectProfitabilityItem {
  key: string;
  label: string;
  expected: number;
  actual: number;
  variance: number;
  unit?: "percent" | "currency" | string;
}

export interface ProjectActionLinks {
  invoices?: string;
  projectInvoicesBreakdown?: string;
  payments?: string;
  agreement?: string;
  quotation?: string;
  bom?: string;
}

export interface ProjectDetailData {
  overview: ProjectOverview;
  contact: ProjectContact;
  assignment: ProjectAssignment;
  agreement: ProjectAgreement;
  financialSummary: ProjectFinancialSummary;
  progressStep: ProjectProgressStep;
  profitabilityOverview: ProjectProfitabilityItem[];
  actionLinks?: ProjectActionLinks;
}

export interface AccountProjectListItem {
  leadId: string;
  projectId: string;
  jobId?: string;
  projectName: string;
  building?: string;
  buildingType?: string;
  amount?: number;
  quoteValue?: number;
  status: string;
  lifecycleStatus?: string;
  startDate?: string;
  createdOn?: string;
  location?: string;
  progress?: number;
  stage?: string;
}

export interface AccountProjectListResponse {
  projects: AccountProjectListItem[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface AccountProjectListParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ProjectInvoicesSummary {
  totalInvoices: number;
  invoiceAmount: number;
  totalBilled: number;
  totalReceived: number;
  outstandingAmount: number;
  overdueAmount: number;
}

import type { InvoiceAddress, InvoiceBankDetails } from "./invoiceManagementApi";

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
  dueDate?: string | null;
  invoiceDate?: string;
  paymentStatus: string;
  invoiceStatus?: string;
  paid: number;
  amountDue: number;
  status: string;
  sentDate?: string;
  items?: number;
  billingAddress?: InvoiceAddress;
  recipientAddress?: InvoiceAddress;
  bankDetails?: InvoiceBankDetails;
}

export interface ProjectInvoiceRecordsResponse {
  records: ProjectInvoiceRecordItem[];
  total: number;
  page: number;
  limit: number;
  leadId?: string;
  projectName?: string;
}

export interface ProjectInvoiceRecordsParams {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: "paid" | "pending" | "unpaid" | "overdue" | string;
  sortBy?: "dueDate" | "amount" | "date" | string;
  sortOrder?: "asc" | "desc";
}

export interface FollowUpInvoiceResponse {
  invoiceId: string;
  invoiceNumber: string;
  leadId?: string;
  statusLabel?: string;
  channels?: {
    email?: boolean;
    inApp?: boolean;
  };
  paymentFollowUpId?: string;
  sentAt?: string;
}

export interface FollowUpInvoiceParams {
  invoiceId: string;
  projectId?: string;
  message?: string;
  subject?: string;
  nextFollowUp?: string;
}
export interface ProjectBomBuildingFile {
  buildingId: string;
  buildingNumber: number;
  bomJobId: string;
  fileName: string;
  fileUrl: string;
  fileFormat: string;
  status: string;
  uploadedAt: string;
  totalItems: number;
  isConfirmed: boolean;
}

export interface ProjectConsolidatedBom {
  _id: string;
  status: string;
  fileUrl: string;
  fileName?: string;
  generatedAt: string;
  itemCount: number;
  totalCost: number;
}

export interface ProjectConsolidatedBomSummary {
  totalItems: number;
  totalWeightLbs: number;
  totalPanelsAreaSqm: number;
  totalCost: number;
  missingDataCount: number;
}

export interface ProjectConsolidatedBomDownloads {
  excelUrl?: string | null;
  pdfUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
}

export interface ProjectConsolidatedBomRow {
  lineNumber: number;
  category: string;
  item: string;
  description: string;
  quantity: number;
  unitWeightLbs?: number;
  totalWeightLbs?: number;
  partColor?: string | null;
  costUnit?: string;
  unitCost?: number;
  totalCost?: number;
  buildings?: (number | string)[];
}

export interface ProjectConsolidatedBomData {
  leadId: string;
  projectName: string;
  jobId: string;
  bomId: string;
  uploadId?: string;
  consolidatedBOMId?: string;
  status: string;
  generatedAt?: string;
  updatedAt?: string;
  summary: ProjectConsolidatedBomSummary;
  downloads: ProjectConsolidatedBomDownloads;
  rows: ProjectConsolidatedBomRow[];
  // Backwards compatibility if old structure is returned
  bomFiles?: ProjectBomBuildingFile[];
  consolidatedBOM?: ProjectConsolidatedBom;
  consolidatedUrlPath?: string;
}

export type ProjectBomData = ProjectConsolidatedBomData;

export interface ProjectPaymentsSummary {
  totalPaymentsReceived: number;
  paymentCompletionPct: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoiced: number;
}

export interface ProjectPaymentRecordItem {
  paymentId: string;
  date: string;
  amount: number;
  relatedTo: string;
  status: string;
  invoiceNumber: string;
  invoiceId: string;
  source: string;
  documentUrl?: string | null;
}

export interface ProjectPaymentRecordsResponse {
  records: ProjectPaymentRecordItem[];
  total: number;
  page: number;
  limit: number;
  leadId?: string;
  projectName?: string;
}

export interface ProjectPaymentRecordsParams {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface ProjectQuotationItem {
  quotationId: string;
  _id?: string;
  quotationNumber?: string;
  quoteNumber?: string;
  status: string;
  approvalStatus?: string;
  finalPrice?: number;
  proposalDate?: string;
  createdAt?: string;
  versionNumber?: number;
  currency?: string;
  buildingType?: string;
}

export interface ProjectQuotationsResponse {
  quotations: ProjectQuotationItem[];
  leadId?: string;
  total?: number;
}

export interface ProjectQuotationsParams {
  projectId: string;
  status?: string;
}

export interface ProjectQuotationCustomer {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
}

export interface ProjectQuotationDetailQuotation {
  _id: string;
  quoteNumber?: string;
  quotationNumber?: string;
  status?: string;
  approvalStatus?: string;
  workflowStatus?: string;
  finalPrice?: number;
  currency?: string;
  proposalDate?: string;
  versionNumber?: number;
  buildingType?: string;
  sqft?: number | string;
  totalArea?: number | string;
  location?: string;
  customerId?: ProjectQuotationCustomer | string;
  leadId?: {
    _id?: string;
    projectName?: string;
    jobId?: string;
  } | string;
  companyName?: string;
  customerName?: string;
  customerEmail?: string;
  width?: number | string;
  length?: number | string;
  height?: number | string;
  leftEaveHeight?: number | string;
  rightEaveHeight?: number | string;
  roofSlope?: string;
  windLoad?: string | number;
  snowLoad?: string | number;
  liveLoad?: string | number;
  deadLoad?: string | number;
  seismicDesign?: string;
  exposureCategory?: string;
  frameType?: string;
  wallPanelType?: string;
  roofPanelType?: string;
  basePrice?: number;
  materialCost?: number;
  freightCost?: number;
  totalCOGS?: number;
  markupPercent?: number;
  markupValue?: number;
  items?: Array<{
    item?: string;
    description?: string;
    rate?: string;
    unit?: string;
    quantity?: number;
    amount?: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
  sentAt?: string;
  [key: string]: unknown;
}

export interface ProjectQuotationDetailData {
  leadId: string;
  projectName?: string;
  downloadPath?: string;
  quotation: ProjectQuotationDetailQuotation;
}

export const projectApi = createApi({
  reducerPath: "projectApi",
  tagTypes: ["Projects", "ProjectDetail", "ProjectInvoices", "ProjectPayments", "ProjectQuotations"],
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // 1. Project list: GET /api/account/projects?search=&status=payment_done&startDate=&endDate=
    getAccountProjects: builder.query<AccountProjectListResponse, AccountProjectListParams | void>({
      query: (params) => {
        const cleanParams: Record<string, string | number> = {};
        if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();
        if (params?.status && params.status !== "all") cleanParams.status = params.status;
        if (params?.startDate) cleanParams.startDate = params.startDate;
        if (params?.endDate) cleanParams.endDate = params.endDate;
        if (params?.page) cleanParams.page = params.page;
        if (params?.limit) cleanParams.limit = params.limit;

        return {
          url: "/api/account/projects",
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (
        response: ApiResponse<AccountProjectListResponse | { projects: AccountProjectListItem[] }>
      ) => {
        if (!response.data) {
          return { projects: [] };
        }
        if ("projects" in response.data && Array.isArray(response.data.projects)) {
          return {
            projects: response.data.projects,
            total: (response.data as AccountProjectListResponse).total ?? response.data.projects.length,
            page: (response.data as AccountProjectListResponse).page ?? 1,
            limit: (response.data as AccountProjectListResponse).limit ?? 20,
          };
        }
        return { projects: [] };
      },
      providesTags: ["Projects"],
    }),

    // 2. Project detail: GET /api/account/projects/:projectId
    getProjectDetail: builder.query<ProjectDetailData, string>({
      query: (projectIdOrJobId) => ({
        url: `/api/account/projects/${encodeURIComponent(projectIdOrJobId)}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ProjectDetailData>) => {
        if (!response.data) {
          throw new Error(response.message || "Project details not found");
        }
        return response.data;
      },
      providesTags: (_result, _error, id) => [{ type: "ProjectDetail", id }],
    }),

    // 3. Project invoices summary: GET /api/account/projects/:projectId/invoices/summary
    getProjectInvoicesSummary: builder.query<ProjectInvoicesSummary, string>({
      query: (projectId) => ({
        url: `/api/account/projects/${encodeURIComponent(projectId)}/invoices/summary`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ProjectInvoicesSummary>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to fetch invoices summary");
        }
        return response.data;
      },
      providesTags: (_result, _error, id) => [{ type: "ProjectInvoices", id }],
    }),

    // 4. Project invoice records: GET /api/account/projects/:projectId/invoices/records?page=1&limit=10&search=&paymentStatus=&sortBy=dueDate&sortOrder=desc
    getProjectInvoiceRecords: builder.query<ProjectInvoiceRecordsResponse, ProjectInvoiceRecordsParams>({
      query: ({ projectId, ...params }) => {
        const cleanParams: Record<string, string | number> = {};
        if (params.page !== undefined) cleanParams.page = params.page;
        if (params.limit !== undefined) cleanParams.limit = params.limit;
        if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
        if (params.paymentStatus && params.paymentStatus !== "all") {
          cleanParams.paymentStatus = params.paymentStatus;
        }
        if (params.sortBy) cleanParams.sortBy = params.sortBy;
        if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

        return {
          url: `/api/account/projects/${encodeURIComponent(projectId)}/invoices/records`,
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (response: ApiResponse<ProjectInvoiceRecordsResponse>) => {
        if (!response.data) {
          return { records: [], total: 0, page: 1, limit: 10 };
        }
        return response.data;
      },
      providesTags: (_result, _error, { projectId }) => [{ type: "ProjectInvoices", id: projectId }],
    }),

    // 5. Mark invoice paid: PUT /api/account/invoices/:invoiceId/mark-paid
    markProjectInvoicePaid: builder.mutation<ApiResponse<unknown>, { invoiceId: string; projectId?: string }>({
      query: ({ invoiceId }) => ({
        url: `/api/account/invoices/${encodeURIComponent(invoiceId)}/mark-paid`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        "Projects",
        ...(projectId ? [{ type: "ProjectInvoices" as const, id: projectId }] : [{ type: "ProjectInvoices" as const }]),
      ],
    }),

    // 6. Follow up invoice payment reminder: POST /api/account/invoices/:invoiceId/follow-up
    followUpProjectInvoice: builder.mutation<ApiResponse<FollowUpInvoiceResponse>, FollowUpInvoiceParams>({
      query: ({ invoiceId, message, subject, nextFollowUp }) => ({
        url: `/api/account/invoices/${encodeURIComponent(invoiceId)}/follow-up`,
        method: "POST",
        body: {
          ...(message ? { message } : {}),
          ...(subject ? { subject } : {}),
          ...(nextFollowUp ? { nextFollowUp } : {}),
        },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        "Projects",
        ...(projectId ? [{ type: "ProjectInvoices" as const, id: projectId }] : [{ type: "ProjectInvoices" as const }]),
      ],
    }),

    // 6. Project Consolidated BOM: GET /api/account/projects/:projectId/bom/consolidated
    getProjectBom: builder.query<ProjectConsolidatedBomData, string>({
      query: (projectIdOrPath) => {
        const url = projectIdOrPath.startsWith("/api/")
          ? projectIdOrPath
          : `/api/account/projects/${encodeURIComponent(projectIdOrPath)}/bom/consolidated`;
        return {
          url,
          method: "GET",
        };
      },
      transformResponse: (response: ApiResponse<ProjectConsolidatedBomData>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to fetch project BOM");
        }
        return response.data;
      },
      providesTags: (_result, _error, id) => [{ type: "ProjectDetail", id }],
    }),

    // 7. Project payments summary: GET /api/account/projects/:projectId/payments/summary
    getProjectPaymentsSummary: builder.query<ProjectPaymentsSummary, string>({
      query: (projectId) => ({
        url: `/api/account/projects/${encodeURIComponent(projectId)}/payments/summary`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ProjectPaymentsSummary>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to fetch payments summary");
        }
        return response.data;
      },
      providesTags: (_result, _error, id) => [{ type: "ProjectPayments", id }],
    }),

    // 8. Project payments records: GET /api/account/projects/:projectId/payments/records?page=1&limit=10
    getProjectPaymentRecords: builder.query<ProjectPaymentRecordsResponse, ProjectPaymentRecordsParams>({
      query: ({ projectId, ...params }) => {
        const cleanParams: Record<string, string | number> = {};
        if (params.page !== undefined) cleanParams.page = params.page;
        if (params.limit !== undefined) cleanParams.limit = params.limit;
        if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
        if (params.status && params.status !== "all") {
          cleanParams.status = params.status;
        }

        return {
          url: `/api/account/projects/${encodeURIComponent(projectId)}/payments/records`,
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (response: ApiResponse<ProjectPaymentRecordsResponse>) => {
        if (!response.data) {
          return { records: [], total: 0, page: 1, limit: 10 };
        }
        return response.data;
      },
      providesTags: (_result, _error, { projectId }) => [{ type: "ProjectPayments", id: projectId }],
    }),

    // 9. Project quotations list: GET /api/account/projects/:projectId/quotations?status=
    getProjectQuotations: builder.query<ProjectQuotationsResponse, ProjectQuotationsParams>({
      query: ({ projectId, status }) => {
        const cleanParams: Record<string, string> = {};
        if (status && status !== "all") {
          cleanParams.status = status;
        }

        return {
          url: `/api/account/projects/${encodeURIComponent(projectId)}/quotations`,
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (response: ApiResponse<ProjectQuotationsResponse>) => {
        if (!response.data) {
          return { quotations: [], total: 0 };
        }
        return response.data;
      },
      providesTags: (_result, _error, { projectId }) => [{ type: "ProjectQuotations", id: projectId }],
    }),

    // 10. Project quotation detail: GET /api/account/projects/:projectId/quotations/:quotationId
    getProjectQuotationDetail: builder.query<ProjectQuotationDetailData, { projectId: string; quotationId: string }>({
      query: ({ projectId, quotationId }) => ({
        url: `/api/account/projects/${encodeURIComponent(projectId)}/quotations/${encodeURIComponent(quotationId)}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ProjectQuotationDetailData>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to fetch quotation details");
        }
        return response.data;
      },
      providesTags: (_result, _error, { quotationId }) => [{ type: "ProjectQuotations", id: quotationId }],
    }),
  }),
});

export const {
  useGetAccountProjectsQuery,
  useLazyGetAccountProjectsQuery,
  useGetProjectDetailQuery,
  useLazyGetProjectDetailQuery,
  useGetProjectInvoicesSummaryQuery,
  useLazyGetProjectInvoicesSummaryQuery,
  useGetProjectInvoiceRecordsQuery,
  useLazyGetProjectInvoiceRecordsQuery,
  useMarkProjectInvoicePaidMutation,
  useFollowUpProjectInvoiceMutation,
  useGetProjectBomQuery,
  useLazyGetProjectBomQuery,
  useGetProjectPaymentsSummaryQuery,
  useLazyGetProjectPaymentsSummaryQuery,
  useGetProjectPaymentRecordsQuery,
  useLazyGetProjectPaymentRecordsQuery,
  useGetProjectQuotationsQuery,
  useLazyGetProjectQuotationsQuery,
  useGetProjectQuotationDetailQuery,
  useLazyGetProjectQuotationDetailQuery,
} = projectApi;
