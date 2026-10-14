import React, { useState } from "react";
import { ArrowLeft, Calendar as CalendarIcon, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CalendarRangePickerModal from "@/components/common_components/CalendarRangePickerModal";
import SuccessModal from "@/components/common_components/SuccessModal";

export const AddRentCostPage: React.FC = () => {
  const navigate = useNavigate();

  // Form Fields
  const [propertyName, setPropertyName] = useState("Surat Storage Warehouse");
  const [landlord, setLandlord] = useState("Rajesh Kapoor");
  const [propertyType, setPropertyType] = useState("Warehouse");
  const [location, setLocation] = useState("Pune");
  const [monthlyRent, setMonthlyRent] = useState("$52,000");
  const [paymentSchedule, setPaymentSchedule] = useState("Monthly");
  const [leaseStartDate, setLeaseStartDate] = useState("12 Aug 2026");
  const [leaseEndDate, setLeaseEndDate] = useState("12 Aug 2026");

  // Dropdown states
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Date picker modal states
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  // Success modal
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const propertyTypeOptions = [
    "Warehouse",
    "Plant",
    "Office",
    "Land",
    "Commercial Space",
  ];

  const scheduleOptions = [
    "Monthly",
    "Quarterly",
    "Half-Yearly",
    "Yearly",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Persist new property in localStorage
    try {
      const stored = localStorage.getItem("custom_rent_properties");
      const currentList = stored ? JSON.parse(stored) : [];
      const newProperty = {
        id: `rent-${Date.now()}`,
        property: propertyName || "Surat Storage Warehouse",
        type: propertyType || "Warehouse",
        location: location || "Pune",
        landlord: landlord || "Rajesh Kapoor",
        monthlyRent: monthlyRent.startsWith("$") ? monthlyRent : `$${monthlyRent}`,
        leaseEnd: leaseEndDate || "31 Dec 2027",
        paymentStatus: "Pending",
      };
      localStorage.setItem("custom_rent_properties", JSON.stringify([newProperty, ...currentList]));
    } catch {
      // ignore
    }

    setIsSuccessOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header / Back Button - matches screenshot: ArrowLeft followed by Add Rent Cost */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate("/cost/rent-cost")}
          className="flex items-center gap-3 text-slate-900 hover:text-slate-950 font-bold text-xl sm:text-2xl transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 group-hover:-translate-x-0.5 transition-transform stroke-[2.2]" />
          <span>Add Rent Cost</span>
        </button>
      </div>

      {/* Main Form Card matching screenshot precisely */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6">
          Basic Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Property Name * & Landlord / Owner * */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Property Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="Surat Storage Warehouse"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Landlord / Owner <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={landlord}
                onChange={(e) => setLandlord(e.target.value)}
                placeholder="Rajesh Kapoor"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Property Type & Location * */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Property Type Dropdown */}
            <div className="relative">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Property Type
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsPropertyTypeOpen(!isPropertyTypeOpen);
                  setIsScheduleOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{propertyType}</span>
                <span className="text-slate-400 text-xs">▼</span>
              </button>

              {isPropertyTypeOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
                  {propertyTypeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setPropertyType(opt);
                        setIsPropertyTypeOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>{opt}</span>
                      {propertyType === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location * */}
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Pune"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Row 3: Monthly Rent * & Payment Schedule * */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Monthly Rent <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="$52,000"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Payment Schedule Dropdown */}
            <div className="relative">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Payment Schedule <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsScheduleOpen(!isScheduleOpen);
                  setIsPropertyTypeOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{paymentSchedule}</span>
                <span className="text-slate-400 text-xs">▼</span>
              </button>

              {isScheduleOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
                  {scheduleOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setPaymentSchedule(opt);
                        setIsScheduleOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>{opt}</span>
                      {paymentSchedule === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Lease Start Date * & Lease End Date * */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Lease Start Date <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsStartDatePickerOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{leaseStartDate}</span>
                <CalendarIcon className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 mb-2">
                Lease End Date <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsEndDatePickerOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <span>{leaseEndDate}</span>
                <CalendarIcon className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Bottom Actions: Cancel (left) & Add (right, purple button) matching screenshot */}
          <div className="pt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/cost/rent-cost")}
              className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Date Pickers */}
      <CalendarRangePickerModal
        isOpen={isStartDatePickerOpen}
        onClose={() => setIsStartDatePickerOpen(false)}
        onApply={(range) => {
          if (range?.startDate) {
            setLeaseStartDate(range.startDate);
          }
          setIsStartDatePickerOpen(false);
        }}
        initialStartDate={leaseStartDate}
        initialEndDate={leaseStartDate}
      />

      <CalendarRangePickerModal
        isOpen={isEndDatePickerOpen}
        onClose={() => setIsEndDatePickerOpen(false)}
        onApply={(range) => {
          if (range?.endDate || range?.startDate) {
            setLeaseEndDate(range.endDate || range.startDate || "");
          }
          setIsEndDatePickerOpen(false);
        }}
        initialStartDate={leaseEndDate}
        initialEndDate={leaseEndDate}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          navigate("/cost/rent-cost");
        }}
        title="Rent Cost Added Successfully!"
        description={`New property ${propertyName} has been registered successfully.`}
      />
    </div>
  );
};

export default AddRentCostPage;
