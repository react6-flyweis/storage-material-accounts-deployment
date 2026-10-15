export function formatQuoteValue(val?: number | string | null): string {
  if (val === null || val === undefined || val === "") return "—";
  const num = typeof val === "number" ? val : Number(val);
  if (Number.isNaN(num)) return String(val);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatIsoDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toISOString().split("T")[0];
}

export function formatSignedDate(dateStr?: string | null): string {
  if (!dateStr) return "Not Signed";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatStepperDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  if (dateStr.toLowerCase().includes("current")) return "Current Step";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function getStatusBadgeStyle(statusLabel = "", status = "") {
  const s = (statusLabel || status).toLowerCase();
  if (s.includes("closed") || s.includes("completed") || s.includes("paid")) {
    return {
      badge: "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]",
      dot: "bg-[#16A34A]",
    };
  }
  if (s.includes("proposal") || s.includes("quotation") || s.includes("sent")) {
    return {
      badge: "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]",
      dot: "bg-[#16A34A]",
    };
  }
  if (
    s.includes("negotiation") ||
    s.includes("progress") ||
    s.includes("gathering")
  ) {
    return {
      badge: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
      dot: "bg-[#D97706]",
    };
  }
  return {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-500",
  };
}
