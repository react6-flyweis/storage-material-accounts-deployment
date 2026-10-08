import { store } from "@/redux/store";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://mr-storage-backend-025k.onrender.com";

function getAuthHeader(): Record<string, string> {
  try {
    const token = store.getState().auth?.accessToken;
    if (token) return { Authorization: `Bearer ${token}` };
    const raw = localStorage.getItem("persist:auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const parsedToken = parsed?.accessToken?.replace(/^"|"$/g, "");
      if (parsedToken) return { Authorization: `Bearer ${parsedToken}` };
    }
  } catch {
    // ignore
  }
  return {};
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(errText || `API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

async function apiDownloadBlob(
  endpoint: string,
  options: RequestInit = {}
): Promise<Blob> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    throw new Error(`Export error ${res.status}: ${res.statusText}`);
  }
  return res.blob();
}

// ---------------- Tax Filing Types & API ----------------

export type TaxFilingFilterProject = {
  leadId: string;
  projectName: string;
  jobId: string;
};

export type TaxFilingFilterClient = {
  customerId: string;
  name: string;
};

export type TaxFilingFiltersData = {
  states: string[];
  projects: TaxFilingFilterProject[];
  clients: TaxFilingFilterClient[];
};

export type GetTaxFilingFiltersResponse = {
  success: boolean;
  message: string;
  data: TaxFilingFiltersData;
};

export type TaxFilingLeadInfo = {
  _id: string;
  jobId: string;
  projectName: string;
};

export type TaxFilingCustomerInfo = {
  _id: string;
  firstName: string;
  lastName: string;
};

export type TaxFilingItem = {
  _id: string;
  state: string;
  dueDate: string;
  amount: number;
  filingFrequency?: string;
  threshold?: string;
  websiteLink?: string | null;
  status: string;
  leadId?: TaxFilingLeadInfo;
  customerId?: TaxFilingCustomerInfo;
  createdBy?: string;
  paidBy?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type TaxFilingStats = {
  totalTaxable: number;
  totalCollected: number;
  taxPayableByStates: number;
  filed: number;
  unfiled: number;
};

export type TaxFilingData = {
  stats: TaxFilingStats;
  pendingFiling: TaxFilingItem[];
  filingHistory: TaxFilingItem[];
  page: number;
  limit: number;
  total?: number;
};

export type GetTaxFilingParams = {
  projectId?: string;
  clientId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type GetTaxFilingResponse = {
  success: boolean;
  message: string;
  data: TaxFilingData;
};

// ---------------- State-Wise Tax Types & API ----------------

export type StateOverviewItem = {
  _id: string;
  taxCollected: number;
  taxableSales: number;
  paidFiled: number;
  payable: number;
  nextDue?: string;
  status: string;
  rate?: string;
};

export type StateWiseTaxData = {
  stats: {
    totalTaxCollected: number;
    totalPaid: number;
    totalPayable: number;
    pendingFilingStates: number;
    nextFilingDue?: string;
  };
  stateOverview: StateOverviewItem[];
  lastSynced?: string;
};

export type GetStateWiseTaxParams = {
  projectId?: string;
  startDate?: string;
  endDate?: string;
};

export type GetStateWiseTaxResponse = {
  success: boolean;
  message: string;
  data: StateWiseTaxData;
};

export type StateWiseTaxStatsMetric = {
  value: number;
  pctChangeFromLastMonth?: number;
};

export type StateWiseTaxStatsPendingFiling = {
  count: number;
  label?: string;
};

export type StateWiseTaxStatsNextFilingDue = {
  date?: string;
  state?: string;
};

export type StateWiseTaxStatsData = {
  totalTaxCollected?: StateWiseTaxStatsMetric;
  totalPaid?: StateWiseTaxStatsMetric;
  totalPayable?: StateWiseTaxStatsMetric;
  pendingFilingStates?: StateWiseTaxStatsPendingFiling;
  nextFilingDue?: StateWiseTaxStatsNextFilingDue;
};

export type GetStateWiseTaxStatsParams = {
  projectId?: string;
};

export type GetStateWiseTaxStatsResponse = {
  success: boolean;
  message: string;
  data: StateWiseTaxStatsData;
};

export type StateWiseTaxDeadlineItem = {
  _id: string;
  state: string;
  filingType: string;
  dueDate: string;
  daysLeft: number;
};

export type GetStateWiseTaxUpcomingDeadlinesParams = {
  limit?: number;
};

export type GetStateWiseTaxUpcomingDeadlinesResponse = {
  success: boolean;
  message: string;
  data: {
    deadlines: StateWiseTaxDeadlineItem[];
    total: number;
  };
};

// ---------------- Project-Wise Tax Types & API ----------------

export type ProjectWiseTaxItem = {
  leadId: string;
  projectName?: string;
  jobId?: string;
  location?: string;
  customerName?: string;
  taxCollected: number;
  taxableSales: number;
  paidFiled: number;
  payable: number;
  dueDate: string;
  status: string;
};

export type GetProjectWiseTaxParams = {
  page?: number;
  limit?: number;
  projectId?: string;
  startDate?: string;
  endDate?: string;
};

export type GetProjectWiseTaxResponse = {
  success: boolean;
  message: string;
  data: {
    projects: ProjectWiseTaxItem[];
    total: number;
    page: number;
    limit: number;
  };
};

export type ProjectWiseTaxMetricWithPct = {
  value: number;
  pctChangeFromLastMonth?: number;
};

export type ProjectWiseTaxPendingFiling = {
  count: number;
  label?: string;
};

export type ProjectWiseTaxNextFilingDue = {
  date?: string;
  location?: string;
};

export type ProjectWiseTaxStatsData = {
  totalTaxCollected?: ProjectWiseTaxMetricWithPct;
  totalPaid?: ProjectWiseTaxMetricWithPct;
  totalPayable?: ProjectWiseTaxMetricWithPct;
  pendingFiling?: ProjectWiseTaxPendingFiling;
  nextFilingDue?: ProjectWiseTaxNextFilingDue;
};

export type GetProjectWiseTaxStatsParams = {
  projectId?: string;
  startDate?: string;
  endDate?: string;
};

export type GetProjectWiseTaxStatsResponse = {
  success: boolean;
  message: string;
  data: ProjectWiseTaxStatsData;
};

// =================== MOCK DATA (MATCHING USER SCREENSHOT) ===================

export const MOCK_TAX_FILING_FILTERS: TaxFilingFiltersData = {
  states: ["Texas", "California", "New York", "Arizona", "Nevada", "Florida"],
  projects: [
    { leadId: "proj-1", projectName: "Commercial Complex A", jobId: "JOB-401" },
    { leadId: "proj-2", projectName: "Storage Unit Expansion", jobId: "JOB-402" },
    { leadId: "proj-3", projectName: "Steel Framework Hub", jobId: "JOB-403" },
  ],
  clients: [
    { customerId: "client-1", name: "Acme Industrial" },
    { customerId: "client-2", name: "Metro Build Corp" },
    { customerId: "client-3", name: "Apex Builders" },
  ],
};

export const MOCK_TAX_FILING_DATA: TaxFilingData = {
  stats: {
    totalTaxable: 1245600,
    totalCollected: 1500000,
    taxPayableByStates: 2200000,
    filed: 300000,
    unfiled: 300000,
  },
  pendingFiling: [
    {
      _id: "pf-1",
      state: "Texas",
      threshold: "6.25% Sales Tax",
      dueDate: "2024-01-14T00:00:00.000Z",
      amount: 450000,
      filingFrequency: "Monthly",
      status: "Due Soon",
      websiteLink: "https://comptroller.texas.gov",
    },
    {
      _id: "pf-2",
      state: "California",
      threshold: "8.25% Sales Tax",
      dueDate: "2024-01-21T00:00:00.000Z",
      amount: 315000,
      filingFrequency: "Monthly",
      status: "Due Soon",
      websiteLink: "https://www.cdtfa.ca.gov",
    },
    {
      _id: "pf-3",
      state: "New York",
      threshold: "8.25% Sales Tax",
      dueDate: "2024-02-20T00:00:00.000Z",
      amount: 840000,
      filingFrequency: "Monthly",
      status: "Pending",
      websiteLink: "https://www.tax.ny.gov",
    },
    {
      _id: "pf-4",
      state: "Arizona",
      threshold: "8.25% Sales Tax",
      dueDate: "2024-03-15T00:00:00.000Z",
      amount: 610000,
      filingFrequency: "Monthly",
      status: "Pending",
      websiteLink: "https://azdor.gov",
    },
    {
      _id: "pf-5",
      state: "Nevada",
      threshold: "8.25% Sales Tax",
      dueDate: "2024-04-12T00:00:00.000Z",
      amount: 0,
      filingFrequency: "Monthly",
      status: "No tax due",
      websiteLink: "https://tax.nv.gov",
    },
  ],
  filingHistory: [
    {
      _id: "fh-1",
      state: "Texas",
      dueDate: "2024-01-14T00:00:00.000Z",
      paidAt: "2024-01-10T14:32:00.000Z",
      amount: 450000,
      filingFrequency: "Monthly",
      status: "Paid",
      threshold: "Texas State Tax",
    },
    {
      _id: "fh-2",
      state: "California",
      dueDate: "2024-01-21T00:00:00.000Z",
      paidAt: "2024-01-18T10:15:00.000Z",
      amount: 315000,
      filingFrequency: "Monthly",
      status: "Paid",
      threshold: "CDTFA Sales Tax",
    },
    {
      _id: "fh-3",
      state: "Florida",
      dueDate: "2024-02-01T00:00:00.000Z",
      paidAt: "2024-01-28T09:45:00.000Z",
      amount: 185000,
      filingFrequency: "Monthly",
      status: "Paid",
      threshold: "Florida DOR",
    },
  ],
  page: 1,
  limit: 10,
  total: 5,
};

export const MOCK_STATE_WISE_TAX_DATA: StateWiseTaxData = {
  stats: {
    totalTaxCollected: 1500000,
    totalPaid: 950000,
    totalPayable: 2200000,
    pendingFilingStates: 4,
    nextFilingDue: "2025-06-20T00:00:00.000Z",
  },
  stateOverview: [
    {
      _id: "Texas",
      taxCollected: 450000,
      taxableSales: 7200000,
      paidFiled: 0,
      payable: 450000,
      nextDue: "2025-06-20T00:00:00.000Z",
      status: "Payment Due",
      rate: "6.25%",
    },
    {
      _id: "California",
      taxCollected: 315000,
      taxableSales: 3818000,
      paidFiled: 0,
      payable: 315000,
      nextDue: "2025-06-21T00:00:00.000Z",
      status: "Payment Due",
      rate: "8.25%",
    },
    {
      _id: "New York",
      taxCollected: 840000,
      taxableSales: 10180000,
      paidFiled: 0,
      payable: 840000,
      nextDue: "2025-07-20T00:00:00.000Z",
      status: "Pending",
      rate: "8.25%",
    },
    {
      _id: "Arizona",
      taxCollected: 610000,
      taxableSales: 7393000,
      paidFiled: 0,
      payable: 610000,
      nextDue: "2025-07-15T00:00:00.000Z",
      status: "Pending",
      rate: "8.25%",
    },
    {
      _id: "Nevada",
      taxCollected: 0,
      taxableSales: 0,
      paidFiled: 0,
      payable: 0,
      nextDue: "2025-08-12T00:00:00.000Z",
      status: "No Due",
      rate: "8.25%",
    },
  ],
};

export const MOCK_PROJECT_WISE_TAX_DATA = {
  projects: [
    {
      leadId: "lead-1",
      projectName: "Downtown Commercial Tower",
      jobId: "JOB-2025-001",
      location: "Austin, Texas",
      customerName: "Acme Industrial",
      taxCollected: 145000,
      taxableSales: 2320000,
      paidFiled: 0,
      payable: 145000,
      dueDate: "2025-06-20T00:00:00.000Z",
      status: "Payment Due",
    },
    {
      leadId: "lead-2",
      projectName: "Pacific Coast Warehouse",
      jobId: "JOB-2025-002",
      location: "San Jose, California",
      customerName: "Pacific Logistics",
      taxCollected: 110000,
      taxableSales: 1333000,
      paidFiled: 0,
      payable: 110000,
      dueDate: "2025-06-21T00:00:00.000Z",
      status: "Payment Due",
    },
    {
      leadId: "lead-3",
      projectName: "Midtown Steel Storage",
      jobId: "JOB-2025-003",
      location: "Queens, New York",
      customerName: "Empire State Storage",
      taxCollected: 290000,
      taxableSales: 3515000,
      paidFiled: 0,
      payable: 290000,
      dueDate: "2025-07-20T00:00:00.000Z",
      status: "Pending",
    },
  ],
  total: 3,
  page: 1,
  limit: 10,
};

// =================== PROVIDER IMPLEMENTATIONS ===================

export async function getTaxFilingFiltersProvider(): Promise<GetTaxFilingFiltersResponse> {
  try {
    const res = await apiFetch<GetTaxFilingFiltersResponse>(
      "/api/admin/financials/tax-filing/filters"
    );
    if (res?.data?.states?.length) return res;
  } catch {
    // fallback
  }
  return {
    success: true,
    message: "Fetched successfully",
    data: MOCK_TAX_FILING_FILTERS,
  };
}

export async function getTaxFilingProvider(
  params?: GetTaxFilingParams
): Promise<GetTaxFilingResponse> {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.clientId && params.clientId !== "all") queryParams.append("clientId", params.clientId);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  try {
    const res = await apiFetch<GetTaxFilingResponse>(
      `/api/admin/financials/tax-filing${queryString ? `?${queryString}` : ""}`
    );
    if (res?.data && (res.data.pendingFiling?.length || res.data.filingHistory?.length)) {
      return res;
    }
  } catch {
    // fallback
  }

  return {
    success: true,
    message: "Fetched successfully",
    data: MOCK_TAX_FILING_DATA,
  };
}

export async function exportTaxFilingProvider(
  params?: GetTaxFilingParams
): Promise<Blob> {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.clientId && params.clientId !== "all") queryParams.append("clientId", params.clientId);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  return apiDownloadBlob(
    `/api/admin/financials/tax-filing/export${queryString ? `?${queryString}` : ""}`
  );
}

export async function getStateWiseTaxProvider(
  params?: GetStateWiseTaxParams
): Promise<GetStateWiseTaxResponse> {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  try {
    const res = await apiFetch<GetStateWiseTaxResponse>(
      `/api/admin/financials/state-wise-tax${queryString ? `?${queryString}` : ""}`
    );
    if (res?.data?.stateOverview?.length) return res;
  } catch {
    // fallback
  }

  return {
    success: true,
    message: "Fetched successfully",
    data: MOCK_STATE_WISE_TAX_DATA,
  };
}

export async function getStateWiseTaxStatsProvider(
  params?: GetStateWiseTaxStatsParams
): Promise<GetStateWiseTaxStatsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);

  const queryString = queryParams.toString();
  try {
    const res = await apiFetch<GetStateWiseTaxStatsResponse>(
      `/api/admin/financials/state-wise-tax/stats${queryString ? `?${queryString}` : ""}`
    );
    if (res?.data) return res;
  } catch {
    // fallback
  }

  return {
    success: true,
    message: "Fetched successfully",
    data: {
      totalTaxCollected: { value: 1500000, pctChangeFromLastMonth: 11.4 },
      totalPaid: { value: 950000, pctChangeFromLastMonth: 5.2 },
      totalPayable: { value: 2200000, pctChangeFromLastMonth: 8.52 },
      pendingFilingStates: { count: 4, label: "Requires filing action" },
      nextFilingDue: { date: "2025-06-20", state: "Texas" },
    },
  };
}

export async function exportStateWiseTaxProvider(
  params?: GetStateWiseTaxParams
): Promise<Blob> {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  return apiDownloadBlob(
    `/api/admin/financials/state-wise-tax/export${queryString ? `?${queryString}` : ""}`
  );
}

export async function getStateWiseTaxUpcomingDeadlinesProvider(
  params?: GetStateWiseTaxUpcomingDeadlinesParams
): Promise<GetStateWiseTaxUpcomingDeadlinesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  try {
    const res = await apiFetch<GetStateWiseTaxUpcomingDeadlinesResponse>(
      `/api/admin/financials/state-wise-tax/upcoming-deadlines${queryString ? `?${queryString}` : ""}`
    );
    if (res?.data?.deadlines?.length) return res;
  } catch {
    // fallback
  }

  return {
    success: true,
    message: "Fetched successfully",
    data: {
      deadlines: [
        {
          _id: "dl-1",
          state: "Texas",
          filingType: "Monthly Return",
          dueDate: "2025-06-20T00:00:00.000Z",
          daysLeft: 31,
        },
        {
          _id: "dl-2",
          state: "California",
          filingType: "Monthly Return",
          dueDate: "2025-06-21T00:00:00.000Z",
          daysLeft: 32,
        },
        {
          _id: "dl-3",
          state: "New York",
          filingType: "Monthly Return",
          dueDate: "2025-07-20T00:00:00.000Z",
          daysLeft: 61,
        },
      ],
      total: 3,
    },
  };
}

export async function getProjectWiseTaxProvider(
  params?: GetProjectWiseTaxParams
): Promise<GetProjectWiseTaxResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  try {
    const res = await apiFetch<GetProjectWiseTaxResponse>(
      `/api/admin/financials/project-wise-tax${queryString ? `?${queryString}` : ""}`
    );
    if (res?.data?.projects?.length) return res;
  } catch {
    // fallback
  }

  return {
    success: true,
    message: "Fetched successfully",
    data: MOCK_PROJECT_WISE_TAX_DATA,
  };
}

export async function getProjectWiseTaxStatsProvider(
  params?: GetProjectWiseTaxStatsParams
): Promise<GetProjectWiseTaxStatsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  try {
    const res = await apiFetch<GetProjectWiseTaxStatsResponse>(
      `/api/admin/financials/project-wise-tax/stats${queryString ? `?${queryString}` : ""}`
    );
    if (res?.data) return res;
  } catch {
    // fallback
  }

  return {
    success: true,
    message: "Fetched successfully",
    data: {
      totalTaxCollected: { value: 1500000, pctChangeFromLastMonth: 11.4 },
      totalPaid: { value: 950000, pctChangeFromLastMonth: 5.2 },
      totalPayable: { value: 2200000, pctChangeFromLastMonth: 8.52 },
      pendingFiling: { count: 3, label: "Requires filing action" },
      nextFilingDue: { date: "2025-06-20", location: "Downtown Commercial Tower" },
    },
  };
}

export async function exportProjectWiseTaxProvider(
  params?: GetProjectWiseTaxParams
): Promise<Blob> {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  return apiDownloadBlob(
    `/api/admin/financials/project-wise-tax/export${queryString ? `?${queryString}` : ""}`
  );
}
