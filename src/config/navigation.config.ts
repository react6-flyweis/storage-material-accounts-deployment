import MenuIcon1 from "@/assets/menuIcon1.svg";
import MenuIcon2 from "@/assets/sidebar_icons/sidebarDollerIcon.svg";
import MenuIcon3 from "@/assets/sidebar_icons/analyticsSideIcon.svg";
import MenuIcon4 from "@/assets/sidebar_icons/BoltIcon.svg";
import MenuIcon5 from "@/assets/sidebar_icons/CallIcon.svg";
import MenuIcon6 from "@/assets/sidebar_icons/BellIcon.svg";
import CustomerIcon from "@/assets/sidebar_icons/CustomerIcon.svg";
// import TaxFilingIcon from "@/assets/sidebar_icons/tax-filing.svg";

import CostIcon from "@/assets/sidebar_icons/costIcon.svg";
import InvoiceIcon from "@/assets/sidebar_icons/InvoiceIcon.svg";

export type SubNavItem = {
  label: string;
  path: string;
};

export type NavItem = {
  title: string;
  color: string;
  icon: string;
  path?: string;
  items?: SubNavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    color: "bg-[#FD8D5B]",
    icon: MenuIcon1,
    path: "/dashboard",
  },
    {
    title: "Customers",
    color: "bg-[#EAB308]",
    icon: CustomerIcon,
    path : "/customers",
  },
  {
    title: "Finance",
    color: "bg-[#A855F7]",
    icon: MenuIcon2,
    items: [
      {
        label: "All Payments",
        path: "/payment_overview",
      },
      {
        label: "Payment Approvals",
        path: "/payment_approvals",
      },
      // { label: "Order & Payments", path: "/order_payments" },
      { label: "Margin Breakdown", path: "/margin_analysis" },
      { label: "Budget Vs Actual", path: "/project_budget_details" },
    ],
  },

  {
    title: "Income / Expenses",
    color: "bg-[#EAB308]",
    icon: MenuIcon3,
    items: [
      { label: "Income Project-wise", path: "/project-wise-income" },
      { label: "Expenses Project-wise", path: "/project-wise-expense" },
      { label: "Profit/Loss Analysis", path: "/profit-loss" },
    ],
  },
  {
    title: "Taxation",
    color: "bg-[#FD8D5B]",
    icon: MenuIcon4,
    items: [
      { label: "Tax & Filing", path: "/tax-and-filing" },
      { label: "State Wise Tax", path: "/state-wise-tax" },
      { label: "Project Wise Tax", path: "/project-wise-tax" },
    ],
  },
    {
    title: "Cost",
    color: "bg-[#2B7FFF]",
    icon: CostIcon,
    items: [
      { label: "Salary Cost", path: "/cost/salary-cost" },
      { label: "Manpower Cost", path: "/cost/manpower-cost" },
    ],
  },
  {
    title: "Invoices",
    color: "bg-[#2D2D2D]",
    icon: InvoiceIcon,
    items: [
      { label: "Project Invoices", path: "/invoices" },
      { label: "Vendor Invoices", path: "/invoices/vendor-invoices" },
      { label: "Carrier Invoices", path: "/invoices/carrier-invoices" },
      { label: "Miscellaneous Inv", path: "/invoices/miscellaneous-invoices" },
      { label: "Quotation-wise Profit / Loss", path: "/invoices/quotation-profit-loss" },
    ],
  },

  {
    title: "Notifications",
    color: "bg-black",
    icon: MenuIcon6,
    path: "/notification",
  },
    {
    title: "Communication",
    color: "bg-[#3AB449]",
    icon: MenuIcon5,
    path: "/communication",
  },
];
