import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const projects = [
  {
    rank: 1,
    name: "Enterprise Cloud Migration",
    category: "IT Infrastructure",
    cost: "$485,000",
    rankColor: "bg-yellow-400 text-white",
  },
  {
    rank: 2,
    name: "Mobile App Development",
    category: "Product Development",
    cost: "$342,000",
    rankColor: "bg-gray-400 text-white",
  },
  {
    rank: 3,
    name: "Supply Chain Optimization",
    category: "Operations",
    cost: "$298,000",
    rankColor: "bg-orange-400 text-white",
  },
  {
    rank: 4,
    name: "Customer Portal Redesign",
    category: "Digital Marketing",
    cost: "$267,000",
    rankColor: "bg-blue-400 text-white",
  },
  {
    rank: 5,
    name: "Data Analytics Platform",
    category: "Business Intelligence",
    cost: "$234,000",
    rankColor: "bg-blue-400 text-white",
  },
];

export default function TopHighestCostProjectsCard() {
  return (
    <Card className="p-6 bg-white rounded-md border-none shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Top 5 Highest Cost Projects
      </h3>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.rank}
            className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                  project.rankColor
                )}
              >
                {project.rank}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {project.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {project.category}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {project.cost}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
