import type { TourStepConfig } from "../tour.types";
import { anchor } from "./tour-helpers";

/** One step per income and expense page; the Income & Expense Guide goes into detail. */
export const incomeExpenseOverviewSteps: TourStepConfig[] = [
  {
    id: "step-income",
    route: "/project-wise-income",
    element: anchor("income-table"),
    title: "Income Project-wise",
    description:
      "Every project with its income. Search, choose dates or sort by any column.",
    speechText: "Every project, with its income.",
    side: "top",
    locked: true,
    branch: {
      tourId: "income-expense-guide",
      label: "Explore Income & Expenses in Depth (3 min)",
      description:
        "Want to open a project's income and expenses, and see how to add income?",
      resumeStepId: "tax-records",
    },
  },
  {
    id: "step-expense",
    route: "/project-wise-expense",
    element: anchor("expense-table"),
    title: "Expenses Project-wise",
    description:
      "The same layout, with each project's expenses, budget and variance.",
    speechText: "The same layout, for expenses.",
    side: "top",
    locked: true,
  },
  {
    id: "step-profit-loss",
    route: "/profit-loss",
    element: anchor("pl-table"),
    title: "Profit/Loss Analysis",
    description:
      "Revenue, expense and net profit for every invoice. Sort by any column.",
    speechText: "Revenue, expense and profit for every invoice.",
    side: "top",
    locked: true,
  },
];
