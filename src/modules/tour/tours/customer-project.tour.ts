import type { TourDefinition } from "../tour.types";
import { anchor, click, CUSTOMER_ROUTE, PROJECT_ROUTE } from "./tour-helpers";

/** Deep dive into a customer and one of their projects. */
export const customerProjectTour: TourDefinition = {
  id: "customer-project",
  name: "Customer Project Guide",
  description:
    "A customer's profile, one of their projects and every page you can open from it.",
  estimatedMinutes: 4,
  requiresProject: true,
  steps: [
    {
      id: "cp-profile",
      route: CUSTOMER_ROUTE,
      element: anchor("customer-profile"),
      title: "Customer",
      description:
        "Who the customer is and how to reach them.",
      speechText: "Who the customer is, and how to reach them.",
      side: "bottom",
      via: {
        fromRoute: "/customers",
        openAnyway: true,
        ...click(
          anchor("customer-row-view"),
          "Open a Customer",
          "Click the <b>eye</b> icon to open this customer.",
        ),
      },
    },
    {
      id: "cp-kpis",
      route: CUSTOMER_ROUTE,
      element: anchor("customer-kpis"),
      title: "Customer: Totals",
      description:
        "What their projects are worth and what they cost.",
      speechText: "What their projects are worth, and what they cost.",
      side: "bottom",
    },
    {
      id: "cp-projects",
      route: CUSTOMER_ROUTE,
      element: anchor("customer-projects"),
      title: "Customer: Projects",
      description:
        "Every project of this customer.",
      speechText: "Every project of this customer.",
      side: "top",
      locked: true,
    },
    {
      id: "cp-profitability",
      route: CUSTOMER_ROUTE,
      element: anchor("customer-profitability"),
      title: "Customer: Profitability",
      description:
        "Expected against actual figures.",
      speechText: "Expected against actual figures.",
      side: "top",
    },
    {
      id: "cp-revenue",
      route: CUSTOMER_ROUTE,
      element: anchor("customer-revenue"),
      title: "Customer: Revenue",
      description:
        "Quoted, invoiced, received, outstanding and overdue.",
      speechText: "Quoted, invoiced, received, outstanding and overdue.",
      side: "top",
    },
    {
      id: "cp-invoices",
      route: CUSTOMER_ROUTE,
      element: anchor("customer-invoices"),
      title: "Customer: Invoices",
      description:
        "Every invoice sent to this customer.",
      speechText: "Every invoice sent to this customer.",
      side: "top",
      locked: true,
    },
    {
      id: "cp-project",
      route: PROJECT_ROUTE,
      element: anchor("project-header"),
      title: "Project",
      description:
        "The finances of one project.",
      speechText: "The finances of one project.",
      side: "bottom",
      locked: true,
      via: {
        fromRoute: CUSTOMER_ROUTE,
        openAnyway: true,
        ...click(
          anchor("customer-project-view"),
          "Open a Project",
          "Click the <b>eye</b> icon to open this project.",
          true,
        ),
      },
    },
    {
      id: "cp-quick-actions",
      route: PROJECT_ROUTE,
      element: anchor("project-quick-actions"),
      title: "Project: Quick Actions",
      description:
        "Shortcuts to the project's invoices, BOM, payments, delivery, quotation and agreement. We'll visit them after the sections below.",
      speechText: "Shortcuts to the project's other pages. We'll visit them shortly.",
      side: "bottom",
      locked: true,
    },
    {
      id: "cp-overview",
      route: PROJECT_ROUTE,
      element: anchor("project-overview"),
      title: "Project: Overview",
      description:
        "The building, the customer and who is assigned to it.",
      speechText: "The building, the customer and who is assigned.",
      side: "top",
      locked: true,
    },
    {
      id: "cp-financials",
      route: PROJECT_ROUTE,
      element: anchor("project-financials"),
      title: "Project: Financial Figures",
      description:
        "What the project is worth, what it costs and what it earns.",
      speechText: "What the project is worth, costs and earns.",
      side: "top",
    },
    {
      id: "cp-progress",
      route: PROJECT_ROUTE,
      element: anchor("project-progress"),
      title: "Project: Progress",
      description:
        "The stage the project is at.",
      speechText: "The stage the project is at.",
      side: "top",
    },
    {
      id: "cp-performance",
      route: PROJECT_ROUTE,
      element: anchor("project-performance"),
      title: "Project: Financial Performance",
      description:
        "Expected against actual, line by line.",
      speechText: "Expected against actual, line by line.",
      side: "top",
    },
    {
      id: "cp-inv",
      route: `${PROJECT_ROUTE}/project-invoices`,
      element: anchor("project-invoices-stats"),
      title: "Project Invoices: Totals",
      description:
        "Invoices for this project, with what is paid, pending and overdue.",
      speechText: "The invoices of this project.",
      side: "bottom",
      via: {
        fromRoute: PROJECT_ROUTE,
        ...click(
          anchor("project-action-invoices"),
          "Open Invoices",
          "From the quick actions, click <b>View Invoices</b>.",
        ),
      },
    },
    {
      id: "cp-inv-toolbar",
      route: `${PROJECT_ROUTE}/project-invoices`,
      element: anchor("project-invoices-toolbar"),
      title: "Project Invoices: Search & Filter",
      description:
        "Search, filter or sort the invoices.",
      speechText: "Search, filter or sort the invoices.",
      side: "bottom",
      locked: true,
    },
    {
      id: "cp-inv-table",
      route: `${PROJECT_ROUTE}/project-invoices`,
      element: anchor("project-invoices-table"),
      title: "Project Invoices: List",
      description:
        "Open an invoice, mark it paid or send a reminder.",
      speechText: "Open an invoice, mark it paid or send a reminder.",
      side: "top",
      locked: true,
    },
    {
      id: "cp-inv-create",
      route: "/payments/new-invoice",
      element: anchor("new-invoice-form"),
      title: "Project Invoices: Create",
      description:
        "The project's details are filled in. Check the items and amounts. The invoice is only created when you press <b>Save</b>.",
      speechText: "Check the items and amounts, then save the invoice.",
      side: "top",
      locked: true,
      via: {
        fromRoute: `${PROJECT_ROUTE}/project-invoices`,
        ...click(
          anchor("project-invoice-create"),
          "Create an Invoice",
          "<b>Create New Invoice</b> starts an invoice for this project.",
        ),
      },
    },
    {
      id: "cp-bom",
      route: `${PROJECT_ROUTE}/bom`,
      element: anchor("project-bom-page"),
      title: "Project BOM",
      description:
        "The project's consolidated Bill of Materials.",
      speechText: "The project's bill of materials.",
      side: "top",
      via: {
        fromRoute: PROJECT_ROUTE,
        ...click(
          anchor("project-action-bom"),
          "Open BOM",
          "From the quick actions, click <b>View BOM</b>.",
        ),
      },
    },
    {
      id: "cp-bom-summary",
      route: `${PROJECT_ROUTE}/bom`,
      element: anchor("project-bom-summary"),
      title: "Project BOM: Summary",
      description:
        "The totals, and any data that is still missing.",
      speechText: "The totals, and any missing data.",
      side: "top",
    },
    {
      id: "cp-bom-download",
      route: `${PROJECT_ROUTE}/bom`,
      element: anchor("project-bom-download"),
      title: "Project BOM: Download",
      description:
        "Saves the BOM as Excel.",
      speechText: "Save the bill of materials as Excel.",
      side: "left",
      locked: true,
    },
    {
      id: "cp-pay",
      route: `${PROJECT_ROUTE}/project-payments`,
      element: anchor("project-payments-stats"),
      title: "Project Payments: Totals",
      description:
        "What the customer has paid, and what is pending or overdue.",
      speechText: "What the customer has paid, and what is pending.",
      side: "bottom",
      via: {
        fromRoute: PROJECT_ROUTE,
        ...click(
          anchor("project-action-payments"),
          "Open Payments",
          "From the quick actions, click <b>View Payments</b>.",
        ),
      },
    },
    {
      id: "cp-pay-toolbar",
      route: `${PROJECT_ROUTE}/project-payments`,
      element: anchor("project-payments-toolbar"),
      title: "Project Payments: Search & Filter",
      description:
        "Search, filter or sort the payments.",
      speechText: "Search, filter or sort the payments.",
      side: "bottom",
      locked: true,
    },
    {
      id: "cp-pay-table",
      route: `${PROJECT_ROUTE}/project-payments`,
      element: anchor("project-payments-table"),
      title: "Project Payments: List",
      description:
        "Every payment, with its invoice.",
      speechText: "Every payment, with its invoice.",
      side: "top",
      locked: true,
    },
    {
      id: "cp-delivery",
      route: `${PROJECT_ROUTE}/material-delivery`,
      element: anchor("project-delivery"),
      title: "Material Delivery",
      description:
        "The project's delivery: schedule, carrier and status.",
      speechText: "The project's delivery schedule, carrier and status.",
      side: "top",
      locked: true,
      via: {
        fromRoute: PROJECT_ROUTE,
        ...click(
          anchor("project-action-delivery"),
          "Open Material Delivery",
          "From the quick actions, click <b>Material Delivery</b>.",
        ),
      },
    },
    {
      id: "cp-quote",
      route: `${PROJECT_ROUTE}/project-quotation`,
      element: anchor("project-quotations"),
      title: "Project Quotation",
      description:
        "Every quotation prepared for this project. Open one to see it in full.",
      speechText: "Every quotation prepared for this project.",
      side: "top",
      locked: true,
      via: {
        fromRoute: PROJECT_ROUTE,
        ...click(
          anchor("project-action-quotation"),
          "Open Quotation",
          "From the quick actions, click <b>View Quotation</b>.",
        ),
      },
    },
    {
      id: "cp-agreement",
      route: PROJECT_ROUTE,
      element: anchor("project-action-agreement"),
      title: "View Agreement",
      description:
        "The last shortcut opens the signed agreement. That covers every page of a project.",
      speechText: "The last shortcut opens the signed agreement. That covers every page of a project.",
      side: "bottom",
      locked: true,
    },
  ],
};
