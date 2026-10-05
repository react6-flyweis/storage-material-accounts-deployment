import MenuIcon1 from "@/assets/menuIcon1.svg";
import MenuIcon2 from "@/assets/sidebar_icons/sidebarDollerIcon.svg";
import MenuIcon3 from "@/assets/sidebar_icons/analyticsSideIcon.svg";
import MenuIcon4 from "@/assets/sidebar_icons/BoltIcon.svg";
import MenuIcon5 from "@/assets/sidebar_icons/CallIcon.svg";
import MenuIcon6 from "@/assets/sidebar_icons/BellIcon.svg";

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
      { label: "Order & Payments", path: "/order_payments" },
    ],
  },
  {
    title: "Analytics",
    color: "bg-[#EAB308]",
    icon: MenuIcon3,
    items: [
      { label: "WIP Profit", path: "/wip_profit" },
      { label: "COGS Analysis", path: "/cogs_analysis" },
    ],
  },
  {
    title: "Management",
    color: "bg-[#FD8D5B]",
    icon: MenuIcon4,
    items: [
      { label: "Expenses", path: "/expenses" },
      { label: "Reports", path: "/reports" },
      { label: "Taxation", path: "/taxation" },
      { label: "Income", path: "/income" },
      { label: "Labor Expenses", path: "/labor_expenses" },
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
