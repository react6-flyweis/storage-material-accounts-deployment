// Type definitions for Freight Cost data
// This file maintains interfaces for future API responses and imports

export interface CarrierCostItem {
  id: string;
  name: string;
  ytdTotal: string;
  totalCost: number;
  totalCostFormatted: string;
  percentageOfTotal: string;
}

export interface MonthlyFreightTrendItem {
  month: string;
  cost: number;
  deliveries: number;
}

export interface CarrierDistributionItem {
  carrier: string;
  amount: number;
}

export interface FreightDeliveryRecord {
  id: string;
  freightId: string;
  project: string;
  deliveryCompany: string;
  deliveryId: string;
  date: string;
  cost: number;
  costFormatted: string;
  approvalStatus: "Approved" | "Pending" | "Rejected";
  // Detail modal fields
  totalLoads?: string;
  statusText?: string;
  awardedCarrier?: string;
  awardedBid?: string;
  averageBid?: string;
  highestBid?: string;
  savings?: string;
  deliveryStatus?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  paymentDueDate?: string;
  invoiceStatus?: string;
}
