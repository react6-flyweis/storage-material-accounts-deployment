import React, { useState } from "react";
import { Search } from "lucide-react";

export interface ProjectOptionItem {
  id: string;
  name: string;
  code: string;
}

interface ProjectSelectorDropdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject?: string;
  onSelectProject: (projectLabel: string) => void;
}

export const ProjectSelectorDropdownModal: React.FC<
  ProjectSelectorDropdownModalProps
> = ({ isOpen, onClose, selectedProject, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const defaultProjects: ProjectOptionItem[] = [
    {
      id: "prj-1",
      name: "Riverside Office Complex",
      code: "PRJ-2025-0015",
    },
    {
      id: "prj-2",
      name: "ABC Office Complex",
      code: "PRJ-2025-0015",
    },
    {
      id: "prj-3",
      name: "XYZ Building Complex",
      code: "PRJ-2025-0015",
    },
    {
      id: "prj-4",
      name: "James Court",
      code: "PRJ-2025-0015",
    },
    {
      id: "prj-5",
      name: "Dupleix Villa",
      code: "PRJ-2025-0015",
    },
  ];

  const filteredProjects = defaultProjects.filter((item) => {
    const full = `${item.name} (${item.code})`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  const handleSelect = (item: ProjectOptionItem) => {
    onSelectProject(`${item.name} (${item.code})`);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-white rounded-xl p-4 shadow-2xl border border-slate-100 w-[310px] sm:w-[350px]">
        {/* Search input with icon */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Ptoject"
            autoFocus
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>

        {/* Project Options List */}
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {/* Option for All Projects */}
          <button
            type="button"
            onClick={() => {
              onSelectProject("All Projects");
              onClose();
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              selectedProject === "All Projects"
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-slate-800 hover:bg-slate-50"
            }`}
          >
            All Projects
          </button>

          {filteredProjects.map((item) => {
            const label = `${item.name} (${item.code})`;
            const isSelected = selectedProject === label;

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
                {item.name} ({item.code})
              </button>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="py-4 text-center text-xs text-slate-400">
              No projects found
            </div>
          )}
        </div>
      </div>
    </div>
  </>
);
};

export default ProjectSelectorDropdownModal;
