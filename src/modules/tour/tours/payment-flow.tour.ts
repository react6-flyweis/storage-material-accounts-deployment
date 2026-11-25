import type { TourDefinition } from "../tour.types";
import { anchor, click } from "./tour-helpers";
import { paymentApprovalModal, sendInvoiceModal, uploadMiscInvoiceModal } from "./panels";

/** Follows the money end to end: customer payments, payables, tax and profit. */
export const paymentFlowTour: TourDefinition = {
  id: "payment-flow",
  name: "Payment Flow Guide",
  description:
    "The complete flow of money, from a customer payment through payables, approvals and tax to profit.",
  estimatedMinutes: 4,
  steps: [
    {
      id: "flow-order-form",
      route: "/payment_overview/add",
      element: anchor("payment-form"),
      title: "1. Record the Order Payment",
      description:
        "It starts here: choose the order and enter its deposit, progress and final payments.",
      speechText: "Start by recording the order and its payments.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/payment_overview",
        ...click(
          anchor("payment-add"),
          "Add an Order Payment",
          "Click <b>Add Order Payment</b> to record a payment.",
        ),
      },
    },
    {
      id: "flow-order-table",
      route: "/payment_overview",
      element: anchor("payment-table"),
      title: "2. Follow What Is Owed",
      description:
        "The order now shows how much has been paid and what is outstanding.",
      speechText: "The order now shows what is paid and what is outstanding.",
      side: "top",
      locked: true,
    },
    {
      id: "flow-invoices",
      route: "/invoices",
      element: anchor("invoice-table"),
      title: "3. Invoice the Customer",
      description:
        "The customer's invoices are listed here. Follow up when one is overdue, and mark it paid when the money arrives.",
      speechText: "Follow up on the customer's invoices, and mark them paid.",
      side: "top",
      locked: true,
    },
    {
      id: "flow-invoice-preview",
      route: "/invoices/project-invoices/:id",
      element: anchor("invoice-preview"),
      title: "Invoice Document",
      description:
        "The invoice as the customer sees it.",
      speechText: "The invoice, as the customer sees it.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/invoices",
        ...click(
          anchor("invoice-row-view"),
          "Open an Invoice",
          "Click <b>Details</b> to open this invoice.",
          true,
        ),
      },
    },
    {
      id: "flow-invoice-actions",
      route: "/invoices/project-invoices/:id",
      element: anchor("invoice-preview-actions"),
      title: "Invoice Actions",
      description:
        "Download the PDF, email it, or mark it as paid.",
      speechText: "Download it, email it, or mark it as paid.",
      side: "bottom",
      align: "end",
      locked: true,
    },
    {
      id: "flow-invoice-email",
      route: "/invoices/project-invoices/:id",
      element: anchor("send-invoice-modal"),
      title: "Email the Invoice",
      description:
        "Check the recipient and message. It is only sent when you press send.",
      speechText: "Check the recipient and message before you send it.",
      panels: [sendInvoiceModal],
    },
    {
      id: "flow-vendor",
      route: "/invoices/vendor-invoices",
      element: anchor("vendor-invoice-table"),
      title: "4. Check What You Owe: Vendors",
      description:
        "Vendors send their invoices here. They must be verified before they can be paid.",
      speechText: "Vendor invoices must be verified before they are paid.",
      side: "top",
      locked: true,
    },
    {
      id: "flow-carrier",
      route: "/invoices/carrier-invoices",
      element: anchor("carrier-invoice-table"),
      title: "5. Check What You Owe: Carriers",
      description:
        "Freight invoices work the same way.",
      speechText: "Freight invoices work the same way.",
      side: "top",
      locked: true,
    },
    {
      id: "flow-misc",
      route: "/invoices/miscellaneous-invoices",
      element: anchor("misc-upload-modal"),
      title: "6. Add Everything Else",
      description:
        "Invoices from anyone else are uploaded by you.",
      speechText: "Upload invoices from anyone else yourself.",
      panels: [uploadMiscInvoiceModal],
    },
    {
      id: "flow-approvals",
      route: "/payment_approvals",
      element: anchor("approvals-table"),
      title: "7. Approve the Payments",
      description:
        "Everything that needs a decision before it is paid ends up in this queue.",
      speechText: "Everything that needs a decision is in this queue.",
      side: "top",
      locked: true,
    },
    {
      id: "flow-approval-review",
      route: "/payment_approvals",
      element: anchor("payment-approval-modal"),
      title: "8. Approve or Dispute",
      description:
        "Check the request, then approve or dispute it.",
      speechText: "Check the request, then approve or dispute it.",
      whenMissing: "No payment is waiting for a decision right now.",
      panels: [paymentApprovalModal],
    },
    {
      id: "flow-tax",
      route: "/tax-and-filing",
      element: anchor("tax-records"),
      title: "9. File the Sales Tax",
      description:
        "Tax collected on your invoices is prepared, paid and filed here.",
      speechText: "Prepare, pay and file the tax you collected.",
      side: "top",
      locked: true,
    },
    {
      id: "flow-pl",
      route: "/profit-loss",
      element: anchor("pl-metrics"),
      title: "10. See the Result",
      description:
        "What came in, what went out and what is left. That is the whole flow.",
      speechText: "What came in, what went out, and what is left. That is the whole flow.",
      side: "bottom",
    },
  ],
};
