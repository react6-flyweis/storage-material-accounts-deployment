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
    let errMessage = `API error ${res.status}: ${res.statusText}`;
    try {
      const errText = await res.text();
      if (errText) {
        try {
          const parsed = JSON.parse(errText);
          errMessage = parsed.message || parsed.error || errText;
        } catch {
          errMessage = errText;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(errMessage);
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

export type TaxFilingKPIStatMetric = {
  value: number;
  pctChangeFromLastMonth?: number;
};

export type TaxFilingKPIStatsData = {
  totalSalesTaxable?: TaxFilingKPIStatMetric;
  totalSalesTaxCollected?: TaxFilingKPIStatMetric;
  taxPayableByStates?: {
    value: number;
  };
  fileVsUnfiledTax?: {
    filed: number;
    unfiled: number;
  };
};

export type GetTaxFilingStatsParams = {
  state?: string;
  projectId?: string;
  clientId?: string;
  search?: string;
};

export type GetTaxFilingStatsResponse = {
  success: boolean;
  message: string;
  data: TaxFilingKPIStatsData;
};

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
  _id?: string;
  jobId?: string;
  projectName?: string;
};

export type TaxFilingCustomerInfo = {
  _id?: string;
  firstName?: string;
  lastName?: string;
};

export type TaxFilingStatusTone = "warning" | "success" | "danger" | "info" | string;

export type TaxFilingStatusObject = {
  code: string;
  label: string;
  tone?: TaxFilingStatusTone;
};

export type TaxFilingReceiptInfo = {
  confirmationNumber: string;
  receiptDate?: string;
};

export type TaxFilingItem = {
  _id: string;
  taxRecordId?: string;
  state: string;
  stateLabel?: string;
  salesTaxRateLabel?: string;
  filingPeriod?: string;
  filingFrequency?: string;
  dueDate?: string;
  daysUntilDue?: number;
  daysUntilDueLabel?: string;
  taxDue?: number;
  payable?: number;
  taxPaid?: number;
  amount?: number;
  filedDate?: string;
  method?: string;
  receipt?: TaxFilingReceiptInfo;
  status: string | TaxFilingStatusObject;
  leadId?: string | TaxFilingLeadInfo | null;
  projectName?: string;
  jobId?: string;
  customerName?: string;
  customerId?: string | TaxFilingCustomerInfo | null;
  threshold?: string;
  websiteLink?: string | null;
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

export type TaxFilingMeta = {
  provider?: string;
  complianceStatus?: string;
  lastSyncedAt?: string;
  syncState?: string;
  canSync?: boolean;
  message?: string;
};

export type TaxFilingData = {
  stats: TaxFilingStats;
  pendingFiling: TaxFilingItem[];
  filingHistory: TaxFilingItem[];
  page: number;
  limit: number;
  total?: number;
  meta?: TaxFilingMeta;
};

export type GetTaxFilingParams = {
  state?: string;
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

// 5.1 & 5.2 Detail & Prepare Types
export type TaxFilingDetailBreakdown = {
  taxCollected: number;
  taxPaid: number;
  penalty: number;
  interest: number;
  totalPayable: number;
};

export type TaxFilingDetailPayNow = {
  enabled: boolean;
  amount: number;
  currency: string;
  provider: string;
  providerLabel: string;
};

export type TaxFilingDetailRecentActivity = {
  at: string;
  type: string;
  amount: number;
  label: string;
};

export type TaxFilingDetailItem = {
  _id: string;
  state: string;
  stateLabel?: string;
  uiStatus?: TaxFilingStatusObject;
  filingPeriod?: string;
  filingPeriodRange?: {
    start: string;
    end: string;
  };
  filingFrequency?: string;
  filingDueDate?: string;
  daysUntilDue?: number;
  breakdown?: TaxFilingDetailBreakdown;
  payNow?: TaxFilingDetailPayNow;
  recentActivity?: TaxFilingDetailRecentActivity[];
};

export type TaxFilingDetailData = {
  detail: TaxFilingDetailItem;
  avalara?: {
    filingId?: string;
    returnsConfigured?: boolean;
    source?: string;
  };
};

export type GetTaxFilingDetailResponse = {
  success: boolean;
  message: string;
  data: TaxFilingDetailData;
};

export type TaxFilingPrepareData = {
  tax: {
    _id: string;
    state: string;
    status: string;
    taxDue: number;
    payable: number;
    taxCollected: number;
    taxableSales: number;
    source: string;
  };
  detail: TaxFilingDetailItem;
  message: string;
};

export type GetTaxFilingPrepareResponse = {
  success: boolean;
  message: string;
  data: TaxFilingPrepareData;
};

// 5.3 & 5.4 Pay Tax / Approve Types
export type PayTaxPayload = {
  paymentMethod: string;
  notificationEmail?: string;
};

export type PayTaxPaymentData = {
  amountPaid: number;
  filingPeriod?: {
    start: string;
    end: string;
  } | string;
  paymentMethod: string;
  confirmationNumber: string;
  status: string;
  estimatedSettlement: string;
  notificationEmail?: string;
};

export type PayTaxResponseData = {
  payment: PayTaxPaymentData;
  tax?: {
    _id: string;
    status: string;
    paymentStatus?: string;
    confirmationNumber?: string;
    providerMethod?: string;
  };
  avalara?: {
    ok?: boolean;
    regionRow?: {
      filingId?: number | string;
      status?: string;
      region?: string;
      taxAmount?: number;
    };
  } | null;
};

export type PayTaxResponse = {
  success: boolean;
  message: string;
  data: PayTaxResponseData;
};

// 5.5 Receipt Types
export type TaxFilingReceiptData = {
  confirmationNumber: string;
  amountPaid: number;
  paidAt: string;
  state: string;
  method: string;
  paymentMethod: string;
  receipt?: {
    confirmationNumber: string;
    receiptDate: string;
  };
  download?: {
    format: string;
    urlHint: string;
  };
};

export type GetTaxFilingReceiptResponse = {
  success: boolean;
  message: string;
  data: TaxFilingReceiptData;
};

// 5.5b Notification Settings Types
export type TaxNotificationSettings = {
  emailReminders?: boolean;
  deadlineAlerts?: boolean;
  daysBeforeDue?: number;
  recipientEmail?: string;
};

export type GetTaxNotificationSettingsResponse = {
  success: boolean;
  message: string;
  data: TaxNotificationSettings;
};

export type UpdateTaxNotificationSettingsResponse = {
  success: boolean;
  message: string;
  data?: TaxNotificationSettings;
};

// 5.6 File Tax Response
export type FileTaxResponse = {
  success: boolean;
  message: string;
  data: {
    tax: {
      _id: string;
      status: string;
      paidAt?: string;
    };
  };
};

// ---------------- State-Wise Tax Types & API ----------------

export type StateOverviewItem = {
  _id?: string;
  state: string;
  stateLabel?: string;
  salesTaxRateLabel?: string;
  rate?: string;
  taxCollected: number;
  taxableSales: number;
  paidFiled: number;
  payable: number;
  dueDate?: string;
  nextDue?: string;
  status:
    | string
    | {
        code: string;
        label: string;
        tone?: string;
      };
  taxRecordId?: string;
};

export type StateWiseTaxData = {
  stats?: {
    totalTaxCollected?: number;
    totalPaid?: number;
    totalPayable?: number;
    pendingFilingStates?: number;
    nextFilingDue?: string;
  };
  stateOverview: StateOverviewItem[];
  lastSynced?: string;
  meta?: {
    provider?: string;
    syncState?: string;
    canSync?: boolean;
    complianceStatus?: string;
  };
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
  startDate?: string;
  endDate?: string;
};

export type GetStateWiseTaxStatsResponse = {
  success: boolean;
  message: string;
  data: StateWiseTaxStatsData;
};

export type StateWiseTaxDeadlineItem = {
  _id: string;
  taxRecordId?: string;
  state?: string;
  location?: string;
  filingType?: string;
  dueDate?: string;
  daysLeft?: number;
  projectName?: string;
  leadId?: string;
  jobId?: string;
  payable?: number;
  taxDue?: number;
  status?:
    | string
    | {
        code: string;
        label: string;
        tone?: string;
      };
};

export type GetStateWiseTaxUpcomingDeadlinesParams = {
  projectId?: string;
  limit?: number;
  scope?: "state" | "project";
};

export type GetStateWiseTaxUpcomingDeadlinesResponse = {
  success: boolean;
  message: string;
  data: {
    deadlines: StateWiseTaxDeadlineItem[];
    total?: number;
    meta?: {
      provider?: string;
      syncState?: string;
      canSync?: boolean;
      complianceStatus?: string;
    };
  };
};

// ---------------- Project-Wise Tax Types & API ----------------

export type ProjectWiseTaxItem = {
  _id?: string;
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
  status:
    | string
    | {
        code: string;
        label: string;
        tone?: string;
      };
  salesTaxRateLabel?: string;
  taxRecordId?: string;
  taxId?: string;
  showPayTax?: boolean;
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
    lastSynced?: string;
    meta?: {
      lastSyncedAt?: string;
      provider?: string;
      syncState?: string;
      canSync?: boolean;
    };
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

// =================== PROVIDER IMPLEMENTATIONS ===================

export async function getTaxFilingStatsProvider(
  params?: GetTaxFilingStatsParams
): Promise<GetTaxFilingStatsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.state && params.state !== "all") queryParams.append("state", params.state);
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.clientId && params.clientId !== "all") queryParams.append("clientId", params.clientId);
  if (params?.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  return apiFetch<GetTaxFilingStatsResponse>(
    `/api/account/financial-extra/tax-filing/stats${queryString ? `?${queryString}` : ""}`
  );
}

export async function getTaxFilingFiltersProvider(): Promise<GetTaxFilingFiltersResponse> {
  return apiFetch<GetTaxFilingFiltersResponse>(
    "/api/account/financial-extra/tax-filing/filters"
  );
}

export async function getTaxFilingProvider(
  params?: GetTaxFilingParams
): Promise<GetTaxFilingResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.state && params.state !== "all") queryParams.append("state", params.state);
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.clientId && params.clientId !== "all") queryParams.append("clientId", params.clientId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  return apiFetch<GetTaxFilingResponse>(
    `/api/account/financial-extra/tax-filing${queryString ? `?${queryString}` : ""}`
  );
}

export async function exportTaxFilingProvider(
  params?: GetTaxFilingParams
): Promise<Blob> {
  const queryParams = new URLSearchParams();
  if (params?.state && params.state !== "all") queryParams.append("state", params.state);
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.clientId && params.clientId !== "all") queryParams.append("clientId", params.clientId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  return apiDownloadBlob(
    `/api/account/financial-extra/tax-filing/export${queryString ? `?${queryString}` : ""}`
  );
}

export async function getTaxFilingDetailProvider(
  id: string
): Promise<GetTaxFilingDetailResponse> {
  return apiFetch<GetTaxFilingDetailResponse>(
    `/api/account/financial-extra/tax-filing/${id}/detail`
  );
}

export async function getTaxFilingPrepareProvider(
  id: string
): Promise<GetTaxFilingPrepareResponse> {
  return apiFetch<GetTaxFilingPrepareResponse>(
    `/api/account/financial-extra/tax-filing/${id}/prepare`
  );
}

export async function approveTaxFilingProvider(
  id: string,
  payload: PayTaxPayload
): Promise<PayTaxResponse> {
  return apiFetch<PayTaxResponse>(
    `/api/account/financial-extra/tax-filing/${id}/approve`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function payTaxFilingProvider(
  id: string,
  payload: PayTaxPayload
): Promise<PayTaxResponse> {
  return apiFetch<PayTaxResponse>(
    `/api/account/financial-extra/tax-filing/${id}/pay`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function submitTaxPaymentProvider(
  id: string,
  payload: PayTaxPayload
): Promise<PayTaxResponse> {
  try {
    return await approveTaxFilingProvider(id, payload);
  } catch (err: unknown) {
    // If Returns env is missing or approve returns 400 with Avalara error, fall back to /pay
    console.warn("Approve endpoint failed, attempting /pay fallback:", err instanceof Error ? err.message : err);
    return await payTaxFilingProvider(id, payload);
  }
}

export async function getTaxFilingReceiptProvider(
  id: string
): Promise<GetTaxFilingReceiptResponse> {
  return apiFetch<GetTaxFilingReceiptResponse>(
    `/api/account/financial-extra/tax-filing/${id}/receipt`
  );
}

export async function downloadTaxFilingReceiptPdfProvider(
  id: string
): Promise<Blob> {
  return apiDownloadBlob(
    `/api/account/financial-extra/tax-filing/${id}/receipt?format=pdf`
  );
}

export async function getTaxNotificationSettingsProvider(): Promise<GetTaxNotificationSettingsResponse> {
  return apiFetch<GetTaxNotificationSettingsResponse>(
    "/api/account/financial-extra/tax-filing/notification-settings"
  );
}

export async function updateTaxNotificationSettingsProvider(
  payload: TaxNotificationSettings
): Promise<UpdateTaxNotificationSettingsResponse> {
  return apiFetch<UpdateTaxNotificationSettingsResponse>(
    "/api/account/financial-extra/tax-filing/notification-settings",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export async function fileTaxProvider(
  id: string
): Promise<FileTaxResponse> {
  return apiFetch<FileTaxResponse>(
    `/api/account/financial-extra/tax-filing/${id}/file`,
    {
      method: "PUT",
    }
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
  return apiFetch<GetStateWiseTaxResponse>(
    `/api/account/financial-extra/state-wise-tax${queryString ? `?${queryString}` : ""}`
  );
}

export async function getStateWiseTaxStatsProvider(
  params?: GetStateWiseTaxStatsParams
): Promise<GetStateWiseTaxStatsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  return apiFetch<GetStateWiseTaxStatsResponse>(
    `/api/account/financial-extra/state-wise-tax/stats${queryString ? `?${queryString}` : ""}`
  );
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
    `/api/account/financial-extra/state-wise-tax/export${queryString ? `?${queryString}` : ""}`
  );
}

export async function getStateWiseTaxUpcomingDeadlinesProvider(
  params?: GetStateWiseTaxUpcomingDeadlinesParams
): Promise<GetStateWiseTaxUpcomingDeadlinesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.scope) queryParams.append("scope", params.scope);

  const queryString = queryParams.toString();
  return apiFetch<GetStateWiseTaxUpcomingDeadlinesResponse>(
    `/api/account/financial-extra/state-wise-tax/upcoming-deadlines${queryString ? `?${queryString}` : ""}`
  );
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
  return apiFetch<GetProjectWiseTaxResponse>(
    `/api/account/financial-extra/project-wise-tax${queryString ? `?${queryString}` : ""}`
  );
}

export async function getProjectWiseTaxStatsProvider(
  params?: GetProjectWiseTaxStatsParams
): Promise<GetProjectWiseTaxStatsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== "all") queryParams.append("projectId", params.projectId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  return apiFetch<GetProjectWiseTaxStatsResponse>(
    `/api/account/financial-extra/project-wise-tax/stats${queryString ? `?${queryString}` : ""}`
  );
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
    `/api/account/financial-extra/project-wise-tax/export${queryString ? `?${queryString}` : ""}`
  );
}

export async function syncTaxFilingProvider(): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/account/financial-extra/tax-filing/sync",
    {
      method: "POST",
    }
  );
}

export async function syncStateWiseTaxProvider(): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/account/financial-extra/state-wise-tax/sync",
    {
      method: "POST",
    }
  );
}

export async function syncProjectWiseTaxProvider(): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/account/financial-extra/project-wise-tax/sync",
    {
      method: "POST",
    }
  );
}
