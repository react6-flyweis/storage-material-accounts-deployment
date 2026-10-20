import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import type { Control, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { List, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TaxRate } from "@/components/modals/TaxModal";
import { formatCurrency } from "@/lib/invoice-amounts";

export interface InvoiceLineItemValues {
  id: string;
  description: string;
  rate: number;
  quantity: number;
  markup?: number;
  markupType?: "percentage" | "amount";
  markupAmount?: number;
  effectiveRate?: number;
  tax?: TaxRate | number | null;
  taxRate?: number;
  taxName?: string;
  taxAmount?: number;
  total?: number;
  notes?: string;
  photos?: string[];
  items?: string[];
}

export interface InvoiceLineItemProps {
  index: number;
  control: Control<any, any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  remove: (index: number) => void;
  markupValue: string | number;
  markupType: "%" | "$";
  onOpenItemList: (index: number) => void;
  onOpenTaxModal: (index: number) => void;
  onOpenUploadModal: (index: number) => void;
  onRemovePhoto: (itemIndex: number, photoIndex: number) => void;
}

export default function InvoiceLineItem({
  index,
  control,
  register,
  setValue,
  remove,
  markupValue,
  markupType,
  onOpenItemList,
  onOpenTaxModal,
  onOpenUploadModal,
  onRemovePhoto,
}: InvoiceLineItemProps) {
  const watchedItem = useWatch({
    control,
    name: `lineItems.${index}`,
  }) as InvoiceLineItemValues | undefined;

  useEffect(() => {
    const rate = Number(watchedItem?.rate) || 0;
    const quantity = Number(watchedItem?.quantity) || 1;
    const parsedMarkup = Number(markupValue) || 0;

    const itemMarkup =
      markupType === "%"
        ? (rate * (parsedMarkup / 100)) * quantity
        : (index === 0 ? parsedMarkup : 0);

    const effectiveRate = quantity > 0 ? (rate * quantity + itemMarkup) / quantity : rate;
    const total = rate * quantity;

    let taxPercent = 0;
    if (typeof watchedItem?.tax === "number") {
      taxPercent = watchedItem.tax;
    } else if (watchedItem?.tax && typeof watchedItem.tax === "object") {
      taxPercent = watchedItem.tax.rate || 0;
    } else if (typeof watchedItem?.taxRate === "number") {
      taxPercent = watchedItem.taxRate;
    }

    const taxAmount = (effectiveRate * quantity) * (taxPercent / 100);

    setValue(`lineItems.${index}.effectiveRate`, effectiveRate);
    setValue(`lineItems.${index}.markupAmount`, itemMarkup);
    setValue(`lineItems.${index}.taxAmount`, taxAmount);
    setValue(`lineItems.${index}.total`, total);
  }, [
    index,
    watchedItem?.rate,
    watchedItem?.quantity,
    watchedItem?.tax,
    watchedItem?.taxRate,
    markupValue,
    markupType,
    setValue,
  ]);

  const itemRate = Number(watchedItem?.rate) || 0;
  const itemQty = Number(watchedItem?.quantity) || 1;
  const itemTotal = itemRate * itemQty;

  const photos = watchedItem?.photos || [];
  const itemsList = watchedItem?.items || [];

  let taxLabel = "Tax";
  if (watchedItem?.tax && typeof watchedItem.tax === "object") {
    taxLabel = `${watchedItem.tax.name} (${watchedItem.tax.rate}%)`;
  } else if (watchedItem?.taxName) {
    taxLabel = `${watchedItem.taxName} (${watchedItem?.taxRate || 0}%)`;
  } else if (typeof watchedItem?.tax === "number" && watchedItem.tax > 0) {
    taxLabel = `${watchedItem.tax}%`;
  }

  return (
    <div className="relative group mb-4">
      {/* Remove Button on Left */}
      <button
        type="button"
        onClick={() => remove(index)}
        className="absolute -left-7 top-4 text-red-500 hover:text-red-700 cursor-pointer"
        title="Remove item"
      >
        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
          <span className="h-0.5 w-2.5 bg-white"></span>
        </div>
      </button>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
        {/* Main Item Row */}
        <div className="grid grid-cols-12 divide-x divide-gray-200 bg-white items-center">
          {/* Description & Item List */}
          <div className="col-span-12 md:col-span-5 p-3 flex items-center gap-3">
            <input
              type="text"
              {...register(`lineItems.${index}.description` as const)}
              placeholder="Description"
              className="w-full text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent px-1"
            />
            <button
              type="button"
              onClick={() => onOpenItemList(index)}
              className="text-blue-600 flex items-center gap-1 text-xs font-semibold hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors shrink-0 cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
              Item list
            </button>
          </div>

          {/* Rate */}
          <div className="col-span-4 md:col-span-2 p-3 flex items-center justify-center">
            <span className="text-gray-500 text-sm mr-1 font-medium">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register(`lineItems.${index}.rate` as const, { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full text-sm text-center text-gray-800 font-medium focus:outline-none bg-transparent"
            />
          </div>

          {/* Quantity */}
          <div className="col-span-3 md:col-span-2 p-3 flex items-center justify-center">
            <input
              type="number"
              min="1"
              {...register(`lineItems.${index}.quantity` as const, { valueAsNumber: true })}
              placeholder="1"
              className="w-full text-sm text-center text-gray-800 font-medium focus:outline-none bg-transparent"
            />
          </div>

          {/* Tax */}
          <div className="col-span-2 md:col-span-1 p-3 flex items-center justify-center">
            <button
              type="button"
              onClick={() => onOpenTaxModal(index)}
              className="text-blue-600 hover:text-blue-700 text-xs font-semibold cursor-pointer truncate max-w-full px-1"
              title={taxLabel}
            >
              {taxLabel}
            </button>
          </div>

          {/* Total */}
          <div className="col-span-3 md:col-span-2 p-3 text-right pr-5 font-mono font-semibold text-sm text-gray-900">
            ${formatCurrency(itemTotal)}
          </div>
        </div>

        {/* Notes Row */}
        <div className="border-t border-gray-100 p-0">
          <input
            type="text"
            placeholder="Notes"
            {...register(`lineItems.${index}.notes` as const)}
            className="w-full px-4 py-2.5 text-xs text-gray-600 placeholder:text-gray-400 focus:outline-none focus:bg-gray-50/50 transition-colors border-0"
          />
        </div>

        {/* Upload Row */}
        <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/30 flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenUploadModal(index)}
            className="border-blue-300 text-blue-600 hover:bg-blue-50 h-7 rounded-full px-3 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            Upload photos
          </Button>
          <span className="text-gray-400 text-[11px]">(Max 4)</span>

          {photos.map((photo, pIdx) => (
            <div
              key={pIdx}
              className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-2xs"
            >
              <span className="truncate max-w-36">{photo}</span>
              <button
                type="button"
                onClick={() => onRemovePhoto(index, pIdx)}
                className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                title={`Remove ${photo}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Items Tags Display */}
      {itemsList.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 flex-wrap pl-1">
          {itemsList.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
