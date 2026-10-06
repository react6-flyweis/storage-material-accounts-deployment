export type CustomerPeriod = "today" | "week" | "month" | "all";

export interface CustomerStatsData {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
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
