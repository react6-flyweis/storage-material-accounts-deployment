import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useGetProjectDeliveryQuery } from "@/redux/api/deliveriesApi";
import DeliveryDetails from "@/components/delivery/DeliveryDetails";

export default function MaterialDeliveryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, id, customerId } = useParams<{
    projectId?: string;
    id?: string;
    customerId?: string;
  }>();

  const locationState = location.state as {
    projectId?: string;
    projectName?: string;
    leadId?: string;
    customerName?: string;
    customerId?: string;
  } | null;

  const currentProjectId =
    projectId || id || locationState?.projectId || locationState?.leadId || "";
  const currentCustomerId = customerId || locationState?.customerId || "";

  const { data, isLoading, isError, error, refetch } = useGetProjectDeliveryQuery(
    currentProjectId,
    {
      skip: !currentProjectId,
    }
  );

  const delivery = data?.delivery;
  const deliveryId = delivery?.deliveryId || currentProjectId || "";

  const handleBack = () => {
    if (currentCustomerId && currentProjectId) {
      navigate(`/customers/${currentCustomerId}/projects/${currentProjectId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <DeliveryDetails
      delivery={delivery}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
      deliveryId={deliveryId}
      projectId={currentProjectId}
      onBack={handleBack}
    />
  );
}
