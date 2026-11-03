import logo from "@/assets/logo.svg";
import type {
  InvoiceAddress,
  InvoiceBankDetails,
  PaymentScheduleDocument,
} from "@/redux/api/invoiceManagementApi";
import { formatCurrency } from "@/lib/invoice-amounts";

function getAddressLines(address?: InvoiceAddress | null): string[] {
  if (!address) return [];
  if (address.lines && address.lines.length > 0) return address.lines;
  const lines: string[] = [];
  if (address.line1?.trim()) lines.push(address.line1.trim());
  if (address.line2?.trim()) lines.push(address.line2.trim());
  const cityStateZip = [
    address.city?.trim(),
    [address.state?.trim(), address.postalCode?.trim()].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  if (cityStateZip) lines.push(cityStateZip);
  if (address.country?.trim() && address.country.trim().toLowerCase() !== "united states") {
    lines.push(address.country.trim());
  }
  return lines;
}

function formatDateDisplay(value?: string | null): string {
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

export interface InvoiceTemplateProps {
  invoice: {
    invoiceNumber?: string | null;
    date?: string | null;
    dueDate?: string | null;
    daysToPay?: number | string | null;
    poNumber?: string | null;
    subtotal?: number | null;
    tax?: number | null;
    taxAmount?: number | null;
    markup?: number | null;
    markupTotal?: number | null;
    discount?: number | null;
    totalAmount?: number | null;
    depositAmount?: number | null;
    billingAddress?: InvoiceAddress | null;
    recipientAddress?: InvoiceAddress | null;
    bankDetails?: InvoiceBankDetails | null;
    lineItems?: Array<{
      id?: string;
      _id?: string;
      description?: string | null;
      rate?: number | null;
      effectiveRate?: number | null;
      quantity?: number | null;
      total?: number | null;
    }> | null;
    customerName?: string | null;
    customerId?: any;
  };
  paymentSchedule?: PaymentScheduleDocument | null;
}

export default function InvoiceTemplate({ invoice, paymentSchedule }: InvoiceTemplateProps) {
  const billingAddress = invoice.billingAddress;
  const recipientAddress =
    invoice.recipientAddress ||
    (typeof invoice.customerId === "object" && invoice.customerId
      ? {
          companyName: invoice.customerId.name || invoice.customerName || "Customer",
          line1: invoice.customerId.address || "",
        }
      : invoice.customerName
      ? { companyName: invoice.customerName }
      : null);

  const bankDetails = invoice.bankDetails;
  const stages = paymentSchedule?.stages || [];

  const subtotal = Number(invoice.subtotal) || 0;
  const tax = Number(invoice.taxAmount ?? invoice.tax ?? 0);
  const discount = Number(invoice.discount) || 0;
  const markup = Number(invoice.markup ?? invoice.markupTotal ?? 0);
  const total = Number(invoice.totalAmount) || Math.max(0, subtotal + markup - discount + tax);
  const deposit = Number(invoice.depositAmount) || 0;

  return (
    <div className="bg-white rounded-lg p-6 sm:p-14 shadow-sm mx-auto max-w-6xl print:shadow-none print:border-none print:p-0">
      {/* Centered INVOICE Header */}
      <h1 className="text-center text-gray-300 font-bold text-md md:text-xl tracking-widest uppercase mb-12 select-none">
        INVOICE
      </h1>

      {/* 3-Column Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16 items-start">
        {/* Col 1: Logo & Seller Company Address */}
        <div className="space-y-4">
          <img
            src={logo}
            alt="Logo"
            className="h-10 max-w-56 object-contain object-left"
          />
          <div>
            <div className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              {billingAddress?.companyName || "STEEL BUILDING DEPOT"}
            </div>
            <div className="text-xs text-gray-500 leading-relaxed mt-1">
              {getAddressLines(billingAddress).map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Billed To / Recipient Address */}
        <div className="space-y-2 md:pl-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Billed To
          </span>
          {recipientAddress?.companyName || recipientAddress?.line1 ? (
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">
                {recipientAddress.companyName || "Customer"}
              </p>
              {getAddressLines(recipientAddress).map((l, i) => (
                <p key={i} className="text-gray-500">
                  {l}
                </p>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">Client details on file</div>
          )}
        </div>

        {/* Col 3: Invoice Meta */}
        <div className="min-w-50 space-y-2 md:text-right">
          <div className="flex md:justify-end justify-between gap-4 text-xs md:text-sm">
            <span className="text-gray-500 font-medium">Payment terms</span>
            <span className="text-gray-900">
              {invoice.daysToPay ? `${invoice.daysToPay} days` : "15 days"}
            </span>
          </div>
          <div className="flex md:justify-end justify-between gap-4 text-xs md:text-sm">
            <span className="text-gray-500 font-medium">Invoice #</span>
            <span className="text-gray-900 font-mono font-bold">
              {invoice.invoiceNumber || "-"}
            </span>
          </div>
          <div className="flex md:justify-end justify-between gap-4 text-xs md:text-sm">
            <span className="text-gray-500 font-medium">Date</span>
            <span className="text-gray-900">{formatDateDisplay(invoice.date)}</span>
          </div>
          {invoice.poNumber && (
            <div className="flex md:justify-end justify-between gap-4 text-xs md:text-sm">
              <span className="text-gray-500 font-medium">PO #</span>
              <span className="text-gray-900 font-mono">{invoice.poNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-12">
        <div className="flex justify-between border-b border-gray-800 pb-2 mb-6">
          <span className="text-sm font-bold text-gray-700">Description</span>
          <div className="flex gap-8">
            <span className="text-sm font-bold text-gray-700 w-24 text-right">Rate</span>
            <span className="text-sm font-bold text-gray-700 w-16 text-right">Qty</span>
            <span className="text-sm font-bold text-gray-700 w-28 text-right">Total</span>
          </div>
        </div>

        <div className="space-y-4">
          {(invoice.lineItems && invoice.lineItems.length > 0) ? (
            invoice.lineItems.map((item, idx) => {
              const rateVal = item.effectiveRate ?? item.rate ?? 0;
              const qtyVal = item.quantity ?? 1;
              const totalVal = item.total ?? rateVal * qtyVal;
              const notes = (item as any).notes;
              const itemsList = (item as any).items as string[] | undefined;
              const photosList = ((item as any).photos || (item as any).images) as string[] | undefined;

              return (
                <div
                  key={item.id || item._id || idx}
                  className={`py-3 ${idx > 0 ? "border-t border-gray-100" : ""}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-800 font-medium">
                      {item.description || `Line Item ${idx + 1}`}
                    </span>
                    <div className="flex gap-8">
                      <span className="text-xs text-gray-600 font-mono w-24 text-right">
                        ${formatCurrency(rateVal)}
                      </span>
                      <span className="text-xs text-gray-600 w-16 text-right">{qtyVal}</span>
                      <span className="text-xs text-gray-900 font-mono font-semibold w-28 text-right">
                        ${formatCurrency(totalVal)}
                      </span>
                    </div>
                  </div>

                  {notes && (
                    <div className="text-[11px] text-gray-400 mt-1">
                      {notes}
                    </div>
                  )}

                  {itemsList && itemsList.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      {itemsList.map((it, i) => (
                        <span
                          key={i}
                          className="bg-gray-50 border border-gray-100 text-gray-500 rounded px-2 py-0.5 text-[10px]"
                        >
                          {it}
                        </span>
                      ))}
                    </div>
                  )}

                  {photosList && photosList.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 mt-2">
                      {photosList.map((photo, i) => (
                        <span
                          key={i}
                          className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded"
                        >
                          📷 {photo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-xs text-gray-400 py-4 text-center italic">
              No line items recorded.
            </div>
          )}
        </div>
      </div>

      {/* Footer Summary: Left Banking, Right Totals */}
      <div className="mt-12 flex flex-col lg:flex-row justify-between items-start gap-12">
        {/* Left: Banking & Wire Info */}
        {bankDetails && (bankDetails.bankName || bankDetails.accountNumber) ? (
          <div className="w-full max-w-sm space-y-3">
            <div className="pb-2 border-b border-gray-300">
              <span className="text-xs md:text-sm font-semibold text-gray-700">
                Banking & Wire Info
              </span>
            </div>

            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Bank</span>
              <span className="text-gray-900 font-medium">{bankDetails.bankName || "-"}</span>
            </div>

            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Account Name</span>
              <span className="text-gray-900 font-medium">{bankDetails.accountName || "-"}</span>
            </div>

            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Account #</span>
              <span className="text-gray-900 font-mono font-medium">
                {bankDetails.accountNumber || "-"}
              </span>
            </div>

            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Routing #</span>
              <span className="text-gray-900 font-mono font-medium">
                {bankDetails.routingNumber || "-"}
              </span>
            </div>

            {bankDetails.paymentInstructions && (
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-300 italic">
                Memo: {bankDetails.paymentInstructions}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-sm text-xs text-gray-400 italic">
            Remittance details provided upon request.
          </div>
        )}

        {/* Right: Pricing Breakdown & Payment Schedule */}
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-900 font-bold">Subtotal</span>
              <span className="text-gray-500 font-mono">${formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-xs md:text-sm text-red-600">
                <span>Discount</span>
                <span className="font-mono">-${formatCurrency(discount)}</span>
              </div>
            )}

            {tax > 0 && (
              <div className="flex justify-between text-xs md:text-sm border-b border-gray-100 pb-3">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-500 font-mono">${formatCurrency(tax)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs md:text-sm pt-1">
              <span className="text-gray-900 font-bold">Total</span>
              <span className="text-gray-900 font-bold font-mono">
                ${formatCurrency(total)}
              </span>
            </div>

            {deposit > 0 && (
              <div className="flex justify-between text-xs md:text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-900 font-medium">Deposit Due</span>
                <span className="text-gray-900 font-bold font-mono">
                  ${formatCurrency(deposit)}
                </span>
              </div>
            )}
          </div>

          {/* Payment Schedule Stages */}
          {stages.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">
                Payment Schedule
              </h3>
              <div className="space-y-2">
                {stages.map((stage, idx) => {
                  const label = formatStageName(stage.stageName, stage.amount, stage.amountType);
                  const stageAmount =
                    stage.amountType === "percentage"
                      ? (total * (stage.amount ?? 0)) / 100
                      : stage.amount ?? 0;

                  return (
                    <div
                      key={stage._id || idx}
                      className="flex justify-between text-xs border-b border-gray-50 pb-2"
                    >
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className="text-gray-900 font-mono font-bold">
                        ${formatCurrency(stageAmount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
