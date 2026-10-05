import {
  ArrowUpDown,
  Eye,
  FileSpreadsheet,
  FileText,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TabType } from "@/pages/Dashboard";
import SuccessModal from "@/components/common_components/SuccessModal";

interface ProjectRow {
  id: number;
  name: string;
  orderValue: string;
  costToDate: string;
  profit: string;
  margin: string;
  marginColor: "green" | "red" | "yellow";
  status: string;
  updatedOn: string;
}

interface ProjectDataTableProps {
  activeTab: TabType;
}

type SortKey =
  | "name"
  | "orderValue"
  | "costToDate"
  | "profit"
  | "margin"
  | "updatedOn";

type SortDirection = "asc" | "desc";

/* -------------------- DATA -------------------- */

const projectTableByFilter: Record<TabType, ProjectRow[]> = {
  today: [
    {
      id: 1,
      name: "Downtown Office Complex",
      orderValue: "$580,000",
      costToDate: "$335,000",
      profit: "$245,000",
      margin: "42.5%",
      marginColor: "green",
      status: "In Progress",
      updatedOn: "2026-01-12",
    },
    {
      id: 2,
      name: "Residential Tower Phase 2",
      orderValue: "$520,000",
      costToDate: "$322,000",
      profit: "$198,000",
      margin: "38.2%",
      marginColor: "green",
      status: "In Progress",
      updatedOn: "2026-01-12",
    },
  ],

  week: [
    {
      id: 1,
      name: "Shopping Mall Renovation",
      orderValue: "$1,240,000",
      costToDate: "$885,000",
      profit: "$355,000",
      margin: "28.6%",
      marginColor: "green",
      status: "In Progress",
      updatedOn: "2026-01-10",
    },
    {
      id: 2,
      name: "Industrial Warehouse",
      orderValue: "$980,000",
      costToDate: "$910,000",
      profit: "$70,000",
      margin: "7.1%",
      marginColor: "red",
      status: "In Progress",
      updatedOn: "2026-01-09",
    },
    {
      id: 3,
      name: "School Extension",
      orderValue: "$760,000",
      costToDate: "$620,000",
      profit: "$140,000",
      margin: "18.4%",
      marginColor: "yellow",
      status: "In Progress",
      updatedOn: "2026-01-08",
    },
  ],

  month: [
    {
      id: 1,
      name: "Hospital Wing",
      orderValue: "$3,850,000",
      costToDate: "$3,120,000",
      profit: "$730,000",
      margin: "18.9%",
      marginColor: "yellow",
      status: "In Progress",
      updatedOn: "2026-01-05",
    },
    {
      id: 2,
      name: "Metro Station Expansion",
      orderValue: "$4,620,000",
      costToDate: "$3,780,000",
      profit: "$840,000",
      margin: "18.1%",
      marginColor: "yellow",
      status: "In Progress",
      updatedOn: "2026-01-03",
    },
    {
      id: 3,
      name: "IT Park Development",
      orderValue: "$6,300,000",
      costToDate: "$5,120,000",
      profit: "$1,180,000",
      margin: "18.7%",
      marginColor: "green",
      status: "In Progress",
      updatedOn: "2026-01-01",
    },
  ],
};

export default function ProjectDataTable({ activeTab }: ProjectDataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const rawProjects = projectTableByFilter[activeTab] ?? [];

  const navigate = useNavigate();

  const parseCurrency = (value: string) =>
    Number(value.replace(/[^0-9.-]+/g, ""));

  const parsePercentage = (value: string) => Number(value.replace("%", ""));

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const projects = [...rawProjects].sort((a, b) => {
    if (!sortKey) return 0;

    let aValue: number | string = "";
    let bValue: number | string = "";

    switch (sortKey) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;

      case "orderValue":
        aValue = parseCurrency(a.orderValue);
        bValue = parseCurrency(b.orderValue);
        break;

      case "costToDate":
        aValue = parseCurrency(a.costToDate);
        bValue = parseCurrency(b.costToDate);
        break;

      case "profit":
        aValue = parseCurrency(a.profit);
        bValue = parseCurrency(b.profit);
        break;

      case "margin":
        aValue = parsePercentage(a.margin);
        bValue = parsePercentage(b.margin);
        break;

      case "updatedOn":
        aValue = new Date(a.updatedOn).getTime();
        bValue = new Date(b.updatedOn).getTime();
        break;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-lg font-bold text-gray-900">Project Data</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="text-gray-600 border-gray-200 hover:bg-gray-50 h-9"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button
            variant="outline"
            className="text-gray-600 border-gray-200 hover:bg-gray-50 h-9"
            onClick={() => {
              setModalTitle("PDF Exported Successfully");
              setIsSuccessModalOpen(true);
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            onClick={() => {
              setModalTitle("EXCEL Exported Successfully");
              setIsSuccessModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-3 px-4 w-[120px] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Project
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 w-[120px] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("orderValue")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Order Value
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 w-[120px] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("costToDate")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Cost to Date
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 w-[120px] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("profit")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Profit
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 w-[120px] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("margin")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Margin %
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 w-[120px] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>

              <th className="py-3 px-4 w-[120px] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div
                  onClick={() => handleSort("updatedOn")}
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                >
                  Updated On
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 w-[120px] text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                  {project.name}
                </td>

                <td className="py-4 px-4 text-sm text-gray-600">
                  {project.orderValue}
                </td>

                <td className="py-4 px-4 text-sm text-gray-600">
                  {project.costToDate}
                </td>

                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                  {project.profit}
                </td>

                <td className="py-4 px-4 text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      project.marginColor === "green"
                        ? "text-emerald-500"
                        : project.marginColor === "red"
                        ? "text-red-500"
                        : "text-amber-500"
                    )}
                  >
                    {project.margin}
                  </span>
                </td>

                <td className="py-4 px-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {project.status}
                  </span>
                </td>

                <td className="py-4 px-4 text-sm text-gray-500">
                  {project.updatedOn}
                </td>

                <td className="py-4 px-4 text-right">
                  <Button
                    onClick={() => navigate(`/dashboard`)}
                    variant="ghost"
                    size="sm"
                    className="h-8 border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={modalTitle}
      />
    </div>
  );
}
