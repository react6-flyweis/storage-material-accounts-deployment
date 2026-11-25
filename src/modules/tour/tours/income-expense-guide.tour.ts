import type { TourDefinition } from "../tour.types";
import { anchor, click } from "./tour-helpers";
import { addIncomeModal, expenseTransactionModal, incomeTransactionModal } from "./panels";

/** Income, expenses and profit/loss in detail, including adding income. */
export const incomeExpenseGuideTour: TourDefinition = {
  id: "income-expense-guide",
  name: "Income & Expense Guide",
  description:
    "A project's income and expenses in detail, how to add income, and profit and loss.",
  estimatedMinutes: 3,
  steps: [
    {
      id: "inc-stats",
      route: "/project-wise-income",
      element: anchor("income-stats"),
      title: "Income: Totals",
      description:
        "Total, received, pending and overdue income.",
      speechText: "Total, received, pending and overdue income.",
      side: "bottom",
    },
    {
      id: "inc-table",
      route: "/project-wise-income",
      element: anchor("income-table"),
      title: "Income: By Project",
      description:
        "Every project with its income. Search, choose dates or sort by any column.",
      speechText: "Every project, with its income.",
      side: "top",
    },
    {
      id: "inc-detail",
      route: "/project-wise-income/:projectId",
      element: anchor("income-detail-summary"),
      title: "Income: Project Details",
      description:
        "One project's information, income figures and summary.",
      speechText: "One project, with its income in detail.",
      side: "bottom",
      via: {
        fromRoute: "/project-wise-income",
        ...click(
          anchor("income-row-view"),
          "Open a Project's Income",
          "Click the <b>eye</b> icon to open this project.",
          true,
        ),
      },
    },
    {
      id: "inc-transactions",
      route: "/project-wise-income/:projectId",
      element: anchor("income-detail-transactions"),
      title: "Income: Transactions",
      description:
        "Every income transaction for the project. Use the tabs to see only received, pending or overdue ones.",
      speechText: "Every income transaction, with tabs for received, pending and overdue.",
      side: "top",
      locked: true,
    },
    {
      id: "inc-transaction-detail",
      route: "/project-wise-income/:projectId",
      element: anchor("income-transaction-modal"),
      title: "Income: Transaction Details",
      description:
        "The transaction in full, with its invoice.",
      speechText: "The transaction in full, with its invoice.",
      panels: [incomeTransactionModal],
    },
    {
      id: "inc-add",
      route: "/project-wise-income/:projectId",
      element: anchor("income-add-modal"),
      title: "Income: Add",
      description:
        "Records income for this project. Nothing is added until you save.",
      speechText: "Record new income for this project.",
      panels: [addIncomeModal],
    },
    {
      id: "exp-stats",
      route: "/project-wise-expense",
      element: anchor("expense-stats"),
      title: "Expenses: Totals",
      description:
        "Total, approved and pending expenses, with the budget and its variance.",
      speechText: "Total, approved and pending expenses against the budget.",
      side: "bottom",
    },
    {
      id: "exp-table",
      route: "/project-wise-expense",
      element: anchor("expense-table"),
      title: "Expenses: By Project",
      description:
        "Every project with its expenses, budget and variance.",
      speechText: "Every project, with its expenses, budget and variance.",
      side: "top",
    },
    {
      id: "exp-detail",
      route: "/project-wise-expense/:projectId",
      element: anchor("expense-detail-summary"),
      title: "Expenses: Project Details",
      description:
        "The same layout as a project's income, with its expense figures.",
      speechText: "The same layout, with the project's expenses.",
      side: "bottom",
      via: {
        fromRoute: "/project-wise-expense",
        ...click(
          anchor("expense-row-view"),
          "Open a Project's Expenses",
          "Click the <b>eye</b> icon to open this project.",
          true,
        ),
      },
    },
    {
      id: "exp-transactions",
      route: "/project-wise-expense/:projectId",
      element: anchor("expense-detail-transactions"),
      title: "Expenses: Transactions",
      description:
        "Every expense for the project. Use the tabs to see only approved or pending ones.",
      speechText: "Every expense, with tabs for approved and pending.",
      side: "top",
      locked: true,
    },
    {
      id: "exp-transaction-detail",
      route: "/project-wise-expense/:projectId",
      element: anchor("expense-transaction-modal"),
      title: "Expenses: Transaction Details",
      description:
        "The expense in full, with its approval status.",
      speechText: "The expense in full, with its approval status.",
      panels: [expenseTransactionModal],
    },
    {
      id: "pl-filters",
      route: "/profit-loss",
      element: anchor("pl-filters"),
      title: "Profit & Loss: Filters",
      description:
        "Choose a date range or a single project.",
      speechText: "Choose a date range or a project.",
      side: "bottom",
      align: "end",
      locked: true,
    },
    {
      id: "pl-metrics",
      route: "/profit-loss",
      element: anchor("pl-metrics"),
      title: "Profit & Loss: Totals",
      description:
        "Total revenue, total expenses, net profit and average margin.",
      speechText: "Revenue, expenses, net profit and average margin.",
      side: "bottom",
    },
    {
      id: "pl-table",
      route: "/profit-loss",
      element: anchor("pl-table"),
      title: "Profit & Loss: Invoice Breakdown",
      description:
        "Revenue, expense and net profit for every invoice. Sort by any column.",
      speechText: "Revenue, expense and profit for every invoice.",
      side: "top",
    },
  ],
};
