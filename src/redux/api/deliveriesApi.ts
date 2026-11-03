import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export interface DeliveryDocumentItem {
  name: string;
  type?: string;
  url: string;
}

export interface DeliveryDetailData {
  deliveryId: string;
  deliveryNumber?: string;
  title?: string;
  status: string;
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    notes?: string;
  }>;
  project?: {
    leadId?: string;
    projectName?: string;
    jobId?: string;
  };
  customer?: {
    customerId?: string;
    customerName?: string;
    email?: string;
    phone?: string;
  };
  overview?: {
    status?: string;
    projectName?: string;
    customerName?: string;
    deliveryDate?: string;
    timeWindow?: string;
    siteAddress?: string;
  };
  deliveryInformation?: {
    description?: string;
    materialCategory?: string;
    pickupDate?: string;
  };
  receivingPoc?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  vendor?: {
    company?: string;
    contactName?: string;
    phone?: string;
    email?: string;
  };
  deliveryCompany?: {
    company?: string;
    contactName?: string;
    phone?: string;
    email?: string;
  };
  siteCoordination?: {
    siteInstructions?: string;
    requiredEquipment?: string;
    equipmentConfirmationStatus?: string;
    specialNotes?: string;
  };
  documents?: {
    documentUrl?: string;
    attachments?: Array<unknown>;
    items?: DeliveryDocumentItem[];
  };
  quickActions?: {
    viewDocuments?: Array<unknown>;
  };
  freightLoadId?: string | null;

  // Legacy / fallback fields
  formDetails?: {
    description?: string;
    loadDescription?: string;
    loadWeight?: number;
    dimensions?: {
      lengthFeet?: number;
      widthFeet?: number;
      heightFeet?: number;
    };
    materialType?: string;
    packageCount?: number;
    loadingEquipment?: string[];
    bidDeadline?: string;
    documentUrl?: string;
    pickupLocation?: string;
    pickupLocationData?: {
      address?: string;
      coordinates?: {
        lat?: number;
        lng?: number;
      };
    };
    deliveryLocation?: string;
    deliveryLocationData?: {
      address?: string;
      coordinates?: {
        lat?: number;
        lng?: number;
      };
    };
    pickupDate?: string;
    pickupTime?: string;
    deliveryDate?: string;
    deliveryTime?: string;
    timings?: string;
    timeWindowStart?: string;
    timeWindowEnd?: string;
    receivingPoc?: string;
    pickupContactPhone?: string;
    specialRequirements?: string;
    additionalNotes?: string;
  };
  deliverySchedule?: {
    deliveryDate?: string;
    timeWindow?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
  };
  shipperDetails?: {
    vendorId?: string;
    vendorName?: string;
    personName?: string;
    number?: string;
    email?: string;
  };
  vendorDetails?: {
    vendorId?: string;
    vendorName?: string;
    personName?: string;
    number?: string;
    email?: string;
  };
  deliveryCompanyDetails?: {
    carrierId?: string;
    carrierName?: string;
    personName?: string;
    number?: string;
    email?: string;
  };
  selectedBid?: {
    bidId?: string;
    carrierId?: string;
    carrierName?: string;
    quotedAmount?: number;
    currency?: string;
    carrierNotes?: string;
    submittedAt?: string;
    selectedAt?: string;
    status?: string;
  };
  internalOwner?: {
    userId?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  siteCoordinationNotes?: string;
  equipmentRequirement?: string[];
  deliveryTypeAndSize?: {
    bundleCount?: number;
    packageCount?: number;
    totalWeight?: number;
  };
  receivingPocDetails?: {
    receivingPoc?: string;
    pickupContactPhone?: string;
  };
}

export interface ProjectDeliveryResponse {
  isFinal?: boolean;
  delivery?: DeliveryDetailData;
}

export const deliveriesApi = createApi({
  reducerPath: "deliveriesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["DeliveryDetail"],
  endpoints: (builder) => ({
    getProjectDelivery: builder.query<ProjectDeliveryResponse, string>({
      query: (projectId) => ({
        url: `/api/account/projects/${encodeURIComponent(projectId)}/delivery`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.delivery?.deliveryId
          ? [{ type: "DeliveryDetail", id: result.delivery.deliveryId }]
          : [],
      transformResponse: (
        response: ApiResponse<ProjectDeliveryResponse> | ProjectDeliveryResponse
      ) => {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as ProjectDeliveryResponse;
      },
    }),
    getDeliveryDetail: builder.query<ProjectDeliveryResponse, string>({
      query: (deliveryId) => ({
        url: `/api/plant/deliveries/${encodeURIComponent(deliveryId)}/detail`,
        method: "GET",
      }),
      providesTags: (_result, _error, deliveryId) => [
        { type: "DeliveryDetail", id: deliveryId },
      ],
      transformResponse: (
        response: ApiResponse<ProjectDeliveryResponse> | ProjectDeliveryResponse
      ) => {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as ProjectDeliveryResponse;
      },
    }),
  }),
});

export const {
  useGetProjectDeliveryQuery,
  useLazyGetProjectDeliveryQuery,
  useGetDeliveryDetailQuery,
  useLazyGetDeliveryDetailQuery,
} = deliveriesApi;
