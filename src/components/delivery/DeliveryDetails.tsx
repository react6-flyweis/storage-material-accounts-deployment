import React from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Truck,
  Building2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectDeliveryResponse } from "@/redux/api/deliveriesApi";
import StatusBadge from "./StatusBadge";
import { formatStatusLabel } from "./deliveryStatusConstants";

// --- Sub-components ---

interface InfoRowProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

const InfoRow = ({ label, value, icon: Icon }: InfoRowProps) => (
  <div className="space-y-1">
    <p className="text-xs md:text-sm font-medium text-[#6A7282] shrink-0 uppercase mb-2">
      {label}
    </p>
    <div className="flex items-center gap-2">
      {Icon && <Icon size={16} className="text-[#6A7282] shrink-0" />}
      <p className="text-sm font-medium text-[#212B36]">{value}</p>
    </div>
  </div>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs md:text-sm font-normal text-[#6A7282] uppercase">
      {label}
    </p>
    <p className="text-sm md:text-base font-normal text-[#101828]">{value}</p>
  </div>
);

const Card = ({
  title,
  children,
  status,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  status?: string;
  className?: string;
}) => (
  <div
    className={`bg-white border border-gray-100 rounded-[14px] p-4 lg:p-6 shadow-xs font-inter ${className}`}
  >
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-base lg:text-lg font-semibold text-[#212B36]">
        {title}
      </h2>
      {status && <StatusBadge status={status} />}
    </div>
    {children}
  </div>
);

const ContactCard = ({
  title,
  company,
  contact,
  phone,
  email,
  icon: Icon,
  showTruckIcon,
}: {
  title: string;
  company?: string;
  contact?: string;
  phone?: string;
  email?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  showTruckIcon?: boolean;
}) => (
  <div className="bg-white border border-gray-100 rounded-[14px] p-4 lg:p-6 shadow-sm space-y-4 min-h-[180px]">
    <h3 className="text-base font-medium text-[#212B36]">{title}</h3>

    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {showTruckIcon && <Truck size={18} className="text-[#6A7282] shrink-0" />}
        {Icon && <Icon size={18} className="text-[#6A7282] shrink-0" />}
        <p className="font-medium text-[#212B36] text-base">{company}</p>
      </div>

      <div className="space-y-2.5">
        {contact && (
          <div className="flex items-center gap-3 text-[#6A7282] shrink-0">
            <User size={18} strokeWidth={2} />
            <span className="text-sm font-normal text-[#4A5565]">{contact}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-3 text-[#6A7282] shrink-0">
            <Phone size={18} strokeWidth={2} />
            <a
              href={`tel:${phone}`}
              className="text-sm font-medium text-[#4A5565] hover:text-[#1D51A4]"
            >
              {phone}
            </a>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-3 text-[#6A7282] shrink-0">
            <Mail size={18} strokeWidth={2} />
            <a
              href={`mailto:${email}`}
              className="text-sm font-medium text-[#4A5565] hover:text-[#1D51A4] text-ellipsis overflow-hidden"
            >
              {email}
            </a>
          </div>
        )}
      </div>
    </div>
  </div>
);

const TimelineItem = ({
  status,
  date,
  description,
  isLast,
}: {
  status: string;
  date: string;
  description: string;
  isLast?: boolean;
}) => (
  <div className="flex gap-4 relative">
    {!isLast && (
      <div className="absolute left-[5px] top-4 bottom-0 w-[2px] bg-[#E5E7EB]" />
    )}
    <div className="w-3 h-3 rounded-full bg-[#2B7FFF] shrink-0 mt-1.5 z-10" />
    <div className="flex-1 min-w-0 pb-6">
      <p className="text-sm font-semibold text-[#212B36]">{status}</p>
      <p className="text-xs font-normal text-[#6A7282] shrink-0 mt-0.5">{date}</p>
      <p className="text-xs text-[#6A7282] shrink-0 mt-1.5 leading-relaxed bg-[#F4F6F8] p-2 md:p-2.5 rounded-lg border border-gray-50">
        {description}
      </p>
    </div>
  </div>
);

interface DeliveryDetailsProps {
  delivery?: ProjectDeliveryResponse["delivery"];
  isLoading: boolean;
  deliveryId: string;
  onBack: () => void;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  projectId?: string;
}

export const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({
  delivery,
  isLoading,
  deliveryId,
  onBack,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div className="xl:pr-5 px-2 pb-10 space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-wrap md:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Main Layout Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Delivery Overview Card Skeleton */}
            <div className="bg-white border border-gray-100 rounded-[14px] p-4 lg:p-6 shadow-xs">
              <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 lg:gap-x-8 lg:gap-y-5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information Card Skeleton */}
            <div className="bg-white border border-gray-100 rounded-[14px] p-4 lg:p-6 shadow-xs">
              <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-[14px] p-4 lg:p-6 shadow-sm space-y-4 h-[180px]"
                >
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-36 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-[14px] p-5 shadow-xs space-y-4">
              <div className="h-4 w-44 bg-gray-200 rounded" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-36 bg-gray-200 rounded" />
              </div>
            </div>

            <div className="bg-white border border-[#0000001A] rounded-[14px] p-5 shadow-sm space-y-4">
              <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center p-8 bg-white border border-gray-100 rounded-[14px] shadow-sm my-12 font-inter max-w-lg mx-auto">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#1D51A4] mb-4">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-[#212B36] mb-2">
          No Delivery Available
        </h3>
        <p className="text-sm text-[#6A7282] mb-6 max-w-xs leading-relaxed">
          We couldn't find any delivery details for this project.
        </p>
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            className="bg-[#1D51A4] hover:bg-[#153E7E] text-white px-6 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="border-gray-200 text-slate-700 hover:bg-gray-50 px-6 font-semibold cursor-pointer"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getPocInitials = () => {
    const name =
      delivery?.receivingPoc?.name ||
      delivery?.receivingPocDetails?.receivingPoc ||
      delivery?.formDetails?.receivingPoc ||
      "-";
    if (name === "-") return "-";
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const headerTitle =
    delivery?.title ||
    delivery?.formDetails?.description ||
    delivery?.deliveryInformation?.description ||
    "-";

  return (
    <div className="xl:pr-5 px-2 pb-10 space-y-6 relative">
      {/* Header */}
      <div className="flex flex-wrap md:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-1 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#212B36] tracking-tight">
              Delivery Details
            </h1>
            <p className="text-sm text-[#6A7282] shrink-0 font-medium mt-0.5">
              {delivery?.deliveryNumber || deliveryId || "-"} - {headerTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3">
        {/* Left Column */}
        <div className="space-y-4">
          {/* 1. Delivery Overview Card */}
          <Card
            title="Delivery Overview"
            status={delivery?.overview?.status || delivery?.status || "Scheduled"}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 lg:gap-x-8 lg:gap-y-5">
              <InfoRow
                label="Project"
                value={
                  delivery?.overview?.projectName ||
                  delivery?.project?.projectName ||
                  "-"
                }
                icon={Building2}
              />
              <InfoRow
                label="Customer"
                value={
                  delivery?.customer?.customerName ||
                  delivery?.overview?.customerName ||
                  "-"
                }
                icon={User}
              />
              <InfoRow
                label="Delivery Date"
                value={
                  delivery?.overview?.deliveryDate
                    ? formatDate(delivery.overview.deliveryDate)
                    : delivery?.deliverySchedule?.deliveryDate
                    ? formatDate(delivery.deliverySchedule.deliveryDate)
                    : delivery?.formDetails?.deliveryDate
                    ? formatDate(delivery.formDetails.deliveryDate)
                    : "-"
                }
                icon={Calendar}
              />
              <InfoRow
                label="Time Window"
                value={
                  delivery?.overview?.timeWindow ||
                  delivery?.formDetails?.timings ||
                  delivery?.formDetails?.deliveryTime ||
                  delivery?.deliverySchedule?.timeWindow ||
                  "-"
                }
                icon={Clock}
              />
              <div className="sm:col-span-2">
                <InfoRow
                  label="Site Address"
                  value={
                    delivery?.overview?.siteAddress ||
                    delivery?.formDetails?.deliveryLocation ||
                    delivery?.deliverySchedule?.dropoffAddress ||
                    "-"
                  }
                  icon={MapPin}
                />
              </div>
            </div>
          </Card>

          {/* 2. Delivery Information Card */}
          <Card title="Delivery Information">
            <div className="space-y-4">
              <InfoRow
                label="Description"
                value={
                  delivery?.deliveryInformation?.description ||
                  delivery?.title ||
                  delivery?.formDetails?.loadDescription ||
                  delivery?.formDetails?.description ||
                  "-"
                }
                icon={Package}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                <InfoBlock
                  label="Material Category"
                  value={
                    delivery?.deliveryInformation?.materialCategory ||
                    delivery?.formDetails?.materialType ||
                    "-"
                  }
                />
                <InfoBlock
                  label="Pickup Date"
                  value={
                    formatDate(
                      delivery?.deliveryInformation?.pickupDate ||
                        delivery?.formDetails?.pickupDate
                    ) || "-"
                  }
                />
              </div>
            </div>
          </Card>

          {/* 3. Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ContactCard
              title="Vendor"
              company={
                delivery?.vendor?.company ||
                delivery?.vendorDetails?.vendorName ||
                delivery?.shipperDetails?.vendorName ||
                "-"
              }
              contact={
                delivery?.vendor?.contactName ||
                delivery?.vendorDetails?.personName ||
                delivery?.shipperDetails?.personName ||
                "-"
              }
              phone={
                delivery?.vendor?.phone ||
                delivery?.vendorDetails?.number ||
                delivery?.shipperDetails?.number ||
                "-"
              }
              email={
                delivery?.vendor?.email ||
                delivery?.vendorDetails?.email ||
                delivery?.shipperDetails?.email ||
                "-"
              }
            />
            <ContactCard
              title="Delivery Company"
              company={
                delivery?.deliveryCompany?.company ||
                delivery?.deliveryCompanyDetails?.carrierName ||
                "-"
              }
              contact={
                delivery?.deliveryCompany?.contactName ||
                delivery?.deliveryCompanyDetails?.personName ||
                "-"
              }
              phone={
                delivery?.deliveryCompany?.phone ||
                delivery?.deliveryCompanyDetails?.number ||
                "-"
              }
              email={
                delivery?.deliveryCompany?.email ||
                delivery?.deliveryCompanyDetails?.email
              }
              showTruckIcon
            />
            <ContactCard
              title="Internal Owner"
              company={delivery?.internalOwner?.name || "-"}
              contact={delivery?.internalOwner?.name || "-"}
              phone={delivery?.internalOwner?.phone || "-"}
              email={delivery?.internalOwner?.email || "-"}
            />

            <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm space-y-4 min-h-[180px]">
              <h3 className="text-[17px] font-semibold text-[#212B36]">
                Delivery Priority, Type, Size
              </h3>
              <div className="space-y-3">
                <p className="text-[17px] font-semibold text-[#212B36]">
                  {delivery?.deliveryNumber || deliveryId || "-"} –{" "}
                  {headerTitle}
                </p>
                <div className="space-y-2">
                  <p className="text-[15px] text-[#212B36]">
                    <span className="font-semibold">Priority:</span> Critical
                  </p>
                  <p className="text-[15px] text-[#212B36]">
                    <span className="font-semibold">Delivery Type:</span>{" "}
                    {delivery?.deliveryInformation?.materialCategory ||
                      delivery?.formDetails?.materialType ||
                      "-"}
                  </p>
                  <p className="text-[15px] text-[#212B36]">
                    <span className="font-semibold">
                      Load Size / Quantity:
                    </span>{" "}
                    {delivery?.deliveryTypeAndSize?.bundleCount
                      ? `${delivery.deliveryTypeAndSize.bundleCount} bundle(s)`
                      : delivery?.formDetails?.packageCount
                      ? `${delivery.formDetails.packageCount} package(s)`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Site Coordination */}
          <Card title="Site Coordination">
            <div className="space-y-5">
              <InfoBlock
                label="Site Instructions"
                value={
                  delivery?.siteCoordination?.siteInstructions ||
                  delivery?.formDetails?.specialRequirements ||
                  delivery?.siteCoordinationNotes ||
                  "-"
                }
              />
              <InfoBlock
                label="Required Equipment"
                value={
                  delivery?.siteCoordination?.requiredEquipment ||
                  delivery?.equipmentRequirement?.join(", ") ||
                  delivery?.formDetails?.loadingEquipment?.join(", ") ||
                  "-"
                }
              />
              <div className="space-y-1">
                <p className="text-xs font-normal text-[#6A7282] shrink-0 uppercase tracking-wide">
                  Equipment Confirmation Status
                </p>
                <div className="flex items-center gap-1.5 text-[#212B36]">
                  <span className="text-sm font-medium">
                    ✔ {delivery?.siteCoordination?.equipmentConfirmationStatus || "Confirmed"}
                  </span>
                </div>
              </div>
              <InfoBlock
                label="Special Notes"
                value={
                  delivery?.siteCoordination?.specialNotes ||
                  delivery?.formDetails?.additionalNotes ||
                  "-"
                }
              />
            </div>
          </Card>

          {/* 5. Freight Link */}
          <Card title="Freight Link">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <InfoBlock
                label="Awarded Carrier"
                value={
                  delivery?.selectedBid?.carrierName ||
                  delivery?.deliveryCompany?.company ||
                  "-"
                }
              />
              <InfoBlock
                label="Price"
                value={
                  delivery?.selectedBid?.quotedAmount
                    ? `$${delivery.selectedBid.quotedAmount} ${
                        delivery.selectedBid.currency || "USD"
                      }`
                    : "-"
                }
              />
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Receiving Point of Contact Card */}
          <div className="bg-white border border-gray-100 rounded-[14px] p-5 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-[#212B36]">
              Receiving Point of Contact
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F4F6F8] text-[#1E51A4] flex items-center justify-center font-semibold text-sm shrink-0">
                {getPocInitials()}
              </div>
              <span className="font-semibold text-[#212B36] text-sm">
                {delivery?.receivingPoc?.name ||
                  delivery?.receivingPocDetails?.receivingPoc ||
                  delivery?.formDetails?.receivingPoc ||
                  "-"}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#6A7282] shrink-0 text-sm">
                <Phone size={14} className="shrink-0" />
                <span>
                  {delivery?.receivingPoc?.phone ||
                    delivery?.receivingPocDetails?.pickupContactPhone ||
                    delivery?.formDetails?.pickupContactPhone ||
                    "-"}
                </span>
              </div>
              {delivery?.receivingPoc?.email && (
                <div className="flex items-center gap-2 text-[#6A7282] shrink-0 text-sm">
                  <Mail size={14} className="shrink-0" />
                  <a
                    href={`mailto:${delivery.receivingPoc.email}`}
                    className="hover:text-[#1D51A4] transition-colors"
                  >
                    {delivery.receivingPoc.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Status History Timeline Card */}
          <div className="bg-white border border-[#0000001A] rounded-[14px] p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#212B36] mb-5">
              Status History
            </h2>
            <div className="relative">
              <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-[#E5E7EB]" />
              <div className="space-y-2">
                {delivery?.statusHistory && delivery.statusHistory.length > 0 ? (
                  delivery.statusHistory.map(
                    (
                      item: { status: string; changedAt: string; notes?: string },
                      idx: number
                    ) => (
                      <TimelineItem
                        key={idx}
                        status={formatStatusLabel(item.status)}
                        date={new Date(item.changedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        description={
                          item.notes ||
                          `Delivery status changed to ${formatStatusLabel(
                            item.status
                          )}`
                        }
                        isLast={idx === (delivery.statusHistory?.length || 0) - 1}
                      />
                    )
                  )
                ) : (
                  <TimelineItem
                    status="Created"
                    date="-"
                    description="Delivery created and scheduled by System"
                    isLast
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetails;
