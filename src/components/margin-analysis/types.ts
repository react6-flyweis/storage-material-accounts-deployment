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

/**
 * Formats company / business unit enum values into human-readable Title Case.
 * Handles snake_case, UPPER_CASE, kebab-case, camelCase, and preserves known corporate acronyms.
 *
 * e.g.
 * - "MR_STORAGE" -> "MR Storage"
 * - "COMMERCIAL_STORAGE" -> "Commercial Storage"
 * - "MATERIAL_RACKING" -> "Material Racking"
 * - "STORAGE_SOLUTIONS" -> "Storage Solutions"
 * - "all" -> "All Companies"
 */
export function formatCompanyEnum(val?: string | null): string {
  if (!val) return "";
  if (val === "all" || val.toLowerCase() === "all") return "All Companies";

  // Separate camelCase words
  const separated = val.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Replace underscores and hyphens with spaces
  const words = separated.replace(/[_-]+/g, " ").trim().split(/\s+/);

  return words
    .map((word) => {
      const upper = word.toUpperCase();
      if (
        ["MR", "LLC", "USA", "UK", "UAE", "BOM", "PL", "INC", "CORP", "LTD"].includes(
          upper
        )
      ) {
        return upper;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

