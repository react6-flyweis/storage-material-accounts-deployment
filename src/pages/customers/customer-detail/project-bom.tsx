import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BomItem {
  id: number;
  category: string;
  item: string;
  description: string;
  quantity: number;
  unitWeight: string;
}

const BOM_ITEMS_DATA: BomItem[] = [
  {
    id: 1,
    category: "Primary Steel",
    item: "Rigid Frame",
    description: "RF-Section",
    quantity: 50,
    unitWeight: "120 IBS",
  },
  {
    id: 2,
    category: "Secondary Steel",
    item: "Purlins",
    description: "Z-200",
    quantity: 120,
    unitWeight: "45 IBS",
  },
  {
    id: 3,
    category: "Panels",
    item: "Roof Panel",
    description: "PBR Panel",
    quantity: 30,
    unitWeight: "90 IBS",
  },
  {
    id: 4,
    category: "Panels",
    item: "Wall Panel",
    description: "PBR Panel",
    quantity: 50,
    unitWeight: "120 IBS",
  },
  {
    id: 5,
    category: "Trim",
    item: "Corner Trim",
    description: "CT-01",
    quantity: 50,
    unitWeight: "120 IBS",
  },
  {
    id: 6,
    category: "Fasteners",
    item: "Screws",
    description: "Self Drill",
    quantity: 50,
    unitWeight: "120 IBS",
  },
];

export default function ProjectBomPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    projectName?: string;
    projectId?: string;
    bomId?: string;
  } | null;

  const projectName = state?.projectName || "Riverside Complex";
  const bomId = state?.bomId || "BOM-001";

  // BOM summary metrics
  const summary = useMemo(() => {
    return {
      totalItems: 125,
      totalWeight: "32,000 lbs",
      totalPanelsArea: "3,300 sqm",
      missingDataIssues: 0,
    };
  }, []);

  // Export to Excel / CSV
  const handleDownloadExcel = () => {
    const headers = ["#", "Category", "Item", "Description", "Quantity", "Unit Weight"];
    const rows = BOM_ITEMS_DATA.map((row) => [
      row.id,
      `"${row.category}"`,
      `"${row.item}"`,
      `"${row.description}"`,
      row.quantity,
      `"${row.unitWeight}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BOM_${bomId}_${projectName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF / Print
  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-[#F0F4F8]">
      {/* Top Header: Back Button, Title & Download Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            BOM Files Details
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Excel</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main BOM Card Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
        {/* Grey Header Banner */}
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Project: {projectName} | BOM ID: {bomId}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Project: {projectName}
          </p>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Upload ID: {bomId}
          </p>
        </div>

        {/* Summary & Missing Data Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-1">
          {/* Left Column: BOM Summary */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              BOM Summary
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Items</span>
                <span className="font-bold text-slate-900">
                  {summary.totalItems}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Weight</span>
                <span className="font-bold text-slate-900">
                  {summary.totalWeight}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Panels Area</span>
                <span className="font-bold text-slate-900">
                  {summary.totalPanelsArea}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Missing Data Issue */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Missing Data Issue
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Missing</span>
                <span className="font-bold text-slate-900">
                  {summary.missingDataIssues}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* BOM Table Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            BOM Table
          </h3>

          <div className="overflow-hidden rounded-xl border border-slate-200/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#222222] text-white text-xs font-semibold">
                    <th className="py-3 px-4 w-12 text-center font-semibold">
                      #
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Category
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Item
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Description
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Quantity
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Unit Weight
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
                  {BOM_ITEMS_DATA.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                        {row.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {row.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {row.item}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {row.description}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {row.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-mono text-xs">
                        {row.unitWeight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
