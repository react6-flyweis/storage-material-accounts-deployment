import { Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { orderSummaryByFilter } from "@/data/mockData";
import type { TabType } from "@/pages/Dashboard";
import { useState } from "react";

export interface OrderSummaryRecord {
  client: string;
  projectId: string;
  location: string;
  orderValue: string;
  currentCost: string;
  deposit: string;
  progress: string;
  final: string;
  outstanding: string;
  wipProfit: string;
  margin: string;
  status: "In progress" | "Completed" | "Started";
}

export default function OrdersPaymentSummaryTable({
  activeTab,
}: {
  activeTab: TabType;
}) {
  const [statusFilter, setStatusFilter] =
  useState("all-clients");

const [dateFilter, setDateFilter] =
  useState("all-dates");
  const rows = orderSummaryByFilter[activeTab];

  const filteredData = rows.filter((row) => {
    const matchesStatus =
      statusFilter === "all-clients"
        ? true
        : row.status.toLowerCase().replace(" ", "-") === statusFilter;

    const matchesDate =
      dateFilter === "all-dates"
        ? true
        : dateFilter === "settled"
        ? row.final === "$0"
        : true;

    return matchesStatus && matchesDate;
  });
  return (
    <div className="bg-white rounded-md">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-1 xl:p-6 p-4 ">
        <h2 className="md:text-xl font-normal text-black tracking-tight self-start md:self-center">
          Orders & Payment Summary
        </h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-full md:w-[160px] bg-white border-gray-200 rounded-lg h-10 text-gray-600">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all-clients">All Clients</SelectItem>
              <SelectItem value="in-progress">In progress</SelectItem>
              <SelectItem value="started">Started</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={dateFilter}
            onValueChange={(value) => setDateFilter(value)}
          >
            <SelectTrigger className="w-full md:w-[160px] bg-white border-gray-200 rounded-lg h-10 text-gray-600">
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all-dates">All Dates</SelectItem>
              <SelectItem value="settled">Settled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto ">
        <table className="w-full text-left border-collapse min-w-[1200px] overflow-x-auto">
          <thead className="bg-[#F9FAFB] align-middle h-16">
            <tr className="border-b border-gray-100 uppercase">
              <th className="pl-4 font-normal text-[#6B7280] text-xs tracking-wider">
                ORDER DETAILS
              </th>
              <th className="px-2 font-normal text-[#6B7280] text-xs tracking-wider">
                ORDER VALUE
              </th>
              <th className=" px-2 font-normal text-[#6B7280] text-xs tracking-wider text-center">
                PAYMENT BREAKDOWN
              </th>
              <th className="px-2  font-normal text-[#6B7280] text-xs tracking-wider text-center">
                OUTSTANDING
              </th>
              <th className=" px-2 font-normal text-[#6B7280] text-xs tracking-wider text-center">
                WIP PROFIT
              </th>
              <th className="px-2 font-normal text-[#6B7280] text-xs tracking-wider text-center">
                STATUS
              </th>
              <th className="px-2 font-normal text-[#6B7280] text-xs tracking-wider text-center">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 p-6">
            {filteredData.map((item: OrderSummaryRecord, index: number) => (
              <tr
                key={index}
                className="hover:bg-gray-50/30 transition-colors p-6 "
              >
                {/* ORDER DETAILS */}
                <td className="p-6 min-w-[180px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-normal text-gray-900 text-[15px]">
                      {item.client}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {item.projectId}
                    </span>
                    <span className="text-gray-400 text-xs font-normal">
                      {item.location}
                    </span>
                  </div>
                </td>

                {/* ORDER VALUE */}
                <td className="py-6 min-w-[150px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-gray-900 text-[15px]">
                      {item.orderValue}
                    </span>
                    <span className="text-gray-400 text-xs font-normal">
                      Current Cost {item.currentCost}
                    </span>
                  </div>
                </td>

                {/* PAYMENT BREAKDOWN */}
                <td className="py-6 min-w-[100px]">
                  <div className="flex flex-col gap-1.5 pr-8">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#6B7280]">Deposit:</span>
                      <span className="font-normal text-black">
                        {item.deposit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#6B7280]">Progress:</span>
                      <span className="font-normal text-black">
                        {item.progress}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#6B7280]">Final:</span>
                      <span className="font-normal text-black">
                        {item.final}
                      </span>
                    </div>
                  </div>
                </td>

                {/* OUTSTANDING */}
                <td className="py-6 text-center">
                  <span className="font-normal text-red-500 text-[15px]">
                    {item.outstanding}
                  </span>
                </td>

                {/* WIP PROFIT */}
                <td className="py-6 text-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-normal text-emerald-500 text-[15px]">
                      {item.wipProfit}
                    </span>
                    <span className="text-gray-400 text-xs font-normal">
                      {item.margin} margin
                    </span>
                  </div>
                </td>

                {/* STATUS */}
                <td className="py-6 text-center">
                  <Badge
                    className={cn(
                      "font-normal text-xs px-4 h-6 w-[100px] rounded-full border-none shadow-none",
                      item.status === "In progress"
                        ? "bg-[#DBEAFE] text-[#1D51A4]"
                        : item.status === "Completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-orange-50 text-orange-600"
                    )}
                  >
                    {item.status}
                  </Badge>
                </td>

                {/* ACTIONS */}
                <td className="p-6 text-right space-x-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-blue-800">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-[#4AA44A]">
                    <Pencil className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
