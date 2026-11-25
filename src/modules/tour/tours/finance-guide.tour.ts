import type { TourDefinition } from "../tour.types";
import { anchor, click } from "./tour-helpers";
import { budgetModal, marginAnalysisModal, orderPaymentModal, paymentApprovalModal } from "./panels";

/** Every finance page in detail, including adding, editing and approving payments. */
export const financeGuideTour: TourDefinition = {
  id: "finance-guide",
  name: "Finance Guide",
  description:
    "Every finance page in detail: payments, approvals, margins and budgets.",
  estimatedMinutes: 4,
  steps: [
    {
      id: "fin-payment-stats",
      route: "/payment_overview",
      element: anchor("payment-stats"),
      title: "All Payments: Totals",
      description:
        "Total order value, what has been received, what is outstanding and the profit on work in progress.",
      speechText: "Order value, received, outstanding and work in progress profit.",
      side: "bottom",
    },
    {
      id: "fin-payment-table",
      route: "/payment_overview",
      element: anchor("payment-table"),
      title: "All Payments: Orders",
      description:
        "Every order with its deposit, progress and final payments, outstanding amount and profit. Search or filter by status on the right.",
      speechText: "Every order, with its payment breakdown and profit.",
      side: "top",
    },
    {
      id: "fin-payment-view",
      route: "/payment_overview",
      element: anchor("order-payment-modal"),
      title: "All Payments: Order Details",
      description:
        "The order's full payment breakdown. <b>Update</b> takes you to its edit form.",
      speechText: "The order's full payment breakdown.",
      panels: [orderPaymentModal],
    },
    {
      id: "fin-payment-edit",
      route: "/payment_overview/edit/:id",
      element: anchor("payment-form"),
      title: "All Payments: Edit",
      description:
        "Correct the order's payments here. Nothing changes until you save.",
      speechText: "Correct the order's payments here.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/payment_overview",
        ...click(
          anchor("payment-row-edit"),
          "Edit an Order",
          "Click the <b>pencil</b> icon to edit this order's payments.",
          true,
        ),
      },
    },
    {
      id: "fin-payment-form",
      route: "/payment_overview/add",
      element: anchor("payment-form"),
      title: "Add an Order Payment",
      description:
        "Choose the quote or order, then enter its deposit, progress and final payments. Profit and margin fill in by themselves.",
      speechText: "Choose an order and enter its payments. Profit and margin are calculated for you.",
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
      id: "fin-approvals-stats",
      route: "/payment_approvals",
      element: anchor("approvals-stats"),
      title: "Payment Approvals: Queue Summary",
      description:
        "Pending, under review, approved and disputed requests. Click a card to filter the queue by it.",
      speechText: "See how many requests are pending, under review, approved or disputed.",
      side: "bottom",
      locked: true,
    },
    {
      id: "fin-approvals-workflow",
      route: "/payment_approvals",
      element: anchor("approvals-workflow"),
      title: "Payment Approvals: Workflow",
      description:
        "The stages every request goes through before it is paid.",
      speechText: "These are the stages every request goes through.",
      side: "bottom",
    },
    {
      id: "fin-approvals-table",
      route: "/payment_approvals",
      element: anchor("approvals-table"),
      title: "Payment Approvals: Queue",
      description:
        "Every invoice waiting for a decision, with its amount, due date and what it is linked to.",
      speechText: "Every invoice waiting for a decision.",
      side: "top",
    },
    {
      id: "fin-approvals-view",
      route: "/payment_approvals",
      element: anchor("payment-approval-modal"),
      title: "Payment Approvals: Review",
      description:
        "Check the invoice, then approve or dispute it. Nothing changes until you choose.",
      speechText: "Check the invoice, then approve it or dispute it.",
      panels: [paymentApprovalModal],
    },
    {
      id: "fin-margin-filters",
      route: "/margin_analysis",
      element: anchor("margin-filters"),
      title: "Margin Breakdown: Filters",
      description:
        "Choose the company, project, currency and date range to analyze, or export the report.",
      speechText: "Choose what to analyze, or export the report.",
      side: "bottom",
    },
    {
      id: "fin-margin-kpis",
      route: "/margin_analysis",
      element: anchor("margin-kpis"),
      title: "Margin Breakdown: Margins",
      description:
        "Gross, operating, net profit and contribution margins, plus the average selling price.",
      speechText: "Your gross, operating, net profit and contribution margins.",
      side: "bottom",
    },
    {
      id: "fin-margin-table",
      route: "/margin_analysis",
      element: anchor("margin-table"),
      title: "Margin Breakdown: Profit & Loss Summary",
      description:
        "Profit and loss per project. Click a row to open its analysis.",
      speechText: "Profit and loss for each project.",
      side: "top",
    },
    {
      id: "fin-margin-modal",
      route: "/margin_analysis",
      element: anchor("margin-analysis-modal"),
      title: "Margin Breakdown: Analysis",
      description:
        "Revenue, costs and profit in detail. Pick a project at the top.",
      speechText: "Revenue, costs and profit in detail.",
      panels: [marginAnalysisModal],
    },
    {
      id: "fin-budget-project",
      route: "/project_budget_details",
      element: anchor("budget-project"),
      title: "Budget vs Actual: Project",
      description:
        "The selected project with its budget, actual spend and variance. Switch projects from the menu at the top right.",
      speechText: "One project, with its budget, actual spend and variance.",
      side: "bottom",
    },
    {
      id: "fin-budget-configure",
      route: "/project_budget_details",
      element: anchor("budget-modal"),
      title: "Budget vs Actual: Configure",
      description:
        "Set a budget for each cost head. It applies only after you save.",
      speechText: "Set a budget for each cost head.",
      panels: [budgetModal],
    },
    {
      id: "fin-budget-table",
      route: "/project_budget_details",
      element: anchor("budget-table"),
      title: "Budget vs Actual: Breakdown",
      description:
        "Budget, actual and variance line by line.",
      speechText: "Budget, actual and variance, line by line.",
      side: "right",
    },
    {
      id: "fin-budget-overview",
      route: "/project_budget_details",
      element: anchor("budget-overview"),
      title: "Budget vs Actual: Overview",
      description:
        "The same figures as a chart, with a summary of the whole budget.",
      speechText: "The same figures as a chart, with a summary.",
      side: "left",
    },
  ],
};
