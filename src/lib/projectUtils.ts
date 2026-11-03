/**
 * Returns a human-friendly display name for a project.
 * If projectName/name is not available, uses fallback: [clientName, buildingType, location].filter(Boolean).join(" - ")
 */
export function getProjectDisplayName(
  p?: {
    projectName?: string;
    name?: string;
    clientName?: string;
    customerName?: string;
    client?: string | { name?: string };
    customer?: string | { name?: string };
    buildingType?: string;
    building?: string;
    location?: string;
    address?: string;
    city?: string;
    jobId?: string;
    code?: string;
  } | null,
  separator: string = " - "
): string {
  if (!p) return "";
  const directName = p.projectName || p.name;
  if (directName && directName.trim()) {
    return directName.trim();
  }

  const client =
    p.clientName ||
    p.customerName ||
    (typeof p.client === "string" ? p.client : p.client?.name) ||
    (typeof p.customer === "string" ? p.customer : p.customer?.name) ||
    "";
  const building = p.buildingType || p.building || "";
  const loc = p.location || p.address || p.city || "";

  const parts = [client, building, loc]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(separator);
  }

  const code = p.jobId || p.code;
  if (code) {
    return `Project #${code}`;
  }

  return "Untitled Project";
}
