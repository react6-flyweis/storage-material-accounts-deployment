import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Plus, Database } from "lucide-react";
import FinanceStatCard from "../components/FinanceStatCard";
import OrdersPaymentSummaryTable from "../components/OrdersPaymentSummaryTable";
import PaymentTimeline from "../components/PaymentTimeline";
import TitleSubtitle from "@/components/common_components/TitleSubtitle";
import { useState } from "react";
import AddNewEntryModal from "@/components/payments/NewEntryModal";
import FilterTabs from "@/components/common_components/FilterTabs";
import type { TabType } from "./Dashboard";
import SuccessModal from "@/components/common_components/SuccessModal";

export const financeStatsByFilter:any = {
  today: [
    {
      title: "Total Order Value",
      value: "$12,30,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-blue-600" />,
      iconBgColor: "bg-[#EFF6FF]",
      valueColor: "text-black",
    },
    {
      title: "Total Received",
      value: "$8,45,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-emerald-500" />,
      iconBgColor: "bg-[#DCFCE7]",
      valueColor: "text-emerald-500",
    },
    {
      title: "Outstanding",
      value: "$3,85,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-red-500" />,
      iconBgColor: "bg-[#FEE2E2]",
      valueColor: "text-red-500",
    },
    {
      title: "Total WIP Profit",
      value: "$2,33,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-purple-600" />,
      iconBgColor: "bg-[#F3E8FF]",
      valueColor: "text-black",
    },
  ],

  week: [
    {
      title: "Total Order Value",
      value: "$58,90,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-blue-600" />,
      iconBgColor: "bg-[#EFF6FF]",
      valueColor: "text-black",
    },
    {
      title: "Total Received",
      value: "$42,10,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-emerald-500" />,
      iconBgColor: "bg-[#DCFCE7]",
      valueColor: "text-emerald-500",
    },
    {
      title: "Outstanding",
      value: "$16,80,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-red-500" />,
      iconBgColor: "bg-[#FEE2E2]",
      valueColor: "text-red-500",
    },
    {
      title: "Total WIP Profit",
      value: "$12,65,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-purple-600" />,
      iconBgColor: "bg-[#F3E8FF]",
      valueColor: "text-black",
    },
  ],

  month: [
    {
      title: "Total Order Value",
      value: "$2,42,80,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-blue-600" />,
      iconBgColor: "bg-[#EFF6FF]",
      valueColor: "text-black",
    },
    {
      title: "Total Received",
      value: "$1,98,40,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-emerald-500" />,
      iconBgColor: "bg-[#DCFCE7]",
      valueColor: "text-emerald-500",
    },
    {
      title: "Outstanding",
      value: "$44,40,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-red-500" />,
      iconBgColor: "bg-[#FEE2E2]",
      valueColor: "text-red-500",
    },
    {
      title: "Total WIP Profit",
      value: "$47,40,000",
      icon: <Database className="md:w-4 md:h-4 w-3.5 h-3.5 text-purple-600" />,
      iconBgColor: "bg-[#F3E8FF]",
      valueColor: "text-black",
    },
  ],
} as const;


const OrdersAndPaymentsPage = () => {
  const [isAddNewEntryModalOpen, setIsAddNewEntryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [modalTitle, setModalTitle] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);


  const handleAddNewEntryModalOpen = () => {
    setIsAddNewEntryModalOpen(true);
  };

  const handleAddNewEntryModalClose = () => {
    setIsAddNewEntryModalOpen(false);
  };

  const financeStats = financeStatsByFilter[activeTab];

  return (
    <div className="xl:px-0 px-2 pb-10 space-y-6">
      <FilterTabs activeTab={activeTab} onChange={setActiveTab} />
      <div className="flex justify-between items-center flex-wrap gap-2 pr-0 sm:pr-10">
        <TitleSubtitle
          title="Orders & Payments"
          subtitle="Financial performance tracking and management"
        />
        <div className="flex flex-wrap items-stretch sm:items-center gap-3 w-fit xl:w-auto ml-auto">
          <Button
          onClick={()=>{
            setModalTitle("Report Exported Successfully");
            setIsSuccessModalOpen(true);
          }}
            variant={"outline"}
            className="bg-[#FFFFFF] hover:bg-[#FFFFFF] text-[#434C5B] rounded-lg h-10 px-4 gap-2 md:text-sm text-xs font-regular w-fit sm:w-auto border border-[#D5D8DE]"
          >
            <ArrowDownToLine className="w-5 h-5" />
            Export Reports
          </Button>
          <Button
            className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg h-10 px-4 gap-2 md:text-sm text-xs font-regular w-fit sm:w-auto"
            onClick={handleAddNewEntryModalOpen}
          >
            <Plus className="w-5 h-5" />
            New Entry
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-5">
        {financeStats.map((stat:any, index:number) => (
          <FinanceStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconBgColor={stat.iconBgColor}
            valueColor={stat.valueColor}
          />
        ))}
      </div>

      <OrdersPaymentSummaryTable activeTab={activeTab} />
      <PaymentTimeline activeTab={activeTab}/>
      <AddNewEntryModal
        isOpen={isAddNewEntryModalOpen}
        onClose={handleAddNewEntryModalClose}
        onSave={()=>{
          handleAddNewEntryModalClose();
          setModalTitle("Entry Added Successfully");
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

export default OrdersAndPaymentsPage;
