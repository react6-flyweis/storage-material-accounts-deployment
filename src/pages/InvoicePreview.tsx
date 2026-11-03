import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, Download, Mail, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoiceTemplate from "@/components/invoices/InvoiceTemplate";
import SendInvoiceModal from "@/components/invoices/SendInvoiceModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import {
  useGetInvoiceDetailQuery,
  useMarkProjectInvoicePaidMutation,
  downloadInvoicePdfBinary,
} from "@/redux/api/invoiceManagementApi";

export default function InvoicePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string; invoiceId?: string }>();
  const navState = (location.state as any) || {};

  const activeInvoiceId =
    params.invoiceId ||
    params.id ||
    navState.invoiceId ||
    navState.invoice?._id ||
    navState.invoice?.invoiceId ||
    "";

  const {
    data: detailData,
    isLoading,
    isError,
    refetch,
  } = useGetInvoiceDetailQuery(activeInvoiceId, {
    skip: !activeInvoiceId,
  });

  const [markPaidMutation, { isLoading: isMarkingPaid }] = useMarkProjectInvoicePaidMutation();
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", subTitle: "" });

  const invoice =
    detailData?.invoice ||
    navState.invoice ||
    (navState.invoiceNumber || navState.subtotal
      ? {
          invoiceNumber: navState.invoiceNumber,
          date: navState.date,
          daysToPay: navState.daysToPay,
          subtotal: navState.subtotal,
          tax: navState.taxAmount,
          taxAmount: navState.taxAmount,
          discount: navState.discount,
          totalAmount: navState.total,
          depositAmount: navState.deposit,
          billingAddress: navState.billingAddress,
          recipientAddress: navState.recipientAddress,
          bankDetails: navState.bankDetails,
          lineItems: navState.lineItems || navState.items,
        }
      : null);

  const paymentSchedule = detailData?.paymentSchedule || null;

  if (isLoading && !invoice) {
    return (
      <div className="p-16 text-center text-gray-500 max-w-xl mx-auto space-y-3">
        <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-600" />
        <p className="text-sm font-medium">Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice && (isError || !activeInvoiceId)) {
    return (
      <div className="p-16 text-center text-gray-600 max-w-md mx-auto space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-sm font-medium">
          Invoice details could not be loaded. Please verify the invoice link or go back.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)} className="text-xs">
          Return to previous page
        </Button>
      </div>
    );
  }

  const isPaid =
    invoice?.status?.toLowerCase() === "paid" ||
    invoice?.paymentStatus?.toLowerCase() === "paid" ||
    (invoice as any)?.isPaid === true;

  const handleDownloadPdf = async () => {
    if (!activeInvoiceId) return;
    try {
      setErrorMessage(null);
      setIsDownloading(true);
      await downloadInvoicePdfBinary(
        activeInvoiceId,
        invoice?.invoiceNumber || "Invoice",
        invoice?.pdfUrl || invoice?.documentUrl
      );
    } catch (err: any) {
      setErrorMessage("Could not download invoice PDF. The document may still be compiling.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!activeInvoiceId) return;
    try {
      setErrorMessage(null);
      await markPaidMutation(activeInvoiceId).unwrap();
      setSuccessModal({
        isOpen: true,
        title: "Invoice Marked Paid",
        subTitle: "The invoice status has been updated to Paid successfully.",
      });
      refetch();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to mark invoice as paid.";
      setErrorMessage(msg);
    }
  };

  const customerEmail =
    (typeof invoice?.customerId === "object" && invoice?.customerId?.email) ||
    (invoice as any)?.customerEmail ||
    "";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={isDownloading || !activeInvoiceId}
            className="text-xs h-9 cursor-pointer"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-1.5" />
            )}
            Download PDF
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsSendModalOpen(true)}
            disabled={!activeInvoiceId}
            className="text-xs h-9 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            Email Invoice
          </Button>

          {!isPaid ? (
            <Button
              onClick={handleMarkPaid}
              disabled={isMarkingPaid || !activeInvoiceId}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold cursor-pointer shadow-xs"
            >
              {isMarkingPaid && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Mark Paid
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-md text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Paid
            </span>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Embedded Presentation Template */}
      {invoice && (
        <InvoiceTemplate invoice={invoice as any} paymentSchedule={paymentSchedule} />
      )}

      {/* Email Modal */}
      <SendInvoiceModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        invoiceId={activeInvoiceId}
        customerEmail={customerEmail}
        invoiceNumber={invoice?.invoiceNumber || ""}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: "", subTitle: "" })}
        title={successModal.title}
        subTitle={successModal.subTitle}
      />
    </div>
  );
}
