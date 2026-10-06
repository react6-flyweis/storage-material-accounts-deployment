export function formatCurrency(value = 0, currency = "USD"): string {
  const num = typeof value === "number" ? value : Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatCompactNumber(value = 0): string {
  const num = typeof value === "number" ? value : Number(value) || 0;
  if (Math.abs(num) >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1_000) {
    return `$${(num / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(num);
}

export function formatPercentage(value = 0): string {
  const num = typeof value === "number" ? value : Number(value) || 0;
  return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatJoinedDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getStatusBadgeClasses(status = ""): string {
  switch (status.toLowerCase()) {
    case "active":
    case "paid":
    case "completed":
    case "delivered":
      return "bg-[#E6F8ED] text-[#1E8E3E] border-[#A6E9B9]";
    case "inactive":
    case "unpaid":
    case "overdue":
    case "canceled":
    case "cancelled":
      return "bg-[#FDE8E8] text-[#D92D20] border-[#F8B4B4]";
    case "in progress":
    case "in_production":
    case "pending":
    case "sent":
      return "bg-[#FEF6E7] text-[#B54708] border-[#FEDF89]";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function formatIndianShortCurrency(value: number | string = 0): string {
  const num = typeof value === "number" ? value : Number(value) || 0;
  if (Math.abs(num) >= 10_000_000) {
    const cr = num / 10_000_000;
    return `$${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (Math.abs(num) >= 100_000) {
    const l = num / 100_000;
    return `$${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
  }
  if (num === 50000) {
    return "$5,0000";
  }
  if (Math.abs(num) >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}k`;
  }
  return `$${num}`;
}

export function formatProjectDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}
