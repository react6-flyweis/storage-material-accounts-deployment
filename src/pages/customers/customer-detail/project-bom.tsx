import { useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetProjectBomQuery,
  type ProjectConsolidatedBomRow,
} from "@/redux/api/projectApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

export default function ProjectBomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, projectId, customerId } = useParams<{
    id?: string;
    projectId?: string;
    customerId?: string;
  }>();

  const state = location.state as {
    projectName?: string;
    projectId?: string;
    leadId?: string;
    bomId?: string;
    customerName?: string;
    customerId?: string;
    actionLink?: string;
  } | null;

  const currentProjectId =
    projectId || id || state?.projectId || state?.leadId || "";
  const currentCustomerId = customerId || state?.customerId || "";

  // Fetch Consolidated BOM data from GET /api/account/projects/:projectId/bom/consolidated
  const {
    data: bomData,
    isLoading,
    isError,
    error,
  } = useGetProjectBomQuery(currentProjectId, {
    skip: !currentProjectId,
  });

  const projectName =
    bomData?.projectName || state?.projectName || "Riverside Complex";
  const bomId = bomData?.bomId || bomData?.jobId || state?.bomId || "BOM-001";
  const uploadId =
    bomData?.uploadId ||
    bomData?.bomId ||
    bomData?.jobId ||
    state?.bomId ||
    "BOM-001";

  const summary = bomData?.summary;
  const downloads = bomData?.downloads;
  const rawRows: ProjectConsolidatedBomRow[] = bomData?.rows || [];

  // Default sample rows matching Figma if data not loaded yet
  const fallbackRows: ProjectConsolidatedBomRow[] = [
    {
      lineNumber: 1,
      category: "Primary Steel",
      item: "Rigid Frame",
      description: "RF-Section",
      partColor: null,
      quantity: 50,
      unitWeightLbs: 120,
      totalWeightLbs: 6000,
      costUnit: "LB",
      unitCost: 1.2,
      totalCost: 7200,
      buildings: [1],
    },
    {
      lineNumber: 2,
      category: "Secondary Steel",
      item: "Purlins",
      description: "Z-200",
      partColor: null,
      quantity: 120,
      unitWeightLbs: 45,
      totalWeightLbs: 5400,
      costUnit: "LB",
      unitCost: 1.15,
      totalCost: 6210,
      buildings: [1],
    },
    {
      lineNumber: 3,
      category: "Panels",
      item: "Roof Panel",
      description: "PBR Panel",
      partColor: "Galvalume",
      quantity: 30,
      unitWeightLbs: 90,
      totalWeightLbs: 2700,
      costUnit: "SQM",
      unitCost: 14.5,
      totalCost: 39150,
      buildings: [1],
    },
    {
      lineNumber: 4,
      category: "Panels",
      item: "Wall Panel",
      description: "PBR Panel",
      partColor: "Polar White",
      quantity: 50,
      unitWeightLbs: 120,
      totalWeightLbs: 6000,
      costUnit: "SQM",
      unitCost: 15.0,
      totalCost: 9000,
      buildings: [1],
    },
    {
      lineNumber: 5,
      category: "Trim",
      item: "Corner Trim",
      description: "CT-01",
      partColor: "Polar White",
      quantity: 50,
      unitWeightLbs: 120,
      totalWeightLbs: 6000,
      costUnit: "FT",
      unitCost: 3.5,
      totalCost: 3500,
      buildings: [1],
    },
    {
      lineNumber: 6,
      category: "Fasteners",
      item: "Screws",
      description: "Self Drill",
      partColor: null,
      quantity: 50,
      unitWeightLbs: 120,
      totalWeightLbs: 5900,
      costUnit: "EA",
      unitCost: 0.45,
      totalCost: 2250,
      buildings: [1],
    },
  ];

  const rows = rawRows.length > 0 ? rawRows : fallbackRows;

  // Pagination for rows if many items exist
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, currentPage]);

  // Helper to resolve full downloadable URL
  const getFullDownloadUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("/")) {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(
        /\/$/,
        "",
      );
      return `${apiBaseUrl}${url}`;
    }
    return url;
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const excelDownloadUrl = downloads?.excelUrl || downloads?.fileUrl || "";
  const excelFileName =
    downloads?.fileName ||
    (uploadId.endsWith(".xlsx") ? uploadId : `Consolidated_BOM_${bomId}.xlsx`);

  const handleDownloadFile = async (url?: string | null, fileName?: string) => {
    if (!url) {
      alert("Download file URL is not available.");
      return;
    }
    const fullUrl = getFullDownloadUrl(url);
    const targetName =
      fileName ||
      (uploadId.endsWith(".xlsx") ? uploadId : `Consolidated_BOM_${bomId}.xlsx`);

    setIsDownloading(true);
    try {
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error("Download request failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = targetName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Direct download trigger fallback
      const link = document.createElement("a");
      link.href = fullUrl;
      link.setAttribute("download", targetName);
      link.setAttribute("target", "_self");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (excelDownloadUrl) {
      handleDownloadFile(excelDownloadUrl, excelFileName);
    } else {
      alert("Consolidated BOM Excel URL is not available.");
    }
  };

  const handleBack = () => {
    if (currentCustomerId && currentProjectId) {
      navigate(`/customers/${currentCustomerId}/projects/${currentProjectId}`);
    } else {
      navigate(-1);
    }
  };

  const httpStatus = (error as { status?: number })?.status;
  const is404 = httpStatus === 404;

  return (
    <div className="space-y-5">
      {/* Top Header: Back Button, Title & Download Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Button
            type="button"
            onClick={handleBack}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-normal text-slate-800 tracking-tight">
            BOM Files Details
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={isDownloading}
            className="bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            title="Download Excel file"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 text-slate-700 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-slate-700" />
            )}
            <span>{isDownloading ? "Downloading..." : "Download Excel"}</span>
          </button>
        </div>
      </div>

      {/* Main White BOM Card Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/70 p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Grey Header Banner */}
        <div className="bg-[#F8F9FA] rounded-xl p-6 space-y-2 border border-slate-100">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Project: {projectName} | BOM ID: {bomId}
          </h2>
          <p className="text-sm font-medium text-slate-800">
            Project: {projectName}
          </p>
          <p className="text-sm font-medium text-slate-800">
            Upload ID: {uploadId}
          </p>
        </div>

        {/* 404 Alert if BOM not found */}
        {isError && (
          <div
            className={`rounded-xl p-4 border flex items-start gap-3 ${
              is404
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            {is404 ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm">
                {is404
                  ? "Consolidated BOM Not Available"
                  : "Unable to load consolidated BOM"}
              </p>
              <p>
                {is404
                  ? "No consolidated BOM has been generated for this project yet. Plant must run consolidation first."
                  : "Please check your network connection or permissions."}
              </p>
            </div>
          </div>
        )}

        {/* Summary & Missing Data Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Left Column: BOM Summary */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              BOM Summary
            </h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-800 font-medium">Total Items</span>
                <span className="font-bold text-slate-900">
                  {summary?.totalItems !== undefined
                    ? summary.totalItems.toLocaleString()
                    : (rawRows.length || 125).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-800 font-medium">Total Weight</span>
                <span className="font-bold text-slate-900">
                  {summary?.totalWeightLbs !== undefined &&
                  summary.totalWeightLbs !== null
                    ? `${summary.totalWeightLbs.toLocaleString()} lbs`
                    : "32,000 lbs"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-800 font-medium">
                  Total Panels Area
                </span>
                <span className="font-bold text-slate-900">
                  {summary?.totalPanelsAreaSqm !== undefined &&
                  summary.totalPanelsAreaSqm !== null
                    ? `${summary.totalPanelsAreaSqm.toLocaleString()} sqm`
                    : "3,300 sqm"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Missing Data Issue */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Missing Data Issue
            </h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-800 font-medium">Missing</span>
                <span className="font-bold text-slate-900">
                  {summary?.missingDataCount ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/80" />

        {/* BOM Table Section with All Available Columns */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">BOM Table</h3>
            <span className="text-xs text-slate-500 font-medium">
              {rows.length} total items
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#222222] text-white text-xs font-semibold whitespace-nowrap">
                    <th className="py-3.5 px-3 text-center w-12">#</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Item</th>
                    <th className="py-3.5 px-3">Description</th>
                    <th className="py-3.5 px-3 text-center">Part Color</th>
                    <th className="py-3.5 px-3 text-center">Quantity</th>
                    <th className="py-3.5 px-3 text-right">Unit Weight</th>
                    <th className="py-3.5 px-3 text-right">Total Weight</th>
                    <th className="py-3.5 px-3 text-center">Cost Unit</th>
                    <th className="py-3.5 px-3 text-right">Unit Cost</th>
                    <th className="py-3.5 px-3 text-right">Total Cost</th>
                    <th className="py-3.5 px-3 text-center">Buildings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="py-12 text-center text-slate-500"
                      >
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                        Loading BOM table...
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row) => (
                      <tr
                        key={row.lineNumber}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* 1. Line # */}
                        <td className="py-3.5 px-3 text-center text-slate-600 font-mono text-xs">
                          {row.lineNumber}
                        </td>

                        {/* 2. Category */}
                        <td className="py-3.5 px-3 text-slate-800 font-normal whitespace-nowrap text-xs">
                          {row.category}
                        </td>

                        {/* 3. Item */}
                        <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap text-xs">
                          {row.item}
                        </td>

                        {/* 4. Description */}
                        <td
                          className="py-3.5 px-3 text-slate-600 whitespace-nowrap text-xs max-w-xs truncate"
                          title={row.description}
                        >
                          {row.description}
                        </td>

                        {/* 5. Part Color */}
                        <td className="py-3.5 px-3 text-center text-slate-600 whitespace-nowrap text-xs">
                          {row.partColor || "-"}
                        </td>

                        {/* 6. Quantity */}
                        <td className="py-3.5 px-3 text-center text-slate-800 font-medium whitespace-nowrap text-xs">
                          {row.quantity?.toLocaleString() ?? 0}
                        </td>

                        {/* 7. Unit Weight */}
                        <td className="py-3.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap text-xs">
                          {row.unitWeightLbs !== undefined &&
                          row.unitWeightLbs !== null
                            ? `${row.unitWeightLbs.toLocaleString()} IBS`
                            : "-"}
                        </td>

                        {/* 8. Total Weight */}
                        <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-800 whitespace-nowrap text-xs">
                          {row.totalWeightLbs !== undefined &&
                          row.totalWeightLbs !== null
                            ? `${row.totalWeightLbs.toLocaleString()} IBS`
                            : "-"}
                        </td>

                        {/* 9. Cost Unit */}
                        <td className="py-3.5 px-3 text-center font-mono text-slate-600 whitespace-nowrap text-xs">
                          {row.costUnit || "-"}
                        </td>

                        {/* 10. Unit Cost */}
                        <td className="py-3.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap text-xs">
                          {row.unitCost !== undefined && row.unitCost !== null
                            ? formatCurrency(row.unitCost)
                            : "-"}
                        </td>

                        {/* 11. Total Cost */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap text-xs">
                          {row.totalCost !== undefined && row.totalCost !== null
                            ? formatCurrency(row.totalCost)
                            : "-"}
                        </td>

                        {/* 12. Buildings */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap text-xs">
                          {Array.isArray(row.buildings) &&
                          row.buildings.length > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              {row.buildings.map((b) => (
                                <span
                                  key={b}
                                  className="px-1.5 py-0.5 rounded font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  Bldg {b}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls if rows > rowsPerPage */}
            {rows.length > rowsPerPage && (
              <div className="p-3 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
                  {Math.min(currentPage * rowsPerPage, rows.length)} of{" "}
                  {rows.length} items
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
