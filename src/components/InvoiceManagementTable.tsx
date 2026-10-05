import { Search, Plus, Eye, Pen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TabType } from "@/pages/Dashboard";
import { invoiceDataByFilter } from "@/data/mockData";
import { useState } from "react";

export type StatusFilter = "all" | "confirmed" | "pending";

export type PaymentStatus = "Confirmed" | "Pending";

export interface InvoiceRow {
  client: string;
  projectId: string;
  projectType: string;
  invoiceNo: string;
  amount: string;
  dueAmount: string;
  paymentDate: string;
  salesPerson: string;
  status: PaymentStatus;
}

export type InvoiceByFilter = Record<TabType, readonly InvoiceRow[]>;


export default function InvoiceManagementTable({activeTab}: {activeTab: TabType}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const rawData = invoiceDataByFilter[activeTab]
  const tableData =rawData.filter((row) => {
  const matchesStatus =
    statusFilter === "all"
      ? true
      : row.status.toLowerCase() === statusFilter;

  const query = searchQuery.toLowerCase();

  const matchesSearch =
    row.client.toLowerCase().includes(query) ||
    row.projectId.toLowerCase().includes(query) ||
    row.projectType.toLowerCase().includes(query) ||
    row.invoiceNo.toLowerCase().includes(query) ||
    row.salesPerson.toLowerCase().includes(query);

  return matchesStatus && matchesSearch;
});
  return (
    <div className="bg-white rounded-md xl:p-6 p-4 shadow-sm border border-gray-100/50">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
        <h2 className="md:text-xl font-normal text-black tracking-tight self-start md:self-center">
          Invoice Managements
        </h2>

        <div className="flex flex-wrap sm:flex-row items-stretch sm:items-center gap-3 w-full justify-end xl:w-auto">
          <Button
            variant={"outline"}
            onClick={() => navigate("/payments/new-invoice")}
            className="bg-[#2563EB] hover:bg-[#2563EB] hover:text-white text-white rounded-lg h-10 px-4 gap-2 font-regular w-fit sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            New Invoice
          </Button>
          <div className="hidden md:flex items-center bg-[#F8F9FA] rounded-md px-4 py-2 flex-1 max-w-xs border border-[#9CA3AF] focus-within:border-[#9CA3AF] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search className="w-5 h-5 text-[#9CA3AF] mr-2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-fit sm:w-[130px] bg-white border-gray-200 rounded-md h-10 text-gray-600">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-100 uppercase">
              <th className="pb-4 font-normal text-gray-400 text-sm tracking-wider">
                CLIENT & PROJECT
              </th>
              <th className="pb-4 font-normal text-gray-400 text-sm tracking-wider">
                INVOICE
              </th>
              <th className="pb-4 font-normal text-gray-400 text-sm tracking-wider">
                AMOUNT
              </th>
              <th className="pb-4 font-normal text-gray-400 text-sm tracking-wider">
                PAYMENT DATE
              </th>
              <th className="pb-4 font-normal text-gray-400 text-sm tracking-wider">
                SALES PERSON
              </th>
              <th className="pb-4 font-normal text-gray-400 text-sm tracking-wider text-center">
                STATUS
              </th>
              <th className="pb-4 font-normal text-gray-400 text-sm tracking-wider text-right">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tableData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                <td className="py-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-gray-900 text-[15px]">
                      {item.client}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {item.projectId}
                    </span>
                    <span className="text-gray-400 text-xs font-normal">
                      {item.projectType}
                    </span>
                  </div>
                </td>
                <td className="py-5">
                  <button className="text-blue-600 font-medium text-sm hover:underline">
                    {item.invoiceNo}
                  </button>
                </td>
                <td className="py-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-gray-900 text-[15px]">
                      {item.amount}
                    </span>
                    <span className="text-red-500 text-xs font-medium">
                      {item.dueAmount}
                    </span>
                  </div>
                </td>
                <td className="py-5 text-sm text-gray-500 font-medium">
                  {item.paymentDate}
                </td>
                <td className="py-5 text-sm text-gray-500 font-medium whitespace-nowrap">
                  {item.salesPerson}
                </td>
                <td className="py-5 text-center">
                  <Badge
                    className={cn(
                      "font-normal text-xs px-4 py-1.5 rounded-full border-none shadow-none",
                      item.status === "Confirmed"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-orange-50 text-orange-600"
                    )}
                  >
                    {item.status}
                  </Badge>
                </td>
                <td className="py-5 text-right">
                  <div className="flex justify-end items-center gap-3 text-blue-800">
                    <button
                      className="p-1.5 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                      onClick={() => navigate("/payments/invoice/preview")}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-1.5 hover:bg-blue-50 rounded-full transition-colors cursor-pointer">
                      <Pen className="w-5 h-5" color="#4AA44A" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
