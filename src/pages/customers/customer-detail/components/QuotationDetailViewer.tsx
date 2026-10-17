import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetProjectQuotationDetailQuery,
  type ProjectQuotationDetailQuotation,
} from "@/redux/api/projectApi";
import { useAppSelector } from "@/redux/hooks";
import { renderQuotationStatusBadge } from "./QuotationListTable";
import { ServerDocumentPreview } from "./ServerDocumentPreview";

export interface QuotationDetailViewerProps {
  projectId: string;
  quotationId: string;
  onBack: () => void;
  passedProjectName?: string;
}

export function QuotationDetailViewer({
  projectId,
  quotationId,
  onBack,
  passedProjectName,
}: QuotationDetailViewerProps) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const accessToken = useAppSelector((state) => state.auth.accessToken);

  // 1.9 Quotation Detail: GET /api/account/projects/:projectId/quotations/:quotationId
  const {
    data: detailData,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useGetProjectQuotationDetailQuery(
    { projectId, quotationId },
    { skip: !projectId || !quotationId }
  );

  const quotation: ProjectQuotationDetailQuotation =
    detailData?.quotation || ({} as ProjectQuotationDetailQuotation);

  const effectiveQuotationId = quotation._id || quotationId;

  const quoteNumber =
    quotation.quoteNumber ||
    quotation.quotationNumber ||
    quotation._id ||
    quotationId ||
    "QUO-DRAFT";

  const versionNumber = quotation.versionNumber || 1;

  const customerObj =
    typeof quotation.customerId === "object" && quotation.customerId !== null
      ? quotation.customerId
      : null;

  const customerName: string = String(
    quotation.customerName ||
    (customerObj
      ? [customerObj.firstName, customerObj.lastName].filter(Boolean).join(" ") ||
        customerObj.name
      : "") ||
    quotation.companyName ||
    detailData?.projectName ||
    passedProjectName ||
    "Customer"
  );

  const displayProjectTitle: string = String(
    detailData?.projectName ||
    (typeof quotation.leadId === "object" && quotation.leadId !== null ? quotation.leadId.projectName : null) ||
    quotation.projectName ||
    passedProjectName ||
    customerName ||
    "Project"
  );

  // Resolve preview HTML endpoint url
  const htmlPreviewUrl = useMemo(() => {
    if (detailData?.downloadPath) {
      const sep = detailData.downloadPath.includes("?") ? "&" : "?";
      return `${detailData.downloadPath}${sep}format=html`;
    }
    if (projectId && effectiveQuotationId) {
      return `/api/account/projects/${encodeURIComponent(projectId)}/quotations/${encodeURIComponent(effectiveQuotationId)}/pdf?format=html`;
    }
    return null;
  }, [detailData?.downloadPath, projectId, effectiveQuotationId]);

  // Fetch HTML server preview
  const loadHtmlPreview = useCallback(async () => {
    if (!projectId || !effectiveQuotationId) return;
    setIsPreviewLoading(true);
    setPreviewError(null);

    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

    // List of candidate endpoints to fetch HTML preview from
    const candidateUrls: string[] = [];
    if (htmlPreviewUrl) {
      candidateUrls.push(
        htmlPreviewUrl.startsWith("http") ? htmlPreviewUrl : `${apiBaseUrl}${htmlPreviewUrl}`
      );
    }
    candidateUrls.push(
      `${apiBaseUrl}/api/account/projects/${encodeURIComponent(projectId)}/quotations/${encodeURIComponent(effectiveQuotationId)}/pdf?format=html`
    );
    candidateUrls.push(
      `${apiBaseUrl}/api/quotations/${encodeURIComponent(effectiveQuotationId)}/pdf?format=html`
    );

    let lastErrorMsg = "Failed to load quotation preview from server.";

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "text/html",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (response.ok) {
          const text = await response.text();
          // Verify response looks like HTML document or markup
          if (text && (text.includes("<") || text.includes("<!DOCTYPE") || text.includes("<html") || text.includes("<div"))) {
            setPreviewHtml(text);
            setIsPreviewLoading(false);
            return;
          }
        } else {
          lastErrorMsg = `Server returned ${response.status} ${response.statusText}`;
        }
      } catch (err: unknown) {
        lastErrorMsg = err instanceof Error ? err.message : String(err);
      }
    }

    setPreviewError(lastErrorMsg);
    setIsPreviewLoading(false);
  }, [projectId, effectiveQuotationId, htmlPreviewUrl, accessToken]);

  useEffect(() => {
    if (effectiveQuotationId) {
      loadHtmlPreview();
    }
  }, [effectiveQuotationId, loadHtmlPreview]);

  // Download PDF Handler
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
      const downloadPath =
        detailData?.downloadPath ||
        `/api/account/projects/${encodeURIComponent(projectId)}/quotations/${encodeURIComponent(effectiveQuotationId)}/pdf`;

      const fullUrl = downloadPath.startsWith("http") ? downloadPath : `${apiBaseUrl}${downloadPath}`;

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          Accept: "application/pdf, application/json, */*",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download PDF (${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Quotation_${quoteNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Direct blob download failed, falling back to new window:", err);
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
      const downloadPath =
        detailData?.downloadPath ||
        `/api/account/projects/${encodeURIComponent(projectId)}/quotations/${encodeURIComponent(effectiveQuotationId)}/pdf`;
      window.open(downloadPath.startsWith("http") ? downloadPath : `${apiBaseUrl}${downloadPath}`, "_blank");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isDetailLoading && !detailData) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-100 gap-4 bg-white rounded-xl border border-slate-200">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Loading quotation details...
        </p>
      </div>
    );
  }

  if (isDetailError && !detailData) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4 my-10 bg-white rounded-2xl shadow-xs border border-red-200">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Quotation Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            {detailError instanceof Error ? detailError.message : "Unable to retrieve quotation data for this project."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="text-xs px-4"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to List
          </Button>
          <Button
            size="sm"
            onClick={() => refetchDetail()}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs px-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header Bar matching Sales Panel quotation-details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={onBack}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                {displayProjectTitle}
              </h1>
              {quoteNumber && (
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                  Quote #{quoteNumber}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                v{versionNumber}
              </span>
              <div>
                {renderQuotationStatusBadge(quotation.status, quotation.approvalStatus)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Download PDF Button */}
          <Button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isDownloadingPdf ? "Downloading..." : "Download PDF"}</span>
          </Button>
        </div>
      </div>

      {/* Document HTML Preview Card - Only show the Server Document Preview as in sales panel */}
      <div id="quotation-preview-section">
        <ServerDocumentPreview
          html={previewHtml}
          isLoading={isPreviewLoading}
          error={previewError}
          onRetry={loadHtmlPreview}
          title={`Quotation Document — ${displayProjectTitle}`}
          minHeight={850}
          showToolbar={true}
        />
      </div>
    </div>
  );
}
