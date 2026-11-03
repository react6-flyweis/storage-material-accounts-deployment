import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import EditAddressModal from "@/components/modals/EditAddressModal";
import EditBankDetailsModal from "@/components/modals/EditBankDetailsModal";
import ItemListModal from "@/components/modals/ItemListModal";
import TaxModal, { type TaxRate } from "@/components/modals/TaxModal";
import UploadImageModal from "@/components/modals/UploadImageModal";
import InvoiceActionModal from "@/components/modals/InvoiceActionModal";
import PaymentScheduleModal, { type PaymentEntry } from "@/components/modals/PaymentScheduleModal";
import SuccessModal from "@/components/common_components/SuccessModal";
import InvoiceLineItem from "@/components/invoices/InvoiceLineItem";
import {
  useGetInvoiceBillingDefaultsQuery,
  useGetInvoiceManagementFiltersQuery,
  useCreateCustomerInvoiceMutation,
  useGetLatestApprovedTaxByLeadQuery,
  useGetPaymentScheduleByLeadQuery,
  type InvoiceAddress,
  type InvoiceBankDetails,
  type CreateCustomerInvoicePayload,
} from "@/redux/api/invoiceManagementApi";
import { formatCurrency, getAdjustmentAmount } from "@/lib/invoice-amounts";

function parseLocationToAddress(location?: string): {
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
} {
  if (!location) return {};
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) return { line1: parts[0] };
  if (parts.length === 2) {
    const [city, stateZip] = parts;
    const szParts = stateZip.split(/\s+/).filter(Boolean);
    return { city, state: szParts[0] || "", postalCode: szParts.slice(1).join(" ") || "" };
  }
  if (parts.length >= 3) {
    const line1 = parts.slice(0, parts.length - 2).join(", ");
    const city = parts[parts.length - 2];
    const stateZip = parts[parts.length - 1];
    const szParts = stateZip.split(/\s+/).filter(Boolean);
    return { line1, city, state: szParts[0] || "", postalCode: szParts.slice(1).join(" ") || "" };
  }
  return { line1: location };
}

export interface InvoiceFormData {
  invoiceNumber: string;
  date: string;
  daysToPay: string;
  poNumber: string;
  markupValue: string;
  markupType: "%" | "$";
  discountValue: string;
  discountType: "%" | "$";
  depositValue: string;
  depositType: "%" | "$";
  billingAddress: InvoiceAddress;
  recipientAddress: InvoiceAddress;
  bankDetails: InvoiceBankDetails;
  lineItems: Array<{
    id: string;
    description: string;
    rate: number;
    quantity: number;
    tax?: TaxRate | number | null;
    taxRate?: number;
    taxName?: string;
    taxAmount?: number;
    effectiveRate?: number;
    markupAmount?: number;
    total?: number;
    notes?: string;
    photos?: string[];
    items?: string[];
  }>;
}

