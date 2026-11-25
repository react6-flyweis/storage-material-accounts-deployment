import type { TourPageIntro } from "../tour.types";
import { anchor, CUSTOMER_ROUTE, PROJECT_ROUTE } from "./tour-helpers";

/**
 * What each page is for. Said in the click hint that leads to the page or, when
 * a tour gets there without one, shown over the whole page before its sections.
 * Keyed by step route, without the query string.
 */
export const PAGE_INTROS: Partial<Record<string, TourPageIntro>> = {
  "/dashboard": {
    title: "Financial Overview",
    description: "Your daily starting point, with revenue, costs, payments and alerts on one page.",
  },
  "/customers": {
    title: "Customers",
    description: "Every customer, with totals on top and the list below.",
  },
  [CUSTOMER_ROUTE]: {
    title: "Customer Details",
    description: "Everything about one customer: profile, projects, profitability and invoices.",
  },
  [PROJECT_ROUTE]: {
    title: "Project Details",
    description: "One project's finances on a single page. Next, we'll go through each section.",
  },
  [`${PROJECT_ROUTE}/project-invoices`]: {
    title: "Project Invoices",
    description: "Every invoice raised for this project.",
  },
  [`${PROJECT_ROUTE}/project-payments`]: {
    title: "Project Payments",
    description: "Every payment made for this project.",
  },
  "/payment_overview": {
    title: "All Payments",
    description: "Every order and how much of it has been paid.",
  },
  "/payment_overview/add": {
    title: "Add an Order Payment",
    description: "The form that records an order's payments.",
    coveredBy: anchor("payment-form"),
  },
  "/payment_approvals": {
    title: "Payment Approvals",
    description: "Payment requests waiting for a decision, across every type of invoice.",
  },
  "/margin_analysis": {
    title: "Margin Breakdown",
    description: "How much you keep of what you sell, overall and per project.",
  },
  "/project_budget_details": {
    title: "Budget vs Actual",
    description: "What a project was expected to cost, against what it really cost.",
  },
  "/project-wise-income": {
    title: "Income Project-wise",
    description: "What every project has brought in.",
  },
  "/project-wise-income/:projectId": {
    title: "Project Income",
    description: "One project's income, with every transaction.",
  },
  "/project-wise-expense": {
    title: "Expenses Project-wise",
    description: "What every project has cost.",
  },
  "/project-wise-expense/:projectId": {
    title: "Project Expenses",
    description: "One project's expenses, with every transaction.",
  },
  "/profit-loss": {
    title: "Profit/Loss Analysis",
    description: "Revenue, expenses and profit together.",
  },
  "/tax-and-filing": {
    title: "Tax & Filing",
    description: "Sales tax collected on your invoices, and its filing.",
  },
  "/state-wise-tax": {
    title: "State Wise Tax",
    description: "Sales tax per state.",
  },
  "/project-wise-tax": {
    title: "Project Wise Tax",
    description: "Sales tax per project.",
  },
  "/cost/salary-cost": {
    title: "Salary Cost",
    description: "What you pay your employees.",
    coveredBy: anchor("salary-table"),
  },
  "/cost/manpower-cost": {
    title: "Manpower Cost",
    description: "Labor hours on projects, and what they cost.",
    coveredBy: anchor("manpower-table"),
  },
  "/cost/miscellaneous-cost": {
    title: "Miscellaneous Cost",
    description: "Expenses that fit nowhere else.",
  },
  "/cost/freight-cost": {
    title: "Freight Cost",
    description: "What deliveries cost, per carrier.",
    coveredBy: anchor("freight-table"),
  },
  "/cost/logistics-cost": {
    title: "Logistics Cost",
    description: "What logistics cost, per delivery.",
    coveredBy: anchor("logistics-table"),
  },
  "/cost/rent-cost": {
    title: "Rent Cost",
    description: "The properties you rent, and their payments.",
  },
  "/cost/item-cost-list": {
    title: "Item Cost List",
    description: "What every part costs.",
    coveredBy: anchor("item-cost-table"),
  },
  "/cost/cost-variance": {
    title: "Cost Variance",
    description: "Where actual cost differs from what was awarded.",
    coveredBy: anchor("variance-table"),
  },
  "/invoices": {
    title: "Project Invoices",
    description: "Invoices sent to your customers.",
    coveredBy: anchor("invoice-table"),
  },
  "/invoices/project-invoices/:id": {
    title: "Invoice Preview",
    description: "One invoice, ready to download or send.",
  },
  "/invoices/vendor-invoices": {
    title: "Vendor Invoices",
    description: "Invoices your vendors sent you.",
    coveredBy: anchor("vendor-invoice-table"),
  },
  "/invoices/vendor-invoices/:id": {
    title: "Vendor Invoice",
    description: "One vendor invoice.",
  },
  "/invoices/carrier-invoices": {
    title: "Carrier Invoices",
    description: "Invoices your carriers sent you.",
    coveredBy: anchor("carrier-invoice-table"),
  },
  "/invoices/carrier-invoices/:id": {
    title: "Carrier Invoice",
    description: "One carrier invoice.",
  },
  "/invoices/miscellaneous-invoices": {
    title: "Miscellaneous Invoices",
    description: "Invoices from anyone else.",
    coveredBy: anchor("misc-invoice-table"),
  },
  "/invoices/quotation-profit-loss": {
    title: "Quotation-wise Profit / Loss",
    description: "What each quotation promised against what it earned.",
    coveredBy: anchor("quotation-pl-table"),
  },
  "/notification": {
    title: "Notifications",
    description: "Payment approvals, billing alerts and messages.",
  },
  "/communication": {
    title: "Communication",
    description: "Customer and team chats.",
    coveredBy: anchor("communication-page"),
  },
};
