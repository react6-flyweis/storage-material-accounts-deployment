import {
  FileText,
  FileSpreadsheet,
  Plus,
  DollarSign,
  Check,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const taxData = [
  {
    id: "ORD-2024-001",
    department: "IT Services",
    taxType: "GST",
    taxableAmount: "$45,000",
    taxPercent: "18%",
    totalTax: "$8,100",
    status: "Filed",
    statusColor: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "ORD-2024-002",
    department: "Design",
    taxType: "Service Tax",
    taxableAmount: "$28,000",
    taxPercent: "15%",
    totalTax: "$4,200",
    status: "Pending",
    statusColor: "bg-yellow-50 text-yellow-600",
  },
  {
    id: "ORD-2024-003",
    department: "Marketing",
    taxType: "Sales Tax",
    taxableAmount: "$15,000",
    taxPercent: "12%",
    totalTax: "$1,800",
    status: "Overdue",
    statusColor: "bg-red-50 text-red-600",
    isOverdue: true,
  },
  {
    id: "ORD-2024-004",
    department: "IT Services",
    taxType: "GST",
    taxableAmount: "$65,000",
    taxPercent: "18%",
    totalTax: "$11,700",
    status: "Filed",
    statusColor: "bg-emerald-50 text-emerald-600",
  },
];

export default function TaxCalculationReport() {
  return (
    <Card className="p-6 bg-white rounded-md border-none shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          Tax Calculation Report
        </h3>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex gap-4">
          <div className="space-y-1.5 w-full md:w-64">
            <label className="text-sm font-medium text-gray-500">
              Tax Type
            </label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full bg-white border-gray-200">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tax Types</SelectItem>
                <SelectItem value="gst">GST</SelectItem>
                <SelectItem value="service">Service Tax</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 w-full md:w-64">
            <label className="text-sm font-medium text-gray-500">Period</label>
            <Select defaultValue="this_month">
              <SelectTrigger className="w-full bg-white border-gray-200">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <FileText className="w-4 h-4" />
            Generate Tax Summary (PDF)
          </Button>
          <Button
            variant="outline"
            className="bg-white border-gray-200 text-gray-700 gap-2 hover:bg-gray-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            className="bg-white border-gray-200 text-gray-700 gap-2 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            Add Tax Note
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tax Type
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Taxable Amount
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tax %
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Tax
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {taxData.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                  {item.id}
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {item.department}
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {item.taxType}
                </td>
                <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                  {item.taxableAmount}
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {item.taxPercent}
                </td>
                <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                  {item.totalTax}
                </td>
                <td className="py-4 px-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        item.statusColor
                      )}
                    >
                      {item.status}
                    </span>
                    {item.isOverdue && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Tax Payable */}
        <div className="bg-blue-50/50 rounded-lg p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">
              Total Tax Payable
            </p>
            <p className="text-2xl font-bold text-blue-900">$25,800</p>
          </div>
        </div>

        {/* Tax Collected */}
        <div className="bg-emerald-50/50 rounded-lg p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-600 mb-1">
              Tax Collected
            </p>
            <p className="text-2xl font-bold text-emerald-900">$19,800</p>
          </div>
        </div>

        {/* Pending Filings */}
        <div className="bg-orange-50/50 rounded-lg p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-orange-600 mb-1">
              Pending Filings
            </p>
            <p className="text-2xl font-bold text-orange-900">1</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