export default function NewInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as any) || {};

  const { data: filtersData } = useGetInvoiceManagementFiltersQuery();
  const [createInvoiceMutation, { isLoading: isSubmitting }] = useCreateCustomerInvoiceMutation();

  const projectList = useMemo(() => filtersData?.projects || [], [filtersData?.projects]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    navState.leadId || navState.projectId || ""
  );

  const activeLeadId = useMemo(() => {
    return (
      selectedLeadId ||
      navState.leadId ||
      navState.projectId ||
      projectList[0]?.leadId ||
      projectList[0]?.projectId ||
      ""
    );
  }, [selectedLeadId, navState, projectList]);

  const projectOptions = useMemo(() => {
    return projectList.map((p) => {
      const id = p.leadId || p.projectId;
      const label = p.projectName
        ? p.jobId
          ? `${p.projectName} (${p.jobId})`
          : p.projectName
        : p.jobId || id;
      return {
        value: id,
        label,
        subLabel: p.jobId && p.projectName ? `Job ID: ${p.jobId}` : undefined,
      };
    });
  }, [projectList]);

  const handleProjectSelect = (id: string) => {
    setSelectedLeadId(id);
    const matched = projectList.find((p) => p.leadId === id || p.projectId === id);
    if (matched) {
      const parsed = (matched as any).location
        ? parseLocationToAddress((matched as any).location)
        : {};
      setValue(
        "recipientAddress.companyName",
        (matched as any).customerName || matched.projectName || "Customer"
      );
      if (parsed.line1) setValue("recipientAddress.line1", parsed.line1);
      if (parsed.city) setValue("recipientAddress.city", parsed.city);
      if (parsed.state) setValue("recipientAddress.state", parsed.state);
      if (parsed.postalCode) setValue("recipientAddress.postalCode", parsed.postalCode);
      if (!getValues("recipientAddress.country")) {
        setValue("recipientAddress.country", "United States");
      }
    }
  };

  // Live queries
  const { data: billingDefaults } = useGetInvoiceBillingDefaultsQuery(activeLeadId || undefined);
  const { data: approvedTaxData } = useGetLatestApprovedTaxByLeadQuery(activeLeadId, {
    skip: !activeLeadId,
  });
  const { data: leadScheduleData } = useGetPaymentScheduleByLeadQuery(activeLeadId, {
    skip: !activeLeadId,
  });

  // Form setup
  const { register, control, setValue, getValues, watch, handleSubmit } = useForm<InvoiceFormData>({
    defaultValues: {
      invoiceNumber: "",
      date: new Date().toISOString().slice(0, 10),
      daysToPay: "15",
      poNumber: "",
      markupValue: "0",
      markupType: "%",
      discountValue: "0",
      discountType: "%",
      depositValue: "0",
      depositType: "%",
      billingAddress: {
        companyName: "STEEL BUILDING DEPOT",
        line1: "1851 Madison Ave Suite 300",
        city: "Council Bluffs",
        state: "IA",
        postalCode: "51503",
        country: "United States",
      },
      recipientAddress: {},
      bankDetails: {},
      lineItems: [
        {
          id: "1",
          description: "",
          rate: 0,
          quantity: 1,
          tax: null,
          notes: "",
          photos: [],
          items: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // Shared Modals state
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isPaymentScheduleModalOpen, setIsPaymentScheduleModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [activeActionType, setActiveActionType] = useState<"markup" | "discount" | "deposit" | null>(
    null
  );

  // Line item modals
  const [isItemListModalOpen, setIsItemListModalOpen] = useState(false);
  const [activeItemListIndex, setActiveItemListIndex] = useState<number | null>(null);

  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [activeTaxItemIndex, setActiveTaxItemIndex] = useState<number | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

  const [paymentSchedule, setPaymentSchedule] = useState<{
    payments: PaymentEntry[];
    unit: "%" | "$";
  }>({
    payments: [{ id: "1", name: "Deposit", amount: 0 }],
    unit: "%",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", subTitle: "" });

  // Sync server defaults
  useEffect(() => {
    if (billingDefaults) {
      if (billingDefaults.billingAddress) {
        setValue("billingAddress", billingDefaults.billingAddress);
      }
      if (billingDefaults.bankDetails) {
        setValue("bankDetails", billingDefaults.bankDetails);
      }
      if (billingDefaults.recipientAddress) {
        setValue("recipientAddress", billingDefaults.recipientAddress);
      }
    }
  }, [billingDefaults, setValue]);

  // Sync selected project recipient details
  useEffect(() => {
    if (activeLeadId && projectList.length > 0) {
      const matched = projectList.find(
        (p) => p.leadId === activeLeadId || p.projectId === activeLeadId
      );
      if (matched) {
        const currentRecipient = getValues("recipientAddress");
        if (!currentRecipient?.companyName && !currentRecipient?.line1) {
          const parsed = (matched as any).location
            ? parseLocationToAddress((matched as any).location)
            : {};
          setValue(
            "recipientAddress.companyName",
            (matched as any).customerName || matched.projectName || "Customer"
          );
          if (parsed.line1) setValue("recipientAddress.line1", parsed.line1);
          if (parsed.city) setValue("recipientAddress.city", parsed.city);
          if (parsed.state) setValue("recipientAddress.state", parsed.state);
          if (parsed.postalCode) setValue("recipientAddress.postalCode", parsed.postalCode);
        }
      }
    }
  }, [activeLeadId, projectList, getValues, setValue]);

  // Sync approved quotation tax and rate
  const lastTaxRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeLeadId || !approvedTaxData) return;
    if (lastTaxRef.current === activeLeadId) return;
    lastTaxRef.current = activeLeadId;

    const baseRate =
      approvedTaxData.amountWithoutMarkup ?? approvedTaxData.subtotalWithoutMarkup ?? 0;
    const markupAmt = approvedTaxData.markup ?? 0;
    const taxRate = approvedTaxData.taxRate ?? 0;

    if (baseRate > 0) {
      setValue("lineItems.0.rate", baseRate);
      setValue(
        "lineItems.0.description",
        approvedTaxData.quoteNumber
          ? `Quotation ${approvedTaxData.quoteNumber}`
          : "Project Quotation"
      );
      if (taxRate > 0) {
        setValue("lineItems.0.tax", taxRate);
        setValue("lineItems.0.taxRate", taxRate);
        setValue("lineItems.0.taxName", "Approved Tax");
      }
    }
    if (markupAmt > 0) {
      setValue("markupValue", String(markupAmt));
      setValue("markupType", "$");
    }
  }, [activeLeadId, approvedTaxData, setValue]);

  // Sync payment schedule
  const lastScheduleRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeLeadId || !leadScheduleData) return;
    if (lastScheduleRef.current === activeLeadId) return;
    lastScheduleRef.current = activeLeadId;

    const schedule = leadScheduleData.schedule;
    if (!schedule?.stages || schedule.stages.length === 0) return;

    const unit: "%" | "$" = schedule.stages[0]?.amountType === "percentage" ? "%" : "$";
    const mapped = schedule.stages.map((st, idx) => ({
      id: st._id || String(idx + 1),
      name: st.stageName || "Payment",
      amount: Number(st.amount) || 0,
    }));
    setPaymentSchedule({ payments: mapped, unit });

    const depStage = schedule.stages.find((s) => s.stageName?.trim().toLowerCase() === "deposit");
    if (depStage && Number(depStage.amount) > 0) {
      setValue("depositValue", String(depStage.amount));
      setValue("depositType", depStage.amountType === "percentage" ? "%" : "$");
    }
  }, [activeLeadId, leadScheduleData, setValue]);

  const watchedValues = watch();
  const subtotal = (watchedValues.lineItems || []).reduce(
    (acc, it) => acc + (Number(it.rate) || 0) * (Number(it.quantity) || 1),
    0
  );
  const markupAmt = getAdjustmentAmount(
    watchedValues.markupValue,
    watchedValues.markupType,
    subtotal
  );
  const discountAmt = getAdjustmentAmount(
    watchedValues.discountValue,
    watchedValues.discountType,
    subtotal
  );
  const taxAmt = (watchedValues.lineItems || []).reduce(
    (acc, it) => acc + (Number(it.taxAmount) || 0),
    0
  );
  const total = Math.max(0, subtotal + markupAmt - discountAmt + taxAmt);
  const depositAmt = getAdjustmentAmount(
    watchedValues.depositValue,
    watchedValues.depositType,
    total
  );

  // Line item modal helpers
  const handleOpenItemList = (index: number) => {
    setActiveItemListIndex(index);
    setIsItemListModalOpen(true);
  };

  const handleSelectItemFromList = (description: string) => {
    if (activeItemListIndex !== null) {
      const currentDesc = getValues(`lineItems.${activeItemListIndex}.description`);
      setValue(
        `lineItems.${activeItemListIndex}.description`,
        currentDesc ? `${currentDesc} - ${description}` : description
      );
      const currentItems = getValues(`lineItems.${activeItemListIndex}.items`) || [];
      if (!currentItems.includes(description)) {
        setValue(`lineItems.${activeItemListIndex}.items`, [...currentItems, description]);
      }
    }
    setIsItemListModalOpen(false);
  };

  const handleOpenTaxModal = (index: number) => {
    setActiveTaxItemIndex(index);
    setIsTaxModalOpen(true);
  };

  const handleSelectTax = (taxRate: TaxRate | null) => {
    if (activeTaxItemIndex !== null) {
      setValue(`lineItems.${activeTaxItemIndex}.tax`, taxRate);
      setValue(`lineItems.${activeTaxItemIndex}.taxRate`, taxRate?.rate || 0);
      setValue(`lineItems.${activeTaxItemIndex}.taxName`, taxRate?.name || "");
    }
    setIsTaxModalOpen(false);
  };

  const handleOpenUploadModal = (index: number) => {
    setActiveUploadIndex(index);
    setIsUploadModalOpen(true);
  };

  const handleUploadPhoto = (file: File) => {
    if (activeUploadIndex !== null) {
      const currentPhotos = getValues(`lineItems.${activeUploadIndex}.photos`) || [];
      if (currentPhotos.length < 4) {
        setValue(`lineItems.${activeUploadIndex}.photos`, [...currentPhotos, file.name]);
      }
    }
    setIsUploadModalOpen(false);
  };

  const handleRemovePhoto = (itemIndex: number, photoIndex: number) => {
    const currentPhotos = getValues(`lineItems.${itemIndex}.photos`) || [];
    const updated = currentPhotos.filter((_, idx) => idx !== photoIndex);
    setValue(`lineItems.${itemIndex}.photos`, updated);
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setErrorMessage(null);
    try {
      const payload: CreateCustomerInvoicePayload = {
        leadId: activeLeadId,
        projectId: activeLeadId,
        invoiceNumber: data.invoiceNumber || undefined,
        date: data.date,
        daysToPay: Number(data.daysToPay) || 15,
        poNumber: data.poNumber || undefined,
        lineItems: data.lineItems.map((item) => {
          let taxVal = 0;
          if (typeof item.tax === "number") taxVal = item.tax;
          else if (item.tax && typeof item.tax === "object") taxVal = item.tax.rate || 0;
          else if (item.taxRate) taxVal = item.taxRate;

          return {
            description: item.description,
            rate: Number(item.rate),
            quantity: Number(item.quantity),
            markup: Number(item.markupAmount) || 0,
            effectiveRate: Number(item.effectiveRate) || Number(item.rate),
            tax: taxVal,
            taxAmount: Number(item.taxAmount) || 0,
            total: (Number(item.effectiveRate) || Number(item.rate)) * Number(item.quantity),
            notes: item.notes || "",
            photos: item.photos || [],
          };
        }),
        billingAddress: data.billingAddress,
        recipientAddress: data.recipientAddress,
        bankDetails: data.bankDetails,
        subtotal,
        markup: markupAmt,
        discount: discountAmt,
        tax: taxAmt,
        totalAmount: total,
        depositAmount: depositAmt,
      };

      const res = await createInvoiceMutation(payload).unwrap();
      const resData = (res as any)?.data;
      const createdId =
        resData?.invoice?._id ||
        resData?._id ||
        (res as any)?._id ||
        (res as any)?.id ||
        data.invoiceNumber ||
        "";

      setSuccessModal({
        isOpen: true,
        title: "Invoice Created Successfully",
        subTitle: "Your invoice has been generated and saved to the project.",
      });

      setTimeout(() => {
        setSuccessModal({ isOpen: false, title: "", subTitle: "" });
        navigate("/payments/invoice/preview", {
          state: {
            invoiceId: createdId,
            invoiceNumber: data.invoiceNumber,
            date: data.date,
            daysToPay: data.daysToPay,
            subtotal,
            taxAmount: taxAmt,
            discount: discountAmt,
            total,
            deposit: depositAmt,
            billingAddress: data.billingAddress,
            recipientAddress: data.recipientAddress,
            bankDetails: data.bankDetails,
            lineItems: data.lineItems,
          },
        });
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Failed to create invoice. Please check all fields.";
      setErrorMessage(msg);
    }
  };

  const sellerAddress = watchedValues.billingAddress;
  const recipientAddress = watchedValues.recipientAddress;

  return (
    <div className="md:px-5 px-2 md:pt-5 pb-10 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">New Invoice</h1>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-6 font-semibold cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-md p-4 sm:p-8 lg:p-10 shadow-sm border border-gray-100">
        {/* Top Section: Organization Info & Client / Invoice Details */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
          {/* Left: Seller Organization Info */}
          <div className="space-y-4">
            <div className="text-base font-bold text-gray-900 tracking-tight">
              {sellerAddress?.companyName || "STEEL BUILDING DEPOT"}
            </div>

            <div className="text-sm text-gray-600 leading-relaxed space-y-0.5">
              <div>{sellerAddress?.line1 || "1851 Madison Ave Suite 300"}</div>
              {sellerAddress?.line2 && <div>{sellerAddress.line2}</div>}
              <div>
                {[
                  sellerAddress?.city || "Council Bluffs",
                  [sellerAddress?.state || "IA", sellerAddress?.postalCode || "51503"]
                    .filter(Boolean)
                    .join(" "),
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              <div>{sellerAddress?.country || "United States"}</div>
              <div>travis@storagematerials.com</div>
              <div>www.storagematerials.com</div>
            </div>

            <button
              type="button"
              onClick={() => setIsBillingModalOpen(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer block pt-1 text-left"
            >
              Edit address
            </button>
          </div>

          {/* Right: Project / Client Selection & Invoice Meta */}
          <div className="flex-1 max-w-2xl flex flex-col gap-6">
            <div className="flex flex-col items-end gap-3">
              {/* Project / Lead Selection Row */}
              <div className="w-full">
                <Combobox
                  options={projectOptions}
                  value={activeLeadId}
                  onChange={handleProjectSelect}
                  placeholder="Select Project / Lead"
                  searchPlaceholder="Search project or lead..."
                  emptyText="No projects found"
                />
              </div>

              {/* Recipient Address Preview */}
              {Boolean(recipientAddress?.companyName || recipientAddress?.line1) && (
                <div className="w-full space-y-1 text-left pt-1">
                  <div className="text-base font-bold text-gray-900 tracking-tight">
                    {recipientAddress.companyName}
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed space-y-0.5">
                    {recipientAddress.line1 && <div>{recipientAddress.line1}</div>}
                    {recipientAddress.line2 && <div>{recipientAddress.line2}</div>}
                    {(recipientAddress.city || recipientAddress.state || recipientAddress.postalCode) && (
                      <div>
                        {[
                          recipientAddress.city,
                          [recipientAddress.state, recipientAddress.postalCode]
                            .filter(Boolean)
                            .join(" "),
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                    {recipientAddress.country && <div>{recipientAddress.country}</div>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRecipientModalOpen(true)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer block pt-1 text-left"
                  >
                    Edit address
                  </button>
                </div>
              )}
            </div>

            {/* 2x2 Meta Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Invoice #</label>
                <Input
                  {...register("invoiceNumber")}
                  placeholder="Auto-generated"
                  className="bg-white border-gray-200 h-11 text-sm font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    {...register("date")}
                    className="bg-white border-gray-200 h-11 text-sm"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Days to pay</label>
                <Input
                  type="text"
                  {...register("daysToPay")}
                  placeholder="15"
                  className="bg-white border-gray-200 h-11 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">PO number</label>
                <Input
                  placeholder="PO number"
                  {...register("poNumber")}
                  className="bg-white border-gray-200 h-11 text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50/50 py-3 px-4 rounded-lg mb-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-5">Description</div>
          <div className="col-span-2 text-center">Rate</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-1 text-center">Tax</div>
          <div className="col-span-2 text-right pr-4">Total</div>
        </div>

        {/* Line Items List */}
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <InvoiceLineItem
              key={field.id}
              index={idx}
              control={control as any}
              register={register}
              setValue={setValue}
              remove={remove}
              markupValue={watchedValues.markupValue}
              markupType={watchedValues.markupType}
              onOpenItemList={handleOpenItemList}
              onOpenTaxModal={handleOpenTaxModal}
              onOpenUploadModal={handleOpenUploadModal}
              onRemovePhoto={handleRemovePhoto}
            />
          ))}

          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              append({
                id: Date.now().toString(),
                description: "",
                rate: 0,
                quantity: 1,
                tax: null,
                notes: "",
                photos: [],
                items: [],
              })
            }
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2 text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            ADD LINE ITEM
          </Button>
        </div>

        {/* Summary Footer: Left Banking, Right Pricing Breakdown */}
        <div className="pt-10 border-t border-gray-200 flex flex-col lg:flex-row justify-between items-start gap-12 mt-10">
          {/* Left: Banking Details */}
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-300">
              <span className="text-sm font-semibold text-gray-700">Banking & Wire Info</span>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(true)}
                className="text-blue-600 text-xs font-medium hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Bank</span>
              <span className="text-gray-900 font-medium">
                {watchedValues.bankDetails?.bankName || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Account Name</span>
              <span className="text-gray-900 font-medium">
                {watchedValues.bankDetails?.accountName || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Account #</span>
              <span className="text-gray-900 font-mono font-medium">
                {watchedValues.bankDetails?.accountNumber || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Routing #</span>
              <span className="text-gray-900 font-mono font-medium">
                {watchedValues.bankDetails?.routingNumber || "-"}
              </span>
            </div>
            {watchedValues.bankDetails?.paymentInstructions && (
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 italic">
                Memo: {watchedValues.bankDetails.paymentInstructions}
              </div>
            )}
          </div>

          {/* Right: Pricing Totals */}
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 font-medium">${formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Markup</span>
              <div className="flex items-center gap-2">
                {markupAmt > 0 && (
                  <span className="text-gray-900 font-medium">${formatCurrency(markupAmt)}</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveActionType("markup");
                    setIsActionModalOpen(true);
                  }}
                  className="text-blue-600 text-xs font-medium hover:underline cursor-pointer"
                >
                  {markupAmt > 0 ? "Edit" : "Add"}
                </button>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <div className="flex items-center gap-2">
                {discountAmt > 0 && (
                  <span className="text-red-500 font-medium">-${formatCurrency(discountAmt)}</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveActionType("discount");
                    setIsActionModalOpen(true);
                  }}
                  className="text-blue-600 text-xs font-medium hover:underline cursor-pointer"
                >
                  {discountAmt > 0 ? "Edit" : "Add"}
                </button>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Request a deposit</span>
              <div className="flex items-center gap-2">
                {depositAmt > 0 && (
                  <span className="text-gray-900 font-medium">${formatCurrency(depositAmt)}</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveActionType("deposit");
                    setIsActionModalOpen(true);
                  }}
                  className="text-blue-600 text-xs font-medium hover:underline cursor-pointer"
                >
                  {depositAmt > 0 ? "Edit" : "Add"}
                </button>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Schedule</span>
              <button
                type="button"
                onClick={() => setIsPaymentScheduleModalOpen(true)}
                className="text-blue-600 text-xs font-medium hover:underline cursor-pointer"
              >
                {paymentSchedule.payments.some((p) => p.amount > 0) ? "Edit" : "Add"}
              </button>
            </div>

            {taxAmt > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900 font-medium">${formatCurrency(taxAmt)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-300">
              <span className="text-lg font-bold text-gray-700">Total(USD)</span>
              <span className="text-xl font-bold text-gray-900">${formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Modals */}
      <EditAddressModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        type="billing"
        initialAddress={watchedValues.billingAddress}
        onSave={(addr) => setValue("billingAddress", addr)}
      />

      <EditAddressModal
        isOpen={isRecipientModalOpen}
        onClose={() => setIsRecipientModalOpen(false)}
        type="recipient"
        initialAddress={watchedValues.recipientAddress}
        onSave={(addr) => setValue("recipientAddress", addr)}
      />

      <EditBankDetailsModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        initialBankDetails={watchedValues.bankDetails}
        onSave={(bank) => setValue("bankDetails", bank)}
      />

      <ItemListModal
        isOpen={isItemListModalOpen}
        onClose={() => {
          setIsItemListModalOpen(false);
          setActiveItemListIndex(null);
        }}
        onSelect={handleSelectItemFromList}
      />

      <TaxModal
        isOpen={isTaxModalOpen}
        onClose={() => {
          setIsTaxModalOpen(false);
          setActiveTaxItemIndex(null);
        }}
        onSelect={handleSelectTax}
        currentTax={
          activeTaxItemIndex !== null
            ? (getValues(`lineItems.${activeTaxItemIndex}.tax`) as TaxRate | null)
            : null
        }
      />

      <UploadImageModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setActiveUploadIndex(null);
        }}
        onUpload={handleUploadPhoto}
      />

      {activeActionType && (
        <InvoiceActionModal
          isOpen={isActionModalOpen}
          onClose={() => {
            setIsActionModalOpen(false);
            setActiveActionType(null);
          }}
          type={activeActionType}
          initialValue={
            activeActionType === "markup"
              ? Number(watchedValues.markupValue)
              : activeActionType === "discount"
              ? Number(watchedValues.discountValue)
              : Number(watchedValues.depositValue)
          }
          initialUnit={
            activeActionType === "markup"
              ? watchedValues.markupType
              : activeActionType === "discount"
              ? watchedValues.discountType
              : watchedValues.depositType
          }
          onDone={(val, unt) => {
            if (activeActionType === "markup") {
              setValue("markupValue", String(val));
              setValue("markupType", unt);
            } else if (activeActionType === "discount") {
              setValue("discountValue", String(val));
              setValue("discountType", unt);
            } else if (activeActionType === "deposit") {
              setValue("depositValue", String(val));
              setValue("depositType", unt);
            }
          }}
        />
      )}

      <PaymentScheduleModal
        isOpen={isPaymentScheduleModalOpen}
        onClose={() => setIsPaymentScheduleModalOpen(false)}
        total={total}
        initialPayments={paymentSchedule.payments}
        initialUnit={paymentSchedule.unit}
        onDone={(payments, unit) => {
          setPaymentSchedule({ payments, unit });
          const dep = payments.find((p) => p.name.trim().toLowerCase() === "deposit");
          if (dep && dep.amount > 0) {
            setValue("depositValue", String(dep.amount));
            setValue("depositType", unit);
          }
        }}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: "", subTitle: "" })}
        title={successModal.title}
        subTitle={successModal.subTitle}
      />
    </div>
  );
}
