import type { TourDefinition } from "../tour.types";
import { anchor, click } from "./tour-helpers";
import {
  miscInvoiceModal,
  quotationModal,
  quotationUploadModal,
  sendInvoiceModal,
  uploadMiscInvoiceModal,
} from "./panels";

/** Every invoice page in detail, with their previews and uploads. */
export const invoiceGuideTour: TourDefinition = {
  id: "invoice-guide",
  name: "Invoice Guide",
  description:
    "Every invoice page in detail: project, vendor, carrier and miscellaneous invoices, and quotation profit and loss.",
  estimatedMinutes: 4,
  steps: [
    {
      id: "inv-stats",
      route: "/invoices",
      element: anchor("invoice-stats"),
      title: "Project Invoices: Totals",
      description:
        "Number of invoices, their amount, what has been received and what is outstanding.",
      speechText: "Invoices, their amount, received and outstanding.",
      side: "bottom",
    },
    {
      id: "inv-table",
      route: "/invoices",
      element: anchor("invoice-table"),
      title: "Project Invoices: List",
      description:
        "Every invoice sent to a customer, with its dates and payment status.",
      speechText: "Every invoice sent to a customer.",
      side: "top",
    },
    {
      id: "inv-filters",
      route: "/invoices",
      element: anchor("invoice-filters"),
      title: "Project Invoices: Filters",
      description:
        "Search, or filter by dates, status or project.",
      speechText: "Search, or filter by dates, status or project.",
      side: "bottom",
      align: "end",
    },
    {
      id: "inv-row-actions",
      route: "/invoices",
      element: anchor("invoice-row-actions"),
      title: "Project Invoices: Actions",
      description:
        "Mark an invoice paid, follow up when it is overdue, download it, or open its details.",
      speechText: "Mark it paid, follow up, download it or open it.",
      side: "left",
      locked: true,
      optional: true,
    },
    {
      id: "inv-invoice-preview",
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
      id: "inv-invoice-actions",
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
      id: "inv-invoice-email",
      route: "/invoices/project-invoices/:id",
      element: anchor("send-invoice-modal"),
      title: "Email the Invoice",
      description:
        "Check the recipient and message. It is only sent when you press send.",
      speechText: "Check the recipient and message before you send it.",
      panels: [sendInvoiceModal],
    },
    {
      id: "inv-vendor-stats",
      route: "/invoices/vendor-invoices",
      element: anchor("invoice-stats"),
      title: "Vendor Invoices: Totals",
      description:
        "Invoices received from vendors, their amount, and what is waiting for verification or payment.",
      speechText: "Vendor invoices waiting for verification or payment.",
      side: "bottom",
    },
    {
      id: "inv-vendor-table",
      route: "/invoices/vendor-invoices",
      element: anchor("vendor-invoice-table"),
      title: "Vendor Invoices: List",
      description:
        "Every vendor invoice with its verification and payment status. A verified invoice can be marked paid from its row.",
      speechText: "Every vendor invoice, with its status.",
      side: "top",
      locked: true,
    },
    {
      id: "inv-vendor-detail",
      route: "/invoices/vendor-invoices/:id",
      element: anchor("vendor-invoice-summary"),
      title: "Vendor Invoices: Details",
      description:
        "Where the invoice came from, what it is linked to and its history.",
      speechText: "Where the invoice came from, and its history.",
      side: "bottom",
      locked: true,
      via: {
        fromRoute: "/invoices/vendor-invoices",
        ...click(
          anchor("vendor-invoice-view"),
          "Open a Vendor Invoice",
          "Click the view button to open this invoice.",
          true,
        ),
      },
    },
    {
      id: "inv-vendor-document",
      route: "/invoices/vendor-invoices/:id",
      element: anchor("vendor-invoice-document"),
      title: "Vendor Invoices: Document",
      description:
        "The invoice itself, with its line items and totals.",
      speechText: "The invoice itself, with its line items and totals.",
      side: "top",
      locked: true,
    },
    {
      id: "inv-carrier-stats",
      route: "/invoices/carrier-invoices",
      element: anchor("invoice-stats"),
      title: "Carrier Invoices: Totals",
      description:
        "The same totals for the carriers who deliver your loads.",
      speechText: "The same totals, for carriers.",
      side: "bottom",
    },
    {
      id: "inv-carrier-table",
      route: "/invoices/carrier-invoices",
      element: anchor("carrier-invoice-table"),
      title: "Carrier Invoices: List",
      description:
        "Every freight invoice with its verification and payment status.",
      speechText: "Every freight invoice, with its status.",
      side: "top",
      locked: true,
    },
    {
      id: "inv-carrier-detail",
      route: "/invoices/carrier-invoices/:id",
      element: anchor("carrier-invoice-summary"),
      title: "Carrier Invoices: Details",
      description:
        "The carrier, the project and delivery it is linked to, and its history.",
      speechText: "The carrier, the linked delivery, and the history.",
      side: "bottom",
      locked: true,
      via: {
        fromRoute: "/invoices/carrier-invoices",
        ...click(
          anchor("carrier-invoice-view"),
          "Open a Carrier Invoice",
          "Click the view button to open this invoice.",
          true,
        ),
      },
    },
    {
      id: "inv-misc-stats",
      route: "/invoices/miscellaneous-invoices",
      element: anchor("invoice-stats"),
      title: "Miscellaneous Invoices: Totals",
      description:
        "Invoices that belong to no vendor or carrier, with what is pending or overdue.",
      speechText: "Other invoices, with what is pending or overdue.",
      side: "bottom",
    },
    {
      id: "inv-misc-table",
      route: "/invoices/miscellaneous-invoices",
      element: anchor("misc-invoice-table"),
      title: "Miscellaneous Invoices: List",
      description:
        "Every other invoice, with its category and payment status.",
      speechText: "Every other invoice, with its category and status.",
      side: "top",
      locked: true,
    },
    {
      id: "inv-misc-upload",
      route: "/invoices/miscellaneous-invoices",
      element: anchor("misc-upload-modal"),
      title: "Miscellaneous Invoices: Upload",
      description:
        "Enter the invoice and attach its file. It is saved only when you submit the form.",
      speechText: "Enter the invoice and attach its file.",
      panels: [uploadMiscInvoiceModal],
    },
    {
      id: "inv-misc-details",
      route: "/invoices/miscellaneous-invoices",
      element: anchor("misc-details-modal"),
      title: "Miscellaneous Invoices: Details",
      description:
        "The invoice's amount, dates and status.",
      speechText: "The invoice's amount, dates and status.",
      panels: [miscInvoiceModal],
    },
    {
      id: "inv-quote-stats",
      route: "/invoices/quotation-profit-loss",
      element: anchor("quotation-pl-stats"),
      title: "Quotation-wise Profit / Loss: Totals",
      description:
        "Quotations, quoted and actual revenue, actual cost and actual profit.",
      speechText: "Quoted revenue against actual revenue, cost and profit.",
      side: "bottom",
    },
    {
      id: "inv-quote-table",
      route: "/invoices/quotation-profit-loss",
      element: anchor("quotation-pl-table"),
      title: "Quotation-wise Profit / Loss: Records",
      description:
        "What each quotation promised and what it actually earned.",
      speechText: "What each quotation promised, and what it earned.",
      side: "top",
    },
    {
      id: "inv-quote-upload",
      route: "/invoices/quotation-profit-loss",
      element: anchor("quotation-pl-upload-modal"),
      title: "Quotation-wise Profit / Loss: Upload",
      description:
        "Enter the actual revenue and cost for a quotation, with a supporting document if you have one.",
      speechText: "Enter the actual revenue and cost of a quotation.",
      panels: [quotationUploadModal],
    },
    {
      id: "inv-quote-details",
      route: "/invoices/quotation-profit-loss",
      element: anchor("quotation-pl-modal"),
      title: "Quotation-wise Profit / Loss: Details",
      description:
        "One quotation, from its quoted figures to its actual profit.",
      speechText: "One quotation, from quoted figures to actual profit.",
      panels: [quotationModal],
    },
  ],
};
