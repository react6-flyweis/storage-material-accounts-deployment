import type { TourDefinition } from "../tour.types";
import { anchor, click } from "./tour-helpers";
import { freightModal, logisticsModal, salaryModal } from "./panels";

/** Every cost page in detail, including the forms that add costs. */
export const costGuideTour: TourDefinition = {
  id: "cost-guide",
  name: "Cost Guide",
  description:
    "Every cost page in detail: salary, manpower, miscellaneous, freight, logistics, rent, items and variance.",
  estimatedMinutes: 6,
  steps: [
    {
      id: "cost-salary-stats",
      route: "/cost/salary-cost",
      element: anchor("salary-stats"),
      title: "Salary Cost: Totals",
      description:
        "Total salary cost, what has been paid and what is pending.",
      speechText: "Total salary cost, paid and pending.",
      side: "bottom",
    },
    {
      id: "cost-salary-table",
      route: "/cost/salary-cost",
      element: anchor("salary-table"),
      title: "Salary Cost: Employees",
      description:
        "Every salary entry with its deductions, net pay, approval and payslip. Filter, search or sort it here.",
      speechText: "Every salary entry, with its net pay, approval and payslip.",
      side: "top",
    },
    {
      id: "cost-salary-export",
      route: "/cost/salary-cost",
      element: anchor("salary-export"),
      title: "Salary Cost: Export",
      description:
        "Download the list as CSV, Excel or PDF. Most cost pages have this button.",
      speechText: "Download the list as a file. Most cost pages have this button.",
      side: "bottom",
      align: "end",
      locked: true,
    },
    {
      id: "cost-salary-view",
      route: "/cost/salary-cost",
      element: anchor("salary-modal"),
      title: "Salary Cost: Details",
      description:
        "The employee's salary in full.",
      speechText: "The employee's salary in full.",
      panels: [salaryModal],
    },
    {
      id: "cost-salary-form",
      route: "/cost/salary-cost/add",
      element: anchor("salary-form"),
      title: "Salary Cost: Add",
      description:
        "Choose the employee and date, then enter the salary and deduction. Fields marked <b>*</b> are required.",
      speechText: "Choose the employee, then enter the salary and deduction.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/cost/salary-cost",
        ...click(
          anchor("salary-add"),
          "Add a Salary Entry",
          "Use this button to add a salary entry.",
        ),
      },
    },
    {
      id: "cost-manpower-stats",
      route: "/cost/manpower-cost",
      element: anchor("manpower-stats"),
      title: "Manpower Cost: Totals",
      description:
        "Total cost, active workforce, working hours and average cost per hour.",
      speechText: "Total cost, workforce, hours and average cost per hour.",
      side: "bottom",
    },
    {
      id: "cost-manpower-table",
      route: "/cost/manpower-cost",
      element: anchor("manpower-table"),
      title: "Manpower Cost: Records",
      description:
        "Hours, overtime, rate and cost for each worker and project. Mark paid, edit or delete at the end of each row.",
      speechText: "Hours, overtime and cost for each worker.",
      side: "top",
      locked: true,
    },
    {
      id: "cost-manpower-edit",
      route: "/cost/manpower-cost/edit/:id",
      element: anchor("manpower-form"),
      title: "Manpower Cost: Edit",
      description:
        "Correct the hours, overtime or rate. Nothing changes until you press <b>Update</b>.",
      speechText: "Correct the hours, overtime or rate.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/cost/manpower-cost",
        ...click(
          anchor("manpower-row-edit"),
          "Edit a Record",
          "Click the <b>pencil</b> icon to edit this record.",
          true,
        ),
      },
    },
    {
      id: "cost-manpower-form",
      route: "/cost/manpower-cost/add",
      element: anchor("manpower-form"),
      title: "Manpower Cost: Add",
      description:
        "Choose the employee and project, then enter the hours, overtime and rate. The total is calculated for you.",
      speechText: "Enter the hours, overtime and rate. The total is calculated for you.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/cost/manpower-cost",
        ...click(
          anchor("manpower-add"),
          "Add Manpower Cost",
          "Use this button to add a record.",
        ),
      },
    },
    {
      id: "cost-misc-stats",
      route: "/cost/miscellaneous-cost",
      element: anchor("misc-cost-stats"),
      title: "Miscellaneous Cost: Totals",
      description:
        "Total cost, approved, pending approval and unplanned expenses.",
      speechText: "Total, approved, pending and unplanned expenses.",
      side: "bottom",
    },
    {
      id: "cost-misc-charts",
      route: "/cost/miscellaneous-cost",
      element: anchor("misc-cost-charts"),
      title: "Miscellaneous Cost: Overview",
      description:
        "Cost over time, and how it splits between categories.",
      speechText: "Cost over time, and by category.",
      side: "top",
    },
    {
      id: "cost-misc-projects",
      route: "/cost/miscellaneous-cost",
      element: anchor("misc-cost-projects"),
      title: "Miscellaneous Cost: By Project",
      description:
        "Each project's expenses against its budget.",
      speechText: "Each project's expenses against its budget.",
      side: "top",
    },
    {
      id: "cost-misc-records",
      route: "/cost/miscellaneous-cost",
      element: anchor("misc-cost-records"),
      title: "Miscellaneous Cost: Records",
      description:
        "Every expense with its category, payee and approval status.",
      speechText: "Every expense, with its approval status.",
      side: "top",
    },
    {
      id: "cost-misc-form",
      route: "/cost/miscellaneous-cost/add",
      element: anchor("misc-cost-form"),
      title: "Miscellaneous Cost: Add",
      description:
        "Fill in the expense and attach its receipt. It is sent for approval when you submit it.",
      speechText: "Fill in the expense. It is sent for approval when you submit it.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/cost/miscellaneous-cost",
        ...click(
          anchor("misc-cost-add"),
          "Add a Miscellaneous Cost",
          "Use this button to add an expense.",
        ),
      },
    },
    {
      id: "cost-freight-stats",
      route: "/cost/freight-cost",
      element: anchor("freight-stats"),
      title: "Freight Cost: Totals",
      description:
        "Total freight cost, active carriers, average cost per delivery and pending invoices.",
      speechText: "Freight cost, carriers, average cost and pending invoices.",
      side: "bottom",
    },
    {
      id: "cost-freight-charts",
      route: "/cost/freight-cost",
      element: anchor("freight-charts"),
      title: "Freight Cost: Charts",
      description:
        "The monthly trend, and how cost splits between carriers.",
      speechText: "The monthly trend, and cost by carrier.",
      side: "top",
    },
    {
      id: "cost-freight-carriers",
      route: "/cost/freight-cost",
      element: anchor("freight-carriers"),
      title: "Freight Cost: Carriers",
      description:
        "Each carrier's total cost and share.",
      speechText: "Each carrier's total cost and share.",
      side: "top",
    },
    {
      id: "cost-freight-table",
      route: "/cost/freight-cost",
      element: anchor("freight-table"),
      title: "Freight Cost: Records",
      description:
        "Every delivery with its cost, approval and payment status.",
      speechText: "Every delivery, with its cost and status.",
      side: "top",
    },
    {
      id: "cost-freight-view",
      route: "/cost/freight-cost",
      element: anchor("freight-modal"),
      title: "Freight Cost: Details",
      description:
        "The delivery in full, with its bids. A cost waiting for approval is decided here.",
      speechText: "The delivery in full.",
      panels: [freightModal],
    },
    {
      id: "cost-logistics-stats",
      route: "/cost/logistics-cost",
      element: anchor("logistics-stats"),
      title: "Logistics Cost: Totals",
      description:
        "Total cost, savings, pending invoices and disputed items.",
      speechText: "Total cost, savings, pending invoices and disputes.",
      side: "bottom",
    },
    {
      id: "cost-logistics-filters",
      route: "/cost/logistics-cost",
      element: anchor("logistics-filters"),
      title: "Logistics Cost: Filters",
      description:
        "Search, or filter by carrier, delivery company, project, status or payment status.",
      speechText: "Search and filter the records here.",
      side: "bottom",
    },
    {
      id: "cost-logistics-table",
      route: "/cost/logistics-cost",
      element: anchor("logistics-table"),
      title: "Logistics Cost: Records",
      description:
        "Every logistics record, with its costs and status.",
      speechText: "Every logistics record, with its costs and status.",
      side: "top",
    },
    {
      id: "cost-logistics-view",
      route: "/cost/logistics-cost",
      element: anchor("logistics-modal"),
      title: "Logistics Cost: Details",
      description:
        "The record in full, with its invoices and delivery. A cost waiting for approval is decided here.",
      speechText: "The record in full.",
      panels: [logisticsModal],
    },
    {
      id: "cost-logistics-form",
      route: "/cost/logistics-cost/add",
      element: anchor("logistics-form"),
      title: "Logistics Cost: Add",
      description:
        "Look up a delivery ID and its project fills in. Then enter the final amount and payment status.",
      speechText: "Look up a delivery, then enter the final amount.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/cost/logistics-cost",
        ...click(
          anchor("logistics-add"),
          "Add a Logistic Cost",
          "Use this button to add a record.",
        ),
      },
    },
    {
      id: "cost-rent-stats",
      route: "/cost/rent-cost",
      element: anchor("rent-stats"),
      title: "Rent Cost: Totals",
      description:
        "Total, monthly, paid, pending and upcoming rent.",
      speechText: "Total, monthly, paid, pending and upcoming rent.",
      side: "bottom",
    },
    {
      id: "cost-rent-upcoming",
      route: "/cost/rent-cost",
      element: anchor("rent-upcoming"),
      title: "Rent Cost: Upcoming Payments",
      description:
        "Rent due soon. Mark it paid from its row.",
      speechText: "Rent that is due soon.",
      side: "top",
      locked: true,
    },
    {
      id: "cost-rent-properties",
      route: "/cost/rent-cost",
      element: anchor("rent-properties"),
      title: "Rent Cost: Properties",
      description:
        "Every rented property with its landlord, rent and lease.",
      speechText: "Every rented property, with its landlord and lease.",
      side: "top",
      locked: true,
    },
    {
      id: "cost-rent-form",
      route: "/cost/rent-cost/add",
      element: anchor("rent-form"),
      title: "Rent Cost: Add",
      description:
        "Enter the property, landlord, rent, payment schedule and lease dates.",
      speechText: "Enter the property, landlord, rent and lease dates.",
      side: "top",
      locked: true,
      via: {
        fromRoute: "/cost/rent-cost",
        ...click(
          anchor("rent-add"),
          "Add Rent",
          "Use this button to add a property.",
        ),
      },
    },
    {
      id: "cost-item-stats",
      route: "/cost/item-cost-list",
      element: anchor("item-cost-stats"),
      title: "Item Cost List: Totals",
      description:
        "Total item cost, number of items and newly added ones.",
      speechText: "Total item cost, items, and new additions.",
      side: "bottom",
    },
    {
      id: "cost-item-filters",
      route: "/cost/item-cost-list",
      element: anchor("item-cost-filters"),
      title: "Item Cost List: Search & Sort",
      description:
        "Search for a part, filter by cost unit, or change the order.",
      speechText: "Search, filter or sort the parts.",
      side: "bottom",
    },
    {
      id: "cost-item-table",
      route: "/cost/item-cost-list",
      element: anchor("item-cost-table"),
      title: "Item Cost List: Parts",
      description:
        "Every part with its MBS cost next to the current market cost.",
      speechText: "Every part, with its cost and the market cost.",
      side: "top",
    },
    {
      id: "cost-variance-stats",
      route: "/cost/cost-variance",
      element: anchor("variance-stats"),
      title: "Cost Variance: Totals",
      description:
        "Net variance, and how many items are over, under or on budget.",
      speechText: "Net variance, and what is over, under or on budget.",
      side: "bottom",
    },
    {
      id: "cost-variance-alerts",
      route: "/cost/cost-variance",
      element: anchor("variance-alerts"),
      title: "Cost Variance: Alerts",
      description:
        "The largest differences between awarded and actual cost. Check these first.",
      speechText: "The largest differences. Check these first.",
      side: "bottom",
    },
    {
      id: "cost-variance-chart",
      route: "/cost/cost-variance",
      element: anchor("variance-chart"),
      title: "Cost Variance: Trend",
      description:
        "Awarded against actual cost over time.",
      speechText: "Awarded against actual cost over time.",
      side: "top",
    },
    {
      id: "cost-variance-filters",
      route: "/cost/cost-variance",
      element: anchor("variance-filters"),
      title: "Cost Variance: Filters",
      description:
        "Search, or filter by project, status or dates.",
      speechText: "Search, or filter by project, status or dates.",
      side: "top",
    },
    {
      id: "cost-variance-table",
      route: "/cost/cost-variance",
      element: anchor("variance-table"),
      title: "Cost Variance: Records",
      description:
        "Awarded amount, actual cost and variance line by line.",
      speechText: "Awarded amount, actual cost and variance, line by line.",
      side: "top",
    },
  ],
};
