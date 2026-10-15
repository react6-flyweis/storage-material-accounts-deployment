export interface MarginFilters {
  companyId: string;
  projectId: string;
  currency: string;
  startDate: string;
  endDate: string;
  presetLabel?: string;
}

export interface DateRangeOption {
  label: string;
  startDate: string;
  endDate: string;
}

export const DATE_PRESETS: DateRangeOption[] = [
  {
    label: "All Time",
    startDate: "",
    endDate: "",
  },
  {
    label: "24 Mar 2025 - 31 Mar 2025",
    startDate: "2025-03-24",
    endDate: "2025-03-31",
  },
  {
    label: "Q1 2025 (Jan - Mar)",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
  },
  {
    label: "Full Year 2025",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  },
  {
    label: "Last 30 Days",
    startDate: "2025-03-01",
    endDate: "2025-03-31",
  },
  {
    label: "Custom Range",
    startDate: "",
    endDate: "",
  },
];
