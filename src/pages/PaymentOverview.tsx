import TitleSubtitle from "../components/common_components/TitleSubtitle";
import { PaymentStatCard } from "../components/PaymentStatCard";
import InvoiceManagementTable from "../components/InvoiceManagementTable";
import ClientPaymentBreakdown from "../components/ClientPaymentBreakdown";
import type { TabType } from "./Dashboard";
import { paymentStatsByFilter } from "@/data/mockData";
import { useState } from "react";
import FilterTabs from "@/components/common_components/FilterTabs";

const PaymentOverview = () => {
  const [activeTab, setActiveTab] = useState<TabType>("today");

  const paymentStats = paymentStatsByFilter[activeTab];
  return (
    <div className="xl:px-0 px-2 pb-10 space-y-6">
      <FilterTabs activeTab={activeTab} onChange={setActiveTab} />
      <TitleSubtitle
        title="Payment Overview"
        subtitle="Financial performance tracking and management"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 xl:gap-6 gap-3">
        {paymentStats.map((stat, index) => (
          <PaymentStatCard key={index} {...stat} />
        ))}
      </div>

      <InvoiceManagementTable activeTab={activeTab}/>
      <ClientPaymentBreakdown activeTab={activeTab}/>
    </div>
  );
};

export default PaymentOverview;
