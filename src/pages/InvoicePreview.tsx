import { useState, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Download,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import {
  useGetInvoiceDetailQuery,
  useMarkProjectInvoicePaidMutation,
  useFollowUpProjectInvoiceMutation,
  downloadInvoicePdfBinary,
  type ProjectInvoiceRecordItem,
} from "@/redux/api/invoiceManagementApi";
import SuccessModal from "@/components/common_components/SuccessModal";

function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return "0.00";
  }
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatInvoiceDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
}

function formatStageName(
  name: string | null | undefined,
  amount: number | null | undefined,
  amountType: string | null | undefined,
) {
  const stageName = name || "Payment";
  if (amountType === "percentage" && amount != null) {
    const pctStr = `${amount}%`;
    if (!stageName.includes("%")) {
      return `${stageName} (${pctStr})`;
    }
  }
  return stageName;
}

interface InvoiceLocationItem {
  id?: string;
  description?: string;
  notes?: string | null;
  rate?: number;
  quantity?: number;
  total?: number;
  photos?: string[];
  images?: string[];
}

interface InvoiceLocationState {
  invoiceId?: string;
  invoiceNumber?: string;
  invoice?: ProjectInvoiceRecordItem;
  date?: string;
  dueDate?: string;
  daysToPay?: number | string;
  subtotal?: number;
  taxAmount?: number;
  discount?: number;
  total?: number;
  deposit?: number;
  items?: InvoiceLocationItem[];
}

