import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Input from "@/components/common_components/Input";
import { cn } from "@/lib/utils";
import SearchableSelect from "../common_components/SearchableSelect";
import { vendors } from "@/data/mockData";
import { useMemo, useState } from "react";
import type { TabType } from "@/pages/Dashboard";

/* -------------------- MOCK DATA BY TAB -------------------- */

type ExpenseItem = {
  id: string;
  category: string;
  vendor: string;
  amount: string;
  date: string;
  status: string;
  statusColor: string;
};

const expenseDataByTab: Record<TabType, ExpenseItem[]> = {
  today: [
    {
      id: "EXP-001",
      category: "Vendor Payments",
      vendor: "ABC Supplies",
      amount: "$2,500.00",
      date: "2026-01-13",
      status: "Paid",
      statusColor: "bg-green-50 text-green-600",
    },
    {
      id: "EXP-002",
      category: "Maintenance",
      vendor: "Tech Solutions",
      amount: "$850.00",
      date: "2026-01-13",
      status: "Pending",
      statusColor: "bg-yellow-50 text-yellow-600",
    },
  ],

  week: [
    {
      id: "EXP-003",
      category: "Logistics",
      vendor: "Fast Delivery",
      amount: "$3,200.00",
      date: "2026-01-10",
      status: "Paid",
      statusColor: "bg-green-50 text-green-600",
    },
    {
      id: "EXP-004",
      category: "Labour",
      vendor: "Workforce Inc",
      amount: "$4,200.00",
      date: "2026-01-09",
      status: "Paid",
      statusColor: "bg-green-50 text-green-600",
    },
    {
      id: "EXP-005",
      category: "Vendor Payments",
      vendor: "Office Depot",
      amount: "$675.00",
      date: "2026-01-08",
      status: "Pending",
      statusColor: "bg-yellow-50 text-yellow-600",
    },
  ],

  month: [
    {
      id: "EXP-006",
      category: "Maintenance",
      vendor: "Clean Pro",
      amount: "$1,450.00",
      date: "2026-01-05",
      status: "Paid",
      statusColor: "bg-green-50 text-green-600",
    },
    {
      id: "EXP-007",
      category: "Labour",
      vendor: "Build Corp",
      amount: "$6,800.00",
      date: "2026-01-03",
      status: "Paid",
      statusColor: "bg-green-50 text-green-600",
    },
    {
      id: "EXP-008",
      category: "Logistics",
      vendor: "Swift Movers",
      amount: "$2,950.00",
      date: "2026-01-01",
      status: "Pending",
      statusColor: "bg-yellow-50 text-yellow-600",
    },
  ],
};

/* -------------------- PROPS -------------------- */

interface ExpenseRecordsCardProps {
  activeTab: TabType;
  onAddClick?: () => void;
}

/* -------------------- COMPONENT -------------------- */

export default function ExpenseRecordsCard({
  activeTab,
  onAddClick,
}: ExpenseRecordsCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<any>(
    null
  );
  const [selectedVendor, setSelectedVendor] = useState<any>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>("");

  const expenseData = expenseDataByTab[activeTab];


const filteredExpenses = useMemo(() => {
  return expenseData.filter((expense) => {
    const matchCategory = selectedCategory
      ? expense.category === selectedCategory.value
      : true;

    const matchVendor = selectedVendor
      ? expense.vendor === selectedVendor.value
      : true;

    const matchDate = selectedDate
      ? expense.date === selectedDate
      : true;

    return matchCategory && matchVendor && matchDate;
  });
}, [expenseData, selectedCategory, selectedVendor, selectedDate]);

  return (
    <Card className="p-6 bg-white rounded-md border-none shadow-sm h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-normal text-gray-900">
          Expense Records
        </h3>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          onClick={onAddClick}
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
        <div className="relative">
          <SearchableSelect
            label="Category"
            options={[
              { value: "Vendor Payments", label: "Vendor Payments" },
              { value: "Maintenance", label: "Maintenance" },
              { value: "Logistics", label: "Logistics" },
              { value: "Labour", label: "Labour" },
            ]}
            value={selectedCategory}
            onChange={setSelectedCategory}
            inputClassName="py-2"
          />
        </div>

        <div className="relative">
          <SearchableSelect
            label="Vendor"
            options={vendors}
            value={selectedVendor}
            onChange={setSelectedVendor}
            inputClassName="py-2"
          />
        </div>

        <div className="space-y-1.5 ">
          <label className="text-sm font-medium text-gray-700">
            Date Range
          </label>
          <div className="relative">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-50/50 border-gray-200 block w-full pl-3 pr-10 h-9"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/30">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Expense ID
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filteredExpenses.map((expense) => (
              <tr
                key={expense.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 px-4 text-sm text-gray-600">
                  {expense.id}
                </td>

                <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                  {expense.category}
                </td>

                <td className="py-4 px-4 text-sm text-gray-600">
                  {expense.vendor}
                </td>

                <td className="py-4 px-4 text-sm font-bold text-gray-900">
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

            {filteredExpenses.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-sm text-gray-400"
                >
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
