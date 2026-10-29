import { useState, useMemo } from "react";
import {
  Clock,
  AlertCircle,
  Check,
  X,
  Search,
  Eye,
  Truck,
  Package,
  Store,
  Wrench,
  Receipt,
  Building2,
  Calendar,
  ArrowRight,
  ArrowDownRight,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectSelectorDropdownModal from "@/components/common_components/ProjectSelectorDropdownModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import { getProjectDisplayName } from "@/lib/projectUtils";
import { useGetBudgetVsActualProjectsQuery } from "@/redux/api/financialApi";
import PaymentApprovalDetailsModal, {
  type PaymentApprovalItem,
  type ApprovalStatus,
  type InvoiceType,
} from "@/components/modals/PaymentApprovalDetailsModal";
import {
  useGetPaymentApprovalsQuery,
  useGetPaymentApprovalFiltersQuery,
  useExportPaymentApprovalsMutation,
  type PaymentApprovalApiItem,
} from "@/redux/api/paymentApprovalsApi";

// ─── Field mappers ────────────────────────────────────────────────────────────

// API status codes → UI label
const STATUS_LABEL_MAP: Record<string, ApprovalStatus> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  disputed: "Disputed",
  paid: "Paid",
};

// API invoiceTypeCode → UI label
const TYPE_LABEL_MAP: Record<string, string> = {
  carrier: "Carrier",
  delivery_company: "Delivery Company",
  vendor: "Vendor",
  vendor_payment: "Vendor Payment",
  shipper_payment: "Shipper Payment",
  equipment: "Equipment",
  other_expenses: "Other Expenses",
};

// UI filter value → API status param
const UI_TO_API_STATUS: Record<string, string> = {
  Pending: "pending",
  "Under Review": "under_review",
  Approved: "approved",
  Disputed: "disputed",
  Paid: "paid",
};

// UI filter value → API payeeType param
const UI_TO_API_TYPE: Record<string, string> = {
  Carrier: "carrier",
  "Delivery Company": "delivery_company",
  Vendor: "vendor",
  "Vendor Payment": "vendor_payment",
  "Shipper Payment": "shipper_payment",
  Equipment: "equipment",
  "Other Expenses": "other_expenses",
  vendor_payment: "vendor_payment",
  shipper_payment: "shipper_payment",
  equipment: "equipment",
  other_expenses: "other_expenses",
};

