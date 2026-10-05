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
  Calendar,
  ArrowRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SuccessModal from "@/components/common_components/SuccessModal";
import PaymentApprovalDetailsModal, {
  type PaymentApprovalItem,
  type ApprovalStatus,
  type InvoiceType,
} from "@/components/modals/PaymentApprovalDetailsModal";

const initialApprovalItems: PaymentApprovalItem[] = [
  {
    id: "1",
    invoiceType: "Carrier",
    companyName: "FastTruck Logistics",
    invoiceNumber: "INV-2024-0345",
    project: "Downtown Plaza",
    amount: "$4500",
    rawAmount: 4500,
    dueDate: "April 1, 2026",
    linkedTo: "Load: LD-0789",
    status: "Pending",
    priority: "Medium",
    deliveryDate: "Wednesday, March 25, 2026",
    deliveryId: "DEL-1001",
    baseFreight: "$4000",
    fuelSurcharge: "$300",
    handlingFee: "$200",
    freightRequestId: "Freight Request ID",
    loadId: "LD-09876",
    linkedDeliveryId: "DEL-9876",
    route: "Austin → Houston",
  },
  {
    id: "2",
    invoiceType: "Delivery Company",
    companyName: "Swift Delivery Solutions",
    invoiceNumber: "INV-2024-0346",
    project: "Riverside Complex",
    amount: "$2800",
    rawAmount: 2800,
    dueDate: "April 18, 2026",
    linkedTo: "Delivery: DEL-1235",
    status: "Under Review",
    priority: "High",
    deliveryDate: "Monday, April 14, 2026",
    deliveryId: "DEL-1002",
    baseFreight: "$2400",
    fuelSurcharge: "$250",
    handlingFee: "$150",
    freightRequestId: "FR-2024-0891",
    loadId: "LD-09877",
    linkedDeliveryId: "DEL-1235",
    route: "Dallas → Fort Worth",
  },
  {
    id: "3",
    invoiceType: "Vendor",
    companyName: "ABC Concrete Suppliers",
    invoiceNumber: "INV-2024-0347",
    project: "Tech Park Development",
    amount: "$15000",
    rawAmount: 15000,
    dueDate: "April 20, 2026",
    linkedTo: "Delivery: DEL-1236",
    status: "Pending",
    priority: "High",
    deliveryDate: "Thursday, April 16, 2026",
    deliveryId: "DEL-1003",
    baseFreight: "$13500",
    fuelSurcharge: "$1000",
    handlingFee: "$500",
    freightRequestId: "FR-2024-0892",
    loadId: "LD-09878",
    linkedDeliveryId: "DEL-1236",
    route: "San Antonio → Austin",
  },
  {
    id: "4",
    invoiceType: "Carrier",
    companyName: "QuickHaul Transport",
    invoiceNumber: "INV-2024-0348",
    project: "Medical Center Expansion",
    amount: "$7200",
    rawAmount: 7200,
    dueDate: "April 22, 2026",
    linkedTo: "Load: LD-0792",
    status: "Disputed",
    priority: "Low",
    deliveryDate: "Saturday, April 18, 2026",
    deliveryId: "DEL-1004",
    baseFreight: "$6500",
    fuelSurcharge: "$450",
    handlingFee: "$250",
    freightRequestId: "FR-2024-0893",
    loadId: "LD-0792",
    linkedDeliveryId: "DEL-9880",
    route: "El Paso → Lubbock",
  },
  {
    id: "5",
    invoiceType: "Vendor",
    companyName: "Elite Steel Supply",
    invoiceNumber: "INV-2024-0349",
    project: "Green Valley Homes",
    amount: "$28500",
    rawAmount: 28500,
    dueDate: "April 25, 2026",
    linkedTo: "Delivery: DEL-1238",
    status: "Approved",
    priority: "Medium",
    deliveryDate: "Tuesday, April 21, 2026",
    deliveryId: "DEL-1005",
    baseFreight: "$26000",
    fuelSurcharge: "$1800",
    handlingFee: "$700",
    freightRequestId: "FR-2024-0894",
    loadId: "LD-09881",
    linkedDeliveryId: "DEL-1238",
    route: "Houston → San Antonio",
  },
  {
    id: "6",
    invoiceType: "Delivery Company",
    companyName: "ProLogistics Inc",
    invoiceNumber: "INV-2024-0350",
    project: "Downtown Plaza",
    amount: "$3200",
    rawAmount: 3200,
    dueDate: "April 28, 2026",
    linkedTo: "Delivery: DEL-1239",
    status: "Under Review",
    priority: "Medium",
    deliveryDate: "Friday, April 24, 2026",
    deliveryId: "DEL-1006",
    baseFreight: "$2800",
    fuelSurcharge: "$250",
    handlingFee: "$150",
    freightRequestId: "FR-2024-0895",
    loadId: "LD-09882",
    linkedDeliveryId: "DEL-1239",
    route: "Austin → Waco",
  },
];