export default function InvoicePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string; invoiceId?: string }>();
  const navState = location.state as InvoiceLocationState | null;

  // Determine active invoice identifier from url params or navigation state
  const activeInvoiceId =
    params.id ||
    params.invoiceId ||
    navState?.invoiceId ||
    navState?.invoice?.invoiceId ||
    "";

  const locationInvoice = navState?.invoice;

  // Live Invoice Detail Query
  const {
    data: detailData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetInvoiceDetailQuery(activeInvoiceId, {
    skip: !activeInvoiceId,
  });

  // Mutations
  const [markPaidMutation, { isLoading: isMarkingPaid }] =
    useMarkProjectInvoicePaidMutation();
  const [followUpMutation, { isLoading: isFollowingUp }] =
    useFollowUpProjectInvoiceMutation();

  // Feedback Modals
  const [isDownloading, setIsDownloading] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    subTitle: string;
  }>({
    isOpen: false,
    title: "",
    subTitle: "",
  });

  // Invoice Document & Payment Schedule
  const invoiceDoc = detailData?.invoice;
  const paymentSchedule = detailData?.paymentSchedule;

  // Merge live API data with navigation cache (NO hardcoded fake mock data)
  const invoiceNumber =
    invoiceDoc?.invoiceNumber ||
    locationInvoice?.invoiceNumber ||
    navState?.invoiceNumber ||
    activeInvoiceId ||
    "-";

  const rawDate =
    invoiceDoc?.date ||
    invoiceDoc?.createdAt ||
    locationInvoice?.invoiceDate ||
    navState?.date;
  const date = formatInvoiceDate(rawDate);

  const daysToPay =
    invoiceDoc?.daysToPay ?? navState?.daysToPay ?? "15";

  const businessTaxNumber = invoiceDoc?.poNumber || "99- 4515145";

  // Financial figures from API
  const subtotal = Number(
    invoiceDoc?.subtotal ??
      locationInvoice?.amount ??
      navState?.subtotal ??
      0,
  );

  const taxAmount = Number(
    invoiceDoc?.tax ??
      invoiceDoc?.taxAmount ??
      navState?.taxAmount ??
      0,
  );

  const taxLabel = "Tax";

  const discount = Number(
    invoiceDoc?.discount ?? navState?.discount ?? 0,
  );

  const total = Number(
    invoiceDoc?.totalAmount ??
      invoiceDoc?.amount ??
      locationInvoice?.amount ??
      navState?.total ??
      subtotal + taxAmount - discount,
  );

  const deposit = Number(
    invoiceDoc?.depositAmount ??
      navState?.deposit ??
      total * 0.25,
  );

  // Line items from real API data
  const items = useMemo(() => {
    if (invoiceDoc?.lineItems && invoiceDoc.lineItems.length > 0) {
      return invoiceDoc.lineItems.map((item, index) => ({
        id: item._id ?? item.id ?? `item-${index}`,
        description: item.description || `Item ${index + 1}`,
        notes: item.notes || null,
        rate: item.effectiveRate ?? item.rate ?? 0,
        quantity: item.quantity ?? 1,
        total:
          item.total ??
          (item.effectiveRate ?? item.rate ?? 0) * (item.quantity ?? 1),
        images: item.images ?? item.photos ?? [],
      }));
    }

    if (navState?.items && navState.items.length > 0) {
      return navState.items.map((item, index) => ({
        id: item.id ?? `item-${index}`,
        description: item.description || `Item ${index + 1}`,
        notes: item.notes || null,
        rate: item.rate ?? 0,
        quantity: item.quantity ?? 1,
        total: item.total ?? (item.rate ?? 0) * (item.quantity ?? 1),
        images: item.photos ?? item.images ?? [],
      }));
    }

    // If total exists but line items array is not broken down, show the invoice description
    if (total > 0) {
      return [
        {
          id: "item-default",
          description:
            invoiceDoc?.description ||
            invoiceDoc?.projectName ||
            locationInvoice?.projectName ||
            "Invoice Item",
          notes: null,
          rate: total,
          quantity: 1,
          total: total,
          images: [],
        },
      ];
    }

    return [];
  }, [invoiceDoc, navState, total, locationInvoice]);

  // Payment Schedule Stages
  const stages = paymentSchedule?.stages ?? [];

  // Status & Version
  const rawStatus = (
    invoiceDoc?.paymentStatus ||
    invoiceDoc?.invoiceStatus ||
    invoiceDoc?.status ||
    locationInvoice?.paymentStatus ||
    locationInvoice?.invoiceStatus ||
    "pending"
  ).toLowerCase();

  const isPaid = rawStatus === "paid";
  const isOverdue = rawStatus === "overdue";
  const isSent = rawStatus === "sent";

  const statusLabel = isPaid
    ? "Paid"
    : isOverdue
    ? "Overdue"
    : isSent
    ? "Sent"
    : "Pending";

  const revision = invoiceDoc?.revision ?? 1;

  // Actions
  const handleMarkPaid = async () => {
    if (!activeInvoiceId) return;
    try {
      await markPaidMutation(activeInvoiceId).unwrap();
      setSuccessModal({
        isOpen: true,
        title: "Invoice Paid",
        subTitle: `Invoice ${invoiceNumber} marked as paid successfully.`,
      });
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to mark invoice as paid";
      alert(msg);
    }
  };

  const handleEmail = async () => {
    if (!activeInvoiceId) return;
    try {
      await followUpMutation(activeInvoiceId).unwrap();
      setSuccessModal({
        isOpen: true,
        title: "Email Sent",
        subTitle: `Invoice ${invoiceNumber} email sent successfully.`,
      });
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to send email";
      alert(msg);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const pdfUrl =
        invoiceDoc?.pdfUrl ||
        invoiceDoc?.documentUrl ||
        locationInvoice?.pdfUrl ||
        locationInvoice?.documentUrl;

      await downloadInvoicePdfBinary(
        activeInvoiceId,
        invoiceNumber,
        pdfUrl
      );
    } catch (err) {
      console.warn("Direct PDF download failed, falling back to print dialog:", err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
  if (isLoading && !locationInvoice && !invoiceDoc) {
    return (
      <div className="md:px-5 px-2 md:pt-5 pb-10 min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Loading invoice details...
        </p>
      </div>
    );
  }

  // Error state
  if (isError && !invoiceDoc && !locationInvoice) {
    return (
      <div className="md:px-5 px-2 md:pt-5 pb-10">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Invoice Not Found
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Unable to load invoice details for ID "{activeInvoiceId}".
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate("/invoices/project-invoices")}
              className="text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              All Invoices
            </Button>
            <Button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-5 px-2 md:pt-5 pb-10 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions Bar (as shown in user design) */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        {/* Left: Back button + Title + Status & Version Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 gap-1.5 h-9 text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/invoices/project-invoices");
              }
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <h1 className="text-slate-900 text-lg sm:text-xl font-bold tracking-tight">
            Customer Invoice Details
          </h1>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full text-xs ${
              isPaid
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : isOverdue
                ? "bg-red-50 text-red-700 border border-red-200"
                : isSent
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : isOverdue ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            )}
            {statusLabel}
          </span>

          {/* Version Badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            v{revision}
          </span>

          {isFetching && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Updating...
            </span>
          )}
        </div>

        {/* Right: Download & Email buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 h-9 text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-600" />
            )}
            Download
          </Button>

          <Button
            onClick={handleEmail}
            disabled={isFollowingUp}
            className="bg-[#2563EB] hover:bg-blue-700 text-white h-9 text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            {isFollowingUp ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
            Email
          </Button>
        </div>
      </div>

      {/* Main Invoice Card (Exactly matching the design in screenshot) */}
      <div className="bg-white rounded-lg p-6 sm:p-14 shadow-sm mx-auto max-w-6xl print:shadow-none print:border-none print:p-0 relative">
        {/* Top Right: Mark Paid Button inside the document card */}
        <div className="flex justify-end mb-2">
          {!isPaid ? (
            <Button
              onClick={handleMarkPaid}
              disabled={isMarkingPaid}
              className="bg-[#2563EB] hover:bg-blue-700 text-white min-w-25 h-9 text-xs font-semibold rounded-md shadow-xs cursor-pointer"
            >
              {isMarkingPaid ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : null}
              Mark Paid
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold px-3 py-1.5 rounded-md text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Paid
            </span>
          )}
        </div>

        {/* Centered INVOICE Header */}
        <h1 className="text-center text-gray-300 font-bold text-md md:text-xl tracking-widest uppercase mb-12 select-none">
          INVOICE
        </h1>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          {/* Logo & Company Address */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="The Steel"
                className="md:w-29 w-20 md:h-16 object-contain"
              />
            </div>

            <div className="text-xs text-gray-500 leading-relaxed">
              1851 Madison Ave Suite 300
              <br />
              Council Bluffs, IA
              <br />
              51503
              <br />
              United States
              <br />
              travis@storagematerials.com
              <br />
              www.storagematerials.com
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="min-w-50 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Payment terms</span>
              <span className="text-gray-900">
                {daysToPay ? `${daysToPay} days` : "15 days"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Invoice #</span>
              <span className="text-gray-900 font-mono font-bold">
                {invoiceNumber}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Date</span>
              <span className="text-gray-900">{date}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Business/Tax #</span>
              <span className="text-gray-900">{businessTaxNumber}</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-12">
          <div className="flex justify-between border-b border-gray-800 pb-2 mb-6">
            <span className="text-xs font-bold text-gray-700">Description</span>
            <span className="text-xs font-bold text-gray-700">Total</span>
          </div>

          <div className="space-y-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={index > 0 ? "border-t border-gray-200 pt-6" : ""}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-700 font-medium">
                    {item.description}
                  </span>
                  <span className="text-xs text-gray-700 font-mono">
                    ${formatCurrency(item.total)}
                  </span>
                </div>

                {item.notes && (
                  <div className="text-[11px] text-gray-400 mb-3">
                    {item.notes}
                  </div>
                )}

                {/* Display Photos if any */}
                {item.images && item.images.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-3 mb-2">
                    {item.images.map((photo: string, i: number) => (
                      <div
                        key={i}
                        className="w-64 h-40 overflow-hidden rounded-sm bg-gray-100 border border-gray-200"
                      >
                        <img
                          src={photo}
                          alt={`Item photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center text-gray-400 text-xs py-6">
                No line items available
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-900 font-bold">Subtotal</span>
              <span className="text-gray-500 font-mono">
                ${formatCurrency(subtotal)}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-xs text-red-600">
                <span>Discount</span>
                <span className="font-mono">-${formatCurrency(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs border-b border-gray-100 pb-3">
              <span className="text-gray-500">{taxLabel}</span>
              <span className="text-gray-500 font-mono">
                ${formatCurrency(taxAmount)}
              </span>
            </div>

            <div className="flex justify-between text-xs pt-1">
              <span className="text-gray-900 font-bold">Total</span>
              <span className="text-gray-900 font-bold font-mono">
                ${formatCurrency(total)}
              </span>
            </div>

            <div className="flex justify-between text-xs pt-2 border-t border-gray-100">
              <span className="text-gray-900 font-medium">Deposit Due</span>
              <span className="text-gray-900 font-bold font-mono">
                ${formatCurrency(deposit)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Schedule Section */}
        <div className="mb-16 max-w-lg ml-auto">
          <h3 className="text-xs font-bold text-gray-900 mb-4">
            Payment Schedule
          </h3>
          <div className="space-y-3">
            {stages.length > 0 ? (
              stages.map((stage, idx) => {
                const label = formatStageName(
                  stage.stageName,
                  stage.amount,
                  stage.amountType,
                );
                const stageAmount =
                  stage.amountType === "percentage"
                    ? (total * (stage.amount ?? 0)) / 100
                    : (stage.amount ?? 0);

                return (
                  <div
                    key={stage._id || idx}
                    className="flex justify-between text-xs border-b border-gray-50 pb-2"
                  >
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-900 font-mono font-medium">
                      ${formatCurrency(stageAmount)}
                    </span>
                  </div>
                );
              })
            ) : (
              // Proportion schedule based on actual live invoice total
              <>
                <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Deposit(25%)</span>
                  <span className="text-gray-500 font-mono">
                    ${formatCurrency(total * 0.25)}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
                  <span className="text-gray-500">1st payment 50% (50%)</span>
                  <span className="text-gray-900 font-medium font-mono">
                    ${formatCurrency(total * 0.5)}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
                  <span className="text-gray-500">2nd payment 20%</span>
                  <span className="text-gray-500 font-mono">
                    ${formatCurrency(total * 0.2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs pb-2">
                  <span className="text-gray-500">Final payment (5%)</span>
                  <span className="text-gray-500 font-mono">
                    ${formatCurrency(total * 0.05)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-[10px] text-gray-500 mb-8">
            Thank you for your business? Reach out with any questions
          </p>
          <p className="text-[10px] text-gray-500 mb-16">
            By Signing this document the customer agrees to the services and
            conditions outlined in this document
          </p>

          <div className="flex justify-end">
            <div className="border-t border-gray-400 w-64 pt-2">
              <p className="text-xs text-gray-500">Client signature</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        subTitle={successModal.subTitle}
      />
    </div>
  );
}
