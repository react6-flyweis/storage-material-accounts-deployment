import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Landmark,
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  CircleDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCustomerDetailQuery } from "@/redux/api/customerApi";

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerId = "", projectId = "", id = "" } = useParams<{
    customerId?: string;
    projectId?: string;
    id?: string;
  }>();

  const actualCustomerId = customerId || "67a1b2c3d4e5f6789012345a";
  const actualProjectId = projectId || id || "2025001";

  const { data: customerDetail } = useGetCustomerDetailQuery(actualCustomerId);

  const passedState = location.state as {
    projectId?: string;
    projectName?: string;
    customerName?: string;
  } | null;

  const matchedProject =
    customerDetail?.projects?.find(
      (p) => p.projectId === actualProjectId || p.leadId === actualProjectId
    ) || {
      leadId: actualProjectId,
      projectId: actualProjectId,
      projectName: passedState?.projectName || "ABC Warehouse",
      amount: 12500,
      status: "Quotation Sent",
      startDate: "2024-10-10",
      buildingType: "Workshop",
      location: "1816 Bayone Ave, Manchester, NNJ, 098765",
    };

  const customerName =
    customerDetail?.profile?.customerName ||
    passedState?.customerName ||
    "John Doe";
  const customerPhone = customerDetail?.profile?.phone || "(163) 2459 315";
  const customerEmail = customerDetail?.profile?.email || "darlee@example.com";
  const customerAddress =
    customerDetail?.profile?.address || "1861 Bayonne Ave,";

  const basePath = customerId
    ? `/customers/${customerId}/projects/${actualProjectId}`
    : `/customers/projects/${actualProjectId}`;

  // State for simple modals if user clicks BOM or Material Delivery
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Quick Action buttons matching Screenshot 1
  const quickActions = [
    {
      label: "View Invoices",
      onClick: () =>
        navigate(`${basePath}/project-invoices`, {
          state: {
            projectName: matchedProject.projectName,
            projectId: actualProjectId,
            customerId: actualCustomerId,
            customerName,
          },
        }),
    },
    {
      label: "View BOM",
      onClick: () =>
        navigate(`${basePath}/bom`, {
          state: {
            projectName: matchedProject.projectName,
            projectId: actualProjectId,
            customerId: actualCustomerId,
            customerName,
          },
        }),
    },
    {
      label: "View Payments",
      onClick: () =>
        navigate(`${basePath}/project-payments`, {
          state: {
            projectName: matchedProject.projectName,
            projectId: actualProjectId,
            customerId: actualCustomerId,
            customerName,
          },
        }),
    },
    {
      label: "Material Delivery",
      onClick: () => setActiveModal("Material Delivery"),
    },
    {
      label: "View Quotation",
      onClick: () =>
        navigate(`${basePath}/project-quotation`, {
          state: {
            projectName: matchedProject.projectName,
            projectId: actualProjectId,
            customerId: actualCustomerId,
            customerName,
          },
        }),
    },
    {
      label: "View Agreement",
      onClick: () =>
        navigate(`${basePath}/contracts`, {
          state: {
            projectName: matchedProject.projectName,
            projectId: actualProjectId,
            customerId: actualCustomerId,
            customerName,
          },
        }),
    },
  ];

  // 8 Financial KPI Cards matching Screenshot 1
  const blueKpiCards = [
    { title: "Project Value", value: "$84L" },
    { title: "Total Invoiced", value: "$84L" },
    { title: "Total Received", value: "$72L" },
    { title: "Outstanding", value: "$12L" },
  ];

  const whiteKpiCards = [
    { title: "Total Project Cost", value: "$58L" },
    { title: "Expected Profit", value: "$39L" },
    { title: "Actual Profit", value: "$26L" },
    { title: "Actual Margin", value: "31.0%" },
  ];

  // Stepper steps matching Screenshot 2
  const steps = [
    { number: 1, title: "Initial Contact", date: "24-10-10", status: "completed" },
    { number: 2, title: "Requirements Gathered", date: "24-10-10", status: "completed" },
    { number: 3, title: "Proposal Sent", date: "24-10-10", status: "completed" },
    { number: 4, title: "Negotiation", date: "24-10-10", status: "completed" },
    { number: 5, title: "Deal Closed", date: "24-10-10", status: "completed" },
    { number: 6, title: "Payment Done", date: "Current Step", status: "current" },
    { number: 7, title: "Converted to PO", date: "-", status: "pending" },
    { number: 8, title: "Sent to Admin", date: "", status: "pending" },
  ];

  // Financial performance table rows matching Screenshot 2
  const financialPerformanceRows = [
    {
      metric: "Revenue",
      expected: "$4.82Cr",
      actual: "$4.68Cr",
      actualColor: "text-[#EF4444]",
      variance: "-$14L",
      varianceBg: "bg-[#FEE2E2] text-[#EF4444]",
      isSummary: false,
    },
    {
      metric: "Material Cost",
      expected: "$2.42Cr",
      actual: "$2.56Cr",
      actualColor: "text-[#10B981]",
      variance: "+$14L",
      varianceBg: "bg-[#DCFCE7] text-[#16A34A]",
      isSummary: false,
    },
    {
      metric: "Freight Cost",
      expected: "$21L",
      actual: "$24.8L",
      actualColor: "text-[#10B981]",
      variance: "+$3.8L",
      varianceBg: "bg-[#DCFCE7] text-[#16A34A]",
      isSummary: false,
    },
    {
      metric: "Logistics Cost",
      expected: "$16L",
      actual: "$18.4L",
      actualColor: "text-[#10B981]",
      variance: "+$2.4L",
      varianceBg: "bg-[#DCFCE7] text-[#16A34A]",
      isSummary: false,
    },
    {
      metric: "Manpower Cost",
      expected: "$18L",
      actual: "$19.2L",
      actualColor: "text-[#10B981]",
      variance: "+$1.2L",
      varianceBg: "bg-[#DCFCE7] text-[#16A34A]",
      isSummary: false,
    },
    {
      metric: "Site Cost",
      expected: "$12L",
      actual: "$14.6L",
      actualColor: "text-[#10B981]",
      variance: "+$2.6L",
      varianceBg: "bg-[#DCFCE7] text-[#16A34A]",
      isSummary: false,
    },
    {
      metric: "Miscellaneous",
      expected: "$8L",
      actual: "$10.2L",
      actualColor: "text-[#10B981]",
      variance: "+$2.2L",
      varianceBg: "bg-[#DCFCE7] text-[#16A34A]",
      isSummary: false,
    },
    {
      metric: "Total Cost",
      expected: "$2.97Cr",
      actual: "$3.43Cr",
      actualColor: "text-[#EF4444]",
      variance: "+$46L",
      varianceBg: "bg-[#DCFCE7] text-[#16A34A]",
      isSummary: true,
      rowBg: "bg-[#F0FDF4]/60",
    },
    {
      metric: "Profit",
      expected: "$1.85Cr",
      actual: "$1.25Cr",
      actualColor: "text-[#EF4444]",
      variance: "-₹60L",
      varianceBg: "bg-[#FEE2E2] text-[#EF4444]",
      isSummary: true,
    },
    {
      metric: "Margin",
      expected: "38.4%",
      actual: "26.7%",
      actualColor: "text-[#EF4444]",
      variance: "-11.7%",
      varianceBg: "bg-[#FEE2E2] text-[#EF4444]",
      isSummary: true,
      rowBg: "bg-[#FEF2F2]/60",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-[#F0F4F8]">
      {/* 1. Header: Back button & Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="default"
          onClick={() => {
            if (customerId) {
              navigate(`/customers/${customerId}/projects`);
            } else {
              navigate(-1);
            }
          }}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Project Details- Project 1 Overivew
        </h1>
      </div>

      {/* 2. 6 Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {quickActions.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.onClick}
            className="w-full bg-[#1D51A4] hover:bg-[#153E7E] text-white rounded-lg shadow-sm font-medium text-sm h-11 flex items-center justify-center transition-all cursor-pointer hover:shadow"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Section Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Project Overview
        </h2>
      </div>

      {/* 3. Project Overview Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Top Header inside card */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
              <Landmark className="w-7 h-7 text-[#1D51A4]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Project 1- ABC Warehouse
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 font-mono">
                Q-2025-1047
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC] w-fit">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            Quotation Sent
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* 4 Details Grid (Building Type, Quote Value, Created On, Location) */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800">Building Type</p>
              <p className="text-xs text-slate-500 mt-0.5">Workshop</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CircleDollarSign className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800">Quote Value</p>
              <p className="text-xs text-slate-500 mt-0.5">$12,500</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800">Created On</p>
              <p className="text-xs text-slate-500 mt-0.5">2024-10-10</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800">Location</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                1816 Bayone Ave, Manchester, NNJ, 098765
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* 3 Sub-Cards: Contact Information, Assignment, Signed Contract */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Contact Information */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Contact Information
            </h4>
            <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2 border border-slate-100 min-h-[110px]">
              <p className="text-xs font-bold text-slate-900">{customerName}</p>
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-14">Phone</span>
                <span className="text-slate-800 font-medium">{customerPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-14">Email</span>
                <a
                  href={`mailto:${customerEmail}`}
                  className="text-[#2563EB] hover:underline font-medium"
                >
                  {customerEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-14">Address</span>
                <span className="text-slate-800 font-medium">{customerAddress}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Assignment */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Assignment
            </h4>
            <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-3.5 border border-slate-100 min-h-[110px]">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-[#16A34A]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Assigned to: Sarah Lee
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Sales Person</p>
              </div>
            </div>
          </div>

          {/* Card 3: Signed Contract/Agreement */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Signed Contract/Agreement
            </h4>
            <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-3.5 border border-slate-100 min-h-[110px]">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-[#16A34A]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Signed contact/Agreement
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Signed on: 12 April 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Financial KPI Cards Grid (4 Dark Blue + 4 White Cards) */}
      <div className="space-y-4">
        {/* Row 1: 4 Dark Blue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {blueKpiCards.map((card) => (
            <div
              key={card.title}
              className="bg-[#184887] rounded-xl p-4 text-white flex items-center gap-3.5 shadow-xs transition-transform hover:-translate-y-0.5 duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <CircleDollarSign className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <p className="text-white/80 text-xs font-normal">{card.title}</p>
                <p className="text-white text-xl font-bold tracking-tight mt-0.5">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: 4 White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {whiteKpiCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <CircleDollarSign className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">{card.title}</p>
                <p className="text-slate-900 text-xl font-bold tracking-tight mt-0.5">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Progress Step Card (Screenshot 2) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-900">Progress Step</h3>

        {/* Horizontal Stepper */}
        <div className="relative pt-4 pb-2 overflow-x-auto">
          <div className="min-w-[760px] relative">
            {/* Connecting progress bar lines */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 z-0">
              {/* Active blue portion connecting up to step 6 */}
              <div className="h-full bg-[#2563EB] w-[71%]" />
            </div>

            {/* Stepper items */}
            <div className="grid grid-cols-8 relative z-10">
              {steps.map((step) => {
                const isCompleted = step.status === "completed";
                const isCurrent = step.status === "current";

                return (
                  <div
                    key={step.number}
                    className="flex flex-col items-center text-center px-1"
                  >
                    {/* Circle badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-colors ${
                        isCompleted
                          ? "bg-[#22C55E] text-white"
                          : isCurrent
                          ? "bg-[#2563EB] text-white ring-4 ring-blue-100"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {step.number}
                    </div>

                    {/* Step Title */}
                    <p
                      className={`text-[11px] font-semibold mt-2 leading-tight ${
                        isCurrent
                          ? "text-[#2563EB] font-bold"
                          : isCompleted
                          ? "text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </p>

                    {/* Step Subtitle / Date */}
                    {step.date && (
                      <p
                        className={`text-[10px] mt-0.5 ${
                          isCurrent
                            ? "text-[#2563EB] font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        {step.date}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Details Box inside Stepper Card */}
        <div className="bg-[#F8FAFC] rounded-xl p-5 border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Col 1: Progress */}
          <div>
            <p className="text-xs font-bold text-slate-900">Progress (4 of 7)</p>
            <p className="text-xs text-slate-500 mt-1">
              Current step: Payment Done
            </p>
          </div>

          {/* Col 2: Dates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div>
                <p className="font-bold text-slate-800 text-[11px]">
                  Lead Generated
                </p>
                <p className="text-slate-500 text-[11px]">2024-10-10</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div>
                <p className="font-bold text-slate-800 text-[11px]">
                  Payemnt Done
                </p>
                <p className="text-slate-500 text-[11px]">2024-10-10</p>
              </div>
            </div>
          </div>

          {/* Col 3: Assigned Sales & Priority */}
          <div className="space-y-2">
            <div>
              <p className="text-xs font-bold text-slate-800">Assigned Sales</p>
              <p className="text-xs text-slate-500 mt-0.5">Sarah Lee</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Priority</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#D97706] mt-0.5">
                Medium
              </span>
            </div>
          </div>

          {/* Col 4: Next Step */}
          <div>
            <p className="text-xs font-bold text-slate-900">Next Step</p>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Convert this lead to PO after this Automatically sent to admin and
              accounts
            </p>
          </div>
        </div>
      </div>

      {/* 6. Project Financial Performance Table Card (Screenshot 2) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4 overflow-hidden">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
          PROJECT FINANCIAL PERFORMANCE
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#ECEEF2] text-xs font-bold text-slate-800">
                <th className="py-3.5 px-6 font-bold text-slate-800">
                  Financial Metric
                </th>
                <th className="py-3.5 px-6 font-bold text-slate-800">
                  Expected
                </th>
                <th className="py-3.5 px-6 font-bold text-slate-800">Actual</th>
                <th className="py-3.5 px-6 font-bold text-slate-800 text-center">
                  Variance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {financialPerformanceRows.map((row) => (
                <tr
                  key={row.metric}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    row.rowBg || ""
                  }`}
                >
                  <td
                    className={`py-3.5 px-6 ${
                      row.isSummary
                        ? "font-bold text-slate-900"
                        : "font-medium text-slate-800"
                    }`}
                  >
                    {row.metric}
                  </td>
                  <td
                    className={`py-3.5 px-6 ${
                      row.isSummary
                        ? "font-bold text-slate-900"
                        : "text-slate-600 font-normal"
                    }`}
                  >
                    {row.expected}
                  </td>
                  <td
                    className={`py-3.5 px-6 ${
                      row.actualColor
                    } ${row.isSummary ? "font-bold" : "font-semibold"}`}
                  >
                    {row.actual}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        row.varianceBg
                      }`}
                    >
                      {row.variance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optional Modal for Quick Action Buttons like BOM / Material Delivery */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {activeModal}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeModal === "BOM"
                ? "Bill of Materials (BOM) for Project 1 - ABC Warehouse includes Pre-Engineered Steel Frames, Purlins, Roofing Sheets, and High-Tensile Anchor Bolts."
                : "Material Delivery for Project 1 - ABC Warehouse is on schedule. Delivery milestone 1 dispatched from central warehouse."}
            </p>
            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                onClick={() => setActiveModal(null)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
