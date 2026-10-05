import { useState } from "react";
import TitleSubtitle from "@/components/common_components/TitleSubtitle";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Input from "@/components/common_components/Input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Check,
  DollarSign,
  Plus,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AddNewTaxModal from "@/components/management/AddNewTaxModal";
import { taxData } from "@/data/mockData";
import Pagination from "@/components/common_components/Pagination";
import SuccessModal from "@/components/common_components/SuccessModal";

const TaxationPage = () => {
  const [isAddNewTaxModalOpen, setIsAddNewTaxModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const handleOpenAddNewTaxModal = () => {
    setIsAddNewTaxModalOpen(true);
  };

  const handleCloseAddNewTaxModal = () => {
    setIsAddNewTaxModalOpen(false);
  };

  return (
       <div className="xl:px-0 px-2 pb-10 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2 pr-0 sm:pr-10 mb-6">
        <TitleSubtitle
          title="Expenses Management"
          subtitle="Track and record company spending including Vendor Payments, Maintenance Costs, Logistics, and Labour."
        />
      </div>
      <div className="bg-white rounded-md md:p-6 p-4">
        <div className="flex justify-between items-center flex-wrap">
          <h2 className="md:text-xl text-lg font-regular">Taxation</h2>
          <div className="flex gap-3">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={() => {
                setModalTitle("PDF Exported Successfully");
                setIsSuccessModalOpen(true);
              }}
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={() => handleOpenAddNewTaxModal()}
            >
              <Plus className="w-4 h-4" />
              Add New Tax
            </Button>
          </div>

        </div>

        <div className="bg-white py-6 border-t border-b my-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-600">
                Date Range
              </label>
              <div className="relative">
                <Input
                  type="date"
                  placeholder="mm/dd/yyyy"
                  className="pl-3 pr-10 border-gray-200 h-9.5"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-600">
                Status
              </label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full bg-white border-gray-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-600">
                Filing Frequency
              </label>
              <Select defaultValue="monthly">
                <SelectTrigger className="w-full bg-white border-gray-200">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-xs font-normal text-[#6B7280] uppercase tracking-wider">
                    STATE
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-normal text-[#6B7280] uppercase tracking-wider">
                    FILING FREQUENCY
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-normal text-[#6B7280] uppercase tracking-wider">
                    DUE DATE
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-normal text-[#6B7280] uppercase tracking-wider">
                    THRESHOLD / PARAMETERS
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-normal text-[#6B7280] uppercase tracking-wider">
                    WEBSITE TO FILE
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-normal text-[#6B7280] uppercase tracking-wider">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {taxData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {row.state}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {row.filingFrequency}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {row.dueDate}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {row.threshold}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 underline cursor-pointer">
                      {row.website}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-normal",
                          row.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-[#FEF9C3] text-[#854D0E]"
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              totalItems={2}
              itemsPerPage={2}
              currentPage={1}
              onPageChange={()=>{}}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-6 gap-3">
          <Card className="bg-blue-50/50 border-none shadow-sm rounded-md">
            <CardContent className="p-2 flex items-center gap-4 w-fit">
              <div className="xl:w-10 xl:h-10 w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center bg-white shrink-0">
                <DollarSign className="xl:w-5 xl:h-5 w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="md:text-sm text-xs font-medium text-blue-600 mb-1">
                  Total Tax Payable
                </p>
                <p className="xl:text-xl md:text-lg text-xs font-bold text-blue-600">
                  $25,800
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50/50 border-none  rounded-md">
            <CardContent className="p-2 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                <Check className="xl:w-6 xl:h-6 w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="md:text-sm text-xs font-medium text-green-600 mb-1">
                  Tax Collected
                </p>
                <p className="xl:text-xl md:text-lg text-xs font-bold text-green-800">
                  $19,800
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50/50 border-none shadow-sm rounded-lg">
            <CardContent className="p-2 flex items-center gap-4">
              <div className="xl:w-10 xl:h-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                <Clock className="xl:w-6 xl:h-6 md:w-6 md:h-6 w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="md:text-sm text-xs font-medium text-orange-500 mb-1">
                  Pending Filings
                </p>
                <p className="xl:text-xl md:text-lg font-bold text-orange-600">
                  1
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddNewTaxModal
        isOpen={isAddNewTaxModalOpen}
        onClose={handleCloseAddNewTaxModal}
        onSubmit={() => {
          handleCloseAddNewTaxModal();
          setModalTitle("Tax Added Successfully");
          setIsSuccessModalOpen(true);
        }}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={modalTitle}
      />
    </div>
  );
};

export default TaxationPage;
