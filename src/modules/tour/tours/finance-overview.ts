import type { TourStepConfig } from "../tour.types";
import { anchor } from "./tour-helpers";

/** One step per finance page; the Finance Guide goes into detail. */
export const financeOverviewSteps: TourStepConfig[] = [
  {
    id: "step-finance-pages",
    route: "/payment_overview",
    element: anchor("sidepanel"),
    title: "Section Pages",
    description:
      "The pages of the section you are in are listed here. Most sections have several.",
    speechText: "The pages of each section are listed here.",
    side: "right",
    locked: true,
  },
  {
    id: "step-finance-payments",
    route: "/payment_overview",
    element: anchor("payment-table"),
    title: "All Payments",
    description:
      "Every order with its deposit, progress and final payments, outstanding amount and profit. Search or filter by status on the right.",
    speechText: "Every order, with its payment breakdown and profit.",
    side: "top",
    locked: true,
    branch: {
      tourId: "finance-guide",
      label: "Explore Finance in Depth (4 min)",
      description:
        "Want to see every finance page in detail, including how to add, edit and approve payments?",
      resumeStepId: "step-income",
    },
  },
  {
    id: "step-finance-approvals",
    route: "/payment_approvals",
    element: anchor("approvals-table"),
    title: "Payment Approvals",
    description:
      "Every invoice waiting for a decision, with its amount, due date and what it is linked to.",
    speechText: "Every invoice waiting for a decision.",
    side: "top",
    locked: true,
  },
  {
    id: "step-finance-margin",
    route: "/margin_analysis",
    element: anchor("margin-table"),
    title: "Margin Breakdown",
    description:
      "Profit and loss per project. Click a row to open its analysis.",
    speechText: "Profit and loss for each project.",
    side: "top",
    locked: true,
  },
  {
    id: "step-finance-budget",
    route: "/project_budget_details",
    element: anchor("budget-table"),
    title: "Budget vs Actual",
    description:
      "Budget, actual and variance line by line. Switch projects from the menu at the top right.",
    speechText: "Budget, actual and variance, line by line.",
    side: "right",
    locked: true,
  },
];
