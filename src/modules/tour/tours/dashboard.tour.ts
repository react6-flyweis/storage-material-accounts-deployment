import type { TourStepConfig } from "../tour.types";
import { anchor } from "./tour-helpers";

/** The dashboard, part by part. It has no guide of its own. */
export const dashboardSteps: TourStepConfig[] = [
  {
    id: "dash-controls",
    route: "/dashboard",
    element: anchor("dashboard-controls"),
    title: "Dashboard: Period & Export",
    description:
      "Choose a period or exact dates. Every number below follows your choice. <b>Export</b> downloads the dashboard as a file.",
    speechText: "Choose a period or exact dates, or export the dashboard.",
    side: "bottom",
    locked: true,
  },
  {
    id: "dash-stats",
    route: "/dashboard",
    element: anchor("dashboard-stats"),
    title: "Dashboard: Key Figures",
    description:
      "Total Revenue, Total Expenses, Net Profit and Outstanding Payments for the selected period.",
    speechText: "Your key figures: revenue, expenses, net profit and outstanding payments.",
    side: "bottom",
    locked: true,
  },
  {
    id: "dash-invoice-report",
    route: "/dashboard",
    element: anchor("dashboard-invoice-report"),
    title: "Dashboard: Invoice Report",
    description:
      "Invoices generated, paid, unpaid and overdue. Delivery finance follows below it.",
    speechText: "What has been paid, what is unpaid and what is overdue.",
    side: "bottom",
    locked: true,
  },
  {
    id: "dash-charts",
    route: "/dashboard",
    element: anchor("dashboard-charts"),
    title: "Dashboard: Charts",
    description:
      "Projects under way and how revenue has moved. The charts around them compare order value with plant costs, and break down profit and cost.",
    speechText: "Projects in progress, and how revenue, profit and cost are moving.",
    side: "top",
  },
  {
    id: "dash-activity",
    route: "/dashboard",
    element: anchor("dashboard-activity"),
    title: "Dashboard: Transactions & Alerts",
    description:
      "The latest transactions, and reminders that need attention. Top carriers and vendors, upcoming payments and every project's budget are further down.",
    speechText: "Recent transactions, and reminders that need attention.",
    side: "top",
  },
];
