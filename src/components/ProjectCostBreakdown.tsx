import { Card } from "@/components/ui/card";
import ProjectCostIcon from "@/assets/icon/ProjectCostIcon.svg";

const mockCostData = [
  {
    project: "Downtown Office ",
    labor: { value: "$200,000", percentage: "59.7%" },
    material: { value: "$115,000", percentage: "34.3%" },
    transport: { value: "$20,000", percentage: "6.0%" },
    total: "$335,000",
  },
  {
    project: "Residential Tower",
    labor: { value: "$195,000", percentage: "60.6%" },
    material: { value: "$105,000", percentage: "32.6%" },
    transport: { value: "$22,000", percentage: "6.8%" },
    total: "$322,000",
  },
  {
    project: "Shopping Mall Re",
    labor: { value: "$165,000", percentage: "59.1%" },
    material: { value: "$95,000", percentage: "34.1%" },
    transport: { value: "$19,000", percentage: "6.8%" },
    total: "$279,000",
  },
  {
    project: "Industrial Wareho",
    labor: { value: "$185,000", percentage: "59.7%" },
    material: { value: "$110,000", percentage: "35.5%" },
    transport: { value: "$15,000", percentage: "4.8%" },
    total: "$310,000",
  },
  {
    project: "School Extension",
    labor: { value: "$140,000", percentage: "60.9%" },
    material: { value: "$75,000", percentage: "32.6%" },
    transport: { value: "$15,000", percentage: "6.5%" },
    total: "$230,000",
  },
  {
    project: "Hospital Wing",
    labor: { value: "$125,000", percentage: "61.9%" },
    material: { value: "$65,000", percentage: "32.2%" },
    transport: { value: "$12,000", percentage: "5.9%" },
    total: "$202,000",
  },
];

export default function ProjectCostBreakdown() {
  return (
    <Card className="p-4 md:p-6 bg-white rounded-md border-none outline-none shadow-none">
      <div className="flex items-center gap-3 mb-8">
        <div className="sm:w-10 sm:h-10 w-8 h-8 rounded-md flex items-center justify-center bg-[#EEF2FF]">
          <img src={ProjectCostIcon} alt="" className="h-5 w-5" />
        </div>
        <h3 className="xl:text-lg text-base font-bold text-black">
          Project Cost Breakdown
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-fit">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left pb-4 text-xs font-normal text-[#6B7280] uppercase tracking-wider pl-0 min-w-[120px]">
                Project
              </th>
              <th className="text-right pb-4 text-xs font-normal text-[#6B7280] uppercase tracking-wider min-w-[100px]">
                Labor
              </th>
              <th className="text-right pb-4 text-xs font-normal text-[#6B7280] uppercase tracking-wider min-w-[100px]">
                Material
              </th>
              <th className="text-right pb-4 text-xs font-normal text-[#6B7280] uppercase tracking-wider min-w-[100px]">
                Transport
              </th>
              <th className="text-right pb-4 text-xs font-normal text-[#6B7280] uppercase tracking-wider min-w-[100px] pr-0">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockCostData.map((row, index) => (
              <tr
                key={index}
                className="group hover:bg-gray-50/30 transition-colors border-b border-[#E5E7EB]"
              >
                <td className="py-5 text-sm font-normal text-gray-800 pl-0 ellipsis">
                  {row.project}
                </td>
                <td className="py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-normal text-black">
                      {row.labor.value}
                    </span>
                    <span className="text-xs font-normal text-blue-500">
                      {row.labor.percentage}
                    </span>
                  </div>
                </td>
                <td className="py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-normal text-black">
                      {row.material.value}
                    </span>
                    <span className="text-xs font-normal text-emerald-500">
                      {row.material.percentage}
                    </span>
                  </div>
                </td>
                <td className="py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-normal text-black">
                      {row.transport.value}
                    </span>
                    <span className="text-xs font-normal text-orange-500">
                      {row.transport.percentage}
                    </span>
                  </div>
                </td>
                <td className="py-5 text-right text-sm font-normal text-black pr-0">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
