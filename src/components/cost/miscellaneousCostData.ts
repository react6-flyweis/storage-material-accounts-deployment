export interface ProjectWiseMiscCost {
  id: string;
  project: string;
  customer: {
    name: string;
    avatar: string;
  };
  expensesCount: number;
  amount: number;
  amountFormatted: string;
  budget: number;
  budgetFormatted: string;
  variance: number;
  varianceFormatted: string;
  status: "Over" | "Under";
}

export const INITIAL_PROJECT_WISE_MISC_COST: ProjectWiseMiscCost[] = [
  {
    id: "p1",
    project: "SMDT Warehouse",
    customer: {
      name: "Linda Ray",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
    },
    expensesCount: 18,
    amount: 184000,
    amountFormatted: "$1.84L",
    budget: 150000,
    budgetFormatted: "$1.50L",
    variance: 34000,
    varianceFormatted: "+$34K",
    status: "Over",
  },
  {
    id: "p2",
    project: "Steel Unit",
    customer: {
      name: "Elliot Murray",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    expensesCount: 14,
    amount: 142000,
    amountFormatted: "$1.42L",
    budget: 160000,
    budgetFormatted: "$1.60L",
    variance: -18000,
    varianceFormatted: "-$18K",
    status: "Under",
  },
  {
    id: "p3",
    project: "SMDT Warehouse",
    customer: {
      name: "Rebecca Smtih",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    },
    expensesCount: 11,
    amount: 96000,
    amountFormatted: "$96K",
    budget: 110000,
    budgetFormatted: "$1.10L",
    variance: -14000,
    varianceFormatted: "-$14K",
    status: "Under",
  },
  {
    id: "p4",
    project: "Industrial Shed",
    customer: {
      name: "Connie Waters",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
    },
    expensesCount: 16,
    amount: 158000,
    amountFormatted: "$1.58L",
    budget: 145000,
    budgetFormatted: "$1.45L",
    variance: 13000,
    varianceFormatted: "+$13K",
    status: "Over",
  },
  {
    id: "p5",
    project: "Warehouse Expansion",
    customer: {
      name: "Anthony Lewis",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    expensesCount: 12,
    amount: 135000,
    amountFormatted: "$1.35L",
    budget: 140000,
    budgetFormatted: "$1.40L",
    variance: -5000,
    varianceFormatted: "-$5K",
    status: "Under",
  },
  {
    id: "p6",
    project: "ABC Warehouse",
    customer: {
      name: "Sophia Martinez",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    expensesCount: 20,
    amount: 195000,
    amountFormatted: "$1.95L",
    budget: 175000,
    budgetFormatted: "$1.75L",
    variance: 20000,
    varianceFormatted: "+$20K",
    status: "Over",
  },
];

export interface MiscExpenseRecord {
  id: string;
  date: string;
  expense: string;
  category: string;
  project: string;
  vendor: string;
  amount: number;
  amountFormatted: string;
  approvalStatus: "Approved" | "Pending" | "Rejected";
}

export const INITIAL_MISC_EXPENSE_RECORDS: MiscExpenseRecord[] = [
  {
    id: "e1",
    date: "20 Jun",
    expense: "Welding Tools",
    category: "Equipment",
    project: "SMDT Warehouse",
    vendor: "ABC Tools",
    amount: 1440,
    amountFormatted: "$1,440",
    approvalStatus: "Pending",
  },
  {
    id: "e2",
    date: "20 Jun",
    expense: "Office Stationery",
    category: "Office Supplies",
    project: "Steel Unit",
    vendor: "Office Mart",
    amount: 1440,
    amountFormatted: "$1,440",
    approvalStatus: "Approved",
  },
  {
    id: "e3",
    date: "20 Jun",
    expense: "Machine Repair",
    category: "Maintenance",
    project: "SMDT Warehouse",
    vendor: "XYZ Services",
    amount: 1440,
    amountFormatted: "$1,440",
    approvalStatus: "Approved",
  },
  {
    id: "e4",
    date: "20 Jun",
    expense: "Internet Charges",
    category: "Communication",
    project: "Industrial Shed",
    vendor: "Airtel",
    amount: 1440,
    amountFormatted: "$1,440",
    approvalStatus: "Approved",
  },
  {
    id: "e5",
    date: "20 Jun",
    expense: "Safety Equipment",
    category: "Safety",
    project: "Warehouse Expansion",
    vendor: "Safety Pro",
    amount: 1440,
    amountFormatted: "$1,440",
    approvalStatus: "Approved",
  },
  {
    id: "e6",
    date: "20 Jun",
    expense: "Welding Tools",
    category: "Equipment",
    project: "SMDT Warehouse",
    vendor: "ABC Tools",
    amount: 1440,
    amountFormatted: "$1,440",
    approvalStatus: "Approved",
  },
  {
    id: "e7",
    date: "20 Jun",
    expense: "Office Stationery",
    category: "Office Supplies",
    project: "Steel Unit",
    vendor: "Office Mart",
    amount: 1440,
    amountFormatted: "$1,440",
    approvalStatus: "Approved",
  },
  {
    id: "e8",
    date: "20 Jun",
    expense: "Machine Repair",
    category: "Maintenance",
    project: "SMDT Warehouse",
    vendor: "XYZ Services",
    amount: 1440,
    amountFormatted: "$1,440",
    approvalStatus: "Approved",
  },
  {
    id: "e9",
    date: "20 Jun",
    expense: "Internet Charges",
    category: "Communication",
    project: "Industrial Shed",
    vendor: "Airtel",
    amount: 1440,
    amountFormatted: "$1,440",
    approvalStatus: "Approved",
  },
  {
    id: "e10",
    date: "20 Jun",
    expense: "Safety Equipment",
    category: "Safety",
    project: "Warehouse Expansion",
    vendor: "Safety Pro",
    amount: 1440,
    amountFormatted: "$1,440",
    approvalStatus: "Approved",
  },
];

export interface MiscellaneousCostEntry {
  id: string;
  expenseId: string;
  title: string;
  category: "Repairs & Maintenance" | "Office Supplies" | "Utilities" | "Equipment & Tools" | "Travel" | "Software" | "Others" | string;
  department: string;
  project: string;
  amount: number;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
  expenseType: "Planned" | "Unplanned";
  paymentStatus: "Paid" | "Unpaid";
  recordedBy: {
    name: string;
    avatar: string;
  };
  description?: string;
}

export const INITIAL_MISC_COST_DATA: MiscellaneousCostEntry[] = [
  {
    id: "1",
    expenseId: "EXP-1001",
    title: "HVAC Maintenance & Filter Replacement",
    category: "Repairs & Maintenance",
    department: "Operations",
    project: "ABC Warehouse",
    amount: 186000,
    date: "12 Oct 2024",
    status: "Approved",
    expenseType: "Planned",
    paymentStatus: "Paid",
    recordedBy: {
      name: "Anthony Lewis",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    description: "Quarterly preventative maintenance for facility cooling and ventilation system.",
  },
];
