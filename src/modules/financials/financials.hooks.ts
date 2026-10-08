export interface FinancialProjectItem {
  _id?: string;
  leadId?: string;
  projectName?: string;
  jobId?: string;
}

const DEFAULT_PROJECTS: FinancialProjectItem[] = [
  { _id: "proj-1", leadId: "proj-1", projectName: "Commercial Complex A", jobId: "JOB-401" },
  { _id: "proj-2", leadId: "proj-2", projectName: "Storage Unit Expansion", jobId: "JOB-402" },
  { _id: "proj-3", leadId: "proj-3", projectName: "Steel Framework Hub", jobId: "JOB-403" },
  { _id: "proj-4", leadId: "proj-4", projectName: "Downtown Commercial Tower", jobId: "JOB-2025-001" },
  { _id: "proj-5", leadId: "proj-5", projectName: "Pacific Coast Warehouse", jobId: "JOB-2025-002" },
  { _id: "proj-6", leadId: "proj-6", projectName: "Midtown Steel Storage", jobId: "JOB-2025-003" },
];

export function useBudgetVsActualProjectsQuery() {
  return {
    data: { data: { projects: DEFAULT_PROJECTS } },
    isLoading: false,
  };
}

export function useExpensesFiltersQuery() {
  return {
    data: { data: { projects: DEFAULT_PROJECTS } },
    isLoading: false,
  };
}
