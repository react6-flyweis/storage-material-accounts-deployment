import { Download, FileText, Mail, Landmark, ChartLine } from "lucide-react";
import TitleSubtitle from "@/components/common_components/TitleSubtitle";
import { Button } from "@/components/ui/button";
import ProfitAndLossOverview from "@/components/management/ProfitAndLossOverview";
import CashFlowAnalysis from "@/components/management/CashFlowAnalysis";
import { cn } from "@/lib/utils";
import { useState } from "react";
import SuccessModal from "@/components/common_components/SuccessModal";

const FinancialReportPage = () => {
  const [activeTab, setActiveTab] = useState("profit_loss");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  return (
    <div className="xl:px-0 px-2 pb-10 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2 pr-0 sm:pr-10 mb-6">
        <TitleSubtitle
          title="Financial Reports"
          subtitle="Analyze company performance and export key accounting data."
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-md inline-flex border border-gray-100 mb-6 w-full flex-wrap">
        <button
          onClick={() => setActiveTab("profit_loss")}
          className={cn(
            "flex items-center gap-2 md:px-6 px-4 py-2.5 rounded-none md:text-sm text-xs font-normal transition-colors flex-1 sm:flex-none justify-center",
            activeTab === "profit_loss"
              ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          )}
        >
          <ChartLine className="w-4 h-4" />
          Profit & Loss
        </button>
        <button
          onClick={() => setActiveTab("cash_flow")}
          className={cn(
            "flex items-center gap-2 md:px-6 px-4 py-2.5 rounded-none md:text-sm text-xs font-normal transition-colors flex-1 sm:flex-none justify-center",
            activeTab === "cash_flow"
              ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b"
          )}
        >
          <Landmark className="w-3 h-3" />
          Cash Flow
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6 md:mb-0 md:justify-start justify-end">
        <Button onClick={() => {
          setModalTitle("All Reports Exported Successfully");
          setIsSuccessModalOpen(true);
        }}  
         className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 md:px-5 px-4 md:text-sm text-xs">
          <Download className="w-4 h-4" />
          Export All Reports
        </Button>
        <Button
        onClick={() => {
          setModalTitle("Combined Report Generated Successfully");
          setIsSuccessModalOpen(true);
        }}
          variant="outline"
          className="bg-white border-gray-200 text-gray-700 gap-2 h-10 md:px-5 px-4 hover:bg-gray-50 md:text-sm text-xs"
        >
          <FileText className="w-4 h-4" />
          Generate Combined Report
        </Button>
        <Button
        onClick={() => {
          setModalTitle("Report Sent Successfully");
          setIsSuccessModalOpen(true);
        }}
          variant="outline"
          className="bg-white border-gray-200 text-gray-700 gap-2 h-10 md:px-5 px-4 hover:bg-gray-50 md:text-sm text-xs"
        >
          <Mail className="w-4 h-4" />
          Send to Email
        </Button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "profit_loss" ? (
          <ProfitAndLossOverview />
        ) : (
          <CashFlowAnalysis />
        )}
      </div>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={modalTitle}
      />
    </div>
  );
};
export default FinancialReportPage;