const PaymentApprovalsPage = () => {
  const [items, setItems] = useState<PaymentApprovalItem[]>(initialApprovalItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [projectFilter, setProjectFilter] = useState<string>("All");

  const [selectedItem, setSelectedItem] = useState<PaymentApprovalItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState("");

  // Counts for the 4 stat cards
  const pendingCount = items.filter((item) => item.status === "Pending").length;
  const underReviewCount = items.filter((item) => item.status === "Under Review").length;
  const approvedCount = items.filter((item) => item.status === "Approved").length;
  const disputedCount = items.filter((item) => item.status === "Disputed").length;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        item.companyName.toLowerCase().includes(query) ||
        item.invoiceNumber.toLowerCase().includes(query) ||
        item.project.toLowerCase().includes(query) ||
        item.linkedTo.toLowerCase().includes(query) ||
        item.amount.toLowerCase().includes(query);

      const matchesPaymentStatus =
        paymentStatusFilter === "All" ||
        item.status.toLowerCase() === paymentStatusFilter.toLowerCase();

      const matchesType =
        typeFilter === "All" ||
        item.invoiceType.toLowerCase() === typeFilter.toLowerCase();

      const matchesProject =
        projectFilter === "All" ||
        item.project.toLowerCase() === projectFilter.toLowerCase();

      return matchesSearch && matchesPaymentStatus && matchesType && matchesProject;
    });
  }, [items, searchQuery, paymentStatusFilter, typeFilter, projectFilter]);

  const handleOpenDetail = (item: PaymentApprovalItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: ApprovalStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    setIsDetailModalOpen(false);
    setSuccessModalTitle(`Status Updated to ${newStatus}`);
    setIsSuccessModalOpen(true);
  };

  const renderTypeBadge = (type: InvoiceType) => {
    switch (type) {
      case "Carrier":
        return (
          <span className="border border-blue-400 text-blue-600 bg-white rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs">
            <Truck className="w-3.5 h-3.5" />
            <span>Carrier</span>
          </span>
        );
      case "Delivery Company":
        return (
          <span className="border border-emerald-400 text-emerald-600 bg-white rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs">
            <Package className="w-3.5 h-3.5" />
            <span>Delivery Company</span>
          </span>
        );
      case "Vendor":
        return (
          <span className="border border-purple-400 text-purple-600 bg-white rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs">
            <Store className="w-3.5 h-3.5" />
            <span>Vendor</span>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Payment Approvals
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve payment requests across all invoice types
        </p>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          icon={<Clock className="md:size-5 size-4 text-[#FF5700]" />}
          color="bg-[#FF5700]"
          onClick={() =>
            setPaymentStatusFilter(
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
          value={underReviewCount}
          icon={<AlertCircle className="md:size-5 size-4 text-[#2563EB]" />}
          color="bg-[#2563EB]"
          onClick={() =>
            setPaymentStatusFilter(
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
          value={approvedCount}
          icon={<Check className="md:size-5 size-4 text-[#00B948] stroke-3" />}
          color="bg-[#00B948]"
          onClick={() =>
            setPaymentStatusFilter(
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
          value={disputedCount}
          icon={<X className="md:size-5 size-4 text-[#EF1428] stroke-3" />}
          color="bg-[#EF1428]"
          onClick={() =>
            setPaymentStatusFilter(
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F3F4F6] text-sm text-gray-800 placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 border-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Payment Status Dropdown */}
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-10 text-sm text-gray-700 bg-[#F3F4F6] border-none rounded-xl px-3.5 focus:ring-1 focus:ring-blue-500 shadow-none cursor-pointer">
              <SelectValue placeholder="Payment Status">
                {paymentStatusFilter === "All" ? "Payment Status" : paymentStatusFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Payment Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Disputed">Disputed</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          {/* Status (Type) Dropdown */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-35 h-10 text-sm text-gray-700 bg-[#F3F4F6] border-none rounded-xl px-3.5 focus:ring-1 focus:ring-blue-500 shadow-none cursor-pointer">
              <SelectValue placeholder="Status">
                {typeFilter === "All" ? "Status" : typeFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Carrier">Carrier</SelectItem>
              <SelectItem value="Delivery Company">Delivery Company</SelectItem>
              <SelectItem value="Vendor">Vendor</SelectItem>
            </SelectContent>
          </Select>

          {/* Project Dropdown */}
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-37.5 h-10 text-sm text-gray-700 bg-[#F3F4F6] border-none rounded-xl px-3.5 focus:ring-1 focus:ring-blue-500 shadow-none cursor-pointer">
              <SelectValue placeholder="Project">
                {projectFilter === "All" ? "Project" : projectFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Projects</SelectItem>
              <SelectItem value="Downtown Plaza">Downtown Plaza</SelectItem>
              <SelectItem value="Riverside Complex">Riverside Complex</SelectItem>
              <SelectItem value="Tech Park Development">Tech Park Development</SelectItem>
              <SelectItem value="Medical Center Expansion">Medical Center Expansion</SelectItem>
              <SelectItem value="Green Valley Homes">Green Valley Homes</SelectItem>
            </SelectContent>
          </Select>
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
            {filteredItems.length} items
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
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400 text-sm">
                    No payment requests match the current filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
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
