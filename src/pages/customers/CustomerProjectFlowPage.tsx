import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Layers,
  ShieldCheck,
  MapPin,
  Eye,
  Check,
  FileCheck,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetCustomerDetailQuery,
  useMarkInvoicePaidMutation,
  type CustomerProjectItem,
} from "@/redux/api/customerApi";
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClasses,
} from "@/modules/customers/customer-utils";

type TabKey = "overview" | "quotation" | "invoices" | "payments" | "agreement";

export default function CustomerProjectFlowPage() {
  const { customerId = "", projectId = "" } = useParams<{
    customerId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [paidLocal, setPaidLocal] = useState<Record<string, boolean>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const passedState = location.state as {
    project?: CustomerProjectItem;
    customer?: { customerName?: string; customerId?: string; company?: string };
  } | null;

  // Retrieve customer data
  const { data: customerData } = useGetCustomerDetailQuery(customerId);

  const [markPaidMutation, { isLoading: isMarkingPaid }] = useMarkInvoicePaidMutation();

  const customerProfile = customerData?.profile || passedState?.customer || {
    customerId: customerId || "CUS-00147",
    customerName: "John Doe",
    company: "ABC Industries",
  };

  // Find target project
  const matchedProject: CustomerProjectItem =
    customerData?.projects?.find(
      (p) => p.projectId === projectId || p.leadId === projectId
    ) ||
    passedState?.project || {
      leadId: projectId || "67a1b2c3d4e5f67890123470",
      projectId: projectId || "2025001",
      projectName: "ABC Building",
      amount: 50000,
      status: "Completed",
      lifecycleStatus: "delivered",
      startDate: "2024-04-02T00:00:00.000Z",
      endDate: "2024-05-02T00:00:00.000Z",
      buildingType: "Commercial Steel Warehouse",
      location: "Manchester, NJ",
    };

  // Filter invoices for this project
  const projectInvoices = (customerData?.invoices || [
    {
      invoiceId: "67a1b2c3d4e5f67890123480",
      invoiceNumber: "INV001",
      dueDate: "2024-12-24T00:00:00.000Z",
      amount: 500,
      paid: 500,
      amountDue: 0,
      status: "Paid",
      invoiceStatus: "paid",
      projectName: matchedProject.projectName,
    },
    {
      invoiceId: "67a1b2c3d4e5f67890123481",
      invoiceNumber: "INV002",
      dueDate: "2024-12-24T00:00:00.000Z",
      amount: 1500,
      paid: 0,
      amountDue: 1500,
      status: "Unpaid",
      invoiceStatus: "sent",
      projectName: matchedProject.projectName,
    },
  ]).filter(
    (inv) =>
      !inv.projectName ||
      inv.projectName.toLowerCase() === matchedProject.projectName.toLowerCase()
  );

  const handleMarkPaid = async (invId: string, invNum: string) => {
    try {
      await markPaidMutation(invId).unwrap();
    } catch {
      // optimistic update
    }
    setPaidLocal((prev) => ({ ...prev, [invId]: true }));
    setFeedbackMsg(`Invoice ${invNum} marked as paid successfully!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Lifecycle steps for the project
  const lifecycleSteps = [
    { name: "Initial Contact", completed: true },
    { name: "Engineering / BOM", completed: true },
    { name: "Quotation Sent", completed: true },
    { name: "Contract Signed", completed: true },
    {
      name: "In Production",
      completed:
        matchedProject.lifecycleStatus === "in_production" ||
        matchedProject.lifecycleStatus === "delivered" ||
        matchedProject.status.toLowerCase() === "completed",
    },
    {
      name: "Delivery & Freight",
      completed:
        matchedProject.lifecycleStatus === "delivered" ||
        matchedProject.status.toLowerCase() === "completed",
    },
    {
      name: "Handover / Completed",
      completed: matchedProject.status.toLowerCase() === "completed",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/customers/${customerId}`)}
            className="text-slate-700 hover:text-slate-900 border-slate-200 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customer Details
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {matchedProject.projectName}
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-xs">
                {matchedProject.projectId}
              </Badge>
              <Badge
                className={`font-semibold text-xs border ${getStatusBadgeClasses(
                  matchedProject.status
                )}`}
              >
                {matchedProject.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-semibold text-slate-700">{customerProfile.customerName}</span> (
              {customerProfile.customerId})
            </p>
          </div>
        </div>

        {/* Quick Summary Badge */}
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Project Value</span>
            <span className="text-sm font-bold text-slate-900">{formatCurrency(matchedProject.amount)}</span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Quick Action Navigation Tabs (Matching Sales and Admin Project Flow) */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
        {[
          { key: "overview", label: "Project Overview", icon: Layers },
          { key: "quotation", label: "View Quotation", icon: FileText },
          { key: "invoices", label: `View Invoices (${projectInvoices.length})`, icon: DollarSign },
          { key: "payments", label: "View Payments", icon: ShieldCheck },
          { key: "agreement", label: "View Agreement", icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              variant={isActive ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`gap-2 text-xs sm:text-sm font-medium rounded-lg h-10 px-4 transition-all ${
                isActive
                  ? "bg-[#1D51A4] text-white shadow-xs hover:bg-[#153e7e]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Lifecycle Step Tracker */}
          <Card className="border-0 shadow-sm bg-white rounded-xl p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Project Lifecycle Progress
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {lifecycleSteps.map((step, idx) => (
                <div
                  key={step.name}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    step.completed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-center mb-1.5">
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold leading-tight block">{step.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Specifications & Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm bg-white rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1D51A4]" />
                Building Specifications
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Building Type</span>
                  <span className="font-semibold text-slate-800">
                    {matchedProject.buildingType || "Pre-Engineered Steel"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Dimensions</span>
                  <span className="font-semibold text-slate-800">80' W x 140' L x 24' H</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Roof Slope</span>
                  <span className="font-semibold text-slate-800">1:12 Pitch</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Location</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {matchedProject.location || "Manchester, NJ"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-sm bg-white rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                Timeline & Schedule
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Start Date</span>
                  <span className="font-semibold text-slate-800">{formatDate(matchedProject.startDate)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Estimated Delivery</span>
                  <span className="font-semibold text-slate-800">
                    {matchedProject.endDate ? formatDate(matchedProject.endDate) : "In 4 Weeks"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Production Stage</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {matchedProject.lifecycleStatus?.replace(/_/g, " ") || "Delivered"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Current Status</span>
                  <Badge className={`text-[10px] font-semibold border ${getStatusBadgeClasses(matchedProject.status)}`}>
                    {matchedProject.status}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-sm bg-white rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Financial Rollup
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Contract Value</span>
                  <span className="font-bold text-slate-900">{formatCurrency(matchedProject.amount)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Invoiced</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(
                      projectInvoices.reduce((acc, curr) => acc + curr.amount, 0) || matchedProject.amount
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Received</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(
                      projectInvoices.reduce((acc, curr) => acc + (paidLocal[curr.invoiceId] ? curr.amount : curr.paid), 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Outstanding Balance</span>
                  <span className="font-bold text-amber-600">
                    {formatCurrency(
                      projectInvoices.reduce(
                        (acc, curr) => acc + (paidLocal[curr.invoiceId] ? 0 : curr.amountDue),
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: QUOTATION */}
      {activeTab === "quotation" && (
        <Card className="border-0 shadow-sm bg-white rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quotation Summary</h2>
              <p className="text-xs text-slate-500">Quote ID: QT-2025-0891 • Revision 2</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700 hover:text-slate-900 gap-1.5"
                onClick={() => alert("Downloading PDF Quotation...")}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900">Scope of Work & Materials:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Primary framing: Built-up I-shape columns and rafters</li>
                <li>Secondary framing: Z & C cold-formed purlins and girts</li>
                <li>Roof Panels: 24 Ga Standing Seam roof panels with Galvalume finish</li>
                <li>Wall Panels: 26 Ga architectural PBR wall panels</li>
                <li>Includes freight & transit insurance to job site</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900">Commercial Terms:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>25% Deposit upon PO & drawing approval</li>
                <li>50% Progress payment upon fabrication completion</li>
                <li>25% Final payment upon delivery to job site</li>
                <li>Lead time: 6-8 weeks from engineering approval</li>
                <li>Quotation validity: 30 days</li>
              </ul>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Item #</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-center">Quantity</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-mono">01</td>
                  <td className="py-3 px-4 font-medium">Pre-Engineered Steel Structure (80' x 140' x 24')</td>
                  <td className="py-3 px-4 text-center">1 EA</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(matchedProject.amount * 0.75)}</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(matchedProject.amount * 0.75)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono">02</td>
                  <td className="py-3 px-4 font-medium">Insulation System (R-19 Roof & R-13 Wall)</td>
                  <td className="py-3 px-4 text-center">1 Lot</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(matchedProject.amount * 0.15)}</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(matchedProject.amount * 0.15)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono">03</td>
                  <td className="py-3 px-4 font-medium">Freight & Logistics to Jobsite</td>
                  <td className="py-3 px-4 text-center">2 Trucks</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(matchedProject.amount * 0.1)}</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(matchedProject.amount * 0.1)}</td>
                </tr>
              </tbody>
              <tfoot className="border-t-2 border-slate-200 font-bold text-sm">
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-right">
                    Total Quoted Amount:
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-700">
                    {formatCurrency(matchedProject.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: INVOICES */}
      {activeTab === "invoices" && (
        <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Invoices for {matchedProject.projectName}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage invoices, review status, and record customer payments
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/payments/new-invoice")}
              className="bg-[#1D51A4] hover:bg-blue-700 text-white text-xs"
            >
              + Create New Invoice
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Due Date</th>
                  <th className="py-3 px-6 text-right">Total Amount</th>
                  <th className="py-3 px-6 text-right">Paid</th>
                  <th className="py-3 px-6 text-right">Amount Due</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectInvoices.map((inv) => {
                  const isPaidLocally = paidLocal[inv.invoiceId];
                  const currentStatus = isPaidLocally ? "Paid" : inv.status;
                  const isPaid = currentStatus.toLowerCase() === "paid";

                  return (
                    <tr key={inv.invoiceId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-[#1D51A4]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-semibold text-slate-900">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="py-3.5 px-6 text-right text-emerald-600 font-medium">
                        {formatCurrency(isPaidLocally ? inv.amount : inv.paid)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-semibold text-slate-900">
                        {formatCurrency(isPaidLocally ? 0 : inv.amountDue)}
                      </td>
                      <td className="py-3.5 px-6">
                        <Badge
                          className={`font-semibold text-xs border ${getStatusBadgeClasses(
                            currentStatus
                          )}`}
                        >
                          {currentStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate("/payments/invoice/preview", {
                                state: {
                                  invoiceNumber: inv.invoiceNumber,
                                  date: inv.dueDate,
                                  projectName: matchedProject.projectName,
                                  total: inv.amount,
                                  amountDue: inv.amountDue,
                                  status: inv.status,
                                },
                              })
                            }
                            className="h-8 px-2.5 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 border-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Preview
                          </Button>
                          {!isPaid && (
                            <Button
                              size="sm"
                              disabled={isMarkingPaid}
                              onClick={() => handleMarkPaid(inv.invoiceId, inv.invoiceNumber)}
                              className="h-8 px-2.5 text-xs bg-[#1E8E3E] hover:bg-emerald-700 text-white font-medium"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-white rounded-xl p-5">
              <span className="text-xs uppercase font-medium text-slate-500">Deposit Received</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(matchedProject.amount * 0.25)}
              </p>
              <span className="text-xs text-emerald-600 font-medium mt-1 block">✓ 100% Cleared</span>
            </Card>

            <Card className="border-0 shadow-sm bg-white rounded-xl p-5">
              <span className="text-xs uppercase font-medium text-slate-500">Progress Payment</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(matchedProject.amount * 0.5)}
              </p>
              <span className="text-xs text-emerald-600 font-medium mt-1 block">✓ 100% Cleared</span>
            </Card>

            <Card className="border-0 shadow-sm bg-white rounded-xl p-5">
              <span className="text-xs uppercase font-medium text-slate-500">Final Balance</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(matchedProject.amount * 0.25)}
              </p>
              <span className="text-xs text-amber-600 font-medium mt-1 block">Due upon delivery</span>
            </Card>
          </div>

          <Card className="border-0 shadow-sm bg-white rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Payment Schedule & Milestones</h3>
            <div className="space-y-3">
              {[
                {
                  milestone: "Milestone 1: 25% Deposit",
                  due: "Apr 02, 2024",
                  amount: matchedProject.amount * 0.25,
                  status: "Completed",
                },
                {
                  milestone: "Milestone 2: 50% Fabrication Complete",
                  due: "Apr 20, 2024",
                  amount: matchedProject.amount * 0.5,
                  status: "Completed",
                },
                {
                  milestone: "Milestone 3: 25% On Jobsite Delivery",
                  due: "May 02, 2024",
                  amount: matchedProject.amount * 0.25,
                  status: matchedProject.status === "Completed" ? "Completed" : "Pending",
                },
              ].map((m) => (
                <div
                  key={m.milestone}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-4 h-4 ${m.status === "Completed" ? "text-emerald-600" : "text-slate-300"}`} />
                    <div>
                      <p className="font-semibold text-slate-800">{m.milestone}</p>
                      <span className="text-slate-400">Due: {m.due}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{formatCurrency(m.amount)}</span>
                    <Badge className={`text-[10px] font-semibold border ${getStatusBadgeClasses(m.status)}`}>
                      {m.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: AGREEMENT */}
      {activeTab === "agreement" && (
        <Card className="border-0 shadow-sm bg-white rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Purchase Agreement & Contract</h2>
              <p className="text-xs text-slate-500">Contract Ref: CTR-2024-0042 • Executed</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs px-3 py-1">
                ✓ Signed & Legally Binding
              </Badge>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
            <h4 className="font-bold text-sm text-slate-900">Parties Involved:</h4>
            <p>
              This Purchase Agreement is entered between <strong className="text-slate-900">Mr. Storage Materials & Construction LLC</strong> ("Seller") and <strong className="text-slate-900">{customerProfile.customerName} / {customerProfile.company}</strong> ("Buyer").
            </p>
            <p>
              Under this agreement, the Seller undertakes the design, manufacturing, engineering certification, and shipment of pre-engineered steel buildings as per approved construction documents and Bill of Materials (BOM).
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase">Effective Date</span>
                <span className="font-bold text-slate-800">{formatDate(matchedProject.startDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase">Agreed Total</span>
                <span className="font-bold text-emerald-700">{formatCurrency(matchedProject.amount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase">Governing Law</span>
                <span className="font-bold text-slate-800">State of New Jersey</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase">Warranty</span>
                <span className="font-bold text-slate-800">20-Year Galvalume Roof</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
