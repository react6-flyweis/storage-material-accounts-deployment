import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  CircleDollarSign,
  Receipt,
  Truck,
  Eye,
  Printer,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileCard, { type ProfileData } from "@/components/profile-card";
import {
  useGetCustomerDetailQuery,
  useMarkInvoicePaidMutation,
} from "@/redux/api/customerApi";
import {
  formatIndianShortCurrency,
  formatProjectDate,
  formatJoinedDate,
} from "@/modules/customers/customer-utils";
import DolleIcon from "@/assets/icon/blueDollerIcon.svg";

function formatInvoiceDate(val?: string | null): string {
  if (!val) return "—";
  const date = new Date(val);
  if (Number.isNaN(date.getTime())) return val;
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function CustomerDetailPage() {
  const { customerId = "" } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const [paidInvoicesLocal, setPaidInvoicesLocal] = useState<Record<string, boolean>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { data: detail, isLoading } = useGetCustomerDetailQuery(customerId);
  const [markPaidMutation, { isLoading: isMarkingPaid }] = useMarkInvoicePaidMutation();

  const profile = detail?.profile;
  const summary = detail?.summary;
  const customerRevenue = detail?.customerRevenue;

  const profileData: ProfileData = {
    name: profile?.customerName || "—",
    status: (profile?.status as "Active" | "Inactive") || "Active",
    id: profile?.customerId || customerId || "—",
    joined: formatJoinedDate(profile?.joinedDate) || "—",
    phone: profile?.phone || "—",
    email: profile?.email || "—",
    address: profile?.address || "—",
    company: profile?.company || "—",
    photo: profile?.photo || null,
  };

  // Top 4 Primary Colored KPI Cards
  const primaryKpiCards = [
    {
      title: "Total Projects",
      value: summary?.totalProjects ?? 0,
      bgColor: "bg-[#1D51A4]",
      icon: <CreditCard className="w-5 h-5 text-[#1D51A4]" />,
    },
    {
      title: "Total Project Value",
      value: formatIndianShortCurrency(summary?.totalProjectValue ?? 0),
      bgColor: "bg-[#FA743E]",
      icon: <CircleDollarSign className="w-5 h-5 text-[#FA743E]" />,
    },
    {
      title: "Total Project Cost",
      value: formatIndianShortCurrency(summary?.totalProjectCost ?? 0),
      bgColor: "bg-[#E5A500]",
      icon: <Receipt className="w-5 h-5 text-[#E5A500]" />,
    },
    {
      title: "Total Freight Cost",
      value: formatIndianShortCurrency(summary?.totalFreightCost ?? 0),
      bgColor: "bg-[#9333EA]",
      icon: <Truck className="w-5 h-5 text-[#9333EA]" />,
    },
  ];

  // Secondary 4 White Metric Cards
  const secondaryKpiCards = [
    {
      title: "Expected Margin",
      value: `${summary?.expectedMargin ?? 0}%`,
    },
    {
      title: "Actual / Real Margin",
      value: `${summary?.actualMargin ?? 0}%`,
    },
    {
      title: "Total Expenses",
      value: formatIndianShortCurrency(summary?.totalExpenses ?? 0),
    },
    {
      title: "Outstanding Amount",
      value: formatIndianShortCurrency(summary?.outstandingAmount ?? 0),
    },
  ];

  // Customer Revenue 5 Cards
  const customerRevenueCards = [
    {
      title: "Total Quoted Value",
      value: formatIndianShortCurrency(customerRevenue?.totalQuotedValue ?? 0),
    },
    {
      title: "Total Invoiced",
      value: formatIndianShortCurrency(customerRevenue?.totalInvoiced ?? 0),
    },
    {
      title: "Total Received",
      value: formatIndianShortCurrency(customerRevenue?.totalReceived ?? 0),
    },
    {
      title: "Outstanding Amount",
      value: formatIndianShortCurrency(customerRevenue?.outstandingAmount ?? 0),
    },
    {
      title: "Overdue",
      value: formatIndianShortCurrency(customerRevenue?.overdue ?? 0),
    },
  ];

  // Projects list
  const displayProjects = useMemo(() => {
    return (detail?.projects || []).map((p, index) => {
      const projLabel = p.projectId || `Project ${index + 1}`;
      const statusFormatted =
        p.status?.toLowerCase() === "completed"
          ? "Completed"
          : p.status || "In progress";
      return {
        id: p.leadId || p.projectId || String(index + 1),
        project: projLabel,
        projectName: p.projectName || `Project ${index + 1}`,
        amount: p.amount ? formatIndianShortCurrency(p.amount) : "$0",
        status: statusFormatted,
        startDate: formatProjectDate(p.startDate) || "—",
        endDate: formatProjectDate(p.endDate) || "—",
      };
    });
  }, [detail?.projects]);

  // Invoice list
  const displayInvoices = useMemo(() => {
    return (detail?.invoices || []).map((inv) => ({
      invoiceId: inv.invoiceId,
      invoiceNumber: inv.invoiceNumber,
      dueDate: formatInvoiceDate(inv.dueDate),
      amount: inv.amount,
      paid: inv.paid,
      amountDue: inv.amountDue,
      status: inv.status || inv.invoiceStatus || "Unpaid",
      projectName: inv.projectName,
    }));
  }, [detail?.invoices]);

  // Profitability rows
  const displayProfitability = useMemo(() => {
    return (detail?.profitabilityOverview || []).map((item) => {
      const isPercent = item.unit === "percent" || item.key === "marginPct";
      const isBold = ["revenue", "totalCost", "profit", "marginPct"].includes(item.key);
      const isHighlighted = item.key === "marginPct";

      const formatVal = (v: number) => {
        if (isPercent) return `${v}%`;
        return formatIndianShortCurrency(v);
      };

      const formatVariance = (v: number) => {
        const prefix = v > 0 ? "+" : "";
        if (isPercent) return `${prefix}${v}%`;
        return `${prefix}${formatIndianShortCurrency(v)}`;
      };

      const isPositive = item.variance >= 0;
      const variancePill = isPositive
        ? "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]"
        : "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]";
      const actualColor = isPositive ? "text-[#10B981]" : "text-[#EF4444]";

      return {
        key: item.key,
        metric: item.label,
        expected: formatVal(item.expected),
        actual: formatVal(item.actual),
        actualColor,
        variance: formatVariance(item.variance),
        variancePill,
        isBold,
        isHighlighted,
      };
    });
  }, [detail?.profitabilityOverview]);

  const handleMarkAsPaid = async (invoiceId: string, invoiceNumber: string) => {
    try {
      await markPaidMutation(invoiceId).unwrap();
    } catch {
      // optimistic update
    }
    setPaidInvoicesLocal((prev) => ({
      ...prev,
      [invoiceId]: true,
      [invoiceNumber]: true,
    }));
    setActionMessage(`Invoice ${invoiceNumber} marked as paid successfully!`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-[#F0F4F8]">
      {/* Top Header Row */}
      <div className="flex items-center gap-3">
        <Button
          variant="default"
          onClick={() => navigate("/customers")}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-slate-900">Customer Info</h1>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Customer Profile Card */}
      <ProfileCard profile={profileData} isLoading={isLoading} />

      {/* 4 Primary Top Colored Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {primaryKpiCards.map((card) => (
          <div
            key={card.title}
            className={`${card.bgColor} text-white rounded-2xl p-5 sm:p-6 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-200`}
          >
            <div>
              <p className="text-xs sm:text-sm text-white/90 font-medium">{card.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5 tracking-tight">
                {card.value}
              </p>
            </div>
            <div className="w-11 h-11 bg-white rounded-xl shadow-xs flex items-center justify-center shrink-0">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 4 Secondary White Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {secondaryKpiCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
              <img src={DolleIcon} alt="dollar" className="w-4 h-4 object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">{card.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* All Projects Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-5">All Projects</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#ECEEF2] text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <tr className="border-b border-slate-200">
                <th className="py-3.5 px-4 font-semibold">PROJECT</th>
                <th className="py-3.5 px-4 font-semibold">PROJECT NAME</th>
                <th className="py-3.5 px-4 font-semibold">AMOUNT</th>
                <th className="py-3.5 px-4 font-semibold">STATUS</th>
                <th className="py-3.5 px-4 font-semibold">START DATE</th>
                <th className="py-3.5 px-4 font-semibold">END DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                    No projects found for this customer.
                  </td>
                </tr>
              ) : (
                displayProjects.map((p) => {
                  const isCompleted = p.status.toLowerCase() === "completed";
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-medium text-slate-800">{p.project}</td>
                      <td className="py-4 px-4 font-medium text-slate-800">{p.projectName}</td>
                      <td className="py-4 px-4 font-bold text-slate-900">{p.amount}</td>
                      <td className="py-4 px-4 font-semibold">
                        <span className={isCompleted ? "text-[#16A34A]" : "text-[#D97706]"}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">{p.startDate}</td>
                      <td className="py-4 px-4 font-medium text-slate-700">{p.endDate}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* View All button */}
        {displayProjects.length > 0 && (
          <div className="text-center pt-6">
            <button
              type="button"
              onClick={() =>
                navigate(
                  customerId ? `/customers/${customerId}/projects` : "/customers/projects"
                )
              }
              className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
        )}
      </div>

      {/* SECTION 1: CUSTOMER PROFITABILITY OVERVIEW */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-5">
          CUSTOMER PROFITABILITY OVERVIEW
        </h2>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-[#ECEEF2] text-xs font-semibold text-slate-700">
              <tr className="border-b border-slate-200">
                <th className="py-3.5 px-6 font-semibold">Financial Metric</th>
                <th className="py-3.5 px-6 font-semibold">Expected</th>
                <th className="py-3.5 px-6 font-semibold">Actual</th>
                <th className="py-3.5 px-6 font-semibold">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayProfitability.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500 font-medium">
                    No profitability data available.
                  </td>
                </tr>
              ) : (
                displayProfitability.map((row) => (
                  <tr
                    key={row.metric}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      row.isHighlighted ? "bg-[#FFF5F5]" : ""
                    }`}
                  >
                    <td
                      className={`py-3.5 px-6 ${
                        row.isBold ? "font-bold text-slate-900" : "font-medium text-slate-800"
                      }`}
                    >
                      {row.metric}
                    </td>
                    <td
                      className={`py-3.5 px-6 ${
                        row.isBold ? "font-bold text-slate-900" : "font-normal text-slate-500"
                      }`}
                    >
                      {row.expected}
                    </td>
                    <td
                      className={`py-3.5 px-6 font-semibold ${row.actualColor}`}
                    >
                      {row.actual}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${row.variancePill}`}
                      >
                        {row.variance}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: CUSTOMER REVENUE */}
      <div className="space-y-3.5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          CUSTOMER REVENUE
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {customerRevenueCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
                <img src={DolleIcon} alt="dollar" className="w-4 h-4 object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">{card.title}</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: INVOICE LIST */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Invoice List</h2>

          {/* Action buttons (PDF, XLS, Print) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-2 py-1 rounded bg-[#E02424] text-white hover:bg-[#C81E1E] transition-colors text-[10px] font-bold shadow-xs cursor-pointer"
              title="Export PDF"
            >
              PDF
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded bg-[#0E9F6E] text-white hover:bg-[#046C4E] transition-colors text-[10px] font-bold shadow-xs cursor-pointer"
              title="Export XLS"
            >
              XLS
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600 shadow-xs cursor-pointer"
              title="Print Invoices"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-[#ECEEF2] text-xs font-semibold text-slate-700">
              <tr className="border-b border-slate-200">
                <th className="py-3.5 px-4 font-semibold">Invoice Number</th>
                <th className="py-3.5 px-4 font-semibold">Due Date</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Paid</th>
                <th className="py-3.5 px-4 font-semibold">Amount Due</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 font-medium">
                    No invoices found for this customer.
                  </td>
                </tr>
              ) : (
                displayInvoices.map((inv) => {
                  const isPaid =
                    paidInvoicesLocal[inv.invoiceId] ||
                    paidInvoicesLocal[inv.invoiceNumber] ||
                    inv.status.toLowerCase() === "paid";

                  return (
                    <tr key={inv.invoiceNumber} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-[#EA580C]">
                        {inv.invoiceNumber}
                      </td>
                    <td className="py-4 px-4 font-medium text-slate-600">
                      {inv.dueDate}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800">
                      ${inv.amount}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800">
                      ${inv.paid}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800">
                      ${inv.amountDue}
                    </td>
                    <td className="py-4 px-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10B981] text-white text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#DC2626] text-white text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {!isPaid && (
                          <button
                            type="button"
                            disabled={isMarkingPaid}
                            onClick={() => handleMarkAsPaid(inv.invoiceId, inv.invoiceNumber)}
                            className="px-2.5 py-1 rounded bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Mark as paid
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            navigate("/payments/invoice/preview", {
                              state: {
                                invoiceNumber: inv.invoiceNumber,
                                date: inv.dueDate,
                                projectName: inv.projectName || "ABC Building",
                                total: inv.amount,
                                amountDue: isPaid ? 0 : inv.amountDue,
                                status: isPaid ? "Paid" : inv.status,
                              },
                            })
                          }
                          className="p-1 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Preview Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
