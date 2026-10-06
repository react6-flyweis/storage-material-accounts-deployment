import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Pagination from "@/components/common_components/Pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ArrowUpDown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusBadgeClasses } from "@/modules/customers/customer-utils";
import type { CustomerProjectItem } from "@/redux/api/customerApi";

export interface ProjectRow {
  id: string;
  name: string;
  businessUnit: string;
  building: string;
  startDate: string;
  stage: string;
  progress: string;
  status: string;
  amount: number;
}

type Props = {
  customerId: string;
  projects?: CustomerProjectItem[];
  customerName?: string;
};

export default function ProjectsTable({ customerId, projects = [], customerName }: Props) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [businessUnitFilter, setBusinessUnitFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const projectRows: ProjectRow[] = useMemo(() => {
    return projects.map((p) => {
      const stage = p.lifecycleStatus
        ? p.lifecycleStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Initial Contact";

      const step = p.status?.toLowerCase() === "completed" ? "Step 8/8" : "Step 4/8";

      return {
        id: p.projectId || p.leadId,
        name: p.projectName || `Project ${p.projectId}`,
        businessUnit: "Commercial Storage",
        building: "1 Building",
        startDate: formatDate(p.startDate),
        stage,
        progress: step,
        status: p.status || "In Progress",
        amount: p.amount || 0,
      };
    });
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projectRows.filter((row) => {
      const matchesSearch =
        !searchTerm.trim() ||
        [row.name, row.businessUnit, row.building, row.startDate, row.stage, row.status]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesBU =
        businessUnitFilter === "all" ||
        row.businessUnit.toLowerCase() === businessUnitFilter.toLowerCase();

      return matchesSearch && matchesBU;
    });
  }, [projectRows, searchTerm, businessUnitFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const visibleProjects = filteredProjects.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">All Projects</h2>
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="bg-white max-w-xs shadow-xs">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search project"
            />
          </InputGroup>

          {(searchTerm !== "" || businessUnitFilter !== "all") && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setBusinessUnitFilter("all");
                setCurrentPage(1);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white rounded-xl">
        <CardContent className="px-0 py-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100 hover:bg-slate-100 border-0">
                <TableHead className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all projects"
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                  />
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  Project Name
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  Business Unit
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  Building
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    Start Date
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </span>
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    Stage
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </span>
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    Progress
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </span>
                </TableHead>
                <TableHead className="font-medium text-slate-500">
                  Status
                </TableHead>
                <TableHead className="font-medium text-slate-500 text-right pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No projects found for this customer.
                  </TableCell>
                </TableRow>
              ) : (
                visibleProjects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="text-[13px] text-slate-700 hover:bg-slate-50/70 border-b border-slate-100"
                  >
                    <TableCell className="px-3 py-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${project.name}`}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-4 font-medium text-slate-800">
                      {project.name}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge
                        variant="outline"
                        className="font-normal text-xs bg-slate-50 border-slate-200 text-slate-700"
                      >
                        {project.businessUnit}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-600">
                      {project.building}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-600">
                      {project.startDate}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-600">
                      {project.stage}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-600">
                      {project.progress}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge
                        className={`text-[11px] font-semibold border ${getStatusBadgeClasses(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right pr-6">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          navigate(`/customers/projects/${project.id}`, {
                            state: {
                              projectId: project.id,
                              projectName: project.name,
                              customerName,
                              customerId,
                            },
                          })
                        }
                        className="bg-[#1D51A4] hover:bg-[#153e7e] text-white text-xs px-3 h-8 rounded"
                      >
                        view
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredProjects.length > rowsPerPage && (
        <div className="bg-white rounded-md shadow-xs p-2">
          <Pagination
            totalItems={filteredProjects.length}
            itemsPerPage={rowsPerPage}
            currentPage={safeCurrentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
