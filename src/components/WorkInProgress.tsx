import { Badge } from "@/components/ui/badge";
import BuildingOneIcon from "@/assets/icon/buildingOneIcon.svg";
import { cn } from "@/lib/utils";
import SectionHeaderWithAction from "./common_components/SectionHeaderWithAction";
import { projectsByFilter } from "@/data/mockData";
import type { TabType } from "@/pages/Dashboard";
import { useNavigate } from "react-router-dom";

interface ProjectItemProps {
  name: string;
  status: "In Progress" | "Planning" | "Execution";
  margin: string;
  revenue: string;
  costs: string;
  profit: string;
}

export type ProjectStatus =
  | "In Progress"
  | "Planning"
  | "Execution"
  | "Completed";

export interface ProjectItemData {
  name: string;
  status: ProjectStatus;
  margin: string;
  revenue: string;
  costs: string;
  profit: string;
}

export type ProjectsByFilter = Record<TabType, readonly ProjectItemData[]>;

function ProjectItem({
  name,
  status,
  margin,
  revenue,
  costs,
  profit,
}: ProjectItemProps) {
  const statusColors = {
    "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
    Planning: "bg-orange-50 text-orange-600 border-orange-100",
    Execution: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className="sm:p-4 p-2 rounded-2xl border border-gray-100 mb-4 last:mb-0 bg-white">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="md:w-10 w-8 md:h-10 h-8 flex items-center justify-center bg-blue-50/50 rounded-xl">
            <img src={BuildingOneIcon} className="md:w-5 md:h-5 w-4 h-4" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-gray-800 text-sm md:text-base leading-tight">
              {name}
            </h4>
            <Badge
              variant="outline"
              className={cn(
                "font-normal md:text-[10px] text-[9px] px-2 py-0 border w-fit h-5",
                statusColors[status]
              )}
            >
              {status}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[#3AB449] font-bold text-sm tracking-tight">
            {margin}
          </div>
          <div className="text-[10px] text-gray-400 font-regular whitespace-nowrap">
            Profit Margin
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 grid-cols-2 gap-4 px-1">
        <div>
          <div className="text-sm text-gray-400 font-normal mb-1">Revenue</div>
          <div className="font-bold text-base text-gray-900">{revenue}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 font-normal mb-1">
            Total Costs
          </div>
          <div className="font-bold text-base text-[#EF4444]">{costs}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 font-normal mb-1">
            Net Profit
          </div>
          <div className="font-bold text-base text-[#3AB449]">{profit}</div>
        </div>
      </div>
    </div>
  );
}

export function WorkInProgress({ activeTab }: { activeTab: TabType }) {
  const projects = projectsByFilter[activeTab];
  const navigate = useNavigate();
  return (
    <div className="p-6 border-none bg-white rounded-md">
      <SectionHeaderWithAction
        title="Work in progress - Profit Analysis"
        subtitle="Real time profitability tracking for active projects"
        onActionClick={() => navigate("/wip_profit")}
        showIcon={true}
      />

      <div className="space-y-4 overflow-y-auto border-t border-gray-300 pt-4">
        {projects.map((project: any) => (
          <ProjectItem
            key={project.name}
            name={project.name}
            status={project.status}
            margin={project.margin}
            revenue={project.revenue}
            costs={project.costs}
            profit={project.profit}
          />
        ))}
      </div>
    </div>
  );
}
