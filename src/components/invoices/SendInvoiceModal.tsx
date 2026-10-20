import { useState, useEffect } from "react";
import { Mail, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Modal from "@/components/common_components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendInvoiceEmailMutation } from "@/redux/api/invoiceManagementApi";

export interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  customerEmail?: string;
  invoiceNumber?: string;
}

export default function SendInvoiceModal({
  isOpen,
  onClose,
  invoiceId,
  customerEmail = "",
  invoiceNumber = "",
}: SendInvoiceModalProps) {
  const [sendEmailMutation, { isLoading }] = useSendInvoiceEmailMutation();

  const [recipientEmail, setRecipientEmail] = useState(customerEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [cc, setCc] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRecipientEmail(customerEmail);
      setSubject(`Invoice #${invoiceNumber || "Invoice"} - Payment Request`);
      setMessage(
        `Dear Customer,\n\nPlease find attached invoice #${invoiceNumber || ""}. Kindly review the remittance and payment schedule details.\n\nThank you for your business!\nSteel Building Depot`
      );
      setCc("");
      setErrorMessage(null);
      setIsSent(false);
    }
  }, [isOpen, customerEmail, invoiceNumber]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      setErrorMessage("Recipient email is required.");
      return;
    }

    try {
      setErrorMessage(null);
      const ccList = cc
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      await sendEmailMutation({
        invoiceId,
        recipientEmail: recipientEmail.trim(),
        subject: subject.trim(),
        message: message.trim(),
        ...(ccList.length > 0 ? { cc: ccList } : {}),
      }).unwrap();

      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      const errMsg =
        err?.data?.message || err?.message || "Failed to send invoice email. Please try again.";
      setErrorMessage(errMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Invoice"
      width="max-w-lg"
      className="p-0 overflow-hidden"
    >
      <form onSubmit={handleSend} className="flex flex-col">
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSent && (
            <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Invoice sent successfully!</span>
            </div>
          )}

          {/* Recipient Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Recipient Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <Input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="customer@example.com"
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {/* CC Emails */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">CC (Optional, comma separated)</label>
            <Input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="accounting@example.com, manager@example.com"
              className="text-sm"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Subject</label>
            <Input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-sm p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading || isSent}
            className="text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isSent}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4 flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </>
            ) : isSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sent!
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Send Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
