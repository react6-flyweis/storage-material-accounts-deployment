import type { TabType } from "@/pages/Dashboard";

/**
 * Formats a date object to ISO string date portion (YYYY-MM-DD)
 */
export const formatDateToIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Returns inclusive startDate and endDate strings in YYYY-MM-DD for a given tab.
 */
export const getDateRangeForTab = (
  tab: TabType
): { startDate: string; endDate: string } => {
  const now = new Date();
  const endDate = formatDateToIso(now);

  if (tab === "today") {
    return {
      startDate: endDate,
      endDate,
    };
  }

  if (tab === "week") {
    const past = new Date(now);
    past.setDate(past.getDate() - 7);
    return {
      startDate: formatDateToIso(past),
      endDate,
    };
  }

  if (tab === "month") {
    const past = new Date(now);
    past.setDate(past.getDate() - 30);
    return {
      startDate: formatDateToIso(past),
      endDate,
    };
  }

  return {
    startDate: endDate,
    endDate,
  };
};

/**
 * Formats a number as USD currency (e.g. $485,250 or $12,500)
 */
export const formatCurrency = (val?: number | string | null): string => {
  if (val === undefined || val === null || val === "") return "$0";
  const num = typeof val === "string" ? Number(val.replace(/[^0-9.-]+/g, "")) : val;
  if (isNaN(num)) return String(val);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);
};

/**
 * Formats a number with comma separators (e.g. 1,420)
 */
export const formatNumber = (val?: number | string | null): string => {
  if (val === undefined || val === null || val === "") return "0";
  const num = typeof val === "string" ? Number(val.replace(/[^0-9.-]+/g, "")) : val;
  if (isNaN(num)) return String(val);

  return new Intl.NumberFormat("en-US").format(num);
};

/**
 * Formats an ISO date string to readable format like "28-03-2025" or "Mar 28, 2025"
 */
export const formatDate = (
  dateStr?: string | null,
  formatStyle: "short" | "display" = "short"
): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  if (formatStyle === "display") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
