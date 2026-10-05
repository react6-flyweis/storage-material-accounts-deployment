import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const overBudgetProjects = [
  {
    name: "Enterprise Cloud Migration",
    originalBudget: "$420,000",
    percentageOver: "+15.2%",
    amountOver: "$63,840",
  },
  {
    name: "Supply Chain Optimization",
    originalBudget: "$274,000",
    percentageOver: "+8.7%",
    amountOver: "$23,838",
  },
  {
    name: "Customer Portal Redesign",
    originalBudget: "$238,000",
    percentageOver: "+12.3%",
    amountOver: "$29,274",
  },
];

export default function ProjectsExceedingBudgetCard() {
  return (
    <Card className="p-6 bg-white rounded-md border-none shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          Projects Exceeding Budget
        </h3>
        <AlertTriangle className="w-5 h-5 text-orange-500" />
      </div>

      <div className="space-y-4 flex-1">
        {overBudgetProjects.map((project, index) => (
          <div
            key={index}
            className="p-4 bg-red-50/50 rounded-lg border border-red-100"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-semibold text-gray-900">
                {project.name}
              </p>
              <span className="text-xs font-bold text-red-600">
                {project.percentageOver}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-xs text-gray-500">
                Original Budget: {project.originalBudget}
              </p>
              <p className="text-xs text-red-600 font-medium">
                Over by: {project.amountOver}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-600 font-medium">
          Total Projects Over Budget
        </span>
        <span className="text-lg font-normal text-red-600">3</span>
      </div>
    </Card>
  );
}
