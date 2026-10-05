import { DollarSign, Info } from "lucide-react";
import TitleSubtitle from "@/components/common_components/TitleSubtitle";
import BudgetVsActualCard from "@/components/management/BudgetVsActualCard";
import BudgetAlertCard from "@/components/management/BudgetAlertCard";
import AddExpenseModal from "@/components/management/AddExpenseModal";
import { useState } from "react";
import SummaryCard from "@/components/management/SummaryCard";
import LaborExpenseRecordsCard from "@/components/management/LaborExpenseRecordsCard";
import SuccessModal from "@/components/common_components/SuccessModal";

const LaborExpensesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const closeModal = () => setIsModalOpen(false);
  const openModal = () => setIsModalOpen(true);

  return (
   <div className="xl:px-0 px-2 pb-10 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2 pr-0 sm:pr-10 mb-6">
        <TitleSubtitle
          title="Expenses Management"
          subtitle="Track and record company spending including Vendor Payments, Maintenance Costs, Logistics, and Labour."
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main Content - Expense Records */}
        <div className="xl:col-span-2 space-y-6">
          <LaborExpenseRecordsCard onAddClick={openModal} />
        </div>

        {/* Sidebar - Summary & Alerts */}
        <div className="space-y-6">
          <SummaryCard
            title="Monthly Summary"
            totalLabel="Total Expenses"
            totalValue="$8,995.00"
            icon={DollarSign}
            items={[
              { label: "Vendor Payments", value: "$3,175.00" },
              { label: "Maintenance", value: "$1,300.00" },
              { label: "Logistics", value: "$320.00" },
            ]}
          />
          <BudgetVsActualCard />
          <BudgetAlertCard />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex gap-3 items-start xl:w-2/3 w-full">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-900">Important Note</h4>
          <p className="text-sm text-blue-700">
            Attach receipts or invoices for expense proof.
          </p>
        </div>
      </div>
      <AddExpenseModal isOpen={isModalOpen} onClose={closeModal} onSubmit={() => {
        closeModal();
        setModalTitle("Labor Expense Added Successfully");
        setIsSuccessModalOpen(true);
      }} />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={modalTitle}
      />
    </div>
  );
};

export default LaborExpensesPage;
