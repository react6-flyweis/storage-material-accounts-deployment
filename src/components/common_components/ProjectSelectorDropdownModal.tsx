import React, { useState, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useGetBudgetVsActualProjectsQuery } from "@/redux/api/financialApi";
import { getProjectDisplayName } from "@/lib/projectUtils";

export interface ProjectOptionItem {
  id: string;
  name: string;
  code: string;
  clientName?: string;
  buildingType?: string;
  location?: string;
}

interface ProjectSelectorDropdownModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
  selectedProject?: string;
  selectedProjectId?: string;
  projects?: ProjectOptionItem[];
  onSelectProject: (projectLabel: string, leadId?: string) => void;
  align?: "left" | "right" | "start" | "end" | "center";
  className?: string;
}

export const ProjectSelectorDropdownModal: React.FC<
  ProjectSelectorDropdownModalProps
> = ({
  isOpen: controlledOpen,
  onClose,
  trigger,
  selectedProject,
  selectedProjectId,
  projects,
  onSelectProject,
  align = "right",
  className = "",
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    if (!nextOpen) {
      onClose?.();
      setSearchTerm("");
    }
  };

  const popoverAlign =
    align === "left" ? "start" : align === "right" ? "end" : align;

  // Encapsulate project query inside component so callers without custom projects get real data automatically
  const { data: fetchedProjects = [], isLoading: isLoadingProjects } =
    useGetBudgetVsActualProjectsQuery(undefined, {
      skip: Boolean(projects && projects.length > 0),
    });

  const projectList: ProjectOptionItem[] = useMemo(() => {
    // 1. If explicit projects are passed and non-empty, use them (e.g. filtered by company)
    if (projects && projects.length > 0) {
      return projects.map((p) => ({
        ...p,
        name: getProjectDisplayName(p),
      }));
    }
    // 2. Use encapsulated projects query results
    if (fetchedProjects && fetchedProjects.length > 0) {
      return fetchedProjects.map((p) => ({
        id: p._id,
        name: getProjectDisplayName(p),
        code: p.jobId || "",
        clientName: p.clientName,
        buildingType: p.buildingType,
        location: p.location || p.address,
      }));
    }
    // 3. Fallback to passed projects array if explicitly empty
    if (projects !== undefined) {
      return projects;
    }
    return [];
  }, [projects, fetchedProjects]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projectList;
    const term = searchTerm.toLowerCase();
    return projectList.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(term);
      const codeMatch = item.code?.toLowerCase().includes(term);
      const full = `${item.name} (${item.code})`.toLowerCase();
      return nameMatch || codeMatch || full.includes(term);
    });
  }, [projectList, searchTerm]);

  const handleSelect = (item: ProjectOptionItem) => {
    onSelectProject(
      item.code ? `${item.name} (${item.code})` : item.name,
      item.id,
    );
    handleOpenChange(false);
  };

  const handleSelectAll = () => {
    onSelectProject("All Projects");
    handleOpenChange(false);
  };

  const isAllSelected =
    (!selectedProjectId ||
      selectedProjectId === "All" ||
      selectedProjectId === "all") &&
    (!selectedProject || selectedProject === "All Projects");

  const dropdownBody = (
    <PopoverContent
      align={popoverAlign}
      sideOffset={6}
      className={`w-77.5 sm:w-87.5 p-4 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150 ${className}`}
    >
      {/* Search input with icon */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Project"
          autoFocus
          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 bg-white"
        />
      </div>

      {/* Project Options List */}
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {/* Option for All Projects */}
        <button
          type="button"
          onClick={handleSelectAll}
          className={`w-full text-left px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            isAllSelected
              ? "bg-blue-50 text-blue-600 font-semibold"
              : "text-slate-800 hover:bg-slate-50"
          }`}
        >
          All Projects
        </button>

        {isLoadingProjects && projectList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Loading projects...</span>
          </div>
        ) : (
          filteredProjects.map((item) => {
            const label = item.code ? `${item.name} (${item.code})` : item.name;
            const isSelected = selectedProjectId
              ? item.id === selectedProjectId
              : selectedProject === label;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer leading-snug ${
                  isSelected
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-800 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            );
          })
        )}

        {!isLoadingProjects && filteredProjects.length === 0 && (
          <div className="py-4 text-center text-xs text-slate-400">
            No projects found
          </div>
        )}
      </div>
    </PopoverContent>
  );

  if (trigger) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        {dropdownBody}
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor className="absolute inset-0 pointer-events-none" />
      {dropdownBody}
    </Popover>
  );
};

export default ProjectSelectorDropdownModal;
