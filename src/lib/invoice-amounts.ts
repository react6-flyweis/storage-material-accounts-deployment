const PERCENT_SCALE = 100;
const MONEY_SCALE = 100;

export function parseNumericInput(value: string | number, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function roundPercent(value: number): number {
  return Math.round(value * PERCENT_SCALE) / PERCENT_SCALE;
}

export function roundMoney(value: number): number {
  return Math.round(value * MONEY_SCALE) / MONEY_SCALE;
}

export function getAdjustmentAmount(
  value: string | number,
  type: "%" | "$",
  baseAmount: number,
): number {
  const numericValue = parseNumericInput(value);
  if (!numericValue) return 0;
  const amount = type === "%" ? (baseAmount * numericValue) / 100 : numericValue;
  return roundMoney(amount);
}

export function getRemainingAfterAdjustment(
  totalAmount: number,
  adjustmentValue: string | number,
  adjustmentType: "%" | "$",
): number {
  const reserved = getAdjustmentAmount(adjustmentValue, adjustmentType, totalAmount);
  return roundMoney(Math.max(0, totalAmount - reserved));
}

export function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) return "0.00";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
