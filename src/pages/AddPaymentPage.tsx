import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Search,
  Building2,
  MapPin,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OrderItem } from "./PaymentOverview";
import {
  useCreatePaymentOrderMutation,
  useUpdatePaymentOrderMutation,
  useGetPaymentOrderDetailQuery,
  useGetPaymentOrderOptionsQuery,
  type PaymentStatusEnum,
  type PaymentOrderDetailData,
  type PaymentOrderOptionItem,
  type PaymentOrderItem,
  type CreatePaymentOrderRequest,
  type UpdatePaymentOrderRequest,
} from "@/redux/api/paymentsApi";
import { formatCurrency } from "@/lib/dashboardFormatters";

const addPaymentFormSchema = z.object({
  quoteId: z.string().trim().min(1, "Quote/Order ID is required"),
  orderValue: z.string().trim().min(1, "Order value is required"),
  paymentDeposit: z.string().trim().optional(),
  paymentProgress: z.string().trim().optional(),
  finalValue: z.string().trim().optional(),
  profit: z.string().trim().optional(),
  margin: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  paymentStatus: z.enum(["In Progress", "Completed", "Started", "On Hold"]),
});

export type AddPaymentFormData = z.infer<typeof addPaymentFormSchema>;

const parseCurrencyNumber = (val?: string | number | null): number => {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const mapStatusToEnum = (status: string): PaymentStatusEnum => {
  const s = status.toLowerCase().replace(/\s+/g, "_");
  if (s === "in_progress" || s === "in progress") return "in_progress";
  if (s === "started") return "started";
  if (s === "completed") return "completed";
  if (s === "on_hold" || s === "on hold") return "on_hold";
  return "in_progress";
};

const mapEnumToUiStatus = (
  val?: string
): "In Progress" | "Completed" | "Started" | "On Hold" => {
  if (!val) return "In Progress";
  const s = val.toLowerCase().replace(/\s+/g, "_");
  if (s === "in_progress") return "In Progress";
  if (s === "completed") return "Completed";
  if (s === "started") return "Started";
  if (s === "on_hold") return "On Hold";
  return "In Progress";
};

export const AddPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const locationState = location.state as
    | { order?: OrderItem; isEdit?: boolean }
    | null;
  const queryParamId = new URLSearchParams(location.search).get("id") || "";

  const targetOrder = locationState?.order;
  const isEditing = Boolean(
    id || queryParamId || targetOrder || locationState?.isEdit
  );
  const editId =
    id ||
    queryParamId ||
    targetOrder?.projectId ||
    targetOrder?.wipId ||
    targetOrder?.leadId ||
    targetOrder?.id ||
    "";

  const [selectedOption, setSelectedOption] =
    useState<PaymentOrderOptionItem | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load existing order details if editing
  const {
    data: fetchedDetail,
    isLoading: isFetchingDetail,
  } = useGetPaymentOrderDetailQuery(editId, {
    skip: !isEditing || !editId,
  });

  // Debounce search filter for backend options query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchFilter);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchFilter]);

  // Close dropdown on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Step 1 — Populate "Select order" (excludeWithWip: true, limit: 50) - skip when editing
  const {
    data: optionsData,
    isLoading: isLoadingOptions,
    isFetching: isFetchingOptions,
  } = useGetPaymentOrderOptionsQuery(
    {
      search: debouncedSearch.trim() || undefined,
      excludeWithWip: true,
      limit: 50,
    },
    {
      skip: isEditing,
    }
  );

  // Client-side instant filter of loaded options
  const filteredOptions = useMemo(() => {
    if (!optionsData?.options) return [];
    if (!searchFilter.trim()) return optionsData.options;
    const q = searchFilter.toLowerCase().trim();
    return optionsData.options.filter((opt) => {
      return (
        opt.quoteOrderId?.toLowerCase().includes(q) ||
        opt.projectName?.toLowerCase().includes(q) ||
        opt.customerName?.toLowerCase().includes(q) ||
        opt.location?.toLowerCase().includes(q) ||
        opt.label?.toLowerCase().includes(q)
      );
    });
  }, [optionsData?.options, searchFilter]);

  // Step 2 — RTK Query Mutations
  const [createPaymentOrder, { isLoading: isCreating }] =
    useCreatePaymentOrderMutation();
  const [updatePaymentOrder, { isLoading: isUpdating }] =
    useUpdatePaymentOrderMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddPaymentFormData>({
    resolver: zodResolver(addPaymentFormSchema),
    defaultValues: {
      quoteId: targetOrder?.projectId || "",
      orderValue: targetOrder?.orderValue || "",
      paymentDeposit: targetOrder?.deposit || "",
      paymentProgress: targetOrder?.progress || "",
      finalValue: targetOrder?.final || "",
      profit: targetOrder?.profit || "",
      margin: targetOrder?.margin || "",
      notes: "",
      paymentStatus: mapEnumToUiStatus(targetOrder?.status),
    },
  });

  // Populate from fetchedDetail when available in edit mode
  useEffect(() => {
    if (fetchedDetail) {
      const qId =
        fetchedDetail.orderDetails?.quoteOrderId ||
        fetchedDetail.orderDetails?.orderId ||
        fetchedDetail.profile?.quoteOrderId ||
        targetOrder?.projectId ||
        editId;
      const oVal =
        fetchedDetail.orderValue !== undefined
          ? formatCurrency(fetchedDetail.orderValue)
          : fetchedDetail.profile?.orderValue !== undefined
          ? formatCurrency(fetchedDetail.profile.orderValue)
          : targetOrder?.orderValue || "";
      const dep =
        fetchedDetail.financials?.deposit !== undefined
          ? formatCurrency(fetchedDetail.financials.deposit)
          : fetchedDetail.paymentBreakdown?.deposit !== undefined
          ? formatCurrency(fetchedDetail.paymentBreakdown.deposit)
          : targetOrder?.deposit || "";
      const prog =
        fetchedDetail.financials?.progress !== undefined
          ? formatCurrency(fetchedDetail.financials.progress)
          : fetchedDetail.paymentBreakdown?.progress !== undefined
          ? formatCurrency(fetchedDetail.paymentBreakdown.progress)
          : targetOrder?.progress || "";
      const fin =
        fetchedDetail.financials?.final !== undefined
          ? formatCurrency(fetchedDetail.financials.final)
          : fetchedDetail.paymentBreakdown?.final !== undefined
          ? formatCurrency(fetchedDetail.paymentBreakdown.final)
          : targetOrder?.final || "";
      const prof =
        fetchedDetail.financials?.profit !== undefined
          ? formatCurrency(fetchedDetail.financials.profit)
          : fetchedDetail.profit !== undefined
          ? formatCurrency(fetchedDetail.profit)
          : targetOrder?.profit || "";
      const marg =
        fetchedDetail.financials?.marginPct !== undefined
          ? `${fetchedDetail.financials.marginPct}%`
          : fetchedDetail.marginPct !== undefined
          ? `${fetchedDetail.marginPct}%`
          : targetOrder?.margin || "";
      const stat = mapEnumToUiStatus(
        fetchedDetail.paymentStatus || fetchedDetail.status || targetOrder?.status
      );
      const notesVal = fetchedDetail.notes || "";

      reset({
        quoteId: qId,
        orderValue: oVal,
        paymentDeposit: dep,
        paymentProgress: prog,
        finalValue: fin,
        profit: prof,
        margin: marg,
        notes: notesVal,
        paymentStatus: stat,
      });
    }
  }, [fetchedDetail, editId, targetOrder, reset]);

  // Watch fields for live profit & margin recalculation
  const watchedOrderValue = watch("orderValue");
  const watchedDeposit = watch("paymentDeposit");
  const watchedProgress = watch("paymentProgress");
  const watchedFinal = watch("finalValue");

  const numOrderValue = parseCurrencyNumber(watchedOrderValue);
  const numDeposit = parseCurrencyNumber(watchedDeposit);
  const numProgress = parseCurrencyNumber(watchedProgress);
  const numFinal = parseCurrencyNumber(watchedFinal);
  const currentCostNum = parseCurrencyNumber(
    fetchedDetail?.currentCost ?? targetOrder?.currentCost ?? 0
  );

  const totalReceived = numDeposit + numProgress + numFinal;
  const calculatedProfit =
    currentCostNum > 0 ? totalReceived - currentCostNum : totalReceived;
  const calculatedMarginPct =
    numOrderValue > 0
      ? ((calculatedProfit / numOrderValue) * 100).toFixed(1)
      : "0.0";

  // Automatically update profit and margin display when values change
  useEffect(() => {
    if (numOrderValue > 0 || totalReceived > 0) {
      setValue("profit", formatCurrency(calculatedProfit), {
        shouldValidate: false,
      });
      setValue("margin", `${calculatedMarginPct}%`, {
        shouldValidate: false,
      });
    }
  }, [calculatedProfit, calculatedMarginPct, numOrderValue, totalReceived, setValue]);

  const handleBack = () => {
    navigate("/payment_overview");
  };

  // Select an order from dropdown
  const handleSelectOption = (opt: PaymentOrderOptionItem) => {
    setSelectedOption(opt);
    setValue("quoteId", opt.quoteOrderId || opt.leadId, {
      shouldValidate: true,
    });

    // Optional prefill: quoteValue
    if (opt.quoteValue !== undefined && opt.quoteValue !== null) {
      setValue("orderValue", formatCurrency(opt.quoteValue), {
        shouldValidate: true,
      });
    }
  };

  // Clear selected order
  const handleClearSelection = () => {
    setSelectedOption(null);
    setValue("quoteId", "", { shouldValidate: true });
    setSearchFilter("");
  };

  // Manual code selection fallback
  const handleManualCodeSelect = (code: string) => {
    setSelectedOption(null);
    setValue("quoteId", code, { shouldValidate: true });
  };

  const onSubmit = async (data: AddPaymentFormData) => {
    setSubmitError(null);
    const parsedOrderValue = parseCurrencyNumber(data.orderValue);
    const parsedDeposit = parseCurrencyNumber(data.paymentDeposit);
    const parsedProgress = parseCurrencyNumber(data.paymentProgress);
    const parsedFinal = parseCurrencyNumber(data.finalValue);
    const mappedStatus = mapStatusToEnum(data.paymentStatus);

    try {
      if (isEditing) {
        const targetId =
          targetOrder?.projectId ||
          targetOrder?.wipId ||
          targetOrder?.leadId ||
          targetOrder?.id ||
          editId ||
          data.quoteId.trim();

        const payload: UpdatePaymentOrderRequest = {
          id: targetId,
          orderValue: parsedOrderValue > 0 ? parsedOrderValue : undefined,
          depositPaid: parsedDeposit,
          progressPaid: parsedProgress,
          finalPaid: parsedFinal,
          status: mappedStatus,
          notes: data.notes?.trim() || "",
        };

        const savedResult: PaymentOrderDetailData = await updatePaymentOrder(
          payload
        ).unwrap();

        const updated: OrderItem = {
          id:
            savedResult.wipId ||
            savedResult.leadId ||
            savedResult.profile?.quoteOrderId ||
            savedResult.orderDetails?.quoteOrderId ||
            targetId,
          wipId: savedResult.wipId || targetOrder?.wipId,
          leadId: savedResult.leadId || targetOrder?.leadId,
          client:
            savedResult.profile?.customerName ||
            savedResult.orderDetails?.customerName ||
            targetOrder?.client ||
            "Customer",
          projectId:
            savedResult.profile?.quoteOrderId ||
            savedResult.orderDetails?.quoteOrderId ||
            savedResult.orderDetails?.orderId ||
            targetOrder?.projectId ||
            targetId,
          location:
            savedResult.profile?.location ||
            savedResult.orderDetails?.location ||
            targetOrder?.location ||
            "Workshop . Texas",
          orderValue: formatCurrency(savedResult.orderValue ?? parsedOrderValue),
          currentCost: formatCurrency(
            savedResult.currentCost ?? currentCostNum
          ),
          deposit: formatCurrency(
            savedResult.financials?.deposit ??
              savedResult.paymentBreakdown?.deposit ??
              parsedDeposit
          ),
          progress: formatCurrency(
            savedResult.financials?.progress ??
              savedResult.paymentBreakdown?.progress ??
              parsedProgress
          ),
          final: formatCurrency(
            savedResult.financials?.final ??
              savedResult.paymentBreakdown?.final ??
              parsedFinal
          ),
          outstanding: formatCurrency(
            savedResult.financials?.outstanding ?? savedResult.outstanding
          ),
          profit: formatCurrency(
            savedResult.financials?.profit ??
              savedResult.profit ??
              calculatedProfit
          ),
          margin: `${
            savedResult.financials?.marginPct ??
            savedResult.marginPct ??
            calculatedMarginPct
          }%`,
          status: savedResult.paymentStatus || data.paymentStatus,
          totalReceived: formatCurrency(
            savedResult.financials?.totalReceived ??
              savedResult.totalReceived ??
              totalReceived
          ),
          raw: savedResult as unknown as PaymentOrderItem,
        };

        navigate("/payment_overview", {
          state: {
            successMessage: "Payment Updated Successfully",
            updatedOrder: updated,
          },
        });
      } else {
        // Step 2 Backend resolution rules:
        // ├─ leadId present? → Lead.findById(leadId)
        // └─ else quoteOrderId? → Lead where jobId === quoteOrderId OR _id === quoteOrderId
        // └─ else → 400 "Project / quote not found"
        const resolvedLeadId =
          selectedOption?.leadId ||
          (data.quoteId.length === 24 && /^[0-9a-fA-F]+$/.test(data.quoteId)
            ? data.quoteId
            : undefined);

        const resolvedQuoteOrderId =
          selectedOption?.quoteOrderId || data.quoteId.trim();

        const payload: CreatePaymentOrderRequest = {
          leadId: resolvedLeadId,
          quoteOrderId: resolvedQuoteOrderId,
          orderValue:
            parsedOrderValue > 0
              ? parsedOrderValue
              : selectedOption?.quoteValue !== undefined
              ? selectedOption.quoteValue
              : undefined,
          depositPaid: parsedDeposit,
          progressPaid: parsedProgress,
          finalPaid: parsedFinal,
          status: mappedStatus,
          notes: data.notes?.trim() || "",
        };

        // POST /api/account/payments/orders
        const savedResult: PaymentOrderDetailData =
          await createPaymentOrder(payload).unwrap();

        // Map back to OrderItem format for payment overview list
        const updated: OrderItem = {
          id:
            savedResult.wipId ||
            savedResult.leadId ||
            savedResult.profile?.quoteOrderId ||
            savedResult.orderDetails?.quoteOrderId ||
            resolvedQuoteOrderId,
          wipId: savedResult.wipId,
          leadId: savedResult.leadId || resolvedLeadId,
          client:
            savedResult.profile?.customerName ||
            savedResult.orderDetails?.customerName ||
            selectedOption?.customerName ||
            "Customer",
          projectId:
            savedResult.profile?.quoteOrderId ||
            savedResult.orderDetails?.quoteOrderId ||
            savedResult.orderDetails?.orderId ||
            resolvedQuoteOrderId,
          location:
            savedResult.profile?.location ||
            savedResult.orderDetails?.location ||
            selectedOption?.location ||
            "Workshop . Texas",
          orderValue: formatCurrency(savedResult.orderValue ?? parsedOrderValue),
          currentCost: formatCurrency(savedResult.currentCost ?? 0),
          deposit: formatCurrency(
            savedResult.financials?.deposit ??
              savedResult.paymentBreakdown?.deposit ??
              parsedDeposit
          ),
          progress: formatCurrency(
            savedResult.financials?.progress ??
              savedResult.paymentBreakdown?.progress ??
              parsedProgress
          ),
          final: formatCurrency(
            savedResult.financials?.final ??
              savedResult.paymentBreakdown?.final ??
              parsedFinal
          ),
          outstanding: formatCurrency(
            savedResult.financials?.outstanding ?? savedResult.outstanding
          ),
          profit: formatCurrency(
            savedResult.financials?.profit ??
              savedResult.profit ??
              calculatedProfit
          ),
          margin: `${
            savedResult.financials?.marginPct ??
            savedResult.marginPct ??
            calculatedMarginPct
          }%`,
          status: savedResult.paymentStatus || data.paymentStatus,
          totalReceived: formatCurrency(
            savedResult.financials?.totalReceived ??
              savedResult.totalReceived ??
              totalReceived
          ),
          raw: savedResult as unknown as PaymentOrderItem,
        };

        navigate("/payment_overview", {
          state: {
            successMessage: "Payment Entry Saved Successfully",
            updatedOrder: updated,
          },
        });
      }
    } catch (err: unknown) {
      console.error("Save payment failed:", err);
      const errMsg =
        err &&
        typeof err === "object" &&
        "data" in err &&
        (err as { data?: { message?: string } }).data?.message
          ? (err as { data: { message: string } }).data.message
          : err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to save payment order. Please check inputs and try again.";
      setSubmitError(errMsg);
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 xl:px-0 pb-10">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleBack}
          className="p-1 hover:bg-white/60 rounded-lg transition-colors cursor-pointer text-gray-800"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span>{isEditing ? "Update Payment" : "Add Payment"}</span>
          {(isLoadingOptions || isFetchingOptions || isFetchingDetail) && (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          )}
        </h1>
      </div>

      {/* Error banner if submission failed */}
      {submitError && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{submitError}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSubmitError(null)}
            className="ml-auto text-xs text-red-600 hover:text-red-800 cursor-pointer"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Card */}
      <Card className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 gap-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Card Title */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Basic Details
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing
                ? "Update order payment details and financial breakdown."
                : "Select an available project/lead order to initialize WIP order payment."}
            </p>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Combined Search & Select Quote/Order Dropdown OR Readonly for Edit */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label
                htmlFor="quoteId"
                className="text-xs sm:text-sm font-medium text-gray-800 flex items-center justify-between"
              >
                <span>
                  {isEditing ? "Quote / Order ID" : "Select Project / Order"}{" "}
                  <span className="text-red-500">*</span>
                </span>
                {!isEditing && (isLoadingOptions || isFetchingOptions) && (
                  <span className="text-xs text-gray-400 font-normal flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    Loading orders...
                  </span>
                )}
              </label>

              {isEditing ? (
                <div className="space-y-2">
                  <input
                    id="quoteId"
                    type="text"
                    disabled
                    {...register("quoteId")}
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-800 font-mono focus:outline-none cursor-not-allowed opacity-80"
                  />
                  {/* Project info strip when editing */}
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs flex flex-wrap items-center gap-x-4 gap-y-2">
                    {(fetchedDetail?.orderDetails?.customerName ||
                      fetchedDetail?.profile?.customerName ||
                      targetOrder?.client) && (
                      <div className="text-gray-700">
                        <span className="text-gray-400">Customer: </span>
                        <span className="font-semibold text-gray-900">
                          {fetchedDetail?.orderDetails?.customerName ||
                            fetchedDetail?.profile?.customerName ||
                            targetOrder?.client}
                        </span>
                      </div>
                    )}
                    {(fetchedDetail?.orderDetails?.location ||
                      fetchedDetail?.profile?.location ||
                      targetOrder?.location) && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {fetchedDetail?.orderDetails?.location ||
                            fetchedDetail?.profile?.location ||
                            targetOrder?.location}
                        </span>
                      </div>
                    )}
                    {currentCostNum > 0 && (
                      <div className="text-gray-600">
                        <span className="text-gray-400">Current Cost: </span>
                        <span className="font-medium text-gray-700">
                          {formatCurrency(currentCostNum)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Combined Searchable Select */
                <div ref={dropdownRef} className="relative w-full space-y-2">
                  {/* Trigger Button */}
                  <button
                    type="button"
                    id="quoteId"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className={cn(
                      "w-full min-h-[42px] px-3.5 py-2 bg-[#F9FAFB] border rounded-lg text-sm text-left flex items-center justify-between gap-2 transition-all cursor-pointer",
                      isDropdownOpen
                        ? "border-blue-500 ring-2 ring-blue-500/10 bg-white"
                        : errors.quoteId
                        ? "border-red-400 hover:bg-white"
                        : "border-gray-200 hover:bg-white focus:border-blue-500"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {selectedOption ? (
                        <div className="flex items-center gap-2 truncate">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-xs font-mono">
                            {selectedOption.quoteOrderId}
                          </span>
                          <span className="font-medium text-gray-900 truncate">
                            {selectedOption.projectName ||
                              selectedOption.customerName}
                          </span>
                          {selectedOption.customerName && (
                            <span className="text-xs text-gray-500 hidden sm:inline truncate">
                              • {selectedOption.customerName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          Search or select available project / order...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-gray-400">
                      {selectedOption && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearSelection();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              handleClearSelection();
                            }
                          }}
                          className="p-1 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
                          title="Clear selection"
                        >
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {isLoadingOptions || isFetchingOptions ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isDropdownOpen && "rotate-180 text-blue-600"
                          )}
                        />
                      )}
                    </div>
                  </button>

                  {/* Hidden input for react-hook-form registration */}
                  <input type="hidden" {...register("quoteId")} />

                  {/* Combined Dropdown Content */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-80 animate-in fade-in-50 zoom-in-95 duration-100">
                      {/* Embedded Search Input */}
                      <div className="p-2.5 border-b border-gray-100 bg-[#F9FAFB] flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          placeholder="Search by Job ID, project name, customer, or location..."
                          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                        />
                        {searchFilter && (
                          <button
                            type="button"
                            onClick={() => setSearchFilter("")}
                            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Scrollable Options List */}
                      <div className="overflow-y-auto p-1.5 space-y-1 divide-y divide-gray-50">
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((opt) => {
                            const isSelected =
                              selectedOption?.leadId === opt.leadId ||
                              selectedOption?.quoteOrderId === opt.quoteOrderId;
                            return (
                              <button
                                key={opt.leadId || opt.quoteOrderId}
                                type="button"
                                onClick={() => {
                                  handleSelectOption(opt);
                                  setIsDropdownOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left p-2.5 rounded-lg transition-colors flex items-center justify-between gap-3 cursor-pointer",
                                  isSelected
                                    ? "bg-blue-50/90 text-blue-900 font-medium"
                                    : "hover:bg-gray-50 text-gray-800"
                                )}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-semibold text-xs font-mono">
                                      {opt.quoteOrderId}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 truncate">
                                      {opt.projectName || opt.customerName}
                                    </span>
                                    {opt.lifecycleStatus && (
                                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium capitalize">
                                        {opt.lifecycleStatus.replace(/_/g, " ")}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    {opt.customerName && (
                                      <span>
                                        Client:{" "}
                                        <strong className="text-gray-700 font-normal">
                                          {opt.customerName}
                                        </strong>
                                      </span>
                                    )}
                                    {opt.location && (
                                      <span>
                                        •{" "}
                                        <strong className="text-gray-600 font-normal">
                                          {opt.location}
                                        </strong>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {opt.quoteValue !== undefined && (
                                    <span className="text-xs font-semibold text-emerald-700">
                                      {formatCurrency(opt.quoteValue)}
                                    </span>
                                  )}
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-6 text-center text-sm text-gray-500">
                            {isLoadingOptions || isFetchingOptions ? (
                              <div className="flex items-center justify-center gap-2 py-2">
                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                <span>Searching orders...</span>
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium text-gray-700">
                                  No matching orders found
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {searchFilter
                                    ? `No WIP-eligible orders match "${searchFilter}".`
                                    : "No orders available without WIP."}
                                </p>
                                {searchFilter.trim() && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleManualCodeSelect(searchFilter.trim());
                                      setIsDropdownOpen(false);
                                    }}
                                    className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                                  >
                                    Use &quot;{searchFilter.trim()}&quot; as custom Quote / Job ID
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer info in dropdown */}
                      {filteredOptions.length > 0 && (
                        <div className="p-2 border-t border-gray-100 bg-[#F9FAFB] text-[11px] text-gray-500 flex items-center justify-between">
                          <span>
                            Showing {filteredOptions.length} available project
                            {filteredOptions.length === 1 ? "" : "s"}
                          </span>
                          <span className="text-gray-400">Press Esc to close</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Project Summary Pill */}
                  {selectedOption && (
                    <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                      <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>{selectedOption.quoteOrderId}</span>
                      </div>
                      {selectedOption.projectName && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{selectedOption.projectName}</span>
                        </div>
                      )}
                      {selectedOption.customerName && (
                        <div className="text-gray-600">
                          <span className="text-gray-400">Customer: </span>
                          <span className="font-medium text-gray-700">
                            {selectedOption.customerName}
                          </span>
                        </div>
                      )}
                      {selectedOption.location && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{selectedOption.location}</span>
                        </div>
                      )}
                      {selectedOption.quoteValue !== undefined && (
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{formatCurrency(selectedOption.quoteValue)}</span>
                        </div>
                      )}
                      {selectedOption.lifecycleStatus && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 capitalize">
                          {selectedOption.lifecycleStatus.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {errors.quoteId && (
                <p className="text-xs text-red-500">
                  {errors.quoteId.message}
                </p>
              )}
            </div>

            {/* Order Value */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="orderValue"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Order Value <span className="text-red-500">*</span>
              </label>
              <input
                id="orderValue"
                type="text"
                placeholder="$4,50,900"
                {...register("orderValue")}
                className={cn(
                  "w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:bg-white transition-colors",
                  errors.orderValue
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-200 focus:ring-blue-500"
                )}
              />
              {errors.orderValue && (
                <p className="text-xs text-red-500">
                  {errors.orderValue.message}
                </p>
              )}
            </div>

            {/* Payment Deposit */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="paymentDeposit"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Payment Deposit
              </label>
              <input
                id="paymentDeposit"
                type="text"
                placeholder="$1,35,000"
                {...register("paymentDeposit")}
                className={cn(
                  "w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:bg-white transition-colors",
                  errors.paymentDeposit
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-200 focus:ring-blue-500"
                )}
              />
              {errors.paymentDeposit && (
                <p className="text-xs text-red-500">
                  {errors.paymentDeposit.message}
                </p>
              )}
            </div>

            {/* Payment Progress */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="paymentProgress"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Payment Progress
              </label>
              <input
                id="paymentProgress"
                type="text"
                placeholder="$0"
                {...register("paymentProgress")}
                className={cn(
                  "w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:bg-white transition-colors",
                  errors.paymentProgress
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-200 focus:ring-blue-500"
                )}
              />
              {errors.paymentProgress && (
                <p className="text-xs text-red-500">
                  {errors.paymentProgress.message}
                </p>
              )}
            </div>

            {/* Final */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="finalValue"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Final Payment
              </label>
              <input
                id="finalValue"
                type="text"
                placeholder="$0"
                {...register("finalValue")}
                className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Profit (Auto-fill) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="profit"
                className="text-xs sm:text-sm font-medium text-gray-800 flex items-center justify-between"
              >
                <span>Profit (Auto-fill)</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Recalculated on server
                </span>
              </label>
              <input
                id="profit"
                type="text"
                placeholder="$89,000"
                {...register("profit")}
                className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none cursor-default"
                readOnly
              />
            </div>

            {/* Margin % (Auto-fill) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="margin"
                className="text-xs sm:text-sm font-medium text-gray-800 flex items-center justify-between"
              >
                <span>Margin % (Auto-fill)</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Recalculated on server
                </span>
              </label>
              <input
                id="margin"
                type="text"
                placeholder="19.8%"
                {...register("margin")}
                className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none cursor-default"
                readOnly
              />
            </div>

            {/* Payment Status */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="paymentStatus"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Payment Status <span className="text-red-500">*</span>
              </label>
              <Controller
                name="paymentStatus"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="paymentStatus"
                      className="w-full h-10 px-4 bg-[#F9FAFB] border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 shadow-none"
                    >
                      <SelectValue placeholder="Select status">
                        {field.value}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Started">Started</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentStatus && (
                <p className="text-xs text-red-500">
                  {errors.paymentStatus.message}
                </p>
              )}
            </div>

            {/* Notes (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="notes"
                className="text-xs sm:text-sm font-medium text-gray-800"
              >
                Notes (Optional)
              </label>
              <input
                id="notes"
                type="text"
                placeholder="Initial order deposit or reference..."
                {...register("notes")}
                className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-6 py-2 h-9 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 h-9 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-lg shadow-xs cursor-pointer gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Saving..."
                  : isEditing
                  ? "Update Payment"
                  : "Save Payment"}
              </span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddPaymentPage;
