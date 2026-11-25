import type { TourStepConfig } from "../tour.types";
import { anchor } from "./tour-helpers";

/** One step per invoice page; the Invoice Guide goes into detail. */
export const invoiceOverviewSteps: TourStepConfig[] = [
  {
    id: "step-invoices-project",
    route: "/invoices",
    element: anchor("invoice-table"),
    title: "Project Invoices",
    description:
      "Every invoice sent to a customer, with its dates and payment status.",
    speechText: "Every invoice sent to a customer.",
    side: "top",
    locked: true,
    branch: {
      tourId: "invoice-guide",
      label: "Explore Invoices in Depth (4 min)",
      description:
        "Want to see every invoice page in detail, with previews, emails and uploads?",
      resumeStepId: "step-notifications",
    },
  },
  {
    id: "step-invoices-vendor",
    route: "/invoices/vendor-invoices",
    element: anchor("vendor-invoice-table"),
    title: "Vendor Invoices",
    description:
      "Every vendor invoice with its verification and payment status.",
    speechText: "Every vendor invoice, with its status.",
    side: "top",
    locked: true,
  },
  {
    id: "step-invoices-carrier",
    route: "/invoices/carrier-invoices",
    element: anchor("carrier-invoice-table"),
    title: "Carrier Invoices",
    description:
      "Every freight invoice with its verification and payment status.",
    speechText: "Every freight invoice, with its status.",
    side: "top",
    locked: true,
  },
  {
    id: "step-invoices-misc",
    route: "/invoices/miscellaneous-invoices",
    element: anchor("misc-invoice-table"),
    title: "Miscellaneous Invoices",
    description:
      "Every other invoice, with its category and payment status.",
    speechText: "Every other invoice, with its category and status.",
    side: "top",
    locked: true,
  },
  {
    id: "step-invoices-quotation",
    route: "/invoices/quotation-profit-loss",
    element: anchor("quotation-pl-table"),
    title: "Quotation-wise Profit / Loss",
    description:
      "What each quotation promised and what it actually earned.",
    speechText: "What each quotation promised, and what it earned.",
    side: "top",
    locked: true,
  },
];
