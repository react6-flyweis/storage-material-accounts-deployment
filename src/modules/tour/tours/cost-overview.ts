import type { TourStepConfig } from "../tour.types";
import { anchor } from "./tour-helpers";

/** One step per cost page; the Cost Guide goes into detail. */
export const costOverviewSteps: TourStepConfig[] = [
  {
    id: "step-cost-salary",
    route: "/cost/salary-cost",
    element: anchor("salary-table"),
    title: "Salary Cost",
    description:
      "Every salary entry with its deductions, net pay, approval and payslip.",
    speechText: "Every salary entry, with its net pay, approval and payslip.",
    side: "top",
    locked: true,
    branch: {
      tourId: "cost-guide",
      label: "Explore Costs in Depth (6 min)",
      description:
        "Want to see every cost page in detail, including how to add each cost?",
      resumeStepId: "step-invoices-project",
    },
  },
  {
    id: "step-cost-manpower",
    route: "/cost/manpower-cost",
    element: anchor("manpower-table"),
    title: "Manpower Cost",
    description:
      "Hours, overtime, rate and cost for each worker and project.",
    speechText: "Hours, overtime and cost for each worker.",
    side: "top",
    locked: true,
  },
  {
    id: "step-cost-misc",
    route: "/cost/miscellaneous-cost",
    element: anchor("misc-cost-projects"),
    title: "Miscellaneous Cost: By Project",
    description:
      "Each project's other expenses against its budget.",
    speechText: "Each project's other expenses against its budget.",
    side: "top",
    locked: true,
  },
  {
    id: "step-cost-freight",
    route: "/cost/freight-cost",
    element: anchor("freight-table"),
    title: "Freight Cost",
    description:
      "Every delivery with its cost, approval and payment status.",
    speechText: "Every delivery, with its cost and status.",
    side: "top",
    locked: true,
  },
  {
    id: "step-cost-logistics",
    route: "/cost/logistics-cost",
    element: anchor("logistics-table"),
    title: "Logistics Cost",
    description:
      "Every logistics record, with its costs and status.",
    speechText: "Every logistics record, with its costs and status.",
    side: "top",
    locked: true,
  },
  {
    id: "step-cost-rent",
    route: "/cost/rent-cost",
    element: anchor("rent-upcoming"),
    title: "Rent Cost: Upcoming Payments",
    description:
      "Rent due soon, with your rented properties below it.",
    speechText: "Rent that is due soon, and your rented properties.",
    side: "top",
    locked: true,
  },
  {
    id: "step-cost-item",
    route: "/cost/item-cost-list",
    element: anchor("item-cost-table"),
    title: "Item Cost List",
    description:
      "Every part with its MBS cost next to the current market cost.",
    speechText: "Every part, with its cost and the market cost.",
    side: "top",
    locked: true,
  },
  {
    id: "step-cost-variance",
    route: "/cost/cost-variance",
    element: anchor("variance-table"),
    title: "Cost Variance",
    description:
      "Awarded amount, actual cost and variance line by line.",
    speechText: "Awarded amount, actual cost and variance, line by line.",
    side: "top",
    locked: true,
  },
];
