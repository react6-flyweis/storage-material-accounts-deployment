import type { TourDefinition } from "../tour.types";
import { anchor } from "./tour-helpers";
import { dashboardSteps } from "./dashboard.tour";
import { financeOverviewSteps } from "./finance-overview";
import { incomeExpenseOverviewSteps } from "./income-expense-overview";
import { taxationSteps } from "./taxation.tour";
import { costOverviewSteps } from "./cost-overview";
import { invoiceOverviewSteps } from "./invoice-overview";

/**
 * A light overview: the layout, then every sidebar page in order. Sections with
 * a guide show only their lists; the guide, offered on the section's first list,
 * covers details, adding and editing.
 */
export const accountsOverviewTour: TourDefinition = {
  id: "accounts-overview",
  name: "Accounts Panel Walkthrough",
  description:
    "The layout, then every section in sidebar order: dashboard, customers, finance, income and expenses, taxation, cost, invoices, notifications and communication.",
  estimatedMinutes: 7,
  steps: [
    {
      id: "step-sidebar",
      route: "",
      element: anchor("sidebar-nav"),
      title: "Main Navigation",
      description:
        "Every section of the panel: dashboard, customers, finance, income and expenses, taxation, cost, invoices, notifications and communication.",
      speechText: "Use the sidebar to move between sections.",
      side: "right",
      locked: true,
    },
    {
      id: "step-header-search",
      route: "",
      element: anchor("header-search"),
      title: "Instant Global Search",
      description:
        "Find any customer or project from anywhere in the panel.",
      speechText: "Find any customer or project from anywhere.",
      side: "bottom",
      locked: true,
    },
    {
      id: "step-tour-hub",
      route: "",
      element: anchor("tour-hub-btn"),
      title: "Tour Hub & Help",
      description:
        "Replay this tour, start a detailed guide or mute the voice from this menu.",
      speechText: "Replay this tour or start a detailed guide from the help menu.",
      side: "bottom",
      align: "end",
      locked: true,
    },
    ...dashboardSteps,
    {
      id: "step-customers",
      route: "/customers",
      element: anchor("customers-table"),
      title: "Customers: List",
      description:
        "Every customer with their contact details. The <b>eye</b> icon opens their profile, projects and invoices.",
      speechText: "Every customer. Use the eye icon to open one.",
      side: "top",
      locked: true,
      branch: {
        tourId: "customer-project",
        label: "Explore a Customer Project (4 min)",
        description:
          "Want a full walkthrough of a customer, their project and every page you can open from it?",
        resumeStepId: "step-finance-pages",
      },
    },
    ...financeOverviewSteps,
    ...incomeExpenseOverviewSteps,
    ...taxationSteps,
    ...costOverviewSteps,
    ...invoiceOverviewSteps,
    {
      id: "step-notifications",
      route: "/notification",
      element: anchor("notifications-list"),
      title: "Notifications: List",
      description:
        "Click a notification to open what it is about, or mark it as read. Filter them at the top.",
      speechText: "Click a notification to open what it is about.",
      side: "top",
      locked: true,
    },
    {
      id: "step-chat",
      route: "/communication",
      element: anchor("communication-page"),
      title: "Communication",
      description:
        "Chat with customers and your team in one place.<br><br>You're all set! Open the help menu to replay this tour or start a guide.",
      speechText: "Chat with customers and your team. You're all set!",
      side: "top",
      locked: true,
    },
  ],
};
