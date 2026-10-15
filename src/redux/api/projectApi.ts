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

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Projects", "ProjectDetail"],
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
  }),
});

export const {
  useGetAccountProjectsQuery,
  useLazyGetAccountProjectsQuery,
  useGetProjectDetailQuery,
  useLazyGetProjectDetailQuery,
} = projectApi;
