import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Input from "@/components/common_components/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const expenseData = [
  {
    id: "EXP-001",
    category: "Vendor Payments",
    vendor: "ABC Supplies",
    amount: "$2500.00",
    date: "2024-01-15",
    status: "Paid",
    statusColor: "bg-green-50 text-green-600",
  },
  {
    id: "EXP-002",
    category: "Maintenance",
    vendor: "Tech Solutions",
    amount: "$850.00",
    date: "2024-01-14",
    status: "Pending",
    statusColor: "bg-yellow-50 text-yellow-600",
  },
  {
    id: "EXP-003",
    category: "Logistics",
    vendor: "Fast Delivery",
    amount: "$320.00",
    date: "2024-01-13",
    status: "Paid",
    statusColor: "bg-green-50 text-green-600",
  },
  {
    id: "EXP-004",
    category: "Labour",
    vendor: "Workforce Inc",
    amount: "$4200.00",
    date: "2024-01-12",
    status: "Paid",
    statusColor: "bg-green-50 text-green-600",
  },
  {
    id: "EXP-005",
    category: "Vendor Payments",
    vendor: "Office Depot",
    amount: "$675.00",
    date: "2024-01-11",
    status: "Pending",
    statusColor: "bg-yellow-50 text-yellow-600",
  },
  {
    id: "EXP-006",
    category: "Maintenance",
    vendor: "Clean Pro",
    amount: "$450.00",
    date: "2024-01-10",
    status: "Paid",
    statusColor: "bg-green-50 text-green-600",
  },
];

interface IncomeRecordsCardProps {
  onAddClick?: () => void;
}

export default function IncomeRecordsCard({
  onAddClick,
}: IncomeRecordsCardProps) {
  return (
    <Card className="p-6 bg-white rounded-md border-none shadow-sm h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-normal text-gray-900">Income Records</h3>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 ml-auto"
          onClick={onAddClick}
        >
          <Plus className="w-4 h-4" />
          Add Income
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-500">Category</label>
          <Select defaultValue="all">
            <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="vendor">Vendor Payments</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-500">Vendor</label>
          <Select defaultValue="all">
            <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
              <SelectValue placeholder="Select Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              <SelectItem value="abc">ABC Supplies</SelectItem>
              <SelectItem value="tech">Tech Solutions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 ">
          <label className="text-sm font-medium text-gray-500">
            Date Range
          </label>
          <div className="relative">
            <Input
              type="date"
              className="bg-gray-50/50 text-sm border-gray-200 block w-full pl-3 pr-10 h-9"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/30">
              <th className="text-left py-3 px-4 text-xs font-normal text-gray-400 uppercase tracking-wider">
                Income ID
              </th>
              <th className="text-left py-3 px-4 text-xs font-normal text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left py-3 px-4 text-xs font-normal text-gray-400 uppercase tracking-wider">
                Vendor
              </th>
              <th className="text-left py-3 px-4 text-xs font-normal text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-xs font-normal text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3 px-4 text-xs font-normal text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {expenseData.map((expense) => (
              <tr
                key={expense.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 px-4 text-sm text-gray-600">
                  {expense.id}
                </td>
                <td className="py-4 px-4 text-sm text-gray-900 font-normal">
                  {expense.category}
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {expense.vendor}
                </td>
                <td className="py-4 px-4 text-sm font-normal text-gray-900">
                  {expense.amount}
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {expense.date}
                </td>
                <td className="py-4 px-4 text-sm">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium",
                      expense.statusColor
                    )}
                  >
                    {expense.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
