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
    title: "Customer",
    color: "bg-[#EAB308]",
    icon: CustomerIcon,
    items: [
      {
        label: "Customers",
        path: "/customers",
      },
    ],
  },
  {
    title: "Payments",
    color: "bg-[#A855F7]",
    icon: MenuIcon2,
    items: [
      {
        label: "Payment Overview",
        path: "/payment_overview",
      },
      {
        label: "Payment Approvals",
        path: "/payment_approvals",
      },
      // { label: "Order & Payments", path: "/order_payments" },
      { label: "Margin Analysis", path: "/margin_analysis" },
      { label: "Project Details", path: "/project_budget_details" },
    ],
  },

  {
    title: "Project-wise Income",
    color: "bg-[#EAB308]",
    icon: MenuIcon3,
    items: [
      { label: "Project-wise Income", path: "/project-wise-income" },
      { label: "Project-wise Expense", path: "/project-wise-expense" },
      { label: "Profit & Loss", path: "/profit-loss" },
    ],
  },
  {
    title: "Cost",
    color: "bg-[#10B981]",
    icon: CostIcon,
    items: [
      { label: "Salary Cost", path: "/cost/salary-cost" },
      { label: "Manpower Cost", path: "/cost/manpower-cost" },
    ],
  },
  {
    title: "Tax & Filing",
    color: "bg-[#FD8D5B]",
    path: "/tax-and-filing",
    icon: MenuIcon4,
    items: [
      { label: "State Wise Tax", path: "/state-wise-tax" },
      { label: "Project Wise Tax", path: "/project-wise-tax" },
    ],
  },
  {
    title: "Project Invoices",
    color: "bg-[#2D2D2D]",
    icon: InvoiceIcon,
    path: "/invoices/project-invoices",
    items: [
      { label: "Vendor Invoices", path: "/invoices/vendor-invoices" },
      { label: "Carrier Invoices", path: "/invoices/carrier-invoices" },
      { label: "Miscellaneous Inv", path: "/invoices/miscellaneous-invoices" },
      { label: "Quotation-wise Profit / Loss", path: "/invoices/quotation-profit-loss" },
    ],
  },
  {
    title: "Communication",
    color: "bg-[#FFC107]",
    icon: MenuIcon5,
    path: "/communication",
  },
  {
    title: "Notifications",
    color: "bg-black",
    icon: MenuIcon6,
    path: "/notification",
  },
];