function mapApiItemToUi(item: PaymentApprovalApiItem): PaymentApprovalItem {
  let status: ApprovalStatus =
    STATUS_LABEL_MAP[item.status?.toLowerCase()] ??
    (item.statusLabel as ApprovalStatus) ??
    "Pending";

  // 3.3 Requirement: When status === "approved" and paidAt is set: statusLabel = Paid, workflowStage = paid
  if (item.status?.toLowerCase() === "approved" && item.paidAt) {
    status = "Paid";
  }

  const invoiceType: InvoiceType =
    TYPE_LABEL_MAP[item.invoiceTypeCode?.toLowerCase()] ??
    (item.invoiceType as InvoiceType) ??
    "Vendor";

  const formatted = item.dueDate
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(item.dueDate))
    : "";

  return {
    id: item.approvalId,
    invoiceType,
    companyName: item.companyName,
    invoiceNumber: item.invoiceNumber,
    project: item.project ? getProjectDisplayName(item.project) : "",
    amount: `$${item.amount?.toLocaleString()}`,
    rawAmount: item.amount,
    dueDate: formatted,
    linkedTo: item.linkedTo,
    status,
    priority: "Medium",
    deliveryDate: "",
    deliveryId: "",
    baseFreight: "",
    fuelSurcharge: "",
    handlingFee: "",
    freightRequestId: "",
    loadId: "",
    linkedDeliveryId: item.linkedId ?? "",
    route: "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const PaymentApprovalsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);

  const [selectedItem, setSelectedItem] = useState<PaymentApprovalItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState("");

  // 3.1 Filters (projects, payeeTypes, statuses, workflowStages)
  const { data: filtersData } = useGetPaymentApprovalFiltersQuery();
  const { data: budgetProjects = [] } = useGetBudgetVsActualProjectsQuery();

  const selectedProjectLabel = useMemo(() => {
    if (!projectFilter || projectFilter === "All") return "All Projects";
    const matched =
      budgetProjects.find((p) => p._id === projectFilter) ||
      filtersData?.projects?.find((p) => p.leadId === projectFilter);
    if (matched) {
      const pName = getProjectDisplayName(matched);
      const pJob = "jobId" in matched ? matched.jobId : "";
      return pJob ? `${pName} (${pJob})` : pName;
    }
    return projectFilter;
  }, [projectFilter, budgetProjects, filtersData?.projects]);

  // 3.6 Export
  const [exportPaymentApprovals, { isLoading: isExporting }] =
    useExportPaymentApprovalsMutation();

  // Filter change handlers that reset page to 1
  const handlePaymentStatusChange = (val: string) => {
    setPaymentStatusFilter(val);
    setPage(1);
  };

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    setPage(1);
  };

  const handleProjectChange = (val: string) => {
    setProjectFilter(val);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  // B2 – Approval queue (also embeds stats)
  const { data: listData, isLoading, isError } = useGetPaymentApprovalsQuery({
    search: searchQuery.trim() || undefined,
    status:
      paymentStatusFilter !== "All"
        ? UI_TO_API_STATUS[paymentStatusFilter] || paymentStatusFilter
        : undefined,
    payeeType:
      typeFilter !== "All"
        ? UI_TO_API_TYPE[typeFilter] || typeFilter
        : undefined,
    project: projectFilter !== "All" ? projectFilter : undefined,
    page,
    limit,
  });

  // Stats from B2 response (falls back to zeros while loading)
  const stats = listData?.stats ?? {
    pendingApproval: 0,
    underReview: 0,
    approved: 0,
    disputed: 0,
  };

  const uiItems: PaymentApprovalItem[] = useMemo(
    () => (listData?.approvals ?? []).map(mapApiItemToUi),
    [listData]
  );

  const totalItems = listData?.total ?? uiItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  // 3.6 Export handler
  const handleExport = async () => {
    try {
      const blob = await exportPaymentApprovals({
        status:
          paymentStatusFilter !== "All"
            ? UI_TO_API_STATUS[paymentStatusFilter] || paymentStatusFilter
            : undefined,
      }).unwrap();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `payment-approvals.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setSuccessModalTitle("Payment Approvals Exported Successfully");
      setIsSuccessModalOpen(true);
    } catch (err: unknown) {
      console.error("Failed to export payment approvals:", err);
    }
  };

  const handleOpenDetail = (item: PaymentApprovalItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = (_id: string, newStatus: ApprovalStatus) => {
    setIsDetailModalOpen(false);
    setSuccessModalTitle(`Status Updated to ${newStatus}`);
    setIsSuccessModalOpen(true);
  };

  const renderTypeBadge = (type: string) => {
    const normalizedType = type?.toLowerCase().replace(/[\s-]+/g, "_");

    switch (normalizedType) {
      case "carrier":
        return (
          <span className="border border-blue-400 text-blue-600 bg-white rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs">
            <Truck className="w-3.5 h-3.5" />
            <span>Carrier</span>
          </span>
        );
      case "delivery_company":
        return (
          <span className="border border-emerald-400 text-emerald-600 bg-white rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs">
            <Package className="w-3.5 h-3.5" />
            <span>Delivery Company</span>
          </span>
        );
      case "vendor":
      case "vendor_payment":
        return (
          <span className="border border-purple-400 text-purple-600 bg-white rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs">
            <Store className="w-3.5 h-3.5" />
            <span>{type === "vendor_payment" ? "Vendor Payment" : type}</span>
          </span>
        );
      case "shipper_payment":
        return (
          <span className="border border-sky-400 text-sky-600 bg-white rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs">
            <Truck className="w-3.5 h-3.5" />
            <span>Shipper Payment</span>
          </span>
        );
      case "equipment":
        return (
          <span className="border border-amber-400 text-amber-600 bg-white rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs">
            <Wrench className="w-3.5 h-3.5" />
            <span>Equipment</span>
          </span>
        );
      case "other_expenses":
        return (
          <span className="border border-rose-400 text-rose-600 bg-white rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs">
            <Receipt className="w-3.5 h-3.5" />
            <span>Other Expenses</span>
          </span>
        );
      default:
        return (
          <span className="border border-gray-300 text-gray-700 bg-white rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs">
            <Building2 className="w-3.5 h-3.5" />
            <span>{type || "Unknown"}</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="border border-orange-400 text-orange-600 bg-white rounded-full px-3.5 py-0.5 text-xs font-semibold inline-block">
            Pending
          </span>
        );
      case "Under Review":
        return (
          <span className="border border-blue-400 text-blue-600 bg-white rounded-full px-3.5 py-0.5 text-xs font-semibold inline-block">
            Under Review
          </span>
        );
      case "Approved":
        return (
          <span className="border border-green-500 text-green-600 bg-white rounded-full px-3.5 py-0.5 text-xs font-semibold inline-block">
            Approved
          </span>
        );
      case "Disputed":
        return (
          <span className="border border-red-500 text-red-600 bg-white rounded-full px-3.5 py-0.5 text-xs font-semibold inline-block">
            Disputed
          </span>
        );
      case "Paid":
        return (
          <span className="border border-emerald-500 text-emerald-600 bg-white rounded-full px-3.5 py-0.5 text-xs font-semibold inline-block">
            Paid
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 xl:px-0 pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Payment Approvals
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve payment requests across all invoice types
          </p>
        </div>
        <Button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium text-sm shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          ) : (
            <Download className="w-4 h-4 text-gray-500" />
          )}
          <span>Export</span>
        </Button>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval}
          icon={<Clock className="md:size-5 size-4 text-[#FF5700]" />}
          color="bg-[#FF5700]"
          onClick={() =>
            handlePaymentStatusChange(
              paymentStatusFilter === "Pending" ? "All" : "Pending"
            )
          }
          className={cn(
            "transition-all hover:opacity-95 hover:shadow-md",
            paymentStatusFilter === "Pending" && "ring-3 ring-orange-300 ring-offset-2"
          )}
        />

        <StatCard
          title="Under Review"
          value={stats.underReview}
          icon={<AlertCircle className="md:size-5 size-4 text-[#2563EB]" />}
          color="bg-[#2563EB]"
          onClick={() =>
            handlePaymentStatusChange(
              paymentStatusFilter === "Under Review" ? "All" : "Under Review"
            )
          }
          className={cn(
            "transition-all hover:opacity-95 hover:shadow-md",
            paymentStatusFilter === "Under Review" && "ring-3 ring-blue-300 ring-offset-2"
          )}
        />

        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<Check className="md:size-5 size-4 text-[#00B948] stroke-3" />}
          color="bg-[#00B948]"
          onClick={() =>
            handlePaymentStatusChange(
              paymentStatusFilter === "Approved" ? "All" : "Approved"
            )
          }
          className={cn(
            "transition-all hover:opacity-95 hover:shadow-md",
            paymentStatusFilter === "Approved" && "ring-3 ring-emerald-300 ring-offset-2"
          )}
        />

        <StatCard
          title="Disputed"
          value={stats.disputed}
          icon={<X className="md:size-5 size-4 text-[#EF1428] stroke-3" />}
          color="bg-[#EF1428]"
          onClick={() =>
            handlePaymentStatusChange(
              paymentStatusFilter === "Disputed" ? "All" : "Disputed"
            )
          }
          className={cn(
            "transition-all hover:opacity-95 hover:shadow-md",
            paymentStatusFilter === "Disputed" && "ring-3 ring-red-300 ring-offset-2"
          )}
        />
      </div>

      {/* Filter Bar */}
      <Card className="rounded-2xl border border-gray-100/80 shadow-xs bg-white p-3 sm:p-3.5 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by company, invoice, or project..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-[#F3F4F6] text-sm text-gray-800 placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 border-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Payment Status Dropdown */}
          <Select value={paymentStatusFilter} onValueChange={handlePaymentStatusChange}>
            <SelectTrigger className="w-full sm:w-40 h-10 text-sm text-gray-700 bg-[#F3F4F6] border-none rounded-xl px-3.5 focus:ring-1 focus:ring-blue-500 shadow-none cursor-pointer">
              <SelectValue placeholder="Payment Status">
                {paymentStatusFilter === "All" ? "Payment Status" : paymentStatusFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Payment Status</SelectItem>
              {filtersData?.statuses && filtersData.statuses.length > 0 ? (
                filtersData.statuses.map((st) => (
                  <SelectItem key={st} value={STATUS_LABEL_MAP[st] || st}>
                    {STATUS_LABEL_MAP[st] || st}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Disputed">Disputed</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {/* Payee Type Dropdown */}
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-40 h-10 text-sm text-gray-700 bg-[#F3F4F6] border-none rounded-xl px-3.5 focus:ring-1 focus:ring-blue-500 shadow-none cursor-pointer">
              <SelectValue placeholder="Invoice Type">
                {typeFilter === "All" ? "Invoice Type" : typeFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Invoice Types</SelectItem>
              {filtersData?.payeeTypes && filtersData.payeeTypes.length > 0 ? (
                filtersData.payeeTypes.map((pt) => (
                  <SelectItem key={pt.code} value={pt.label || pt.code}>
                    {pt.label || pt.code}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="Vendor Payment">Vendor Payment</SelectItem>
                  <SelectItem value="Shipper Payment">Shipper Payment</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Other Expenses">Other Expenses</SelectItem>
                  <SelectItem value="Carrier">Carrier</SelectItem>
                  <SelectItem value="Delivery Company">Delivery Company</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {/* Project Filter Trigger & Dropdown Modal */}
          <ProjectSelectorDropdownModal
            trigger={
              <button
                type="button"
                className="w-full sm:w-48 h-10 text-sm text-gray-700 bg-[#F3F4F6] border-none rounded-xl px-3.5 focus:ring-1 focus:ring-blue-500 shadow-none cursor-pointer flex items-center justify-between gap-2 transition-colors hover:bg-gray-200/60"
              >
                <span className="truncate">{selectedProjectLabel}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
              </button>
            }
            selectedProjectId={projectFilter}
            selectedProject={selectedProjectLabel}
            onSelectProject={(label, leadId) => {
              if (!leadId || label === "All Projects") {
                handleProjectChange("All");
              } else {
                handleProjectChange(leadId);
              }
            }}
            align="right"
          />
        </div>
      </Card>

      {/* Workflow Process Banner */}
      <div className="bg-white/80 border border-blue-100/70 rounded-2xl px-5 sm:px-6 py-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-gray-700">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FA541C] shrink-0" />
            <span>Pending</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
            <span>Under Review</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00B948] shrink-0" />
            <span>Approved</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
            <span>Paid</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowDownRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF1428] shrink-0" />
            <span>Disputed</span>
          </div>
        </div>
      </div>

      {/* Payment Approval Queue Card */}
      <Card className="rounded-2xl border border-gray-100 shadow-xs bg-white overflow-hidden py-0 gap-0">
        {/* Table header bar */}
        <div className="p-5 sm:px-6 flex items-center justify-between border-b border-gray-100/70">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Payment Approval Queue
          </h2>
          <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium border border-gray-200">
            {listData?.total ?? uiItems.length} items
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-245">
            <thead className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-800">
              <tr>
                <th className="py-4 px-6">Invoice Type</th>
                <th className="py-4 px-6">Company Name</th>
                <th className="py-4 px-6">Invoice Number</th>
                <th className="py-4 px-6">Project</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Linked To</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-red-400 text-sm">
                    Failed to load payment approvals. Please try again.
                  </td>
                </tr>
              ) : uiItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400 text-sm">
                    No payment requests match the current filters.
                  </td>
                </tr>
              ) : (
                uiItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Invoice Type */}
                    <td className="py-4 px-6 align-middle">
                      {renderTypeBadge(item.invoiceType)}
                    </td>

                    {/* Company Name */}
                    <td className="py-4 px-6 align-middle">
                      <div className="font-semibold text-gray-900 text-sm">
                        {item.companyName}
                      </div>
                    </td>

                    {/* Invoice Number */}
                    <td className="py-4 px-6 align-middle">
                      <div className="text-xs text-gray-500 font-medium">
                        {item.invoiceNumber}
                      </div>
                    </td>

                    {/* Project */}
                    <td className="py-4 px-6 align-middle">
                      <div className="text-xs text-gray-700 font-medium max-w-32.5 leading-tight">
                        {item.project}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 align-middle">
                      <div className="font-bold text-gray-900 text-sm">
                        {item.amount}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-4 px-6 align-middle">
                      <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.dueDate}</span>
                      </div>
                    </td>

                    {/* Linked To */}
                    <td className="py-4 px-6 align-middle">
                      <div className="text-xs text-gray-500">
                        {item.linkedTo}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 align-middle text-center">
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(item)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 stroke-[1.8]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-gray-100 bg-white text-xs text-gray-500">
            <span>
              Showing {Math.min((page - 1) * limit + 1, totalItems)} to{" "}
              {Math.min(page * limit, totalItems)} of {totalItems} entries
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-2.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </Button>
              <span className="px-2 py-1 font-medium text-gray-700">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-2.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details & Approval Action Modal */}
      <PaymentApprovalDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onStatusChange={handleStatusChange}
        onDownloadInvoice={(item) => {
          setSuccessModalTitle(`Invoice ${item.invoiceNumber} Downloaded Successfully`);
          setIsSuccessModalOpen(true);
        }}
      />

      {/* Success Notification Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successModalTitle}
      />
    </div>
  );
};

export default PaymentApprovalsPage;
